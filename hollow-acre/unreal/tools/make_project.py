"""Creates the HollowAcre Unreal project from Epic's First Person C++ template, the same way the editor's
New Project dialog does (TemplateDefs.ini rules), then merges our renderer settings.

Run with any Python 3 (Unreal ships one):
  C:\\UE_5.8\\Engine\\Binaries\\ThirdParty\\Python3\\Win64\\python.exe hollow-acre/unreal/tools/make_project.py --engine C:\\UE_5.8

It refuses to overwrite an existing project unless --force is given.
"""
import argparse, os, re, shutil, secrets

HERE = os.path.dirname(os.path.abspath(__file__))
UNREAL = os.path.dirname(HERE)
ap = argparse.ArgumentParser()
ap.add_argument('--engine', default=r'C:\UE_5.8')
ap.add_argument('--engine-version', default='5.8')
ap.add_argument('--name', default='HollowAcre')
ap.add_argument('--out', default=os.path.join(UNREAL, 'HollowAcre'))
ap.add_argument('--force', action='store_true')
A = ap.parse_args()

T = 'TP_FirstPerson'
P = A.name
SRC = os.path.join(A.engine, 'Templates', T)
RES = os.path.join(A.engine, 'Templates', 'TemplateResources')
OUT = os.path.abspath(A.out)
if os.path.exists(os.path.join(OUT, P + '.uproject')) and not A.force:
    raise SystemExit(f'{OUT} already has a project; pass --force to rebuild it')

IGNORE_DIRS = {'Binaries', 'Build', 'Intermediate', 'Saved', 'Media'}
IGNORE_FILES = {f'{T}.uproject', f'{T}.png', 'Config/TemplateDefs.ini', 'Config/config.ini', 'Manifest.json', 'contents.txt'}
TEXT_EXT = {'.cpp', '.h', '.ini', '.cs'}


def rename(s):
    s = s.replace(T.upper(), P.upper()).replace(T.lower(), P.lower())
    return re.sub(re.escape(T), P, s, flags=re.I)


# 1. Template files, with folder/file renames and in-file replacements
for d, dirs, files in os.walk(SRC):
    rel_d = os.path.relpath(d, SRC).replace('\\', '/')
    if rel_d == '.':
        dirs[:] = [x for x in dirs if x not in IGNORE_DIRS]
    for f in files:
        rel = (f if rel_d == '.' else f'{rel_d}/{f}')
        if rel in IGNORE_FILES:
            continue
        dst = os.path.join(OUT, *rename(rel).split('/')) if os.path.splitext(f)[1] in TEXT_EXT or rel.startswith('Source/') else os.path.join(OUT, *rel.split('/'))
        os.makedirs(os.path.dirname(dst), exist_ok=True)
        if os.path.splitext(f)[1] in TEXT_EXT:
            with open(os.path.join(d, f), encoding='utf-8-sig') as fh:
                txt = fh.read()
            with open(dst, 'w', encoding='utf-8', newline='') as fh:
                fh.write(rename(txt))
        else:
            shutil.copy2(os.path.join(d, f), dst)

# 2. Shared content packs (TemplateDefs.ini SharedContentPacks), mounted as Content/<MountName>/
for level, mount in [('High', 'Characters'), ('High', 'LevelPrototyping'), ('High', 'Input'), ('Standard', 'Weapons')]:
    src = os.path.join(RES, level, mount, 'Content')
    shutil.copytree(src, os.path.join(OUT, 'Content', mount), dirs_exist_ok=True)

# 3. Project descriptor
with open(os.path.join(SRC, f'{T}.uproject'), encoding='utf-8') as fh:
    up = fh.read()
up = up.replace(f'"Name": "{T}"', f'"Name": "{P}"')
up = up.replace('"EngineAssociation": ""', f'"EngineAssociation": "{A.engine_version}"')
up = up.replace('"Category": ""', '"Category": "Games"')
up = up.replace('"Description": ""', '"Description": "Hollow Acre Part 2: the realistic first-person continuation"')
with open(os.path.join(OUT, f'{P}.uproject'), 'w', encoding='utf-8', newline='') as fh:
    fh.write(up)


# 4. Config: redirects so template Blueprints find the renamed C++ classes, then our renderer settings
def ini_set(path, section, pairs, append=()):
    """Set key=value pairs in [section] (replace existing keys); append '+Key=...' lines verbatim."""
    lines = open(path, encoding='utf-8').read().splitlines() if os.path.exists(path) else []
    head = f'[{section}]'
    if head not in lines:
        lines += ['', head]
    i = lines.index(head) + 1
    end = i
    while end < len(lines) and not lines[end].startswith('['):
        end += 1
    body = lines[i:end]
    for k, v in pairs:
        hit = [j for j, l in enumerate(body) if l.split('=', 1)[0].strip() == k]
        if hit:
            body[hit[0]] = f'{k}={v}'
        else:
            while body and body[-1] == '':
                body.pop()
            body.append(f'{k}={v}')
    for l in append:
        if l not in body:
            while body and body[-1] == '':
                body.pop()
            body.append(l)
    lines[i:end] = body + ['']
    with open(path, 'w', encoding='utf-8', newline='\n') as fh:
        fh.write('\n'.join(lines).rstrip() + '\n')


eng = os.path.join(OUT, 'Config', 'DefaultEngine.ini')
classes = sorted({m.group(1) for d, _, fs in os.walk(os.path.join(OUT, 'Source')) for f in fs if f.endswith('.h')
                  for m in re.finditer(r'class\s+(?:\w+_API\s+)?[AU](' + P + r'\w+)', open(os.path.join(d, f), encoding='utf-8').read())})
redir = [f'+ActiveGameNameRedirects=(OldGameName="{T}",NewGameName="/Script/{P}")',
         f'+ActiveGameNameRedirects=(OldGameName="/Script/{T}",NewGameName="/Script/{P}")']
redir += [f'+ActiveClassRedirects=(OldClassName="{c.replace(P, T, 1)}",NewClassName="{c}")' for c in classes]
ini_set(eng, '/Script/Engine.Engine', [], redir)
ini_set(eng, '/Script/AndroidFileServerEditor.AndroidFileServerRuntimeSettings', [('SecurityToken', secrets.token_hex(16).upper())])

snip = os.path.join(UNREAL, 'ConfigSnippets', 'DefaultEngine.ini.part')
sec, pairs = None, {}
for l in open(snip, encoding='utf-8').read().splitlines():
    l = l.strip()
    if not l or l.startswith(';'):
        continue
    if l.startswith('['):
        sec = l[1:-1]; pairs.setdefault(sec, [])
    else:
        k, v = l.split('=', 1); pairs[sec].append((k.strip(), v.strip()))
for s, kv in pairs.items():
    ini_set(eng, s, kv)

game = os.path.join(OUT, 'Config', 'DefaultGame.ini')
ini_set(game, '/Script/EngineSettings.GeneralProjectSettings',
        [('ProjectName', 'Hollow Acre'), ('CompanyName', 'Jaxon Charlton'), ('CopyrightNotice', 'Hollow Acre by Jaxon Charlton')])
print('project written to', OUT)
print('class redirects:', classes)

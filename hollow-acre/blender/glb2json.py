import json,struct,base64,sys
d=open(sys.argv[1],'rb').read();assert d[:4]==b'glTF'
o=12;js=None;bn=b''
while o<len(d):
    L,T=struct.unpack('<I4s',d[o:o+8]);c=d[o+8:o+8+L];o+=8+L
    if T==b'JSON':js=json.loads(c)
    elif T==b'BIN\x00':bn=c
js['buffers'][0]['uri']='data:application/octet-stream;base64,'+base64.b64encode(bn).decode()
open(sys.argv[2],'w').write(json.dumps(js,separators=(',',':')))
print(len(json.dumps(js)))

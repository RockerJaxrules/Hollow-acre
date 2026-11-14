/* ================= #245 the journal's pieces open again. Grandpa's pages were cut off after a line with "…" and couldn't be
   opened; each one (and every letter from the mailbox, which are now kept) is a row you can tap to read it whole, the same
   way it looked when you found it, with a way back to the journal. ================= */
function jrBack(){setTimeout(()=>{try{openJournal();}catch(e){}},30);}
function jrPage(i){const pg=PAGES[i];if(!pg)return;SFX.page&&SFX.page();const n=S.pages.indexOf(i)+1;
  openNote(`<p class="date">Grandpa’s diary · ${pg.date}</p><p>${pg.text}</p><p class="date" style="text-align:right">Page ${n} of 6</p>`,'Back to the journal',jrBack);}
function jrLetter(k,day){const t=typeof ST_LETTERS!=='undefined'&&ST_LETTERS[k];if(!t)return;SFX.page&&SFX.page();
  openNote(`<h3>Day ${day}</h3><p>${t}</p>${k==='epi_door'?'':'<p style="text-align:right">— you</p>'}`,'Back to the journal',jrBack);}
{const st=document.createElement('style');st.textContent=`#noteText .jpiece{display:flex;gap:8px;align-items:baseline;width:100%;text-align:left;margin:.25em 0;padding:6px 8px;background:rgba(0,0,0,.14);border:0;box-shadow:inset 0 0 0 1px rgba(232,200,150,.18);color:inherit;font:inherit;cursor:pointer}
#noteText .jpiece:hover,#noteText .jpiece:focus-visible{background:rgba(232,146,63,.16);box-shadow:inset 0 0 0 1px rgba(232,146,63,.6);outline:none}
#noteText .jpiece .jt{flex:1;min-width:0}#noteText .jpiece .jgo{opacity:.65;font-size:.85em;white-space:nowrap}`;document.head.appendChild(st);}
{const _oj=openJournal;openJournal=function(){const r=_oj.apply(this,arguments);try{const el=$('noteText');if(!el||(typeof JTAB!=='undefined'&&JTAB!=='notes'))return r;
    // Grandpa's pages: the rows under their heading become buttons, in the order they were found
    const h4=[...el.querySelectorAll('h4')].find(h=>/Grandpa/.test(h.textContent));
    if(h4){let p=h4.nextElementSibling;let k=0;while(p&&p.tagName==='P'&&k<S.pages.length){const i=S.pages[k++];const b=document.createElement('button');b.className='jpiece';
        b.innerHTML=`<span class="jt">${p.innerHTML.replace(/^•\s*/,'')}</span><span class="jgo">Read ›</span>`;b.onclick=()=>jrPage(i);const nx=p.nextElementSibling;p.replaceWith(b);p=nx;}}
    // letters you've read from the mailbox
    const L=(S.st&&S.st.lt)||[];if(L.length&&!el.querySelector('.jletters')){const box=document.createElement('div');box.className='jletters';box.innerHTML='<h4>Letters</h4>';
      for(const [k,day] of L){const t=typeof ST_LETTERS!=='undefined'&&ST_LETTERS[k];if(!t)continue;const b=document.createElement('button');b.className='jpiece';
        const plain=String(t).replace(/<[^>]+>/g,'');b.innerHTML=`<span class="jt"><i>Day ${day}</i> — ${plain.slice(0,70)}${plain.length>70?'…':''}</span><span class="jgo">Read ›</span>`;b.onclick=()=>jrLetter(k,day);box.appendChild(b);}
      const after=h4||[...el.querySelectorAll('h4')].pop();if(after&&after.parentNode===el){let q=after.nextElementSibling;while(q&&(q.tagName==='P'||q.classList.contains('jpiece')))q=q.nextElementSibling;el.insertBefore(box,q);}else el.appendChild(box);}}catch(e){}return r;};}

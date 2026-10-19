/* Planta do escritório para o RH: visualização e busca, sem edição. */
(() => {
  const ROOMS = [
    { k: 'creta', n: 'Creta', x: 110, y: 100, w: 620, h: 340 },
    { k: 'ios', n: 'Ios', x: 735, y: 100, w: 345, h: 340 },
    { k: 'fabio', n: 'Fábio', x: 1265, y: 100, w: 325, h: 340 },
    { k: 'paros', n: 'Paros', x: 1595, y: 100, w: 765, h: 340 },
  ];
  const D = [];
  const add = (nums, x, y, w, h, side) => nums.forEach((n, i) => D.push({ k: 'd' + n, n, x: x + i * 191, y, w, h, side }));
  add(['26','25','24'],147,607,190,85,'t'); add(['23','22','21'],147,692,190,85,'b'); add(['20','19','18'],152,917,190,85,'t');
  add(['17','16','15','14'],831,605,190,82,'t'); add(['13','12','11','10'],831,687,190,82,'b');
  add(['09','08','07'],1766,602,190,85,'t'); add(['06','05','04'],1766,687,190,85,'b'); add(['03','02','01'],1771,912,190,84,'t');
  D.push({k:'d27',n:'27',x:1374,y:997,w:226,h:60,side:''});
  const BL = [[1718,603,47,84,'TI'],[1718,687,47,84,'Escritório'],[1724,912,47,84,'O&M'],[153,1320,497,60,'O&M'],[1620,1378,230,48,'O&M'],[1850,1378,225,48,'RH/NETZ'],[840,999,251,58,''],[1091,999,94,58,'Financeiro'],[1185,999,94,58,'Financeiro'],[1280,999,94,58,'Legal'],[2318,117,40,296,'NETZ']];
  const PAL = ['#5b5bf0','#10b981','#f59e0b','#ec4899','#06b6d4','#8b5cf6','#ef4444','#64748b'];
  const state = { q: '', sel: null };
  let modelCache;
  const norm = s => String(s ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const qty = x => Number.parseInt(x.qtd,10) || 1;
  const items = () => (window.rhOfficePlantData?.().ativos || []);
  const positions = () => (window.rhOfficePlantData?.().positions || {});
  const nameOf = x => String(x.colaborador ?? x.colab ?? '').trim();
  const locationOf = x => String(x.posicao ?? x.pos ?? '').trim();
  const label = k => k[0] === 'd' ? 'Mesa ' + Number(k.slice(1)) : ROOMS.find(r => r.k === k)?.n || k;
  function keyOf(pos) {
    const t = norm(pos); if (!t) return null;
    const room = ROOMS.find(r => t.includes(norm(r.n))); if (room) return room.k;
    const m = String(pos).match(/\d+/); return m && +m[0] >= 1 && +m[0] <= 27 ? 'd' + String(+m[0]).padStart(2,'0') : null;
  }
  function model() {
    const sp = {}, per = {}, sem = [];
    [...D,...ROOMS].forEach(s => sp[s.k] = {items:[]});
    items().forEach(x => {
      const k = keyOf(locationOf(x)), n = nameOf(x); (k ? sp[k].items : sem).push(x);
      if (n) { const p = per[n] || (per[n] = {name:n,keys:new Set(),qtd:0,sem:0}); p.qtd += qty(x); k ? p.keys.add(k) : p.sem++; }
    });
    Object.entries(positions()).forEach(([n,pos]) => { const k = keyOf(pos); if (!k) return; const p = per[n] || (per[n]={name:n,keys:new Set(),qtd:0,sem:0}); p.keys.add(k); sp[k].mappedPpl = [...(sp[k].mappedPpl||[]),n]; });
    Object.values(sp).forEach(p => { p.ppl = [...new Set([...p.items.map(nameOf).filter(Boolean),...(p.mappedPpl||[])])]; p.qtd = p.items.reduce((n,x)=>n+qty(x),0); });
    return {sp,per,sem};
  }
  const initial = n => n.trim().split(/\s+/).slice(0,2).map(w=>w[0]).join('').toUpperCase();
  const color = n => PAL[[...n].reduce((a,c)=>a+c.charCodeAt(0),0)%PAL.length];
  const plural = n => `${n} ${n === 1 ? 'item' : 'itens'}`;
  const chair = (cx,cy,dir,c='cr') => `<g class="cr ${c}" transform="translate(${cx} ${cy}) rotate(${({t:0,b:180,l:-90,r:90})[dir]})"><rect class="cs" x="-22" y="-18" width="44" height="36" rx="14"/><rect class="cb" x="-22" y="-30" width="44" height="10" rx="5"/></g>`;
  const meet = (x,y,w,h,n,side) => { let s=`<rect class="mt" x="${x}" y="${y}" width="${w}" height="${h}" rx="6"/>`; for(let i=0;i<n;i++){const cx=x+(w/n)*(i+.5);s+=chair(cx,y-30,'t')+chair(cx,y+h+30,'b');} return side?s+chair(x-30,y+h/2,'l')+chair(x+w+30,y+h/2,'r'):s; };
  function highlights(m) { const s=state.sel,q=norm(state.q); if(s){const keys=s.t==='spot'?new Set([s.k]):s.t==='person'?new Set(m.per[s.n]?.keys||[]):new Set();return keys.size?keys:null;} if(!q)return null; const keys=new Set(); Object.entries(m.sp).forEach(([k,p])=>{if(norm(label(k)).includes(q)||p.ppl.some(n=>norm(n).includes(q)))keys.add(k);}); return keys; }
  function mapSvg(m,H) {
    const st=k=>H?(H.has(k)?' hl':' dim'):''; let o='<svg viewBox="0 0 2485 1484" class="rh-pl-svg"><rect x="100" y="92" width="2265" height="1305" rx="10" class="floor"/>';
    ROOMS.forEach(r=>{const p=m.sp[r.k];o+=`<g class="spot room${st(r.k)}" data-k="${r.k}"><rect class="desk" x="${r.x}" y="${r.y}" width="${r.w}" height="${r.h}"/><text class="room-name" x="${r.x+24}" y="${r.y+52}">${r.n}</text>${p.items.length?`<text class="room-count" x="${r.x+r.w-24}" y="${r.y+52}" text-anchor="end">${plural(p.qtd)}</text>`:''}</g>`;});
    o+=`<g class="furniture">${meet(230,214,254,125,3,1)}${meet(911,206,166,125,2,0)}${meet(1885,207,254,125,3,1)}<rect class="mt" x="1268" y="242" width="188" height="84" rx="6"/>${chair(1362,212,'t')}<rect class="wall" x="100" y="92" width="2265" height="1305" rx="10" fill="none" stroke-width="14"/>`;
    [[110,440,2360,440],[732,100,732,440],[1080,100,1080,440],[1265,100,1265,440],[1592,100,1592,440]].forEach(([a,b,c,d])=>o+=`<line class="wall" x1="${a}" y1="${b}" x2="${c}" y2="${d}" stroke-width="8"/>`);
    [[617,440,707,338],[760,440,850,335],[1165,430,1262,333],[1480,440,1570,333],[1605,440,1695,328]].forEach(([a,b,c,d])=>o+=`<path class="door" d="M${a} ${b} A95 105 0 0 1 ${c} ${d}"/>`);
    [[724,1365],[1178,1363],[2203,1360]].forEach(([x,y])=>o+=`<rect class="mt" x="${x}" y="${y}" width="120" height="28"/><path class="door" stroke-dasharray="8 8" d="M${x+4} ${y-100} A110 100 0 0 1 ${x+116} ${y-2}"/>`);
    BL.forEach(([x,y,w,h,t])=>{const v=h>w*1.5,L=(v?h:w)-10,fit=t.length*20*.56>L?` textLength="${L}" lengthAdjust="spacingAndGlyphs"`:'';o+=`<rect class="bk" x="${x}" y="${y}" width="${w}" height="${h}" rx="4"/>`+(t?`<text class="bt" transform="translate(${x+w/2} ${y+h/2+7})${v?' rotate(-90)':''}" text-anchor="middle"${fit}>${t}</text>`:'');}); o+='</g>';
    D.forEach(d=>{const p=m.sp[d.k],occ=p.ppl.length>0,cx=d.x+d.w/2;o+=`<g class="spot${occ?' occ':p.items.length?' only':''}${st(d.k)}" data-k="${d.k}" style="--p:${Math.min(62,20+p.qtd*6)}%">`;if(d.side)o+=chair(cx,d.side==='t'?d.y-30:d.y+d.h+30,d.side,'chair');o+=`<rect class="desk" x="${d.x}" y="${d.y}" width="${d.w}" height="${d.h}" rx="8"/><text class="desk-no" x="${d.x+12}" y="${d.y+26}">${d.n}</text>`;o+=occ?`<text class="person" x="${cx}" y="${d.y+d.h/2+6}" text-anchor="middle">${esc(p.ppl[0].split(/\s+/).slice(0,2).join(' '))}${p.ppl.length>1?' +'+(p.ppl.length-1):''}</text><text class="count" x="${cx}" y="${d.y+d.h-10}" text-anchor="middle">${plural(p.qtd)}</text>`:`<text class="${p.items.length?'count':'free'}" x="${cx}" y="${d.y+d.h/2+12}" text-anchor="middle">${p.items.length?plural(p.qtd):'Livre'}</text>`;o+='</g>';}); return o+'</svg>';
  }
  function itemRow(x) { const desc=[x.tipo,x.marca,x.modelo].filter(Boolean).join(' ')||'—', status=String(x.status||'—'), pos=locationOf(x); return `<div class="rh-pl-item"><b>${esc(x.id||x.asset_id||'—')}</b><span>${esc(desc)}<em>${esc(pos?(keyOf(pos)?label(keyOf(pos)):pos):'Sem posição')}</em></span><small>${esc(status)}</small></div>`; }
  function side(m) {
    const s=state.sel; if(s){let h=`<button class="rh-pl-back" type="button" data-back>← Todos os colaboradores</button>`; if(s.t==='spot'){const p=m.sp[s.k];h+=`<h3>${esc(label(s.k))}</h3><div class="rh-pl-sub">${p.ppl.length?p.ppl.map(esc).join(', '):'Sem colaborador'} · ${plural(p.qtd)}</div>`;h+=p.ppl.map(n=>`<div class="rh-pl-person"><i style="background:${color(n)}">${initial(n)}</i><b>${esc(n)}</b></div>`).join('');return h+(p.items.length?`<div class="rh-pl-list">${p.items.map(itemRow).join('')}</div>`:'<div class="rh-pl-sub">Livre — nenhum item com essa posição.</div>');} if(s.t==='person'){const p=m.per[s.n],its=items().filter(x=>nameOf(x)===s.n);return h+`<div class="rh-pl-person selected"><i style="background:${color(s.n)}">${initial(s.n)}</i><b>${esc(s.n)}</b><span>${plural(p?.qtd||0)}</span></div><div class="rh-pl-chips">${p?.keys.size?[...p.keys].sort().map(k=>`<button type="button" data-k="${k}">${label(k)}</button>`).join(''):'<span>Sem mesa definida</span>'}</div><div class="rh-pl-list">${its.map(itemRow).join('')||'<div class="rh-pl-sub">Nenhum item encontrado.</div>'}</div>`;} return h+'<h3>Itens sem posição</h3><div class="rh-pl-sub">Estes itens não possuem mesa ou sala associada.</div><div class="rh-pl-list">'+m.sem.slice(0,150).map(itemRow).join('')+'</div>'; }
    const q=norm(state.q), ppl=Object.values(m.per).filter(p=>!q||norm(p.name).includes(q)||[...p.keys].some(k=>norm(label(k)).includes(q))).sort((a,b)=>a.name.localeCompare(b.name,'pt-BR'));
    return `<h3>Colaboradores <span class="rh-pl-pill">${ppl.length}</span></h3>`+(ppl.map(p=>`<div class="rh-pl-person" data-person="${esc(p.name)}"><i style="background:${color(p.name)}">${initial(p.name)}</i><div><b>${esc(p.name)}</b><div class="rh-pl-chips">${[...p.keys].sort().map(k=>`<em>${label(k)}</em>`).join('')}${p.sem?`<em class="warning">${p.sem} sem mesa</em>`:''}</div></div><span>${p.qtd}</span></div>`).join('')||'<div class="rh-pl-sub">Nenhum colaborador encontrado.</div>');
  }
  function draw() {
    const root=document.getElementById('rh-office-plant'); if(!root)return; const m=model(); modelCache=m;
    const occ=D.filter(d=>m.sp[d.k].ppl.length).length, ppl=Object.values(m.per).filter(p=>p.keys.size).length, deskItems=D.reduce((t,d)=>t+m.sp[d.k].qtd,0), without=m.sem.reduce((t,x)=>t+qty(x),0);
    root.querySelector('#rh-pl-kpis').innerHTML=[['Mesas ocupadas',`${occ} / ${D.length}`],['Colaboradores na planta',ppl],['Itens nas mesas',deskItems]].map(([a,b])=>`<div class="rh-pl-kpi"><span>${a}</span><b>${b}</b></div>`).join('')+`<button class="rh-pl-kpi" type="button" data-sem><span>Itens sem posição</span><b>${without}</b></button>`;
    root.querySelector('#rh-pl-map').innerHTML=mapSvg(m,highlights(m))+`<div class="rh-pl-legend"><span><i class="l0"></i>Livre</span><span><i class="l1"></i>Ocupada (mais escura = mais itens)</span><span><i class="l2"></i>Só equipamentos</span></div><div class="rh-pl-tip"></div>`;
    root.querySelector('#rh-pl-side').innerHTML=side(m);
  }
  const style=document.createElement('style'); style.textContent=`
.rh-office-plant{margin-top:16px;color:var(--tx)}.rh-pl-top{display:flex;gap:10px;align-items:center;margin-bottom:14px;flex-wrap:wrap}.rh-pl-top input{max-width:360px}.rh-pl-hint,.rh-pl-sub{color:var(--tx2);font-size:12px}.rh-pl-kpis{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;margin-bottom:14px}.rh-pl-kpi{min-height:78px;text-align:left;background:var(--surf);border:1px solid var(--border);border-radius:14px;padding:13px 15px;color:var(--tx);font:inherit}.rh-pl-kpi span{display:block;color:var(--tx2);font-size:12px}.rh-pl-kpi b{display:block;font-size:20px;margin-top:5px}.rh-pl-kpi[data-sem]{cursor:pointer}.rh-pl-wrap{display:grid;grid-template-columns:minmax(0,1fr) 340px;gap:16px;align-items:start}.rh-pl-card{background:var(--surf);border:1px solid var(--border);border-radius:14px;padding:14px;min-width:0}#rh-pl-map{position:relative}.rh-pl-svg{width:100%;height:auto;display:block}.rh-pl-svg .floor{fill:var(--surf2)}.rh-pl-svg .wall{stroke:var(--tx2);stroke-linecap:round}.rh-pl-svg .door{fill:none;stroke:var(--tx2);stroke-width:3;opacity:.7}.rh-pl-svg .mt{fill:var(--surf);stroke:var(--border2);stroke-width:3}.rh-pl-svg .cs,.rh-pl-svg .cb{fill:var(--border2)}.rh-pl-svg .cb{opacity:.75}.rh-pl-svg .bk{fill:#c99b6d}.rh-pl-svg .bt{fill:#fff;font-size:20px;font-weight:600}.rh-pl-svg .furniture{pointer-events:none}.rh-pl-svg .spot{cursor:pointer;transition:opacity .2s}.rh-pl-svg .desk{fill:var(--surf);stroke:var(--border2);stroke-width:3;transition:fill .2s,stroke .15s}.rh-pl-svg .room .desk{fill:color-mix(in srgb,var(--surf) 55%,transparent);stroke-width:0}.rh-pl-svg .occ .desk{fill:color-mix(in srgb,#4f8ef7 var(--p),var(--surf));stroke:#4f8ef7}.rh-pl-svg .occ .chair .cs,.rh-pl-svg .occ .chair .cb{fill:#4f8ef7}.rh-pl-svg .only .desk{fill:color-mix(in srgb,#f59e0b 22%,var(--surf));stroke:#f59e0b}.rh-pl-svg .spot:hover .desk{stroke:#4f8ef7;stroke-width:6}.rh-pl-svg .spot.room:hover .desk{fill:color-mix(in srgb,#4f8ef7 12%,var(--surf));stroke-width:0}.rh-pl-svg .spot.dim{opacity:.28}.rh-pl-svg .spot.hl .desk{stroke:#4f8ef7;stroke-width:7}.rh-pl-svg .spot.hl{animation:rh-pl-pulse 1.4s ease-in-out infinite}@keyframes rh-pl-pulse{50%{filter:drop-shadow(0 0 16px #4f8ef7)}}.rh-pl-svg .desk-no,.rh-pl-svg .count,.rh-pl-svg .free{font-size:23px;fill:var(--tx2);font-weight:600}.rh-pl-svg .person{font-size:23px;font-weight:700;fill:var(--tx)}.rh-pl-svg .room-name{font-size:40px;font-weight:700;fill:var(--tx)}.rh-pl-svg .room-count{font-size:28px;font-weight:600;fill:#4f8ef7}.rh-pl-legend{display:flex;gap:18px;flex-wrap:wrap;margin-top:10px;font-size:12px;color:var(--tx2)}.rh-pl-legend span{display:flex;align-items:center;gap:6px}.rh-pl-legend i{width:14px;height:14px;border-radius:4px;border:2px solid var(--border2);background:var(--surf)}.rh-pl-legend .l1{background:color-mix(in srgb,#4f8ef7 45%,var(--surf));border-color:#4f8ef7}.rh-pl-legend .l2{background:color-mix(in srgb,#f59e0b 22%,var(--surf));border-color:#f59e0b}.rh-pl-card#rh-pl-side{max-height:calc(100vh - 185px);overflow:auto;position:sticky;top:16px}.rh-pl-card#rh-pl-side h3{font-size:15px;margin:2px 0 12px}.rh-pl-pill{float:right;background:var(--surf2);border-radius:99px;padding:2px 8px;font-size:12px}.rh-pl-person{display:flex;align-items:center;gap:10px;padding:8px;border-radius:11px;cursor:pointer}.rh-pl-person:hover{background:var(--surf2)}.rh-pl-person i{width:32px;height:32px;border-radius:10px;color:#fff;font-size:12px;font-weight:700;display:grid;place-items:center;flex:none;font-style:normal}.rh-pl-person b{font-size:13px}.rh-pl-person>div{min-width:0}.rh-pl-person>span{margin-left:auto;font-weight:700;font-size:12px;background:var(--surf2);border-radius:99px;padding:2px 9px}.rh-pl-chips{display:flex;gap:4px;flex-wrap:wrap;margin-top:3px}.rh-pl-chips em,.rh-pl-chips button{font-style:normal;font-size:11px;font-weight:600;background:#5b5bf022;color:#4f8ef7;border-radius:99px;padding:2px 8px;border:0;font-family:inherit}.rh-pl-chips button{cursor:pointer}.rh-pl-chips .warning{background:#d9770622;color:#a85c00}.rh-pl-list{margin-top:10px}.rh-pl-item{display:grid;grid-template-columns:auto 1fr auto;gap:10px;align-items:center;padding:9px 6px;border-bottom:1px solid var(--border);font-size:13px}.rh-pl-item>span{min-width:0}.rh-pl-item em{display:block;font-style:normal;font-size:11px;color:var(--tx2)}.rh-pl-item small{border-radius:99px;padding:3px 8px;background:var(--surf2);color:var(--tx2);white-space:nowrap}.rh-pl-back{margin-bottom:12px;background:var(--surf);border:1px solid var(--border);color:var(--tx);border-radius:8px;padding:7px 10px;cursor:pointer}.rh-pl-tip{position:absolute;display:none;pointer-events:none;background:var(--tx);color:var(--surf);padding:9px 12px;border-radius:10px;font-size:12px;line-height:1.5;max-width:260px;z-index:5;box-shadow:0 8px 24px #0002}.rh-pl-map-wrap{position:relative}@media(max-width:1100px){.rh-pl-wrap{grid-template-columns:1fr}.rh-pl-card#rh-pl-side{position:static;max-height:none}}@media(max-width:700px){.rh-pl-kpis{grid-template-columns:repeat(2,minmax(0,1fr))}.rh-pl-card{padding:8px}.rh-pl-top input{max-width:none;flex:1}}`;
  document.head.appendChild(style);
  const modalStyle=document.createElement('style');
  modalStyle.textContent=`
.rh-pl-screen{position:relative}
.rh-pl-expand{margin-left:auto;white-space:nowrap}
.rh-pl-close{display:none;width:36px;height:36px;align-items:center;justify-content:center;border:1px solid var(--border2);border-radius:9px;background:var(--surf);color:var(--tx);font-size:20px;cursor:pointer}
.rh-pl-svg .person{font-size:20px}
.rh-office-plant.expanded{position:fixed;inset:0;z-index:1200;margin:0;padding:20px;background:rgba(7,10,20,.68);overflow:auto;overscroll-behavior:contain}
.rh-office-plant.expanded .rh-pl-screen{width:100%;min-height:100%;margin:0 auto;padding:18px;background:var(--surf2);border:1px solid var(--border);border-radius:16px;box-shadow:0 24px 80px rgba(0,0,0,.35)}
.rh-office-plant.expanded .rh-pl-top{padding-right:48px}
.rh-office-plant.expanded .rh-pl-close{display:inline-flex;position:absolute;top:16px;right:16px;z-index:2}
.rh-office-plant.expanded .rh-pl-expand{display:none}
.rh-office-plant.expanded .rh-pl-svg .person{font-size:20px}
.rh-office-plant.expanded .rh-pl-wrap{grid-template-columns:minmax(0,1fr) 340px}
.rh-office-plant.expanded .rh-pl-card#rh-pl-side{max-height:calc(100vh - 190px)}
body.rh-pl-modal-open{overflow:hidden}
@media(max-width:700px){.rh-office-plant.expanded{padding:8px}.rh-office-plant.expanded .rh-pl-screen{padding:10px;border-radius:10px}.rh-office-plant.expanded .rh-pl-top{padding-right:0}.rh-office-plant.expanded .rh-pl-hint{display:none}.rh-office-plant.expanded .rh-pl-wrap{grid-template-columns:1fr}.rh-office-plant.expanded .rh-pl-card#rh-pl-side{position:static;max-height:none}}
`;
  document.head.appendChild(modalStyle);
  function bind(root) {
    const input=root.querySelector('#rh-pl-q'); input.value=state.q;
    input.oninput=()=>{state.q=input.value;state.sel=null;draw();const el=document.querySelector('#rh-pl-q');if(el){el.focus();el.setSelectionRange(el.value.length,el.value.length);}};
    root.querySelector('#rh-pl-clr').onclick=()=>{state.q='';state.sel=null;draw();root.querySelector('#rh-pl-q').value='';};
    root.onclick=e=>{if(e.target.closest('[data-expand]')){root.classList.add('expanded');root.setAttribute('role','dialog');root.setAttribute('aria-modal','true');root.querySelector('[data-expand]').setAttribute('aria-expanded','true');document.body.classList.add('rh-pl-modal-open');return;}if(e.target.closest('[data-close]')){root.classList.remove('expanded');root.removeAttribute('role');root.removeAttribute('aria-modal');root.querySelector('[data-expand]').setAttribute('aria-expanded','false');document.body.classList.remove('rh-pl-modal-open');return;}const spot=e.target.closest('#rh-pl-map .spot[data-k]'),chip=e.target.closest('#rh-pl-side [data-k]'),person=e.target.closest('[data-person]');const k=spot?.dataset.k||chip?.dataset.k;if(k)state.sel=state.sel?.t==='spot'&&state.sel.k===k?null:{t:'spot',k};else if(person)state.sel={t:'person',n:person.dataset.person};else if(e.target.closest('[data-back]'))state.sel=null;else if(e.target.closest('[data-sem]'))state.sel={t:'sem'};else if(state.sel?.t==='spot')state.sel=null;else return;draw();};
    root.onmousemove=e=>{const tip=root.querySelector('.rh-pl-tip'),g=e.target.closest('#rh-pl-map .spot');if(!tip)return;if(!g||!modelCache){tip.style.display='none';return;}const p=modelCache.sp[g.dataset.k],types={};p.items.forEach(x=>types[x.tipo||'Outros']=(types[x.tipo||'Outros']||0)+qty(x));tip.innerHTML=`<b>${esc(label(g.dataset.k))}</b><br>${p.ppl.length?p.ppl.map(esc).join(', '):p.items.length?'Sem colaborador':'Livre'}${p.items.length?'<br>'+Object.entries(types).map(([t,n])=>`${esc(t)} ×${n}`).join(' · '):''}`;const r=root.querySelector('#rh-pl-map').getBoundingClientRect();tip.style.display='block';tip.style.left=Math.min(e.clientX-r.left+14,r.width-270)+'px';tip.style.top=e.clientY-r.top+16+'px';};
    root.onmouseleave=()=>{const tip=root.querySelector('.rh-pl-tip');if(tip)tip.style.display='none';};
  }
  function mount() { const root=document.getElementById('rh-office-plant');if(root&&!root.dataset.ready){root.dataset.ready='1';bind(root);draw();} else if(root) draw(); }
  const appRoot=document.getElementById('app')||document.body;
  new MutationObserver(records=>{if(records.some(record=>record.target.id==='app'||record.target.id==='mc'))mount();})
    .observe(appRoot,{childList:true,subtree:true});
  window.addEventListener('rh-assets-updated',()=>{if(document.getElementById('rh-office-plant'))draw();});
  mount();
})();


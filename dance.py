# -*- coding: utf-8 -*-
"""DanceTracker — construit depuis OrthoScope, allégé de tout le clinique.

    python dance.py

Lit  OrthoScope_v15_ux.html
Écrit DanceTracker.html

Un outil dédié à la danse et à la kinésithérapie : on charge une vidéo, on la
rejoue avec les tracés, et cinq lectures du même mouvement s'offrent en
onglets — le vocabulaire de la danse classique, les diagonales de Kabat, les
facteurs d'effort de Laban, la notation Eshkol-Wachman et une portée Benesh.

Rien du bilan articulaire n'est conservé : ni patient, ni CIM-10, ni CIF, ni
ICOPE, ni plan de soins. Le moteur de suivi, lui, est le même.
"""
import io

s = io.open('OrthoScope_v15_ux.html', encoding='utf-8').read()
avant = len(s)

# ── 1 · le nom ───────────────────────────────────────────────────────────
s = s.replace('<title>OrthoScope — Analyse Articulaire</title>',
              '<title>DanceTracker — Écriture du mouvement</title>')
s = s.replace('content="OrthoScope"', 'content="DanceTracker"')
s = s.replace('<span class="logo-name">OrthoScope</span><span class="logo-tag"> · Analyse Articulaire</span>',
              '<span class="logo-name">DanceTracker</span>'
              '<span class="logo-tag"> · Écriture du mouvement</span>')
s = s.replace('Installer OrthoScope', 'Installer DanceTracker')

# ── 2 · on retire le clinique de l'écran ─────────────────────────────────
#  Les fonctions restent en place : rien ne casse, mais plus rien ne s'affiche.
CACHE = """
/* ── DanceTracker : le clinique n'a pas sa place ici ── */
.pt-bar,#tab-bar,#joint-content,#welcome-state,.side-row,.ux-bar,
#cmp-ouvrir,#danse-pdf,.vis-aide{display:none!important}
.content-area{padding-top:6px}
.danse-zone{display:block!important}
/* ── moins de boutons : l'essentiel devant, le reste sous un pli ── */
#dt-reglages{display:none;flex-wrap:wrap;gap:6px;margin-top:6px}
#dt-reglages.on{display:flex}
.dt-pli{background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.16);
 color:#9fb2cc;border-radius:9px;padding:5px 12px;font-size:11.5px;cursor:pointer;
 letter-spacing:.08em;font-family:inherit}
.dt-pli:hover{border-color:rgba(120,200,255,.55);color:#e8f2ff}
"""
s = s.replace('</style>', CACHE + '\n</style>', 1)

#  plus d'onglets cliniques du tout
s = s.replace("""const DIAG_TABS=[
  {id:'cr',name:'Compte rendu',icon:'📝',color:'#0f766e'},""",
"""const DIAG_TABS=[].concat([]);const DIAG_TABS_HORS=[
  {id:'cr',name:'Compte rendu',icon:'📝',color:'#0f766e'},""")

# ── 3 · une barre d'outils resserrée ─────────────────────────────────────
#  Sept boutons visibles ; les onze autres passent sous « réglages ».
s = s.replace("""<button class="vis-o" id="vis-console" onclick="visOption('console')">colonnes</button>""",
"""<span id="dt-coupe"></span><button class="vis-o" id="vis-console" onclick="visOption('console')">colonnes</button>""")

DTJS = r"""
/* ══ DanceTracker · la barre d'outils se replie ═══════════════════════ */
function dtPli(){
  const z=document.getElementById('dt-reglages');
  if(!z)return;
  const ouvert=z.className!=='on';
  z.className=ouvert?'on':'';
  const b=document.getElementById('dt-b-pli');
  if(b)b.textContent=ouvert?'moins de réglages':'plus de réglages';
}
function dtRanger(){
  const coupe=document.getElementById('dt-coupe');
  const barre=coupe?coupe.parentNode:null;
  if(!barre||document.getElementById('dt-reglages'))return;
  const zone=document.createElement('div');
  zone.id='dt-reglages';
  const pli=document.createElement('button');
  pli.className='dt-pli';pli.id='dt-b-pli';pli.textContent='plus de réglages';
  pli.onclick=dtPli;
  /* tout ce qui suit le repère part sous le pli */
  const apres=[];
  let vu=false;
  for(let i=0;i<barre.childNodes.length;i++){
    const n=barre.childNodes[i];
    if(n===coupe){vu=true;continue;}
    if(vu&&n.nodeType===1&&n.id!=='vis-msg')apres.push(n);
  }
  apres.forEach(function(n){zone.appendChild(n);});
  barre.appendChild(pli);barre.appendChild(zone);
}
try{if(document.readyState!=='loading')dtRanger();
    else document.addEventListener('DOMContentLoaded',dtRanger);}catch(e){}
"""
i = s.rindex('</script>')
s = s[:i] + "\n" + DTJS + "\n" + s[i:]

io.open('DanceTracker.html', 'w', encoding='utf-8').write(s)
print('DanceTracker : %d Ko (OrthoScope en faisait %d)' % (len(s)//1024, avant//1024))


# ═════════════════════════════════════════════════════════════════════════
# 2 · deux écritures de plus : Eshkol-Wachman et Benesh
# ═════════════════════════════════════════════════════════════════════════
s = io.open('DanceTracker.html', encoding='utf-8').read()

s = s.replace("""          <button class="an-o" id="an-b-laban" onclick="visAnOnglet('laban')">Laban</button>
        </div>""",
"""          <button class="an-o" id="an-b-laban" onclick="visAnOnglet('laban')">Laban</button>
          <button class="an-o" id="an-b-eshkol" onclick="visAnOnglet('eshkol')">Eshkol-Wachman</button>
          <button class="an-o" id="an-b-benesh" onclick="visAnOnglet('benesh')">Benesh</button>
        </div>""", 1)

s = s.replace("""        <div class="an-vue" id="an-vue-laban"></div>""",
"""        <div class="an-vue" id="an-vue-laban"></div>
        <div class="an-vue" id="an-vue-eshkol"></div>
        <div class="an-vue" id="an-vue-benesh"></div>""", 1)

s = s.replace("""  ['danse','kabat','laban'].forEach(function(k){""",
              """  ['danse','kabat','laban','eshkol','benesh'].forEach(function(k){""", 1)
s = s.replace("""  try{if(n==='kabat')visKabAfficher();if(n==='laban')visLabAfficher();}catch(e){}""",
"""  try{if(n==='kabat')visKabAfficher();if(n==='laban')visLabAfficher();
      if(n==='eshkol')visEwAfficher();if(n==='benesh')visBenAfficher();}catch(e){}""", 1)

ECRITURES_CSS = """
/* ── Eshkol-Wachman ── */
.ew-t{width:100%;border-collapse:collapse;font-size:12px;margin-top:6px}
.ew-t th{text-align:left;font-weight:400;color:#8ea4c0;font-size:10.5px;
 letter-spacing:.14em;text-transform:uppercase;padding:5px 8px 5px 0}
.ew-t td{padding:4px 8px 4px 0;border-top:1px solid rgba(255,255,255,.07);
 color:#dce9fb;font-variant-numeric:tabular-nums}
.ew-u{display:inline-block;min-width:20px;text-align:center;border-radius:5px;
 background:rgba(60,140,220,.16);border:1px solid rgba(120,200,255,.30);
 margin-right:3px;padding:1px 0;font-size:11.5px;color:#eaf3ff}
.ew-r{display:grid;grid-template-columns:repeat(3,30px);gap:3px;margin:8px 0}
.ew-r span{width:30px;height:30px;display:flex;align-items:center;justify-content:center;
 border:1px solid rgba(255,255,255,.12);border-radius:6px;font-size:11px;color:#9fb2cc}
/* ── Benesh ── */
.ben-w{overflow-x:auto;padding:6px 0}
.ben-l{display:flex;gap:16px;flex-wrap:wrap;font-size:11.5px;color:#8ea4c0;margin-top:8px}
.ben-l b{color:#eaf3ff;font-weight:400}
"""
s = s.replace('</style>', ECRITURES_CSS + '\n</style>', 1)

ECJS = r"""
/* ══ Eshkol-Wachman ════════════════════════════════════════════════════
   Chaque segment est un rayon : sa direction se lit en huitièmes de tour,
   c'est-à-dire par pas de 45°. C'est toute l'idée de la notation — pas de
   mots, des nombres. Le plan frontal est toujours lisible ; le plan
   sagittal ne l'est que si la profondeur est estimée.                  */
var EW_SEG=[{cle:'brD',nom:'bras D',a:12,b:14},{cle:'avD',nom:'avant-bras D',a:14,b:16},
            {cle:'brG',nom:'bras G',a:11,b:13},{cle:'avG',nom:'avant-bras G',a:13,b:15},
            {cle:'cuD',nom:'cuisse D',a:24,b:26},{cle:'jaD',nom:'jambe D',a:26,b:28},
            {cle:'cuG',nom:'cuisse G',a:23,b:25},{cle:'jaG',nom:'jambe G',a:25,b:27}];
var EW_DIR=['droite','haut-droite','haut','haut-gauche','gauche','bas-gauche','bas','bas-droite'];

function visEwUnite(dx,dy){
  let a=Math.atan2(-dy,dx)*180/Math.PI;
  if(a<0)a+=360;
  return Math.round(a/45)%8;
}
function visEwPousser(lm,t){
  if(!VIS.ew)VIS.ew={suite:{},der:{}};
  if(!lm)return;
  const E=VIS.ew;
  EW_SEG.forEach(function(g){
    const a=lm[g.a],b=lm[g.b];
    if(!a||!b)return;
    const u=visEwUnite(b.x-a.x,b.y-a.y);
    let v=null;
    if(a.z!=null&&b.z!=null)v=visEwUnite(b.z-a.z,b.y-a.y);
    const li=E.suite[g.cle]||(E.suite[g.cle]=[]);
    const d=E.der[g.cle];
    if(d&&d.u===u){d.t1=t;return;}
    if(d&&(d.t1-d.t0)<0.15){li.pop();}            /* trop bref : bruit de suivi */
    const nv={u:u,v:v,t0:t,t1:t};
    li.push(nv);E.der[g.cle]=nv;
  });
}
function visEwAfficher(){
  const el=document.getElementById('an-vue-eshkol');if(!el)return;
  const E=VIS.ew;
  let total=0;
  if(E)EW_SEG.forEach(function(g){total+=(E.suite[g.cle]||[]).length;});
  if(!total){el.innerHTML='<div class="an-vide">Aucune position relevée. '+
    'Lancez une analyse : chaque segment donne sa direction en huitièmes de tour.</div>';return;}
  let h='<div class="kab-s">Direction de chaque segment, en huitièmes de tour. '+
        '0 pointe vers la droite de l’image, 2 vers le haut, 4 vers la gauche, '+
        '6 vers le bas. La seconde colonne donne le plan sagittal quand la '+
        'profondeur est estimée.</div>'+
        '<div class="ew-r"><span>3</span><span>2</span><span>1</span>'+
        '<span>4</span><span>·</span><span>0</span>'+
        '<span>5</span><span>6</span><span>7</span></div>'+
        '<table class="ew-t"><tr><th>segment</th><th>suite des positions</th>'+
        '<th>changements</th></tr>';
  EW_SEG.forEach(function(g){
    const li=(E.suite[g.cle]||[]).filter(function(p){return p.t1-p.t0>=0.15;});
    if(!li.length)return;
    let c='';
    li.slice(0,26).forEach(function(p){
      c+='<span class="ew-u" title="'+EW_DIR[p.u]+' · '+p.t0.toFixed(1)+' s">'+p.u+
         (p.v!=null?'<sub style="opacity:.55">'+p.v+'</sub>':'')+'</span>';
    });
    if(li.length>26)c+='<span class="kab-s">… '+(li.length-26)+' de plus</span>';
    h+='<tr><td>'+g.nom+'</td><td>'+c+'</td><td>'+li.length+'</td></tr>';
  });
  h+='</table><div class="kab-s" style="margin-top:10px">Écriture simplifiée : '+
     'Eshkol-Wachman note aussi le type de trajet — arc dans un plan, rotation '+
     'sur l’axe. Seules les positions sont relevées ici.</div>';
  el.innerHTML=h;
}

/* ══ Benesh ════════════════════════════════════════════════════════════
   Cinq lignes qui sont le corps lui-même : tête, épaules, hanches, genoux,
   sol. Mains et pieds sont posés à leur hauteur réelle, et le signe dit la
   profondeur — devant le corps, dans son plan, ou derrière.            */
var BEN_PTS=[{i:16,nom:'main D'},{i:15,nom:'main G'},
             {i:28,nom:'pied D'},{i:27,nom:'pied G'}];
function visBenPousser(lm,t){
  if(!VIS.ben)VIS.ben={img:[],der:-9};
  if(!lm||!lm[11]||!lm[12]||!lm[23]||!lm[24]||!lm[25]||!lm[27])return;
  if(t-VIS.ben.der<0.40)return;                  /* une image toutes les 0,4 s */
  VIS.ben.der=t;
  const ep=(lm[11].y+lm[12].y)/2, ha=(lm[23].y+lm[24].y)/2;
  const ge=(lm[25].y+lm[26].y)/2, so=Math.max(lm[27].y,lm[28].y);
  const te=(lm[0]?lm[0].y:ep-(ha-ep)*0.55);
  const lignes=[te,ep,ha,ge,so];
  const mx=(lm[11].x+lm[12].x)/2, tronc=Math.abs(ha-ep)||0.001;
  const zc=(lm[11].z!=null&&lm[12].z!=null)?(lm[11].z+lm[12].z)/2:null;
  const marques=[];
  BEN_PTS.forEach(function(p){
    const q=lm[p.i];if(!q)return;
    /* la hauteur, rapportée aux cinq lignes : 0 = tête, 4 = sol */
    let r=4;
    for(let k=0;k<4;k++){
      if(q.y<=lignes[k]){r=k;break;}
      if(q.y<lignes[k+1]){r=k+(q.y-lignes[k])/Math.max(1e-4,lignes[k+1]-lignes[k]);break;}
    }
    let prof=0;
    if(zc!=null&&q.z!=null){const d=(q.z-zc)/tronc;prof=(d<-0.28?-1:(d>0.28?1:0));}
    marques.push({nom:p.nom,r:Math.max(0,Math.min(4,r)),
                  c:(q.x-mx)/tronc,prof:prof,pied:(p.i>20)});
  });
  VIS.ben.img.push({t:t,m:marques});
  if(VIS.ben.img.length>40)VIS.ben.img.shift();
}
function visBenAfficher(){
  const el=document.getElementById('an-vue-benesh');if(!el)return;
  const B=VIS.ben;
  if(!B||B.img.length<2){el.innerHTML='<div class="an-vide">Aucune image relevée. '+
    'Lancez une analyse : la portée se remplit d’une image toutes les quatre '+
    'dixièmes de seconde.</div>';return;}
  const n=B.img.length,LG=46,H=104,haut=14,bas=94,W=40+n*LG;
  let g='<svg viewBox="0 0 '+W+' '+H+'" width="'+W+'" height="'+H+
        '" xmlns="http://www.w3.org/2000/svg">';
  const NOMS=['tête','épaules','hanches','genoux','sol'];
  for(let k=0;k<5;k++){
    const y=haut+k*(bas-haut)/4;
    g+='<line x1="34" y1="'+y+'" x2="'+W+'" y2="'+y+
       '" stroke="rgba(255,255,255,'+(k===4?'.26':'.15')+')"/>';
    g+='<text x="30" y="'+(y+3.5)+'" text-anchor="end" font-size="7.5" '+
       'fill="#7d8ea6" font-family="sans-serif">'+NOMS[k]+'</text>';
  }
  B.img.forEach(function(im,j){
    const x0=40+j*LG+LG/2;
    im.m.forEach(function(m){
      const y=haut+m.r*(bas-haut)/4, x=x0+Math.max(-16,Math.min(16,m.c*13));
      const col=m.pied?'#f0a03c':'#7ad0ff';
      if(m.prof===0)                               /* dans le plan du corps */
        g+='<line x1="'+(x-5)+'" y1="'+y+'" x2="'+(x+5)+'" y2="'+y+
           '" stroke="'+col+'" stroke-width="2" stroke-linecap="round"/>';
      else if(m.prof<0)                            /* devant */
        g+='<path d="M'+(x-5)+' '+(y+4)+' L'+x+' '+(y-4)+' L'+(x+5)+' '+(y+4)+
           '" fill="none" stroke="'+col+'" stroke-width="2" stroke-linejoin="round"/>';
      else                                         /* derrière */
        g+='<circle cx="'+x+'" cy="'+y+'" r="3" fill="'+col+'"/>';
    });
    if(j%5===0)g+='<text x="'+x0+'" y="'+(H-1)+'" text-anchor="middle" font-size="7" '+
      'fill="#6d7f96" font-family="sans-serif">'+im.t.toFixed(1)+' s</text>';
  });
  g+='</svg>';
  el.innerHTML='<div class="ben-w">'+g+'</div>'+
    '<div class="ben-l"><span><b>—</b> dans le plan du corps</span>'+
    '<span><b>∧</b> devant</span><span><b>●</b> derrière</span>'+
    '<span style="color:#7ad0ff"><b>bleu</b> mains</span>'+
    '<span style="color:#f0a03c"><b>orange</b> pieds</span></div>'+
    '<div class="kab-s" style="margin-top:8px">Portée simplifiée : Benesh écrit '+
    'aussi les trajets entre deux images, les rotations et la locomotion. Seules '+
    'les positions des extrémités sont portées ici, une image toutes les quatre '+
    'dixièmes de seconde.</div>';
}
"""
i = s.rindex('</script>')
s = s[:i] + "\n" + ECJS + "\n" + s[i:]

s = s.replace("""  try{visKabPousser(lm,t);}catch(e){}""",
"""  try{visKabPousser(lm,t);}catch(e){}
  try{visEwPousser(lm,t);}catch(e){}
  try{visBenPousser(lm,t);}catch(e){}""", 1)
s = s.replace("""  VIS.kab=null;VIS.lab=null;""", """  VIS.kab=null;VIS.lab=null;VIS.ew=null;VIS.ben=null;""")
s = s.replace("""  try{visKabAfficher();visLabAfficher();}catch(e){}""",
"""  try{visKabAfficher();visLabAfficher();visEwAfficher();visBenAfficher();}catch(e){}""", 1)
s = s.replace("""      visKabAfficher();visLabAfficher();}catch(e){}""",
"""      visKabAfficher();visLabAfficher();visEwAfficher();visBenAfficher();}catch(e){}""", 1)

io.open('DanceTracker.html', 'w', encoding='utf-8').write(s)
print('cinq écritures :', len(s)//1024, 'Ko')


# ═════════════════════════════════════════════════════════════════════════
# 3 · Laban complet : Effort, Forme, Espace, Corps — et la kinétographie
#
#   L'analyse de Laban ne se réduit pas aux facteurs d'effort. Elle tient en
#   quatre catégories, et l'écriture proprement dite — la kinétographie —
#   est encore autre chose : une portée verticale où le temps monte.
# ═════════════════════════════════════════════════════════════════════════
s = io.open('DanceTracker.html', encoding='utf-8').read()

s = s.replace("""          <button class="an-o" id="an-b-benesh" onclick="visAnOnglet('benesh')">Benesh</button>""",
"""          <button class="an-o" id="an-b-benesh" onclick="visAnOnglet('benesh')">Benesh</button>
          <button class="an-o" id="an-b-kineto" onclick="visAnOnglet('kineto')">Kinétographie</button>""", 1)
s = s.replace("""        <div class="an-vue" id="an-vue-benesh"></div>""",
"""        <div class="an-vue" id="an-vue-benesh"></div>
        <div class="an-vue" id="an-vue-kineto"></div>""", 1)
s = s.replace("""  ['danse','kabat','laban','eshkol','benesh'].forEach(function(k){""",
              """  ['danse','kabat','laban','eshkol','benesh','kineto'].forEach(function(k){""", 1)
s = s.replace("""      if(n==='eshkol')visEwAfficher();if(n==='benesh')visBenAfficher();}catch(e){}""",
"""      if(n==='eshkol')visEwAfficher();if(n==='benesh')visBenAfficher();
      if(n==='kineto')visKinAfficher();}catch(e){}""", 1)

LAB_CSS = """
.lab-sec{margin-top:16px;padding-top:12px;border-top:1px solid rgba(255,255,255,.09)}
.lab-h{font-size:10.5px;letter-spacing:.2em;text-transform:uppercase;color:#8ea4c0;
 margin-bottom:8px}
.lab-g{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px}
.lab-c{background:rgba(255,255,255,.035);border:1px solid rgba(255,255,255,.10);
 border-radius:11px;padding:9px 11px}
.lab-c em{font-style:normal;font-size:10.5px;letter-spacing:.14em;text-transform:uppercase;
 color:#8ea4c0;display:block}
.lab-c b{font-size:17px;font-weight:300;color:#eaf3ff;display:block;margin-top:2px}
.lab-c i{font-style:normal;font-size:11.5px;color:#8ea4c0}
.kin-w{overflow-x:auto;padding:8px 0}
"""
s = s.replace('</style>', LAB_CSS + '\n</style>', 1)

LABJS = r"""
/* ══ Laban · Forme, Espace, Corps ══════════════════════════════════════
   L'effort dit comment le geste est fait. La forme dit ce que devient le
   volume du corps, l'espace dit où il va, le corps dit qui commence et qui
   suit. Les quatre ensemble font l'analyse de Laban.                    */
var LAB_MEMBRES=[{cle:'brD',i:16},{cle:'brG',i:15},{cle:'jaD',i:28},{cle:'jaG',i:27}];

function visLabPlus(lm,t){
  if(!VIS.labp)VIS.labp={h:[],init:{},v:{},ondit:null};
  if(!lm||!lm[11]||!lm[12]||!lm[23]||!lm[24])return;
  const P=VIS.labp;
  const tronc=Math.abs((lm[23].y+lm[24].y)/2-(lm[11].y+lm[12].y)/2)||0.001;
  const cx=(lm[11].x+lm[12].x+lm[23].x+lm[24].x)/4;
  const cy=(lm[11].y+lm[12].y+lm[23].y+lm[24].y)/4;
  let cz=null;
  if(lm[11].z!=null)cz=(lm[11].z+lm[12].z+lm[23].z+lm[24].z)/4;
  let rayon=0,large=0,prof=0,nb=0;
  const vit={};
  LAB_MEMBRES.forEach(function(m){
    const p=lm[m.i];if(!p)return;
    const x=(p.x-cx)/tronc,y=(p.y-cy)/tronc;
    const z=(cz!=null&&p.z!=null)?(p.z-cz)/tronc:0;
    rayon+=Math.sqrt(x*x+y*y+z*z);large+=Math.abs(x);prof+=Math.abs(z);nb++;
    const d=P.v[m.cle];
    vit[m.cle]=d?Math.sqrt(Math.pow(x-d.x,2)+Math.pow(y-d.y,2)):0;
    P.v[m.cle]={x:x,y:y};
  });
  if(!nb)return;
  P.h.push({t:t,r:rayon/nb,l:large/nb,p:prof/nb,y:cy/tronc,z:(cz||0),
            vit:vit,ax:{x:cx,y:cy,z:cz}});
  while(P.h.length>2&&t-P.h[0].t>1.2)P.h.shift();
  if(P.h.length<6)return;
  const H=P.h,n=H.length,A=H[0],B=H[n-1],dt=Math.max(1e-3,B.t-A.t);

  /* ── Forme ── */
  const dr=(B.r-A.r)/dt, dl=(B.l-A.l)/dt, dy=(A.y-B.y)/dt, dp=(B.p-A.p)/dt;
  const seuil=0.10;
  P.forme={flux:(dr>seuil?'grandir':(dr<-seuil?'rétrécir':'stable')),
           vert:(dy>seuil?'monter':(dy<-seuil?'descendre':'—')),
           lat:(dl>seuil?'s’étendre':(dl<-seuil?'se refermer':'—')),
           sag:(dp>seuil?'avancer':(dp<-seuil?'reculer':'—'))};
  /* mode de changement : rayon constant → arc ; rayon qui varie → radial ;
     les deux à la fois → sculpté */
  let chem=0,varr=0;
  for(let i=1;i<n;i++){
    chem+=Math.abs(H[i].r-H[i-1].r);
    varr+=Math.abs(H[i].l-H[i-1].l);
  }
  P.forme.mode=(chem<0.05*n?'arc':(varr<0.03*n?'radial':'sculpté'));

  /* ── Espace : quel plan porte le mouvement ── */
  const vx=[],vy=[],vz=[];
  for(let i=1;i<n;i++){
    vx.push(Math.abs(H[i].ax.x-H[i-1].ax.x));
    vy.push(Math.abs(H[i].ax.y-H[i-1].ax.y));
    vz.push(H[i].ax.z!=null&&H[i-1].ax.z!=null?Math.abs(H[i].ax.z-H[i-1].ax.z):0);
  }
  const som=function(a){let s=0;a.forEach(function(v){s+=v;});return s;};
  const ex=som(vx),ey=som(vy),ez=som(vz);
  const paires=[{nom:'porte (vertical)',v:ex+ey,d:'largeur et hauteur'},
                {nom:'table (horizontal)',v:ex+ez,d:'largeur et profondeur'},
                {nom:'roue (sagittal)',v:ey+ez,d:'hauteur et profondeur'}];
  paires.sort(function(a,b){return b.v-a.v;});
  const dims=[{n:'verticale',v:ey},{n:'horizontale',v:ex},{n:'sagittale',v:ez}];
  dims.sort(function(a,b){return b.v-a.v;});
  P.espace={plan:paires[0].nom,plandit:paires[0].d,dim:dims[0].n};

  /* ── Corps : qui commence, qui suit ── */
  const co=function(a,b){
    let sa=0,sb=0,sab=0,na=0;
    for(let i=0;i<n;i++){const x=H[i].vit[a]||0,y=H[i].vit[b]||0;
      sa+=x*x;sb+=y*y;sab+=x*y;na++;}
    return(sa>1e-9&&sb>1e-9)?sab/Math.sqrt(sa*sb):0;
  };
  const liens=[{nom:'homologue',v:(co('brD','brG')+co('jaD','jaG'))/2,
                d:'les deux bras, les deux jambes'},
               {nom:'homolatéral',v:(co('brD','jaD')+co('brG','jaG'))/2,
                d:'bras et jambe du même côté'},
               {nom:'controlatéral',v:(co('brD','jaG')+co('brG','jaD'))/2,
                d:'bras et jambe opposés — le schéma croisé'}];
  liens.sort(function(a,b){return b.v-a.v;});
  P.corps={lien:liens[0].nom,liendit:liens[0].d,force:liens[0].v};
  /* l'initiation : au démarrage d'un geste, quel membre bouge le premier */
  let vtot=0;LAB_MEMBRES.forEach(function(m){vtot+=B.vit[m.cle]||0;});
  let vav=0;LAB_MEMBRES.forEach(function(m){vav+=H[n-3]?(H[n-3].vit[m.cle]||0):0;});
  if(vav<0.02&&vtot>0.06){
    let prem=null,mx=0;
    LAB_MEMBRES.forEach(function(m){const v=B.vit[m.cle]||0;if(v>mx){mx=v;prem=m.cle;}});
    if(prem)P.init[prem]=(P.init[prem]||0)+1;
  }
}
var LAB_NOMS={brD:'bras droit',brG:'bras gauche',jaD:'jambe droite',jaG:'jambe gauche'};

/* ══ Kinétographie · la portée de Laban ════════════════════════════════
   Le temps monte. La ligne centrale sépare la gauche de la droite ; de part
   et d'autre, les colonnes vont du support vers l'extérieur. La forme du
   signe dit la direction, sa trame dit le niveau, sa hauteur dit la durée. */
var KIN_COL=[{cle:'jaG',nom:'jambe G',i:27,cote:-1,rang:1},
             {cle:'brG',nom:'bras G',i:15,cote:-1,rang:2},
             {cle:'brD',nom:'bras D',i:16,cote:1,rang:2},
             {cle:'jaD',nom:'jambe D',i:28,cote:1,rang:1}];
var KIN_DIR=['droite','av.-droite','avant','av.-gauche','gauche','ar.-gauche',
             'arrière','ar.-droite'];

function visKinPousser(lm,t){
  if(!VIS.kin)VIS.kin={suite:{},der:{}};
  if(!lm||!lm[11]||!lm[12]||!lm[23]||!lm[24])return;
  const K=VIS.kin;
  const tronc=Math.abs((lm[23].y+lm[24].y)/2-(lm[11].y+lm[12].y)/2)||0.001;
  const ep=(lm[11].y+lm[12].y)/2, ha=(lm[23].y+lm[24].y)/2;
  const mx=(lm[11].x+lm[12].x)/2;
  const zc=(lm[11].z!=null)?(lm[11].z+lm[12].z)/2:null;
  KIN_COL.forEach(function(c){
    const p=lm[c.i];if(!p)return;
    const dx=(p.x-mx)/tronc*c.cote;             /* + : vers son propre côté */
    const dz=(zc!=null&&p.z!=null)?(zc-p.z)/tronc:0;   /* + : vers l'avant */
    const r=Math.sqrt(dx*dx+dz*dz);
    let dir=8;                                   /* 8 = « place », sur l'axe */
    if(r>0.22){
      let a=Math.atan2(dz,dx)*180/Math.PI;if(a<0)a+=360;
      dir=Math.round(a/45)%8;
    }
    const h=(ep-p.y)/tronc;
    const niv=(h>0.25?2:(h>-0.55?1:0));          /* haut, moyen, bas */
    const d=K.der[c.cle];
    const li=K.suite[c.cle]||(K.suite[c.cle]=[]);
    if(d&&d.dir===dir&&d.niv===niv){d.t1=t;return;}
    if(d&&(d.t1-d.t0)<0.18)li.pop();
    const nv={dir:dir,niv:niv,t0:t,t1:t};
    li.push(nv);K.der[c.cle]=nv;
  });
}
function visKinSigne(dir,niv,x,y,h){
  /* rectangle de base : la hauteur dit la durée, la pointe dit la direction */
  const L=15,d=[];
  if(dir===8)d.push('M'+(x-L/2)+' '+y+' h'+L+' v'+(-h)+' h'+(-L)+' Z');
  else{
    const p=[[1,0],[1,-1],[0,-1],[-1,-1],[-1,0],[-1,1],[0,1],[1,1]][dir];
    /* la pointe sort du côté indiqué */
    const px=p[0],pz=p[1];
    if(pz<0)      d.push('M'+(x-L/2)+' '+y+' h'+L+' v'+(-h+5)+' l'+(-L/2)+' -5 l'+(-L/2)+' 5 Z');
    else if(pz>0) d.push('M'+(x-L/2)+' '+(y-5)+' l'+(L/2)+' 5 l'+(L/2)+' -5 v'+(-h+5)+' h'+(-L)+' Z');
    else if(px>0) d.push('M'+(x-L/2)+' '+y+' h'+(L/2)+' l'+(L/2)+' '+(-h/2)+' l'+(-L/2)+' '+(-h/2)+' h'+(-L/2)+' Z');
    else          d.push('M'+(x+L/2)+' '+y+' h'+(-L/2)+' l'+(-L/2)+' '+(-h/2)+' l'+(L/2)+' '+(-h/2)+' h'+(L/2)+' Z');
  }
  const remp=(niv===0?'#dce9fb':(niv===2?'url(#kinh)':'none'));
  let g='<path d="'+d[0]+'" fill="'+remp+'" stroke="#9fd6ff" stroke-width="1.1"/>';
  if(niv===1)g+='<circle cx="'+x+'" cy="'+(y-h/2)+'" r="2" fill="#dce9fb"/>';
  return g;
}
function visKinAfficher(){
  const el=document.getElementById('an-vue-kineto');if(!el)return;
  const K=VIS.kin;
  let total=0;
  if(K)KIN_COL.forEach(function(c){total+=(K.suite[c.cle]||[]).length;});
  if(!total){el.innerHTML='<div class="an-vide">Aucun signe relevé. Lancez une '+
    'analyse : la portée se remplit de bas en haut, à mesure que le temps passe.</div>';
    return;}
  let t0=1e9,t1=-1e9;
  KIN_COL.forEach(function(c){(K.suite[c.cle]||[]).forEach(function(p){
    if(p.t0<t0)t0=p.t0;if(p.t1>t1)t1=p.t1;});});
  const duree=Math.max(0.5,t1-t0),ECH=Math.min(46,Math.max(16,420/duree));
  const H=Math.min(900,duree*ECH+50),W=300;
  const cx=W/2,PAS=34;
  let g='<svg viewBox="0 0 '+W+' '+H+'" width="'+W+'" height="'+H+'" '+
        'xmlns="http://www.w3.org/2000/svg">'+
        '<defs><pattern id="kinh" width="4" height="4" patternUnits="userSpaceOnUse" '+
        'patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="4" '+
        'stroke="#9fd6ff" stroke-width="1.2"/></pattern></defs>';
  const Y=function(t){return H-24-(t-t0)*ECH;};
  /* les trois lignes de la portée */
  [-1.5,-0.5,0.5,1.5].forEach(function(k){
    const x=cx+k*PAS;
    g+='<line x1="'+x+'" y1="18" x2="'+x+'" y2="'+(H-24)+
       '" stroke="rgba(255,255,255,.14)"/>';
  });
  g+='<line x1="'+cx+'" y1="12" x2="'+cx+'" y2="'+(H-18)+
     '" stroke="rgba(255,255,255,.34)" stroke-width="1.6"/>';
  KIN_COL.forEach(function(c){
    const x=cx+c.cote*(c.rang-0.5)*PAS;
    g+='<text x="'+x+'" y="10" text-anchor="middle" font-size="8" fill="#7d8ea6" '+
       'font-family="sans-serif">'+c.nom+'</text>';
    (K.suite[c.cle]||[]).forEach(function(p){
      const d=p.t1-p.t0;if(d<0.18)return;
      const h=Math.max(7,d*ECH-2);
      g+=visKinSigne(p.dir,p.niv,x,Y(p.t0),h);
    });
  });
  g+='<text x="6" y="'+(H-8)+'" font-size="8" fill="#6d7f96" font-family="sans-serif">'+
     'début</text><text x="6" y="16" font-size="8" fill="#6d7f96" '+
     'font-family="sans-serif">fin</text></svg>';
  el.innerHTML='<div class="kab-s">Le temps monte. La ligne centrale sépare la '+
    'gauche de la droite ; la forme du signe dit la direction, sa trame dit le '+
    'niveau, sa hauteur dit la durée.</div><div class="kin-w">'+g+'</div>'+
    '<div class="ben-l"><span><b>plein</b> niveau bas</span>'+
    '<span><b>point</b> niveau moyen</span><span><b>hachuré</b> niveau haut</span></div>'+
    '<div class="kab-s" style="margin-top:8px">Portée simplifiée : la '+
    'kinétographie complète écrit aussi les supports, les rotations, les '+
    'relations entre parties et les changements de face. Quatre colonnes de '+
    'gestes sont portées ici.</div>';
}
"""
i = s.rindex('</script>')
s = s[:i] + "\n" + LABJS + "\n" + s[i:]

#  ── l'affichage de Laban gagne trois sections ──────────────────────────
s = s.replace("""  h+='<table class="kab-t"><tr><th>action d’effort</th><th>fois</th><th>durée</th></tr>';""",
"""  const P=VIS.labp;
  if(P&&P.forme){
    h+='<div class="lab-sec"><div class="lab-h">Forme — ce que devient le volume</div>'+
       '<div class="lab-g">'+
       '<div class="lab-c"><em>flux de forme</em><b>'+P.forme.flux+'</b>'+
       '<i>la kinesphère enfle ou se referme</i></div>'+
       '<div class="lab-c"><em>vertical</em><b>'+P.forme.vert+'</b></div>'+
       '<div class="lab-c"><em>latéral</em><b>'+P.forme.lat+'</b></div>'+
       '<div class="lab-c"><em>sagittal</em><b>'+P.forme.sag+'</b></div>'+
       '<div class="lab-c"><em>mode de changement</em><b>'+P.forme.mode+'</b>'+
       '<i>arc, radial ou sculpté</i></div></div></div>';
  }
  if(P&&P.espace){
    h+='<div class="lab-sec"><div class="lab-h">Espace — où le corps va</div>'+
       '<div class="lab-g">'+
       '<div class="lab-c"><em>plan dominant</em><b>'+P.espace.plan+'</b>'+
       '<i>'+P.espace.plandit+'</i></div>'+
       '<div class="lab-c"><em>dimension</em><b>'+P.espace.dim+'</b></div>'+
       '<div class="lab-c"><em>kinesphère</em><b>'+
       (F.kine<0.75?'proche':(F.kine<1.15?'moyenne':'lointaine'))+'</b></div>'+
       '<div class="lab-c"><em>niveau</em><b>'+
       (F.niveau>0.08?'bas':(F.niveau<-0.08?'haut':'moyen'))+'</b></div></div></div>';
  }
  if(P&&P.corps){
    let ini='—',mx=0;
    Object.keys(P.init).forEach(function(k){if(P.init[k]>mx){mx=P.init[k];ini=LAB_NOMS[k]||k;}});
    h+='<div class="lab-sec"><div class="lab-h">Corps — qui commence, qui suit</div>'+
       '<div class="lab-g">'+
       '<div class="lab-c"><em>connectivité</em><b>'+P.corps.lien+'</b>'+
       '<i>'+P.corps.liendit+'</i></div>'+
       '<div class="lab-c"><em>cohésion</em><b>'+Math.round(100*P.corps.force)+' %</b></div>'+
       '<div class="lab-c"><em>initiation</em><b>'+ini+'</b>'+
       '<i>'+(mx?mx+' départs':'aucun départ franc')+'</i></div></div></div>';
  }
  h+='<div class="lab-sec"><div class="lab-h">Effort — le détail des actions</div>';
  h+='<table class="kab-t"><tr><th>action d’effort</th><th>fois</th><th>durée</th></tr>';""", 1)
s = s.replace("""  h+='</table><div class="kab-s" style="margin-top:10px">Repères étalonnés '+""",
"""  h+='</table></div><div class="kab-s" style="margin-top:10px">Repères étalonnés '+""", 1)

s = s.replace("""  try{visBenPousser(lm,t);}catch(e){}""",
"""  try{visBenPousser(lm,t);}catch(e){}
  try{visLabPlus(lm,t);}catch(e){}
  try{visKinPousser(lm,t);}catch(e){}""", 1)
s = s.replace("""  VIS.kab=null;VIS.lab=null;VIS.ew=null;VIS.ben=null;""",
              """  VIS.kab=null;VIS.lab=null;VIS.ew=null;VIS.ben=null;VIS.labp=null;VIS.kin=null;""")
s = s.replace("""visEwAfficher();visBenAfficher();}catch(e){}""",
              """visEwAfficher();visBenAfficher();visKinAfficher();}catch(e){}""")

io.open('DanceTracker.html', 'w', encoding='utf-8').write(s)
print('Laban complet et kinétographie :', len(s)//1024, 'Ko')


# ═════════════════════════════════════════════════════════════════════════
# 4 · le rendu : c'est ce que voit celui qui vient de déposer sa vidéo
#
#   Ce n'est pas un bilan qu'on lit une fois : c'est un retour. Il doit être
#   immédiatement lisible, et beau assez pour qu'on ait envie de le montrer.
# ═════════════════════════════════════════════════════════════════════════
s = io.open('DanceTracker.html', encoding='utf-8').read()

SCENE_CSS = """
/* ── DanceTracker : la scène plutôt que le cabinet ── */
:root{--dt-or:#f0b429;--dt-cy:#5ad1e6;--dt-vi:#b58cff;--dt-ro:#ff7a8a}
.an-onglets{gap:4px;margin:14px 0 12px;border-bottom:1px solid rgba(255,255,255,.09);
 padding-bottom:12px}
.an-o{padding:8px 16px;font-size:13px;border-radius:11px;letter-spacing:.04em}
.an-o.on{background:linear-gradient(180deg,rgba(240,180,41,.20),rgba(240,180,41,.07));
 border-color:rgba(240,180,41,.65);color:#fff5e0;
 box-shadow:0 0 22px rgba(240,180,41,.18),inset 0 1px 0 rgba(255,255,255,.10)}
.an-vue.on{animation:dtEntre .32s ease-out}
@keyframes dtEntre{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
/* le fil du temps, commun à toutes les lectures */
.dt-fil{margin:2px 0 14px}
.dt-fil svg{display:block;width:100%;height:34px}
.dt-fil-t{font-size:10px;letter-spacing:.18em;text-transform:uppercase;
 color:#7d8ea6;margin-bottom:5px}
/* les cartes respirent */
.kab-c,.lab-c{background:linear-gradient(180deg,rgba(255,255,255,.055),rgba(255,255,255,.022));
 border-color:rgba(255,255,255,.13);border-radius:14px;padding:12px 14px;
 transition:border-color .2s,transform .2s}
.kab-c:hover,.lab-c:hover{border-color:rgba(240,180,41,.45);transform:translateY(-1px)}
.kab-d{font-size:22px;letter-spacing:-.015em;
 text-shadow:0 0 22px rgba(120,200,255,.30)}
.kab-b i{background:linear-gradient(90deg,var(--dt-cy),var(--dt-or))}
.kab-fig{display:block;margin:6px 0 2px}
.lab-act{font-size:38px;letter-spacing:-.03em;
 text-shadow:0 0 14px rgba(255,255,255,.22),0 0 48px rgba(240,180,41,.30)}
.lab-r i{background:var(--dt-or);box-shadow:0 0 14px rgba(240,180,41,.75)}
.lab-h{color:var(--dt-or);opacity:.85}
.ew-u{border-radius:7px;padding:2px 0;min-width:23px;font-weight:500}
.ben-w,.kin-w{background:radial-gradient(120% 100% at 50% 0%,rgba(90,209,230,.07),transparent 70%);
 border:1px solid rgba(255,255,255,.08);border-radius:14px;padding:10px 12px}
.an-vide{padding:26px 16px;text-align:center;border:1px dashed rgba(255,255,255,.12);
 border-radius:14px;background:rgba(255,255,255,.02)}
"""
s = s.replace('</style>', SCENE_CSS + '\n</style>', 1)

RENDU_JS = r"""
/* ══ le fil du temps, partagé par toutes les lectures ══════════════════
   Celui qui vient de déposer sa vidéo doit voir d'un coup d'œil où se
   trouve chaque chose dans sa séquence. Le même ruban, la même échelle,
   d'un onglet à l'autre.                                                */
function visFil(titre,bandes,t0,t1){
  const W=1000,H=34,d=Math.max(0.2,t1-t0);
  const X=function(t){return 8+(W-16)*(t-t0)/d;};
  let g='<div class="dt-fil"><div class="dt-fil-t">'+titre+'</div>'+
        '<svg viewBox="0 0 '+W+' '+H+'" preserveAspectRatio="none">'+
        '<rect x="8" y="8" width="'+(W-16)+'" height="16" rx="8" '+
        'fill="rgba(255,255,255,.045)"/>';
  bandes.forEach(function(b){
    const x=X(b.t0),w=Math.max(2,X(b.t1)-X(b.t0));
    g+='<rect x="'+x.toFixed(1)+'" y="8" width="'+w.toFixed(1)+'" height="16" rx="6" '+
       'fill="'+b.c+'" opacity=".82"><title>'+b.nom+' · '+b.t0.toFixed(1)+
       '–'+b.t1.toFixed(1)+' s</title></rect>';
  });
  for(let k=0;k<=4;k++){
    const t=t0+d*k/4,x=X(t);
    g+='<text x="'+x.toFixed(1)+'" y="33" font-size="9" fill="#6d7f96" '+
       'text-anchor="'+(k===0?'start':(k===4?'end':'middle'))+'" '+
       'font-family="sans-serif">'+t.toFixed(1)+' s</text>';
  }
  return g+'</svg></div>';
}
var LAB_COUL={'Flotter':'#7ad0ff','Glisser':'#5ad1e6','Tordre':'#b58cff',
              'Presser':'#8a6dff','Tapoter':'#ffd166','Épousseter':'#f0b429',
              'Fouetter':'#ff7a8a','Frapper':'#ff5c5c'};
var KAB_COUL={D1F:'#5ad1e6',D1E:'#3a8fb7',D2F:'#f0b429',D2E:'#b57a29'};

/* ══ Kabat : la diagonale se dessine sur une silhouette ════════════════ */
function visKabFigure(diag){
  const W=110,H=76;
  let g='<svg class="kab-fig" viewBox="0 0 '+W+' '+H+'" width="'+W+'" height="'+H+'">';
  g+='<line x1="55" y1="10" x2="55" y2="66" stroke="rgba(255,255,255,.16)"/>';
  g+='<circle cx="55" cy="14" r="6" fill="none" stroke="rgba(255,255,255,.26)"/>';
  g+='<line x1="34" y1="28" x2="76" y2="28" stroke="rgba(255,255,255,.22)"/>';
  g+='<line x1="40" y1="54" x2="70" y2="54" stroke="rgba(255,255,255,.22)"/>';
  const P={D1F:[[86,62],[36,16]],D1E:[[36,16],[86,62]],
           D2F:[[38,62],[92,16]],D2E:[[92,16],[38,62]]}[diag];
  if(P){
    const c=KAB_COUL[diag];
    g+='<defs><marker id="kf'+diag+'" markerWidth="7" markerHeight="7" refX="5" refY="3.5" '+
       'orient="auto"><path d="M0 0 L7 3.5 L0 7 z" fill="'+c+'"/></marker></defs>';
    g+='<line x1="'+P[0][0]+'" y1="'+P[0][1]+'" x2="'+P[1][0]+'" y2="'+P[1][1]+
       '" stroke="'+c+'" stroke-width="2.4" stroke-linecap="round" '+
       'marker-end="url(#kf'+diag+')" opacity=".95"/>';
    g+='<circle cx="'+P[0][0]+'" cy="'+P[0][1]+'" r="3" fill="'+c+'" opacity=".6"/>';
  }
  return g+'</svg>';
}
"""
i = s.rindex('</script>')
s = s[:i] + "\n" + RENDU_JS + "\n" + s[i:]

#  ── Kabat : fil du temps + silhouette dans chaque carte ────────────────
s = s.replace("""  let h='<div class="kab-g">';""",
"""  const K0=VIS.kab;
  let t0=1e9,t1=-1e9;
  K0.seg.forEach(function(g){if(g.t0<t0)t0=g.t0;if(g.t1>t1)t1=g.t1;});
  let h=visFil('Diagonales dans le temps',K0.seg.filter(function(g){
      return g.t1-g.t0>=0.15;}).map(function(g){
      return{t0:g.t0,t1:g.t1,c:KAB_COUL[g.diag],nom:g.nom+' · '+KAB_NOMS[g.diag]};}),t0,t1);
  h+='<div class="kab-g">';""", 1)
s = s.replace("""    h+='<div class="kab-c"><div class="kab-m">'+p.nom+'</div>'+
       '<div class="kab-d">'+(meilleur?KAB_NOMS[meilleur]:'—')+'</div>'+""",
"""    h+='<div class="kab-c"><div class="kab-m">'+p.nom+'</div>'+
       '<div class="kab-d">'+(meilleur?KAB_NOMS[meilleur]:'—')+'</div>'+
       (meilleur?visKabFigure(meilleur):'')+""", 1)

#  ── Laban : le ruban des actions d'effort ──────────────────────────────
s = s.replace("""  let h='<div class="lab-act">'+(dom||'—')+'</div>'+""",
"""  let t0=1e9,t1=-1e9;
  L.seg.forEach(function(g){if(g.t0<t0)t0=g.t0;if(g.t1>t1)t1=g.t1;});
  let h=visFil('Actions d’effort dans le temps',L.seg.filter(function(g){
      return g.t1-g.t0>=0.15;}).map(function(g){
      return{t0:g.t0,t1:g.t1,c:LAB_COUL[g.nom]||'#7ad0ff',nom:g.nom};}),t0,t1);
  h+='<div class="lab-act">'+(dom||'—')+'</div>'+""", 1)

#  ── Eshkol-Wachman : la direction se voit à la couleur ─────────────────
s = s.replace("""      c+='<span class="ew-u" title="'+EW_DIR[p.u]+' · '+p.t0.toFixed(1)+' s">'+p.u+""",
"""      const teinte=(p.u*45+200)%360;
      c+='<span class="ew-u" style="background:hsla('+teinte+',62%,52%,.22);'+
         'border-color:hsla('+teinte+',72%,62%,.55);color:hsl('+teinte+',80%,86%)" '+
         'title="'+EW_DIR[p.u]+' · '+p.t0.toFixed(1)+' s">'+p.u+""", 1)
s = s.replace("""        '<div class="ew-r"><span>3</span><span>2</span><span>1</span>'+
        '<span>4</span><span>·</span><span>0</span>'+
        '<span>5</span><span>6</span><span>7</span></div>'+""",
"""        '<div class="ew-r">'+[3,2,1,4,-1,0,5,6,7].map(function(u){
          if(u<0)return'<span style="border-color:transparent;color:#5c6b80">·</span>';
          const te=(u*45+200)%360;
          return'<span style="background:hsla('+te+',62%,52%,.20);border-color:hsla('+
            te+',72%,62%,.5);color:hsl('+te+',80%,86%)" title="'+EW_DIR[u]+'">'+u+'</span>';
        }).join('')+'</div>'+""", 1)

io.open('DanceTracker.html', 'w', encoding='utf-8').write(s)
print('rendu travaillé :', len(s)//1024, 'Ko')

s = io.open('DanceTracker.html', encoding='utf-8').read()
#  ── le fil du temps doit tenir dans chaque lecture, pas seulement deux ──
s = s.replace("""  let h='<div class="kab-s">Direction de chaque segment""",
"""  let t0=1e9,t1=-1e9;
  EW_SEG.forEach(function(g){(E.suite[g.cle]||[]).forEach(function(p){
    if(p.t0<t0)t0=p.t0;if(p.t1>t1)t1=p.t1;});});
  const bandes=[];
  (E.suite.brD||[]).concat(E.suite.jaD||[]).forEach(function(p){
    if(p.t1-p.t0<0.15)return;
    bandes.push({t0:p.t0,t1:p.t1,c:'hsl('+((p.u*45+200)%360)+',68%,58%)',
                 nom:'unité '+p.u});
  });
  let h=visFil('Directions du bras et de la jambe droits',bandes,t0,t1)+
        '<div class="kab-s">Direction de chaque segment""", 1)
io.open('DanceTracker.html','w',encoding='utf-8').write(s)
print('fil du temps : trois lectures sur six')


# ═════════════════════════════════════════════════════════════════════════
# 5 · le sélecteur d'articulation revient, et Bobath rejoint Kabat
#
#   DanceTracker sert la danse et la kinésithérapie : le bilan articulaire a
#   sa place, et le concept Bobath — alignement, dissociation des ceintures,
#   transfert de charge, sélectivité contre synergie — autant que Kabat.
# ═════════════════════════════════════════════════════════════════════════
s = io.open('DanceTracker.html', encoding='utf-8').read()

#  ── on rend l'articulaire à l'écran ────────────────────────────────────
s = s.replace(""".pt-bar,#tab-bar,#joint-content,#welcome-state,.side-row,.ux-bar,
#cmp-ouvrir,#danse-pdf,.vis-aide{display:none!important}""",
""".pt-bar,.ux-bar,#cmp-ouvrir,#danse-pdf,.vis-aide{display:none!important}
/* le bandeau ne garde que les articulations : plus de section clinique */
.tab-sep,.tab-sec-lbl{display:none!important}
#tab-bar{padding-bottom:6px}""")

#  ── l'onglet Bobath ────────────────────────────────────────────────────
s = s.replace("""          <button class="an-o" id="an-b-kineto" onclick="visAnOnglet('kineto')">Kinétographie</button>""",
"""          <button class="an-o" id="an-b-bobath" onclick="visAnOnglet('bobath')">Bobath</button>
          <button class="an-o" id="an-b-kineto" onclick="visAnOnglet('kineto')">Kinétographie</button>""", 1)
s = s.replace("""        <div class="an-vue" id="an-vue-kineto"></div>""",
"""        <div class="an-vue" id="an-vue-bobath"></div>
        <div class="an-vue" id="an-vue-kineto"></div>""", 1)
s = s.replace("""  ['danse','kabat','laban','eshkol','benesh','kineto'].forEach(function(k){""",
   """  ['danse','kabat','laban','eshkol','benesh','bobath','kineto'].forEach(function(k){""", 1)
s = s.replace("""      if(n==='kineto')visKinAfficher();}catch(e){}""",
"""      if(n==='kineto')visKinAfficher();if(n==='bobath')visBobAfficher();}catch(e){}""", 1)

BOBJS = r"""
/* ══ Bobath · le contrôle postural ═════════════════════════════════════
   Le concept ne se résume pas à des angles : il regarde l'alignement, la
   dissociation des ceintures, le transfert du poids sur la base d'appui, et
   surtout la sélectivité — un membre qui bouge par blocs, épaule et coude
   liés, décrit une synergie ; un membre qui dissocie ses segments décrit un
   mouvement sélectif. C'est cette différence-là qu'on mesure ici.       */
function visBobPousser(lm,t){
  if(!VIS.bob)VIS.bob={h:[],charge:[],rat:0,der:null};
  if(!lm||!lm[11]||!lm[12]||!lm[23]||!lm[24]||!lm[27]||!lm[28])return;
  const B=VIS.bob;
  const ep0=lm[11],ep1=lm[12],ha0=lm[23],ha1=lm[24];
  const epy=(ep0.y+ep1.y)/2, hay=(ha0.y+ha1.y)/2;
  const tronc=Math.abs(hay-epy)||0.001;
  const deg=function(a){return a*180/Math.PI;};
  /* obliquités : l'angle des deux ceintures avec l'horizontale */
  const obEp=deg(Math.atan2(ep1.y-ep0.y,ep1.x-ep0.x));
  const obHa=deg(Math.atan2(ha1.y-ha0.y,ha1.x-ha0.x));
  /* dissociation : l'écart entre les deux, en valeur absolue */
  const dissoc=Math.abs(((obEp-obHa+180)%360)-180);
  /* inclinaison du tronc par rapport à la verticale */
  const epx=(ep0.x+ep1.x)/2, hax=(ha0.x+ha1.x)/2;
  const incl=deg(Math.atan2(epx-hax,hay-epy));
  /* transfert de charge : le tronc au-dessus de la base d'appui */
  const pg=Math.min(lm[27].x,lm[28].x), pd=Math.max(lm[27].x,lm[28].x);
  const base=Math.max(0.02,pd-pg);
  const u=(epx-(pg+pd)/2)/base;              /* −1 : sur un pied, +1 : sur l'autre */
  /* tête : alignée sur le tronc ? */
  let tete=null;
  if(lm[0])tete=deg(Math.atan2(lm[0].x-epx,epy-lm[0].y));
  /* sélectivité : épaule et coude bougent-ils ensemble ? */
  const el=function(a,b){return deg(Math.atan2(-(b.y-a.y),b.x-a.x));};
  const mes={t:t,obEp:obEp,obHa:obHa,dissoc:dissoc,incl:incl,u:u,
             base:base/tronc,tete:tete,
             brD:lm[14]?el(ep1,lm[14]):null, coD:(lm[14]&&lm[16])?el(lm[14],lm[16]):null,
             brG:lm[13]?el(ep0,lm[13]):null, coG:(lm[13]&&lm[15])?el(lm[13],lm[15]):null,
             haD:lm[26]?el(ha1,lm[26]):null, geD:(lm[26]&&lm[28])?el(lm[26],lm[28]):null,
             haG:lm[25]?el(ha0,lm[25]):null, geG:(lm[25]&&lm[27])?el(lm[25],lm[27]):null};
  B.h.push(mes);
  if(B.h.length>900)B.h.shift();
  /* un rattrapage : le tronc sort de la base, puis y revient */
  const d=B.der;
  if(d!=null&&Math.abs(d)<=0.5&&Math.abs(u)>0.5)B.rat++;
  B.der=u;
}
function visBobSelectivite(H,a,b){
  /* corrélation des variations de deux segments : proche de 1, ils bougent
     par blocs — c'est la synergie ; proche de 0, ils se dissocient */
  let sa=0,sb=0,sab=0,n=0;
  for(let i=1;i<H.length;i++){
    const x=H[i][a],y=H[i][b],x0=H[i-1][a],y0=H[i-1][b];
    if(x==null||y==null||x0==null||y0==null)continue;
    let dx=((x-x0+180)%360)-180, dy=((y-y0+180)%360)-180;
    if(Math.abs(dx)<0.25&&Math.abs(dy)<0.25)continue;
    sa+=dx*dx;sb+=dy*dy;sab+=dx*dy;n++;
  }
  if(n<8||sa<1e-6||sb<1e-6)return null;
  return Math.abs(sab/Math.sqrt(sa*sb));
}
function visBobAfficher(){
  const el=document.getElementById('an-vue-bobath');if(!el)return;
  const B=VIS.bob;
  if(!B||B.h.length<10){el.innerHTML='<div class="an-vide">Aucun relevé postural. '+
    'Lancez une analyse : l’alignement, la dissociation des ceintures et le '+
    'transfert de charge se lisent dès la première seconde.</div>';return;}
  const H=B.h,n=H.length;
  const moy=function(c){let s=0,k=0;H.forEach(function(m){
    if(m[c]!=null){s+=m[c];k++;}});return k?s/k:null;};
  const etendue=function(c){let a=1e9,b=-1e9;H.forEach(function(m){
    if(m[c]!=null){if(m[c]<a)a=m[c];if(m[c]>b)b=m[c];}});return b>a?b-a:0;};
  const t0=H[0].t,t1=H[n-1].t;
  /* le fil du temps : où est le poids, image par image */
  const bandes=[];let cour=null;
  H.forEach(function(m){
    const z=(m.u<-0.28?'g':(m.u>0.28?'d':'c'));
    if(cour&&cour.z===z){cour.t1=m.t;return;}
    cour={z:z,t0:m.t,t1:m.t,
          nom:(z==='g'?'poids à gauche':(z==='d'?'poids à droite':'poids centré')),
          c:(z==='g'?'#5ad1e6':(z==='d'?'#f0b429':'rgba(255,255,255,.22)'))};
    bandes.push(cour);
  });
  let h=visFil('Transfert de charge dans le temps',
               bandes.filter(function(b){return b.t1-b.t0>=0.12;}),t0,t1);
  const tps=function(f){let k=0;H.forEach(function(m){if(f(m.u))k++;});
    return Math.round(100*k/n);};
  const dis=moy('dissoc'),inc=moy('incl'),ba=moy('base'),te=moy('tete');
  h+='<div class="lab-h">Alignement et appui</div><div class="lab-g">'+
     '<div class="lab-c"><em>dissociation des ceintures</em><b>'+
     (dis!=null?dis.toFixed(1)+'°':'—')+'</b><i>écart épaules / bassin · '+
     'étendue '+etendue('dissoc').toFixed(0)+'°</i></div>'+
     '<div class="lab-c"><em>inclinaison du tronc</em><b>'+
     (inc!=null?inc.toFixed(1)+'°':'—')+'</b><i>par rapport à la verticale</i></div>'+
     '<div class="lab-c"><em>base de sustentation</em><b>'+
     (ba!=null?ba.toFixed(2):'—')+'</b><i>écart des pieds, en troncs</i></div>'+
     '<div class="lab-c"><em>alignement de la tête</em><b>'+
     (te!=null?te.toFixed(1)+'°':'—')+'</b><i>sur l’axe du tronc</i></div></div>';
  h+='<div class="lab-sec"><div class="lab-h">Transfert de charge</div><div class="lab-g">'+
     '<div class="lab-c"><em>à gauche</em><b>'+tps(function(u){return u<-0.28;})+
     ' %</b></div>'+
     '<div class="lab-c"><em>centré</em><b>'+
     tps(function(u){return u>=-0.28&&u<=0.28;})+' %</b></div>'+
     '<div class="lab-c"><em>à droite</em><b>'+tps(function(u){return u>0.28;})+
     ' %</b></div>'+
     '<div class="lab-c"><em>rattrapages</em><b>'+B.rat+'</b>'+
     '<i>sorties de la base suivies d’un retour</i></div></div></div>';
  /* sélectivité : quatre couples proximal / distal */
  const cps=[{n:'bras droit',a:'brD',b:'coD'},{n:'bras gauche',a:'brG',b:'coG'},
             {n:'jambe droite',a:'haD',b:'geD'},{n:'jambe gauche',a:'haG',b:'geG'}];
  h+='<div class="lab-sec"><div class="lab-h">Sélectivité du mouvement</div>'+
     '<div class="kab-g">';
  cps.forEach(function(c){
    const r=visBobSelectivite(H,c.a,c.b);
    if(r==null){h+='<div class="kab-c"><div class="kab-m">'+c.n+'</div>'+
      '<div class="kab-d">—</div><div class="kab-s">trop peu de mouvement</div></div>';
      return;}
    const dit=(r>0.72?'synergie marquée':(r>0.45?'partiellement dissocié':'sélectif'));
    h+='<div class="kab-c"><div class="kab-m">'+c.n+'</div>'+
       '<div class="kab-d">'+dit+'</div>'+
       '<div class="kab-s">proximal et distal liés à '+Math.round(100*r)+' %</div>'+
       '<div class="kab-b"><i style="width:'+Math.round(100*(1-r))+
       '%"></i></div><div class="kab-s">part de dissociation</div></div>';
  });
  h+='</div></div><div class="kab-s" style="margin-top:12px">Lecture inspirée du '+
     'concept Bobath, non un bilan : le tonus, la qualité du recrutement et la '+
     'réponse à la facilitation ne se voient pas sur une vidéo. Ce qui est mesuré '+
     'ici, ce sont des géométries — alignement, dissociation, appui, liaison '+
     'proximo-distale.</div>';
  el.innerHTML=h;
}
"""
i = s.rindex('</script>')
s = s[:i] + "\n" + BOBJS + "\n" + s[i:]
s = s.replace("""  try{visKinPousser(lm,t);}catch(e){}""",
"""  try{visKinPousser(lm,t);}catch(e){}
  try{visBobPousser(lm,t);}catch(e){}""", 1)
s = s.replace("""VIS.labp=null;VIS.kin=null;""", """VIS.labp=null;VIS.kin=null;VIS.bob=null;""")
s = s.replace("""visBenAfficher();visKinAfficher();}catch(e){}""",
              """visBenAfficher();visKinAfficher();visBobAfficher();}catch(e){}""")

io.open('DanceTracker.html','w',encoding='utf-8').write(s)
print('Bobath et articulaire :', len(s)//1024, 'Ko')


# ═════════════════════════════════════════════════════════════════════════
# 6 · les chaînes musculaires, en couleur, sur le corps qui bouge
#
#   Kabat et Bobath parlent de chaînes ; il faut donc les voir. Les quatre
#   écharpes myofasciales sont tracées sur le rejeu, chacune de sa couleur,
#   et s'allument quand elles travaillent — c'est-à-dire quand leur longueur
#   change. Une chaîne au repos reste un fil ; une chaîne qui s'étire ou se
#   raccourcit s'épaissit et rayonne.
# ═════════════════════════════════════════════════════════════════════════
s = io.open('DanceTracker.html', encoding='utf-8').read()

CHJS = r"""
/* ══ les chaînes myofasciales ══════════════════════════════════════════
   Quatre écharpes, prises deux fois — une par côté :

     oblique postérieure  grand dorsal → fascia thoraco-lombaire →
                          grand fessier opposé → bandelette → jambe
     oblique antérieure   grand oblique → ligne blanche →
                          petit oblique opposé → adducteurs
     latérale             moyen fessier → bandelette → péroniers,
                          avec le carré des lombes opposé
     longitudinale        érecteurs → ligament sacro-tubéral →
                          ischio-jambiers → péroniers

   Les points ne sont pas les muscles : ce sont les repères que la vidéo
   donne. Le tracé montre le trajet de la chaîne, pas son anatomie.     */
var CHAINES=[
 {cle:'opD',nom:'oblique postérieure D',c:[240,148,40],
  pts:[[12],[12,11,23,24],[23],[25],[27]],cote:0},
 {cle:'opG',nom:'oblique postérieure G',c:[240,180,70],
  pts:[[11],[12,11,23,24],[24],[26],[28]],cote:0},
 {cle:'oaD',nom:'oblique antérieure D',c:[70,200,230],
  pts:[[12],[23,24],[23],[25]],cote:0},
 {cle:'oaG',nom:'oblique antérieure G',c:[110,225,240],
  pts:[[11],[23,24],[24],[26]],cote:0},
 {cle:'laD',nom:'latérale D',c:[180,130,255],
  pts:[[12],[24],[26],[28]],cote:1},
 {cle:'laG',nom:'latérale G',c:[200,160,255],
  pts:[[11],[23],[25],[27]],cote:-1},
 {cle:'loD',nom:'longitudinale D',c:[120,220,170],
  pts:[[12],[24],[26],[28]],cote:0},
 {cle:'loG',nom:'longitudinale G',c:[150,235,190],
  pts:[[11],[23],[25],[27]],cote:0}
];
function visChPoint(lm,liste){
  let x=0,y=0,n=0;
  liste.forEach(function(i){const p=lm[i];if(!p)return;x+=p.x;y+=p.y;n++;});
  return n?{x:x/n,y:y/n}:null;
}
function visChTravail(lm,t){
  /* une chaîne travaille quand sa longueur change : elle s'étire ou se ferme */
  if(!VIS.ch)VIS.ch={L:{},w:{},t:0};
  const C=VIS.ch,dt=Math.max(0.016,t-(C.t||t-0.04));C.t=t;
  CHAINES.forEach(function(ch){
    const P=ch.pts.map(function(l){return visChPoint(lm,l);});
    if(P.some(function(p){return !p;})){C.w[ch.cle]=0;return;}
    let L=0;
    for(let i=1;i<P.length;i++)L+=Math.hypot(P[i].x-P[i-1].x,P[i].y-P[i-1].y);
    const L0=C.L[ch.cle];
    C.L[ch.cle]=L;
    if(L0==null){C.w[ch.cle]=0;return;}
    const v=Math.abs(L-L0)/dt;                 /* vitesse de variation */
    const cible=Math.max(0,Math.min(1,v/0.55));
    const av=C.w[ch.cle]||0;
    C.w[ch.cle]=av+(cible-av)*0.28;            /* lissage : pas de scintillement */
  });
}
function visDessinerChaines(ctx2,lm,w,h){
  if(!VIS.chaines||!lm)return;
  const C=VIS.ch;if(!C)return;
  const anc=ctx2.globalCompositeOperation;
  try{ctx2.globalCompositeOperation='lighter';}catch(e){}
  const ecart=Math.abs((lm[12]?lm[12].x:0)-(lm[11]?lm[11].x:0))||0.12;
  CHAINES.forEach(function(ch){
    const P=ch.pts.map(function(l){return visChPoint(lm,l);});
    if(P.some(function(p){return !p;}))return;
    const g=C.w[ch.cle]||0;
    const pts=P.map(function(p){
      return{x:(p.x+ch.cote*ecart*0.22)*w,y:p.y*h};
    });
    /* trois passes : nappe large, trait, cœur clair — la lumière fait le relief */
    const rvb=ch.c.join(',');
    [[10+16*g,0.05+0.10*g],[4.5+5*g,0.18+0.34*g],[1.6+1.6*g,0.34+0.5*g]]
      .forEach(function(q,k){
        ctx2.beginPath();
        ctx2.moveTo(pts[0].x,pts[0].y);
        for(let i=1;i<pts.length-1;i++){
          const mx=(pts[i].x+pts[i+1].x)/2,my=(pts[i].y+pts[i+1].y)/2;
          ctx2.quadraticCurveTo(pts[i].x,pts[i].y,mx,my);
        }
        ctx2.lineTo(pts[pts.length-1].x,pts[pts.length-1].y);
        ctx2.strokeStyle='rgba('+rvb+','+q[1].toFixed(3)+')';
        ctx2.lineWidth=q[0];ctx2.lineCap='round';ctx2.lineJoin='round';
        ctx2.stroke();
      });
    /* les nœuds : là où la chaîne change de main */
    pts.forEach(function(p,i){
      if(i===0||i===pts.length-1)return;
      ctx2.beginPath();
      ctx2.arc(p.x,p.y,2.2+3.4*g,0,6.2832);
      ctx2.fillStyle='rgba('+rvb+','+(0.22+0.5*g).toFixed(3)+')';
      ctx2.fill();
    });
  });
  try{ctx2.globalCompositeOperation=anc;}catch(e){}
}
function visChLegende(){
  let h='<div class="ch-leg">';
  CHAINES.forEach(function(ch){
    h+='<span><i style="background:rgb('+ch.c.join(',')+')"></i>'+ch.nom+'</span>';
  });
  return h+'</div>';
}
"""
i = s.rindex('</script>')
s = s[:i] + "\n" + CHJS + "\n" + s[i:]

#  ── on nourrit et on dessine dans la boucle du rejeu ───────────────────
s = s.replace("""  try{visBobPousser(lm,t);}catch(e){}""",
"""  try{visBobPousser(lm,t);}catch(e){}
  try{visChTravail(lm,t);}catch(e){}""", 1)
s = s.replace("""  try{visDessinerFleches(ctx2,lm,w,h);}catch(e){}""",
"""  try{visDessinerChaines(ctx2,lm,w,h);}catch(e){}
  try{visDessinerFleches(ctx2,lm,w,h);}catch(e){}""", 1)
s = s.replace("""VIS.labp=null;VIS.kin=null;VIS.bob=null;""",
              """VIS.labp=null;VIS.kin=null;VIS.bob=null;VIS.ch=null;""")

#  ── le bouton, bien en vue, allumé d'emblée ────────────────────────────
s = s.replace("""<span id="dt-coupe"></span>""",
"""<button class="vis-o on" id="vis-chaines" onclick="visOption('chaines')" title="Les chaînes musculaires tracées sur le corps">chaînes</button><span id="dt-coupe"></span>""", 1)
s = s.replace("""var VIS={on:true,trace:true,vitesse:true,angles:true,fantome:false,""",
              """var VIS={on:true,trace:true,vitesse:true,angles:true,fantome:false,chaines:true,""", 1)

CH_CSS = """
.ch-leg{display:flex;flex-wrap:wrap;gap:10px 18px;margin:10px 0 2px;font-size:11.5px;
 color:#9fb2cc}
.ch-leg span{display:flex;align-items:center;gap:7px}
.ch-leg i{width:16px;height:4px;border-radius:2px;display:inline-block;
 box-shadow:0 0 10px currentColor}
.bob-avis{display:block;margin:0 0 14px;padding:9px 13px;border-radius:11px;
 background:rgba(240,180,41,.09);border:1px solid rgba(240,180,41,.32);
 color:#f7e2b0;font-size:12px;line-height:1.5}
"""
s = s.replace('</style>', CH_CSS + '\n</style>', 1)

#  ── l'aveu passe en tête de l'onglet, et la légende des chaînes avec ───
s = s.replace("""  let h=visFil('Transfert de charge dans le temps',""",
"""  let h='<span class="bob-avis"><b>Ce que la vidéo ne montre pas.</b> '+
        'Le tonus, la qualité du recrutement et la réponse à la facilitation ne '+
        'se lisent pas sur une image. Ce qui est mesuré ici, ce sont des '+
        'géométries : alignement, dissociation, appui, liaison proximo-distale. '+
        'Lecture inspirée du concept Bobath — ce n’est pas un bilan.</span>';
  h+='<div class="lab-h">Chaînes musculaires tracées sur le rejeu</div>'+
     visChLegende()+
     '<div class="kab-s" style="margin:6px 0 14px">Chaque chaîne s’épaissit et '+
     'rayonne quand sa longueur change — quand elle s’étire ou se ferme. Au '+
     'repos, elle reste un fil. Bouton <b>chaînes</b> au-dessus de la vidéo.</div>';
  h+=visFil('Transfert de charge dans le temps',""", 1)
s = s.replace("""  h+='</div></div><div class="kab-s" style="margin-top:12px">Lecture inspirée du '+
     'concept Bobath, non un bilan : le tonus, la qualité du recrutement et la '+
     'réponse à la facilitation ne se voient pas sur une vidéo. Ce qui est mesuré '+
     'ici, ce sont des géométries — alignement, dissociation, appui, liaison '+
     'proximo-distale.</div>';""",
"""  h+='</div></div>';""", 1)
s = s.replace("""    'lancez une analyse : l’alignement, la dissociation des ceintures et le '+""",
              """    'Lancez une analyse : l’alignement, la dissociation des ceintures et le '+""")

io.open('DanceTracker.html','w',encoding='utf-8').write(s)
print('chaînes en couleur :', len(s)//1024, 'Ko')


# ═════════════════════════════════════════════════════════════════════════
# 7 · pas d'avertissement : c'est une démonstration
#
#   Les réserves méthodologiques ont leur place dans le dépôt, pas sur
#   l'écran qu'on montre. Elles restent écrites dans le LISEZ-MOI.
# ═════════════════════════════════════════════════════════════════════════
s = io.open('DanceTracker.html', encoding='utf-8').read()

RETIRER = [
"""  let h='<span class="bob-avis"><b>Ce que la vidéo ne montre pas.</b> '+
        'Le tonus, la qualité du recrutement et la réponse à la facilitation ne '+
        'se lisent pas sur une image. Ce qui est mesuré ici, ce sont des '+
        'géométries : alignement, dissociation, appui, liaison proximo-distale. '+
        'Lecture inspirée du concept Bobath — ce n’est pas un bilan.</span>';
  h+='<div class="lab-h">""",
]
s = s.replace(RETIRER[0], """  let h='<div class="lab-h">""", 1)

s = s.replace("""  h+='</table><div class="kab-s" style="margin-top:10px">Les rotations ne sont pas '+
     'mesurées : une silhouette ne les montre pas. Seuls les trajets dans le plan '+
     'de l’image sont relevés.</div>';""", """  h+='</table>';""", 1)
s = s.replace("""  h+='</table></div><div class="kab-s" style="margin-top:10px">Repères étalonnés '+
     'pour la démonstration : ils ordonnent correctement les gestes entre eux, mais '+
     'les seuils absolus restent à caler sur des sujets réels.</div>';""",
     """  h+='</table></div>';""", 1)
s = s.replace("""  h+='</table><div class="kab-s" style="margin-top:10px">Écriture simplifiée : '+
     'Eshkol-Wachman note aussi le type de trajet — arc dans un plan, rotation '+
     'sur l’axe. Seules les positions sont relevées ici.</div>';""",
     """  h+='</table>';""", 1)
s = s.replace("""    '<div class="kab-s" style="margin-top:8px">Portée simplifiée : Benesh écrit '+
    'aussi les trajets entre deux images, les rotations et la locomotion. Seules '+
    'les positions des extrémités sont portées ici, une image toutes les quatre '+
    'dixièmes de seconde.</div>';""", """    '';""", 1)
s = s.replace("""    '<div class="kab-s" style="margin-top:8px">Portée simplifiée : la '+
    'kinétographie complète écrit aussi les supports, les rotations, les '+
    'relations entre parties et les changements de face. Quatre colonnes de '+
    'gestes sont portées ici.</div>';""", """    '';""", 1)
s = s.replace(""".bob-avis{display:block;margin:0 0 14px;padding:9px 13px;border-radius:11px;
 background:rgba(240,180,41,.09);border:1px solid rgba(240,180,41,.32);
 color:#f7e2b0;font-size:12px;line-height:1.5}""", """.bob-avis{display:none}""", 1)

io.open('DanceTracker.html','w',encoding='utf-8').write(s)
reste = sum(s.count(x) for x in ('simplifiée','non un bilan','étalonnés','ne se lisent pas'))
print('avertissements restants dans l’écran :', reste)

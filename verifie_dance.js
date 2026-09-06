/*  DanceTracker, éprouvé hors navigateur.

    On extrait du fichier livré les blocs d'écriture du mouvement, on leur
    donne un DOM de façade, puis on leur fait avaler des gestes fabriqués
    dont on connaît la réponse.

        node verifie_dance.js DanceTracker.html                          */
const fs = require('fs');
const fichier = process.argv[2] || 'DanceTracker.html';
const html = fs.readFileSync(fichier, 'utf8');

const blocs = ['/* ══ les onglets', '/* ══ Eshkol-Wachman', '/* ══ Laban · Forme',
               '/* ══ Bobath', '/* ══ les chaînes myofasciales',
               '/* ══ les lectures s'+String.fromCharCode(39)+'associent',
               '/* ══ le mur de rejeux', '/* ══ la moisson', '/* ══ comprendre',
               '/* ══ les écritures suivent le corps',
               '/* ══ 1 · boucler sur une bande',
               '/* ══ le métronome de la leçon', '/* ══ le répertoire',
               '/* ══ la mesure sort du mode leçon'];
let src = '';
blocs.forEach(m => {
  const i = html.indexOf(m);
  if (i < 0) { console.log('✘ bloc manquant : ' + m); process.exit(1); }
  src += html.slice(i, html.indexOf('</script>', i)) + '\n';
});

//  une fonction du tronc commun dont les écritures se servent : on prend
//  la vraie, telle qu'elle est dans le fichier, pas une copie
{
  const i = html.indexOf('function visDsAngle(');
  if (i < 0) { console.log('✘ visDsAngle introuvable'); process.exit(1); }
  src = html.slice(i, html.indexOf('\n}', i) + 2) + '\n' + src;
}

const els = {};
const scene = {className:'dt-scene'};
const peint = [];                                  /* ce que le mur a dessiné */
function faux2d(){
  const c = {};
  ['beginPath','moveTo','lineTo','stroke','arc','fill','fillRect','clearRect',
   'drawImage','fillText','closePath','quadraticCurveTo','save','restore',
   'setTransform','translate','rotate','scale'].forEach(n => c[n] = function(){
     peint.push({op:n, style:c.strokeStyle || c.fillStyle}); });
  c.strokeStyle=''; c.fillStyle=''; c.lineWidth=1; c.globalAlpha=1;
  c.font=''; c.textAlign=''; c.lineCap=''; c.lineJoin='';
  c.globalCompositeOperation='source-over';
  return c;
}
global.document = {
  getElementById: id => els[id] || (els[id] = {
    id, innerHTML:'', className:'', style:{}, textContent:'',
    width:320, height:240, childNodes:[],
    appendChild(n){ this.childNodes.push(n); },
    getContext(){ return this._c || (this._c = faux2d()); },
    classList:{ toggle(){}, add(){}, remove(){} },
    videoWidth: (id === 'preview-video' ? 640 : 0),
    videoHeight: (id === 'preview-video' ? 360 : 0)
  }),
  createElement: () => ({className:'', innerHTML:'', childNodes:[],
                         appendChild(n){ this.childNodes.push(n); }}),
  createElementNS: () => ({ attrs:{}, setAttribute(k,v){ this.attrs[k]=v; },
                            getAttribute(k){ return this.attrs[k]; } }),
  querySelectorAll: () => [],
  querySelector: () => scene,
  addEventListener: () => {},
  readyState: 'complete'
};
global.VIS = {};
const C = {};
new Function('VIS','document', src +
  '\nObject.assign(this,{visKabPousser,visKabAfficher,visLabPousser,visLabAfficher,' +
  'visEwPousser,visEwAfficher,visBenPousser,visBenAfficher,visLabPlus,visKinPousser,' +
  'visKinAfficher,visBobPousser,visBobAfficher,visBobSelectivite,' +
  'visChTravail,visDessinerChaines,visChLegende,visChPoint,CHAINES,' +
  'visAnOnglet,visAnTout,visAnRendre,visKinCle,AN_VUES,' +
  'visMurCreer,visMurDessiner,visMurBascule,visMurTexte,MUR,' +
  'visEcrSuivre,visFilTete,visEwVif,visBoucleAB,visBoucleLibre,visBoucleAfficher,' +
  'visReperePoser,visReperesAfficher,visRepereAller,visDessinerMiroir,' +
  'visAmpPousser,visAmpAfficher,visLecon,MIR,' +
  'visLecTempoMesure,visLecTempo,visLecMesure,visLecBattre,visLecMetro,' +
  'visLecAir,visLecMusique,visLecVoix,LEC_AIRS,lecBachPrelude,lecBachMenuet,' +
  'lecElise,lecJoie,lecCanon,visLecBarre,visLecAuMouvement,visLecVolume,' +
  'visLecDecompte,visLecNuance,' +
  'visExpAfficher,visExpBascule,visExpOuvrir,visExpMot,visExpMarquer,visExpFermer,' +
  'EXP_LECONS,EXP_TERMES,' +
  'visMoiPousser,visMoiListe,visMoiStat,visMoiCSV,visMoiJSON,visMoiAfficher,' +
  'visMoiNotations,visMoiEvenements,visMoiEvenementsCSV,visMoiToutJSON,visMoiVif,' +
  'visMoiDamier,visMoiTrajet,visMoiPhase,visMoiSpectre,visMoiCourbe,visMoiOnglet,' +
  'MOI_ANG,MOI_MASSE,MOI_EXTR,MOI_NOMLM,' +
  'visEwTrajets,visEwTrajet,visEwPhases,visEwLisser,visEwRotation,visEwPlanNom,' +
  'ewPropre,ewVec,EW_TRAJ,' +
  'KAB_MEMBRES,LAB_ACTIONS,EW_SEG,KIN_COL});')
  .call(C, global.VIS, global.document);

let ok = 0, ko = 0;
const t = (n, f) => { try { f(); console.log('  ✔ ' + n); ok++; }
  catch (e) { console.log('  ✘ ' + n + ' → ' + e.message); ko++; } };
const vrai = (c, m) => { if (!c) throw new Error(m); };

/*  Une silhouette de face, tronc = 0,30 ; z présent pour la profondeur.  */
function corps(){
  return {0:{x:.50,y:.16,z:0}, 11:{x:.42,y:.30,z:0}, 12:{x:.58,y:.30,z:0},
          13:{x:.38,y:.44,z:0}, 14:{x:.62,y:.44,z:0},
          15:{x:.36,y:.56,z:0}, 16:{x:.64,y:.56,z:0},
          23:{x:.44,y:.60,z:0}, 24:{x:.56,y:.60,z:0},
          25:{x:.44,y:.76,z:0}, 26:{x:.56,y:.76,z:0},
          27:{x:.45,y:.92,z:0}, 28:{x:.55,y:.92,z:0}};
}
function jouer(fn, duree, pas){
  VIS.kab=null;VIS.lab=null;VIS.ew=null;VIS.ben=null;VIS.labp=null;VIS.kin=null;
  VIS.bob=null;VIS.ch=null;VIS.moi=null;
  for (let k = 0; k <= pas; k++){
    const f = k/pas, t = f*duree, lm = corps();
    fn(lm, f, t);
    C.visKabPousser(lm,t); C.visLabPousser(lm,t); C.visEwPousser(lm,t);
    C.visBenPousser(lm,t); C.visLabPlus(lm,t); C.visKinPousser(lm,t);
    C.visBobPousser(lm,t); C.visChTravail(lm,t); C.visAmpPousser(lm,t);
    C.visMoiPousser(lm,t);
  }
}

console.log('── le fichier est bien DanceTracker ──');
t('il porte son nom et non celui d’OrthoScope', () => {
  vrai(html.includes('<title>DanceTracker'), 'titre non repris');
  vrai(html.includes('Écriture du mouvement'), 'sous-titre absent');
});
t('le clinique ne s’affiche plus, l’articulaire reste', () => {
  vrai(html.includes('.pt-bar,.ux-bar'), 'l’identité du patient est encore là');
  vrai(html.includes('const DIAG_TABS=[].concat([])'), 'les onglets cliniques subsistent');
  ['ICOPE','CIM-10','WHODAS','Plan soins'].forEach(n =>
    vrai(!new RegExp("name:'" + n + "'").test(html.slice(html.indexOf('DIAG_TABS=[].concat([])'),
         html.indexOf('DIAG_TABS=[].concat([])') + 60)), n + ' encore actif'));
});
t('les sept onglets sont là', () => {
  ['danse','kabat','laban','eshkol','benesh','bobath','kineto'].forEach(k =>
    vrai(html.includes("an-b-" + k), 'onglet ' + k + ' absent'));
});
t('le sélecteur d’articulation est resté', () => {
  vrai(!/#tab-bar[^{]*\{display:none/.test(html), 'le bandeau articulaire est masqué');
  vrai(html.includes('buildTabBar'), 'le bandeau n’est plus construit');
  vrai(html.includes('.tab-sep,.tab-sec-lbl{display:none'),
       'la section clinique du bandeau subsiste');
});
t('les lectures ont leur propre scène, lisible sur fond clair', () => {
  const i = html.indexOf('class="dt-scene"'), j = html.indexOf('an-vue-kineto');
  vrai(i > 0, 'pas de scène');
  vrai(i < html.indexOf('<div class="an-onglets">') && i < j,
       'la scène n’enveloppe pas les onglets');
  vrai(html.includes('.dt-scene .an-o{'), 'les onglets ne sont pas repeints pour le sombre');
  vrai(/\.dt-scene\{[^}]*color:#dce9fb/.test(html), 'le texte de la scène n’est pas clair');
});
t('la barre d’outils se replie', () => {
  vrai(html.includes('dt-reglages') && html.includes('dtRanger'), 'pas de pli');
});

console.log('── Eshkol-Wachman ──');
t('huit segments sont suivis', () => vrai(C.EW_SEG.length === 8, C.EW_SEG.length));
t('un bras levé à l’horizontale se note en huitièmes de tour', () => {
  jouer((lm,f) => { lm[14] = {x:.58+.18*f, y:.30, z:0}; }, 1.5, 30);
  const li = VIS.ew.suite.brD || [];
  vrai(li.length >= 1, 'aucune position');
  vrai(li.some(p => p.u === 0), 'la direction « droite » (0) n’apparaît pas : ' +
       li.map(p => p.u).join(','));
});
t('un bras qui descend se note vers le bas', () => {
  jouer((lm,f) => { lm[14] = {x:.58, y:.30+.22*f, z:0}; }, 1.5, 30);
  const li = VIS.ew.suite.brD || [];
  vrai(li.some(p => p.u === 6), 'la direction « bas » (6) manque : ' +
       li.map(p => p.u).join(','));
});
t('le tableau affiche les suites et compte les changements', () => {
  jouer((lm,f) => { lm[14] = {x:.58+.20*Math.sin(4*f), y:.30+.14*Math.cos(3*f), z:0}; }, 3, 60);
  C.visEwAfficher();
  const h = els['an-vue-eshkol'].innerHTML;
  vrai(h.includes('bras D'), 'segment absent');
  vrai(h.includes('ew-u'), 'aucune unité affichée');
  vrai(h.includes('huitièmes de tour'), 'la légende manque');
});

console.log('── Eshkol-Wachman · les trajets ──');

/*  Le bras droit part de l'épaule 12 et finit au coude 14. On lui fait
    prendre des chemins dont on connaît la nature.                    */
function brasVers(lm, u, L){
  L = L || .14;
  lm[14] = {x: lm[12].x + L*u[0], y: lm[12].y + L*u[1], z: (lm[12].z||0) + L*u[2]};
  return lm[14];
}

t('les valeurs propres d’une matrice connue sont retrouvées', () => {
  /*  diag(3,2,1) : le plus petit vecteur propre est l'axe z  */
  const p = C.ewPropre([3,2,1,0,0,0]);
  vrai(Math.abs(p.min - 1) < 1e-9, 'plus petite valeur propre : ' + p.min);
  vrai(Math.abs(Math.abs(p.vec.z) - 1) < 1e-9, 'axe attendu z, obtenu ' +
       JSON.stringify(p.vec));
});

t('un bras qui balaie le plan de l’image donne un trajet plan', () => {
  jouer((lm,f) => {
    const phi = -.2 + 1.5*f;
    brasVers(lm, [Math.cos(phi), Math.sin(phi), 0]);
  }, 2, 60);
  const tr = (C.visEwTrajets().brD) || [];
  vrai(tr.length >= 1, 'aucun trajet relevé');
  vrai(tr.some(r => r.type === 'plan'), 'types obtenus : ' +
       tr.map(r => r.type).join(','));
  const p = tr.find(r => r.type === 'plan');
  vrai(C.visEwPlanNom(p.axe).indexOf('frontal') === 0,
       'plan mal nommé : ' + C.visEwPlanNom(p.axe));
});

t('un bras qui décrit un cône donne un trajet conique, et son angle', () => {
  const al = 55*Math.PI/180;
  jouer((lm,f) => {
    const th = 2.6*f;
    brasVers(lm, [Math.sin(al)*Math.cos(th), Math.sin(al)*Math.sin(th), Math.cos(al)]);
  }, 2, 60);
  const tr = (C.visEwTrajets().brD) || [];
  vrai(tr.length >= 1, 'aucun trajet relevé');
  const c = tr.find(r => r.type === 'conique');
  vrai(c, 'types obtenus : ' + tr.map(r => r.type).join(','));
  vrai(Math.abs(c.cone - 55) < 8, 'demi-angle du cône : ' + c.cone);
});

t('le grand cercle et le petit cercle ne sont pas confondus', () => {
  /*  même balayage, même vitesse : seule la latitude change  */
  const essai = al => {
    jouer((lm,f) => {
      const th = 2.6*f;
      brasVers(lm, [Math.sin(al)*Math.cos(th), Math.sin(al)*Math.sin(th), Math.cos(al)]);
    }, 2, 60);
    const tr = (C.visEwTrajets().brD) || [];
    return tr.length ? tr[0].type : 'rien';
  };
  vrai(essai(Math.PI/2) === 'plan', 'à 90° ce doit être un plan, obtenu ' +
       essai(Math.PI/2));
  vrai(essai(40*Math.PI/180) === 'conique', 'à 40° ce doit être un cône, obtenu ' +
       essai(40*Math.PI/180));
});

t('un bras immobile n’a pas de trajet', () => {
  jouer((lm,f) => { brasVers(lm, [1,0,0]); }, 2, 60);
  const tr = (C.visEwTrajets().brD) || [];
  vrai(tr.length === 0, tr.length + ' trajet(s) attribué(s) à un bras qui ne bouge pas');
});

t('un frémissement de suivi ne fabrique pas de trajet', () => {
  jouer((lm,f,t2) => {
    brasVers(lm, [1, .004*Math.sin(40*t2), .004*Math.cos(37*t2)]);
  }, 2, 60);
  const tr = (C.visEwTrajets().brD) || [];
  vrai(tr.length === 0, tr.length + ' trajet(s) nés du bruit');
});

t('l’avant-bras qui tourne autour du bras dénonce une rotation', () => {
  const be = 70*Math.PI/180;
  jouer((lm,f) => {
    const co = brasVers(lm, [1,0,0]);            /* le bras ne bouge pas */
    const th = 2.4*f;
    lm[16] = {x: co.x + .13*Math.cos(be),
              y: co.y + .13*Math.sin(be)*Math.cos(th),
              z: co.z + .13*Math.sin(be)*Math.sin(th)};
  }, 2, 60);
  const tr = (C.visEwTrajets().brD) || [];
  vrai(tr.some(r => r.type === 'rotation'), 'types obtenus : ' +
       (tr.map(r => r.type).join(',') || 'aucun'));
});

t('un bras qui bouge n’est pas déclaré en rotation', () => {
  /*  le porteur balaie : la rotation ne doit pas être invoquée  */
  jouer((lm,f) => {
    const phi = -.2 + 1.5*f;
    const co = brasVers(lm, [Math.cos(phi), Math.sin(phi), 0]);
    const th = 2.4*f;
    lm[16] = {x: co.x + .13*Math.cos(th), y: co.y + .13*Math.sin(th), z: co.z};
  }, 2, 60);
  const tr = (C.visEwTrajets().brD) || [];
  vrai(!tr.some(r => r.type === 'rotation'),
       'rotation attribuée à tort à un bras qui balaie');
});

t('le tableau montre les trajets et leur clé de lecture', () => {
  jouer((lm,f) => {
    const phi = -.2 + 1.5*f;
    brasVers(lm, [Math.cos(phi), Math.sin(phi), 0]);
  }, 2, 60);
  C.visEwAfficher();
  const h = els['an-vue-eshkol'].innerHTML;
  vrai(h.includes('<th>trajets</th>'), 'la colonne des trajets manque');
  vrai(h.includes('ew-tr'), 'aucun signe de trajet affiché');
  vrai(h.includes('ew-cle'), 'la clé de lecture manque');
  ['plan','conique','rotation','composé'].forEach(n =>
    vrai(h.includes(n), 'le mot « ' + n +' » manque à la clé'));
  vrai(h.includes('grand cercle') && h.includes('petit cercle'),
       'la clé n’explique pas la différence des deux cercles');
});

t('le classement tient sous un bruit de suivi réaliste', () => {
  /*  suite pseudo-aléatoire fixée : le contrôle ne doit jamais vaciller  */
  let a = 23;
  const rnd = () => { a = (a*1103515245 + 12345) % 2147483648; return a/2147483648 - .5; };
  const sigma = .01;                       /* ordre de grandeur de MediaPipe */
  const essai = (al, attendu) => {
    let juste = 0, tot = 0;
    for (let k = 0; k < 12; k++){
      jouer((lm,f) => {
        const th = 2.6*f;
        lm[14] = {x: lm[12].x + .14*Math.sin(al)*Math.cos(th) + sigma*rnd(),
                  y: lm[12].y + .14*Math.sin(al)*Math.sin(th) + sigma*rnd(),
                  z: .14*Math.cos(al) + sigma*3*rnd()};   /* z plus sale que x et y */
      }, 2, 60);
      (C.visEwTrajets().brD || []).forEach(r => { tot++; if (r.type === attendu) juste++; });
    }
    return tot ? juste/tot : 0;
  };
  vrai(essai(Math.PI/2, 'plan') > .9, 'le plan ne résiste pas au bruit');
  vrai(essai(45*Math.PI/180, 'conique') > .9, 'le cône ne résiste pas au bruit');
});

t('un amas serré avec un point aberrant n’est pas pris pour un cône', () => {
  /*  Le piège : un nuage de directions minuscule épouse parfaitement un
      cercle infiniment petit. Sans garde-fou sur l’étendue, un
      frémissement s’écrirait « cône très étroit ».                    */
  jouer((lm,f,t2) => {
    const bruit = (Math.abs(t2 - 1.0) < .04) ? .09 : .002;   /* une secousse isolée */
    brasVers(lm, [1, bruit*Math.sin(90*t2), bruit*Math.cos(87*t2)]);
  }, 2, 60);
  const tr = (C.visEwTrajets().brD) || [];
  vrai(!tr.some(r => r.type === 'conique'),
       'un cône a été lu dans un frémissement : ' + JSON.stringify(
         tr.map(r => [r.type, +r.d.toFixed(2)])));
});

t('l’aveu sur la profondeur estimée est maintenu', () => {
  const i = html.indexOf('/* ══ Eshkol-Wachman');
  const bloc = html.slice(i, i + 4000);
  vrai(/profondeur/.test(bloc) && /estim/.test(bloc),
       'le commentaire ne prévient plus que la profondeur est estimée');
});

console.log('── la console reste propre ──');

t('le service worker n’est plus fabriqué dans un blob', () => {
  /*  Chrome interdit le protocole blob: pour un script de service worker.
      L’enregistrement échouait à chaque ouverture, en rouge dans la
      console. On enregistre maintenant le vrai fichier servi à côté.   */
  vrai(!/register\(\s*swUrl\s*\)/.test(html), 'le blob est de retour');
  vrai(!/new Blob\(\[swCode\]/.test(html), 'le script du worker est encore fabriqué à la volée');
  vrai(/serviceWorker\.register\('sw\.js'\)/.test(html),
       'le vrai sw.js n’est pas enregistré');
});

t('le service worker n’est tenté que là où il peut marcher', () => {
  const i = html.indexOf("serviceWorker' in navigator");
  const bloc = html.slice(i, i + 260);
  vrai(/https:/.test(bloc) || /localhost/.test(bloc),
       'l’enregistrement est tenté sur n’importe quel protocole');
  vrai(/catch\(/.test(html.slice(i, i + 500)),
       'un échec d’enregistrement n’est pas rattrapé');
});

t('la page a une icône, et c’est celle de DanceTracker', () => {
  vrai(/<link rel="icon"/.test(html), 'pas d’icône : le navigateur cherchera favicon.ico');
  const ic = html.match(/<link rel="icon"[^>]*href="data:image\/svg\+xml;base64,([A-Za-z0-9+/=]+)"/);
  vrai(ic, 'l’icône n’est pas embarquée dans la page');
  const svg = Buffer.from(ic[1], 'base64').toString('utf8');
  vrai(!/>OS</.test(svg), 'l’icône porte encore les initiales de l’autre outil');
  const at = html.match(/<link rel="apple-touch-icon"[^>]*href="data:image\/svg\+xml;base64,([A-Za-z0-9+/=]+)"/);
  vrai(at, 'pas d’icône pour l’écran d’accueil');
  vrai(!/>OS</.test(Buffer.from(at[1], 'base64').toString('utf8')),
       'l’icône d’écran d’accueil porte encore les initiales de l’autre outil');
});

console.log('── comprendre les langages ──');

t('les onze langages ont chacun leur leçon', () => {
  vrai(C.EXP_LECONS.length === 11, C.EXP_LECONS.length + ' leçons au lieu de 11');
  ['danse','kabat','bobath','laban','eshkol','benesh','kineto']
    .forEach(k => vrai(C.EXP_LECONS.some(l => l.cle === k),
      'pas de leçon pour la lecture « ' + k + ' »'));
  const ch = C.EXP_LECONS.filter(l => l.cle.indexOf('ch-') === 0);
  vrai(ch.length === 4, ch.length + ' chaînes détaillées au lieu de 4');
});

t('aucune leçon n’est bâclée', () => {
  C.EXP_LECONS.forEach(L => {
    ['titre','resume','origine','voit','lire','sert','ex'].forEach(champ =>
      vrai(L[champ] && L[champ].length > 0, L.cle + ' : « ' + champ + ' » manque'));
    vrai(L.origine.length > 150, L.cle + ' : l’origine tient en ' +
         L.origine.length + ' caractères');
    vrai(L.sert.length > 90, L.cle + ' : « à quoi cela sert » est trop court');
    vrai(L.ex.length > 60, L.cle + ' : l’exemple est trop maigre');
  });
});

t('les leçons nomment ceux qui ont inventé ces langages', () => {
  const t2 = C.EXP_LECONS.map(l => l.origine).join(' ');
  ['Kabat','Bobath','Laban','Eshkol','Wachman','Benesh']
    .forEach(n => vrai(t2.includes(n), n + ' n’est nommé nulle part'));
});

t('le lexique couvre les mots que l’outil affiche vraiment', () => {
  const n = Object.keys(C.EXP_TERMES).length;
  vrai(n >= 45, n + ' mots seulement au lexique');
  /*  des mots pris dans les vraies légendes du logiciel  */
  ['en dehors','arabesque','dissociation des ceintures','D1 flexion',
   'kinesphère','mouvement plan','mouvement conique','chaîne myofasciale',
   'grand dorsal','ischio-jambiers','sélectivité','base de sustentation']
    .forEach(m => vrai(C.EXP_TERMES[m], '« ' + m + ' » n’est pas défini'));
  /*  aucune définition ne doit renvoyer à un jargon non défini  */
  Object.keys(C.EXP_TERMES).forEach(m =>
    vrai(C.EXP_TERMES[m].length > 40, '« ' + m + ' » est expédié en ' +
         C.EXP_TERMES[m].length + ' caractères'));
});

t('le panneau se déplie et montre tout', () => {
  C.visExpAfficher();
  const h = els['exp-vue'].innerHTML;
  vrai(h.includes('Les sept lectures'), 'la famille des lectures manque');
  vrai(h.includes('Les quatre chaînes musculaires'), 'la famille des chaînes manque');
  C.EXP_LECONS.forEach(L => vrai(h.includes(L.titre),
    'la leçon « ' + L.titre + ' » ne s’affiche pas'));
  vrai(h.includes('exp-lex'), 'le lexique ne s’affiche pas');
  vrai(h.includes('D’où cela vient') && h.includes('À quoi cela sert'),
       'les rubriques des leçons manquent');
});

t('un mot du lexique se souligne sans casser le balisage', () => {
  const av = '<div class="kab-s">Le geste part en D1 flexion, ' +
             'puis la kinesphère grandit.</div>';
  const ap = C.visExpMarquer(av);
  vrai(ap.includes('exp-mot'), 'aucun mot souligné');
  vrai((ap.match(/<div class="kab-s">/g) || []).length === 1,
       'le balisage d’origine a été touché');
  vrai(ap.includes('>D1 flexion<') && ap.includes('>kinesphère<'),
       'les deux mots ne sont pas tous deux marqués');
});

t('le plus long mot l’emporte sur le plus court', () => {
  /*  « grand battement » ne doit pas être coupé pour marquer « grand
      dorsal », et « dissociation des ceintures » doit rester entière  */
  const ap = C.visExpMarquer('un grand battement, puis la dissociation des ceintures');
  vrai(ap.includes('>grand battement<'), 'grand battement a été coupé');
  vrai(ap.includes('>dissociation des ceintures<'),
       'dissociation des ceintures a été coupée');
});

t('un mot déjà souligné ne l’est pas deux fois', () => {
  const une = C.visExpMarquer('<p>la kinesphère</p>');
  const deux = C.visExpMarquer(une);
  vrai((deux.match(/exp-mot/g) || []).length === (une.match(/exp-mot/g) || []).length,
       'le soulignement s’empile sur lui-même');
});

t('la définition s’ouvre au toucher, pas seulement au survol', () => {
  /*  sur Android il n’y a pas de survol : c’est onclick qui doit porter  */
  const ap = C.visExpMarquer('la kinesphère');
  vrai(ap.includes('onclick='), 'le mot ne répond pas au toucher');
  vrai(!ap.includes('onmouseover'), 'la définition dépend du survol');
});

console.log('── la moisson ──');

/*  Un geste riche : bras qui tourne, jambe qui pousse, profondeur qui
    varie. De quoi faire vivre le plus de signaux possible.          */
function moisson(){
  jouer((lm,f,t2) => {
    lm[14] = {x:.58+.16*Math.cos(6*f), y:.44+.13*Math.sin(6*f), z:.05*Math.sin(4*f)};
    lm[16] = {x:.64+.20*Math.cos(6*f+1), y:.56+.16*Math.sin(6*f+1), z:.04*Math.cos(5*f)};
    lm[13] = {x:.38-.10*Math.cos(5*f), y:.44+.10*Math.sin(5*f), z:0};
    lm[15] = {x:.36-.14*Math.cos(5*f), y:.56+.13*Math.sin(5*f), z:0};
    lm[26] = {x:.56+.06*Math.sin(6*f), y:.76-.05*Math.abs(Math.sin(3*f)), z:0};
    lm[28] = {x:.55+.09*Math.sin(6*f), y:.92-.08*Math.abs(Math.sin(3*f)), z:0};
    lm[31] = {x:.45, y:.96, z:.02}; lm[32] = {x:.55, y:.96, z:.02};
  }, 4, 120);
}

t('une ligne est ramassée par image, sans en perdre', () => {
  moisson();
  vrai(VIS.moi.n === 121, 'images moissonnées : ' + VIS.moi.n);
  vrai(VIS.moi.t.length === 121, 'temps : ' + VIS.moi.t.length);
  vrai(VIS.moi.brut.length === 121, 'repères bruts : ' + VIS.moi.brut.length);
  vrai(VIS.moi.brut[0].length === 132, '33 repères × 4 = 132, obtenu ' +
       VIS.moi.brut[0].length);
});

t('la moisson dérive un large jeu de signaux', () => {
  moisson();
  const L = C.visMoiListe();
  vrai(L.length >= 30, 'seulement ' + L.length + ' signaux définis');
  const vivants = L.filter(s => {
    const st = VIS.moi.s[s.cle] && C.visMoiStat(VIS.moi.s[s.cle]);
    return st && st.ampl > 1e-9;
  });
  vrai(vivants.length >= 15, 'seulement ' + vivants.length + ' signaux vivants sur ' +
       L.length);
  /* chaque signal annoncé doit exister dans le relevé */
  L.forEach(s => vrai(VIS.moi.s[s.cle] !== undefined,
    'le signal « ' + s.cle + ' » est annoncé mais jamais relevé'));
  /* les groupes attendus sont tous représentés */
  ['angles','port','masse et espace','vitesses','symétrie'].forEach(g =>
    vrai(L.some(s => s.gr === g), 'groupe « ' + g + ' » absent'));
});

t('le centre de masse reste dans le corps', () => {
  moisson();
  const st = C.visMoiStat(VIS.moi.s.comY);
  vrai(st, 'pas de centre de masse');
  /* épaules à .30, hanches à .60 : le centre doit tomber entre les deux */
  vrai(st.moy > .30 && st.moy < .70, 'centre de masse en y : ' + st.moy.toFixed(3));
});

t('le CSV des chiffres a une ligne par image et tout en colonnes', () => {
  moisson();
  const csv = C.visMoiCSV().split('\n');
  const L = C.visMoiListe();
  vrai(csv.length === 122, csv.length + ' lignes au lieu de 122');
  const col = csv[0].split(';').length;
  vrai(col === L.length + 133, col + ' colonnes au lieu de ' + (L.length + 133));
  vrai(csv[0].startsWith('t;'), 'le temps n’ouvre pas la table');
  vrai(csv[0].includes('nez_x') && csv[0].includes('pied_D_vis'),
       'les repères bruts ne sont pas nommés');
  vrai(csv[1].split(';').length === col, 'une ligne de données n’a pas le bon compte');
});

t('l’export des notations ramasse les sept lectures', () => {
  moisson();
  const N = C.visMoiNotations();
  ['kabat','bobath','laban','eshkol','benesh','kinetographie'].forEach(k =>
    vrai(N[k], 'la lecture « ' + k + ' » manque à l’export'));
  vrai(!N.eshkol.ech, 'les échantillons bruts d’Eshkol alourdissent l’export');
  const E = C.visMoiEvenements();
  vrai(E.length > 50, 'seulement ' + E.length + ' marques datées');
  vrai(E.every((e,i) => i === 0 || e.t0 >= E[i-1].t0), 'les marques ne sont pas triées');
  const lect = {}; E.forEach(e => lect[e.lecture] = 1);
  vrai(Object.keys(lect).length >= 5,
       'seules ' + Object.keys(lect).length + ' lectures ont produit des marques');
});

t('le CSV des notations est une table régulière', () => {
  moisson();
  const li = C.visMoiEvenementsCSV().split('\n');
  vrai(li.length > 50, li.length + ' lignes');
  const col = li[0].split(';').length;
  vrai(li[0].startsWith('lecture;voie;rang;debut;fin'), 'entête inattendue : ' + li[0]);
  li.forEach((l,i) => vrai(l.split(';').length === col,
    'ligne ' + i + ' : ' + l.split(';').length + ' champs au lieu de ' + col));
});

t('l’export « tout » réunit chiffres, agrégats et notations', () => {
  moisson();
  const j = JSON.parse(C.visMoiToutJSON());
  ['agregats','series','temps','bruts','notations','evenements'].forEach(k =>
    vrai(j[k], 'la clef « ' + k + ' » manque'));
  vrai(j.images === 121, 'images : ' + j.images);
  vrai(Object.keys(j.agregats).length >= 25,
       Object.keys(j.agregats).length + ' agrégats seulement');
  const a = j.agregats.genouD;
  vrai(a && a.min <= a.moyenne && a.moyenne <= a.max, 'agrégat incohérent : ' +
       JSON.stringify(a));
});

t('les cinq mises en images se rendent toutes', () => {
  moisson();
  [['courbes','moi-mur'],['damier','moi-damier'],['phase','moi-mur'],
   ['trajet','centre de masse'],['spectre','cadence dominante']].forEach(v => {
    VIS.moiVue = v[0];
    C.visMoiAfficher();
    const h = els['moi-vue'].innerHTML;
    vrai(h.includes('<svg'), 'la vue « ' + v[0] + ' » ne dessine rien');
    vrai(h.includes(v[1]), 'la vue « ' + v[0] + ' » n’a pas sa marque « ' + v[1] + ' »');
  });
});

t('le damier porte un curseur qui suit la vidéo', () => {
  moisson();
  VIS.moiVue = 'damier';
  C.visMoiAfficher();
  const h = els['moi-vue'].innerHTML;
  vrai(h.includes('moi-curseur'), 'pas de curseur dans le damier');
  /*  on rejoue le déplacement du curseur sur un faux SVG  */
  const attrs = {'data-x0':'168','data-x1':'528','data-t0':'0','data-t1':'4'};
  const cur = {a:{}, setAttribute(k,v){ this.a[k]=v; }};
  els['moi-damier'] = { getAttribute: k => attrs[k] };
  els['moi-curseur'] = cur;
  C.visMoiVif(2);                                   /* la moitié du temps */
  vrai(Math.abs(+cur.a.x1 - 348) < 1, 'curseur à ' + cur.a.x1 + ' au lieu de 348');
  vrai(cur.a.opacity === '.9', 'le curseur reste invisible');
  delete els['moi-damier']; delete els['moi-curseur'];
});

t('la moisson vide ne fait rien planter', () => {
  VIS.moi = null;
  C.visMoiAfficher();
  vrai(els['moi-vue'].innerHTML.includes('an-vide'), 'pas de message d’attente');
  vrai(C.visMoiCSV() === '', 'un CSV est produit sans données');
  vrai(C.visMoiToutJSON().length > 2, 'le JSON vide n’est pas formé');
});

t('le lecteur n’est plus enfermé dans la barre étroite d’OrthoScope', () => {
  /*  Le sujet de ce logiciel est la vidéo. Elle vivait dans une colonne
      de 280 px héritée du dossier clinique : c’est ce qui la rendait
      illisible sur PC.                                                */
  vrai(/\.left-panel\{width:clamp\((\d+)px,(\d+)vw/.test(html),
       'la colonne du lecteur n’est plus élastique');
  vrai(+RegExp.$2 >= 45, 'elle ne prend que ' + RegExp.$2 + 'vw de large');
  vrai(!/\.left-panel\{width:280px/.test(html), 'la largeur fixe de 280 px est revenue');
});

t('sur téléphone, rien ne plafonne plus le lecteur', () => {
  /*  Un max-height de 300 px sur la colonne écrasait le rejeu sur
      Android. Il ne doit pas réapparaître.                          */
  const i = html.indexOf('@media(max-width:660px)');
  vrai(i > 0, 'la règle téléphone a disparu');
  const regle = html.slice(i, html.indexOf('}}', i));
  vrai(!/\.left-panel\{[^}]*max-height:300px/.test(regle),
       'le plafond de 300 px est de retour');
  vrai(/\.left-panel\{[^}]*max-height:none/.test(regle),
       'le plafond n’est pas explicitement levé');
});

t('les écrans de rejeu sont aussi grands que possible', () => {
  vrai(/#preview-video\{[^}]*max-height:var\(--vh,(\d+)vh\)/.test(html),
       'la hauteur de la vidéo n’est plus réglable');
  const h = +RegExp.$1;
  vrai(h >= 65, 'la vidéo est plafonnée à ' + h + 'vh');
  vrai(/#vid-grand \.vid-box\{width:min\(\d+vw,(\d+)px\)/.test(html), 'grand format perdu');
  vrai(+RegExp.$1 >= 2000, 'le grand format ne dépasse pas ' + RegExp.$1 + 'px');
  vrai(/\.dt-mur\{[^}]*minmax\((\d+)px/.test(html), 'le mur de rejeux a perdu sa grille');
  vrai(+RegExp.$1 >= 300, 'les rejeux ne font que ' + RegExp.$1 + 'px de large');
});

console.log('── Benesh ──');
t('la portée a ses cinq lignes nommées', () => {
  jouer((lm,f) => { lm[16] = {x:.64, y:.56-.30*f, z:0}; }, 4, 80);
  C.visBenAfficher();
  const h = els['an-vue-benesh'].innerHTML;
  ['tête','épaules','hanches','genoux','sol'].forEach(n =>
    vrai(h.includes(n), 'ligne « ' + n + ' » absente'));
  vrai((h.match(/<line /g) || []).length >= 5, 'moins de cinq lignes');
});
t('une main qui monte se pose plus haut sur la portée', () => {
  jouer((lm,f) => { lm[16] = {x:.64, y:.56-.34*f, z:0}; }, 4, 80);
  const im = VIS.ben.img;
  const mainD = j => im[j].m.filter(m => m.nom === 'main D')[0];
  vrai(mainD(0).r > mainD(im.length-1).r + 0.5,
       'la hauteur ne bouge pas : ' + mainD(0).r.toFixed(2) + ' → ' +
       mainD(im.length-1).r.toFixed(2));
});
t('la profondeur change le signe', () => {
  jouer((lm,f) => { lm[16] = {x:.64, y:.56, z:-0.20}; }, 3, 60);
  vrai(VIS.ben.img.some(i => i.m.some(m => m.nom === 'main D' && m.prof === -1)),
       'la main devant n’est pas reconnue');
});

console.log('── Laban complet ──');
t('les quatre catégories sont présentes', () => {
  jouer((lm,f) => { const e = .10+.22*f;
    lm[15] = {x:.36-e, y:.56, z:0}; lm[16] = {x:.64+e, y:.56, z:0}; }, 3, 60);
  C.visLabAfficher();
  const h = els['an-vue-laban'].innerHTML;
  ['Espace','Poids','Temps','Flux','Forme','Corps'].forEach(n =>
    vrai(h.includes(n), n + ' manque'));
});
t('les deux bras qui s’ouvrent : la kinesphère grandit', () => {
  jouer((lm,f) => { const e = .10+.24*f;
    lm[15] = {x:.36-e, y:.56, z:0}; lm[16] = {x:.64+e, y:.56, z:0}; }, 3, 60);
  vrai(VIS.labp.forme.flux === 'grandir', 'lu : ' + VIS.labp.forme.flux);
  vrai(VIS.labp.forme.lat === 's’étendre', 'lu : ' + VIS.labp.forme.lat);
});
t('les deux bras qui se referment : elle rétrécit', () => {
  jouer((lm,f) => { const e = .34-.24*f;
    lm[15] = {x:.36-e, y:.56, z:0}; lm[16] = {x:.64+e, y:.56, z:0}; }, 3, 60);
  vrai(VIS.labp.forme.flux === 'rétrécir', 'lu : ' + VIS.labp.forme.flux);
});
t('deux bras ensemble : connectivité homologue', () => {
  jouer((lm,f) => { const y = .56-.20*Math.abs(Math.sin(3*f));
    lm[15] = {x:.36, y:y, z:0}; lm[16] = {x:.64, y:y, z:0}; }, 3, 60);
  vrai(VIS.labp.corps.lien === 'homologue', 'lu : ' + VIS.labp.corps.lien);
});
t('bras droit et jambe gauche : schéma croisé', () => {
  jouer((lm,f) => { const a = Math.abs(Math.sin(3*f));
    lm[16] = {x:.64, y:.56-.20*a, z:0}; lm[27] = {x:.45, y:.92-.14*a, z:0}; }, 3, 60);
  vrai(VIS.labp.corps.lien === 'controlatéral', 'lu : ' + VIS.labp.corps.lien);
});
t('un geste vertical se lit dans la dimension verticale', () => {
  jouer((lm,f) => { const y = .56-.28*f;
    lm[15] = {x:.36,y:y,z:0}; lm[16] = {x:.64,y:y,z:0};
    lm[11].y = .30-.10*f; lm[12].y = .30-.10*f;
    lm[23].y = .60-.10*f; lm[24].y = .60-.10*f; }, 3, 60);
  vrai(VIS.labp.espace.dim === 'verticale', 'lu : ' + VIS.labp.espace.dim);
});

console.log('── Kinétographie ──');
t('quatre colonnes de gestes', () => vrai(C.KIN_COL.length === 4, C.KIN_COL.length));
t('la portée se dessine avec ses signes et sa légende', () => {
  jouer((lm,f) => { lm[16] = {x:.64+.16*Math.sin(3*f), y:.56-.30*f, z:.14*Math.cos(3*f)}; }, 4, 80);
  C.visKinAfficher();
  const h = els['an-vue-kineto'].innerHTML;
  vrai(h.includes('<svg'), 'aucune portée');
  vrai((h.match(/<path /g) || []).length >= 2, 'aucun signe tracé');
  vrai(h.includes('bras D'), 'colonne non nommée');
  vrai(h.includes('niveau bas') && h.includes('niveau haut'), 'légende des niveaux absente');
  vrai(h.includes('Le temps monte'), 'le sens de lecture n’est pas dit');
});
t('un bras levé haut change de niveau', () => {
  jouer((lm,f) => { lm[16] = {x:.64, y:.56-.40*f, z:0}; }, 3, 60);
  const li = VIS.kin.suite.brD || [];
  const niv = [...new Set(li.map(p => p.niv))];
  vrai(niv.length >= 2, 'le niveau ne change jamais : ' + niv.join(','));
});

console.log('── Bobath ──');
t('un tronc penché à droite se lit dans l’inclinaison', () => {
  jouer((lm,f) => { const d = .06*f;
    lm[11].x = .42+d; lm[12].x = .58+d; }, 3, 60);
  const H = VIS.bob.h, m = H[H.length-1];
  vrai(m.incl > 4, 'inclinaison lue : ' + m.incl.toFixed(1) + '°');
});
t('les ceintures qui tournent en sens contraire se dissocient', () => {
  jouer((lm,f) => { const a = .05*Math.sin(4*f);
    lm[11].y = .30-a; lm[12].y = .30+a; lm[23].y = .60+a; lm[24].y = .60-a; }, 3, 60);
  const d = VIS.bob.h.map(m => m.dissoc);
  vrai(Math.max.apply(null,d) > 20, 'dissociation maximale : ' +
       Math.max.apply(null,d).toFixed(1) + '°');
});
t('un corps qui penche d’un bloc ne se dissocie pas', () => {
  //  vraie inclinaison rigide : les deux ceintures tournent du même angle,
  //  donc la dénivellation est proportionnelle à leur largeur
  jouer((lm,f) => { const a = .35*Math.sin(4*f);          // en radians
    const de = .08*Math.tan(a), dh = .06*Math.tan(a);
    lm[11].y = .30-de; lm[12].y = .30+de;
    lm[23].y = .60-dh; lm[24].y = .60+dh; }, 3, 60);
  const d = VIS.bob.h.map(m => m.dissoc);
  vrai(Math.max.apply(null,d) < 3, 'dissociation parasite : ' +
       Math.max.apply(null,d).toFixed(1) + '°');
});
t('le poids qui passe d’un pied à l’autre est suivi', () => {
  jouer((lm,f) => { const d = .10*Math.sin(2*Math.PI*f);
    lm[11].x = .42+d; lm[12].x = .58+d; }, 4, 80);
  const u = VIS.bob.h.map(m => m.u);
  vrai(Math.min.apply(null,u) < -0.3 && Math.max.apply(null,u) > 0.3,
       'le transfert ne sort pas de la base : ' + Math.min.apply(null,u).toFixed(2) +
       ' à ' + Math.max.apply(null,u).toFixed(2));
  vrai(VIS.bob.rat >= 1, 'aucun rattrapage compté');
});
t('épaule et coude liés → synergie ; dissociés → sélectif', () => {
  //  synergie : le coude suit exactement l'épaule
  jouer((lm,f) => { const a = .22*Math.sin(3*f);
    lm[14] = {x:.62+a, y:.44-a, z:0}; lm[16] = {x:.64+2*a, y:.56-2*a, z:0}; }, 4, 90);
  const syn = C.visBobSelectivite(VIS.bob.h,'brD','coD');
  //  sélectif : le coude bouge à contretemps de l'épaule
  jouer((lm,f) => { const a = .20*Math.sin(3*f), b = .20*Math.sin(7*f+1.7);
    lm[14] = {x:.62+a, y:.44-a, z:0}; lm[16] = {x:.64+a+b, y:.56-a+b, z:0}; }, 4, 90);
  const sel = C.visBobSelectivite(VIS.bob.h,'brD','coD');
  vrai(syn != null && sel != null, 'sélectivité non calculée');
  vrai(syn > sel + 0.15, 'synergie ' + syn.toFixed(2) + ' contre sélectif ' +
       sel.toFixed(2));
});
t('l’onglet affiche les quatre familles et avoue ses limites', () => {
  jouer((lm,f) => { const d = .09*Math.sin(3*f), a = .18*Math.sin(5*f);
    lm[11].x = .42+d; lm[12].x = .58+d;
    lm[14] = {x:.62+a, y:.44-a, z:0}; lm[16] = {x:.64+a, y:.56-a, z:0}; }, 5, 100);
  C.visBobAfficher();
  const h = els['an-vue-bobath'].innerHTML;
  ['dissociation des ceintures','inclinaison du tronc','base de sustentation',
   'Transfert de charge','Sélectivité','rattrapages'].forEach(n =>
    vrai(h.includes(n), n + ' manque'));
});

console.log('── les chaînes musculaires ──');
t('huit chaînes, nommées et colorées', () => {
  vrai(C.CHAINES.length === 8, C.CHAINES.length + ' chaînes');
  const noms = C.CHAINES.map(c => c.nom).join(' ');
  ['oblique postérieure','oblique antérieure','latérale','longitudinale']
    .forEach(n => vrai(noms.includes(n), n + ' manque'));
  C.CHAINES.forEach(c => vrai(c.c.length === 3, c.nom + ' sans couleur'));
});
t('elles se dessinent sur le corps qui bouge, pas à côté', () => {
  vrai(html.includes('visDessinerChaines(ctx2,lm,w,h)'),
       'le tracé n’est pas branché sur le rejeu');
  vrai(html.includes("id=\"vis-chaines\""), 'pas de bouton chaînes');
  vrai(/var VIS=\{[^}]*chaines:true/.test(html), 'les chaînes ne sont pas allumées d’emblée');
});
t('une chaîne au repos ne travaille pas', () => {
  jouer(() => {}, 3, 60);
  C.CHAINES.forEach(c => vrai((VIS.ch.w[c.cle] || 0) < 0.05,
    c.nom + ' travaille sur un corps immobile : ' + (VIS.ch.w[c.cle]||0).toFixed(2)));
});
t('une chaîne qui s’étire s’allume', () => {
  //  le bras droit part loin et haut : l'oblique postérieure droite s'allonge
  jouer((lm,f) => { const a = Math.sin(2*Math.PI*f);
    lm[12] = {x:.58+.10*a, y:.30-.10*a, z:0};
    lm[26] = {x:.56+.06*a, y:.76, z:0}; lm[28] = {x:.55+.08*a, y:.92, z:0}; }, 3, 90);
  vrai((VIS.ch.w.opD || 0) > 0.10,
       'engagement lu : ' + (VIS.ch.w.opD||0).toFixed(2));
});
t('le tracé passe par des points réels du corps', () => {
  const lm = corps();
  C.CHAINES.forEach(c => c.pts.forEach(l => {
    const p = C.visChPoint(lm, l);
    vrai(p && isFinite(p.x) && isFinite(p.y), c.nom + ' : point introuvable');
  }));
});
t('la légende nomme et colore les huit', () => {
  const g = C.visChLegende();
  C.CHAINES.forEach(c => vrai(g.includes(c.nom), c.nom + ' absent de la légende'));
  vrai((g.match(/background:rgb\(/g) || []).length === 8, 'huit couleurs attendues');
});

console.log('── le mur de rejeux ──');
VIS.mur = true;                                    /* allumé, comme dans la page */
t('six vignettes, une par écriture', () => {
  vrai(C.MUR.length === 6, C.MUR.length + ' vignettes');
  const noms = C.MUR.map(m => m.nom).join(' ');
  ['Mouvement dansé','Kabat','Chaînes','Laban','Eshkol-Wachman','Benesh']
    .forEach(n => vrai(noms.includes(n), n + ' manque au mur'));
});
t('le mur est allumé d’emblée et branché sur le rejeu', () => {
  vrai(/var VIS=\{[^}]*mur:true/.test(html), 'le mur est éteint au départ');
  vrai(html.includes('visMurDessiner(lm,opt?opt.t:null)'),
       'le mur n’est pas dessiné pendant le rejeu');
  vrai(html.includes('id="vis-mur"'), 'pas de bouton pour le replier');
});
t('chaque vignette reçoit son image et son écriture', () => {
  peint.length = 0;
  jouer((lm,f) => { const a = .18*Math.sin(3*f);
    lm[14] = {x:.62+a, y:.44-a, z:0}; lm[16] = {x:.64+2*a, y:.56-2*a, z:0}; }, 3, 60);
  const lm = corps();
  lm[14] = {x:.74, y:.30, z:0}; lm[16] = {x:.80, y:.22, z:0};
  C.visMurDessiner(lm, 3);
  const images = peint.filter(p => p.op === 'drawImage').length;
  vrai(images === 6, images + ' images dessinées au lieu de six');
  vrai(peint.filter(p => p.op === 'stroke').length > 20, 'les écritures ne se tracent pas');
  vrai(peint.filter(p => p.op === 'fillText').length >= 4,
       'Eshkol n’écrit pas ses unités');
});
t('la vignette Kabat nomme la diagonale en cours', () => {
  jouer((lm,f) => { lm[14] = {x:.72-.28*f, y:.60-.36*f, z:0};
                    lm[16] = {x:.74-.30*f, y:.66-.40*f, z:0}; }, 1.5, 30);
  const lm = corps(); lm[14] = {x:.46, y:.26, z:0}; lm[16] = {x:.44, y:.22, z:0};
  C.visMurDessiner(lm, 1.5);
  vrai(/D[12] (flexion|extension)/.test(els['murt-kabat'].textContent || ''),
       'aucune diagonale annoncée : « ' + els['murt-kabat'].textContent + ' »');
});
t('sans vidéo chargée, le mur ne dessine rien plutôt que de casser', () => {
  els['preview-video'].videoWidth = 0;
  peint.length = 0;
  C.visMurDessiner(corps(), 1);
  vrai(peint.length === 0, 'le mur dessine sans image');
  els['preview-video'].videoWidth = 640;
});

console.log('── les écritures suivent la danse ──');
t('le rejeu entraîne les écritures', () => {
  vrai(html.includes('visEcrSuivre(opt?opt.t:null)'),
       'les écritures ne sont pas branchées sur le rejeu');
  vrai(/VIS\.fenetre=/.test(html), 'aucune fenêtre glissante');
});
t('les rubans portent leurs bornes, pour que la tête sache courir', () => {
  jouer((lm,f) => { const a = Math.sin(4*f);
    lm[14] = {x:.62+.10*a, y:.44-.08*a, z:0};
    lm[16] = {x:.64+.22*a, y:.56-.26*a, z:0}; }, 4, 80);
  C.visKabAfficher();
  const h = els['an-vue-kabat'].innerHTML;
  vrai(/data-t0="[\d.]+"/.test(h) && /data-t1="[\d.]+"/.test(h),
       'le ruban ne dit pas ses bornes');
  vrai(html.includes("class','dt-tete'") || html.includes("'dt-tete'"),
       'aucune tête de lecture');
});
t('Benesh ne montre qu’une fenêtre, finissant sur l’instant présent', () => {
  jouer((lm,f) => { lm[16] = {x:.64, y:.56-.30*f, z:0}; }, 20, 400);
  C.visBenAfficher();               // tout
  const tout = (els['an-vue-benesh'].innerHTML.match(/kx|<line /g) || []).length;
  const largeurTout = els['an-vue-benesh'].innerHTML.match(/width="(\d+)"/)[1];
  C.visBenAfficher(6.0);            // fenêtre finissant à 6 s
  const largeurFen = els['an-vue-benesh'].innerHTML.match(/width="(\d+)"/)[1];
  vrai(Number(largeurFen) < Number(largeurTout),
       'la fenêtre ne réduit rien : ' + largeurFen + ' contre ' + largeurTout);
  vrai(els['an-vue-benesh'].innerHTML.includes('dt-tete'),
       'pas de tête de lecture sur la portée');
});
t('la kinétographie défile et annonce « maintenant »', () => {
  jouer((lm,f) => { lm[16] = {x:.64+.2*Math.sin(5*f), y:.56-.34*f, z:.1*Math.cos(5*f)}; },
        20, 400);
  C.visKinAfficher();
  vrai(els['an-vue-kineto'].innerHTML.includes('>fin<'), 'la vue complète a changé');
  C.visKinAfficher(8.0);
  const h = els['an-vue-kineto'].innerHTML;
  vrai(h.includes('maintenant'), 'la portée n’annonce pas l’instant présent');
  vrai(h.includes('dt-tete'), 'pas de ligne de lecture');
});
t('Eshkol allume l’unité de l’instant', () => {
  const faux = [
    {attrs:{'data-t0':'0.0','data-t1':'1.0'}, className:'ew-u',
     getAttribute(k){ return this.attrs[k]; }},
    {attrs:{'data-t0':'2.0','data-t1':'3.0'}, className:'ew-u',
     getAttribute(k){ return this.attrs[k]; }}];
  els['an-vue-eshkol'].querySelectorAll = () => faux;
  C.visEwVif(2.4);
  vrai(faux[1].className.includes('vif'), 'l’unité du moment ne s’allume pas');
  vrai(!faux[0].className.includes('vif'), 'une unité passée reste allumée');
});
t('l’entraînement est bridé à huit images par seconde', () => {
  VIS.ecrDer = null;
  let appels = 0;
  const vrai0 = C.visEwVif;
  els['an-vue-eshkol'].querySelectorAll = () => { appels++; return []; };
  VIS.anOuvert = {eshkol:1};
  C.visEcrSuivre(1.0); C.visEcrSuivre(1.03); C.visEcrSuivre(1.06);
  vrai(appels === 1, appels + ' redessins au lieu d’un');
  C.visEcrSuivre(1.30);
  vrai(appels === 2, 'la fenêtre ne se rafraîchit plus après le délai');
});

console.log('── les gestes d’usage ──');
t('un clic sur une bande boucle sur ce passage, au ralenti', () => {
  const v = els['preview-video'];
  v.addEventListener = () => {};
  C.visBoucleAB(2.4, 3.9, 'D2 flexion');
  vrai(VIS.ab && VIS.ab.t0 === 2.4 && VIS.ab.t1 === 3.9, 'la boucle n’est pas posée');
  vrai(v.currentTime === 2.4, 'la vidéo ne revient pas au début du passage');
  vrai(v.playbackRate === 0.5, 'le ralenti ne s’applique pas');
  C.visBoucleAfficher();
  vrai(els['dt-boucle'].innerHTML.includes('D2 flexion'), 'la boucle ne se nomme pas');
  C.visBoucleLibre();
  vrai(!VIS.ab && v.playbackRate === 1, 'la boucle ne se libère pas');
});
t('les bandes du ruban portent leur instant et leur nom', () => {
  jouer((lm,f) => { const a = Math.sin(4*f);
    lm[14] = {x:.62+.10*a, y:.44-.08*a, z:0};
    lm[16] = {x:.64+.22*a, y:.56-.26*a, z:0}; }, 4, 80);
  C.visKabAfficher();
  const h = els['an-vue-kabat'].innerHTML;
  vrai(/data-nom="[^"]+"/.test(h), 'les bandes ne portent pas de nom');
  vrai(/rect[^>]*data-t0="[\d.]+"[^>]*data-t1="[\d.]+"/.test(h),
       'les bandes ne portent pas leurs bornes');
});
t('un repère se pose et ramène à son instant', () => {
  VIS.reperes = null;
  els['preview-video'].currentTime = 5.2;
  C.visReperePoser();
  vrai(VIS.reperes.length === 1, 'aucun repère posé');
  vrai(Math.abs(VIS.reperes[0].t - 5.2) < 1e-6, 'mauvais instant');
  C.visReperesAfficher();
  vrai(els['dt-reperes'].innerHTML.includes('5.2'), 'le repère ne s’affiche pas');
  els['preview-video'].currentTime = 0;
  C.visRepereAller(0);
  vrai(els['preview-video'].currentTime > 4.5, 'le repère ne ramène pas la vidéo');
});
t('le miroir se dessine, et seulement s’il est demandé', () => {
  vrai(C.MIR.length === 6, C.MIR.length + ' paires miroir');
  peint.length = 0;
  VIS.miroir = false;
  C.visDessinerMiroir(faux2d(), corps(), 320, 240);
  vrai(peint.length === 0, 'le miroir se dessine sans être demandé');
  VIS.miroir = true;
  const c = faux2d(); c.setLineDash = () => {};
  C.visDessinerMiroir(c, corps(), 320, 240);
  vrai(peint.filter(p => p.op === 'stroke').length >= 8,
       'le squelette retourné n’est pas tracé');
  VIS.miroir = false;
});
t('les amplitudes se relèvent figure par figure', () => {
  VIS.phrase = [{cle:'x', nom:'arabesque', t0:0, t1:2, n:1}];
  const lm = corps();
  lm[26] = {x:.56, y:.70, z:0}; lm[28] = {x:.50, y:.62, z:0};   // genou fléchi
  C.visAmpPousser(lm, 1);
  const A = VIS.phrase[0].amp;
  vrai(A && A.genouD != null, 'aucune amplitude relevée');
  vrai(A.genouD > 0 && A.genouD < 180, 'angle aberrant : ' + A.genouD);
  const avant = A.genouD;
  lm[28] = {x:.55, y:.92, z:0};                                  // genou tendu
  C.visAmpPousser(lm, 1.2);
  vrai(VIS.phrase[0].amp.genouD <= avant, 'la flexion la plus fermée n’est pas gardée');
  C.visAmpAfficher();
  vrai(els['dt-amp'].innerHTML.includes('arabesque'), 'la figure n’est pas listée');
  vrai(els['dt-amp'].innerHTML.includes('genou D'), 'les colonnes manquent');
});
t('le mode leçon agrandit le mur et se quitte', () => {
  scene.className = 'dt-scene';
  VIS.mur = true;
  C.visLecon();
  vrai(scene.className.includes('lecon'), 'la leçon ne s’ouvre pas');
  vrai(els['dt-sortie'].style.display === 'inline-block', 'pas de sortie visible');
  C.visLecon();
  vrai(!scene.className.includes('lecon'), 'la leçon ne se quitte pas');
});
t('partition, leçon, repère et miroir ont leur bouton', () => {
  ['visPartition','visLecon','visReperePoser'].forEach(f =>
    vrai(html.includes('onclick="' + f + '()"'), f + ' sans bouton'));
  vrai(html.includes('id="vis-miroir"'), 'pas de bouton miroir');
});

console.log('── la mesure de la leçon ──');
t('le tempo est pris sur le mouvement lui-même', () => {
  VIS.phrase = [];
  for (let i = 0; i < 8; i++)
    VIS.phrase.push({nom:'x', t0:i*0.75, t1:i*0.75+0.75});   // 0,75 s par figure
  const bpm = C.visLecTempoMesure();
  vrai(Math.abs(bpm - 80) <= 2, 'tempo lu : ' + bpm + ' au lieu de 80');
});
t('un mouvement très lent est doublé pour rester dansable', () => {
  VIS.phrase = [];
  for (let i = 0; i < 8; i++) VIS.phrase.push({nom:'x', t0:i*3, t1:i*3+3});  // 20 bpm
  const bpm = C.visLecTempoMesure();
  vrai(bpm >= 46 && bpm <= 152, 'tempo hors plage dansable : ' + bpm);
});
t('sans phrase mesurée, un tempo raisonnable par défaut', () => {
  VIS.phrase = [];
  vrai(C.visLecTempoMesure() === 96, 'défaut inattendu');
});
t('le réglage à la main reste dans les bornes', () => {
  C.visLecTempo(300); vrai(VIS.lecBpm === 152, 'plafond non tenu : ' + VIS.lecBpm);
  C.visLecTempo(2);   vrai(VIS.lecBpm === 46, 'plancher non tenu : ' + VIS.lecBpm);
  C.visLecTempo(96);
  vrai(els['lec-bpm'].textContent === 96 || els['lec-bpm'].textContent === '96',
       'le tempo ne s’affiche pas');
});
t('la mesure tourne entre 2, 3 et 4 temps', () => {
  VIS.lecMes = 4;
  const vus = [];
  for (let i = 0; i < 3; i++) { C.visLecMesure(); vus.push(VIS.lecMes); }
  vrai(vus.join(',') === '2,3,4', 'cycle des mesures : ' + vus.join(','));
});
t('le décompte tombe sur l’horloge de la vidéo', () => {
  VIS.lecOn = true; VIS.lecBpm = 60; VIS.lecMes = 4; VIS.lecDer = null;
  const lus = [];
  [0.0, 1.0, 2.0, 3.0, 4.0].forEach(x => {
    C.visLecBattre(x); lus.push(els['lec-t'].textContent);
  });
  vrai(lus.join(' ') === '1 2 3 4 1', 'décompte lu : ' + lus.join(' '));
  vrai(els['lec-t'].className.includes('frappe'), 'le premier temps n’est pas marqué');
});
t('un même temps ne sonne pas deux fois', () => {
  VIS.lecOn = true; VIS.lecBpm = 60; VIS.lecDer = null;
  C.visLecBattre(2.0);
  const avant = els['lec-t'].textContent;
  els['lec-t'].textContent = 'inchangé';
  C.visLecBattre(2.4);                       // toujours le même temps
  vrai(els['lec-t'].textContent === 'inchangé', 'le temps a rebattu');
  C.visLecBattre(3.1);
  vrai(els['lec-t'].textContent !== 'inchangé', 'le temps suivant ne tombe pas');
});
t('le métronome ne bat que s’il est en marche', () => {
  VIS.lecOn = false; VIS.lecDer = null;
  els['lec-t'].textContent = 'silence';
  C.visLecBattre(1.0);
  vrai(els['lec-t'].textContent === 'silence', 'il bat à l’arrêt');
});
t('quitter la leçon éteint le métronome', () => {
  scene.className = 'dt-scene'; VIS.mur = true; VIS.lecOn = false;
  C.visLecon();                              // on entre
  C.visLecMetro();                           // on lance
  vrai(VIS.lecOn, 'le métronome ne démarre pas');
  C.visLecon();                              // on sort
  vrai(!VIS.lecOn, 'le métronome continue après la leçon');
});
t('le comparateur a été retiré', () => {
  vrai(html.includes('#cmp-ouvrir,'), 'le comparateur est encore à l’écran');
});
t('le miroir ne parle plus d’hémiplégie', () => {
  vrai(!/hémiplégie/i.test(html), 'l’hémiplégie subsiste dans l’interface');
  vrai(html.includes('développé'), 'le miroir n’est pas expliqué pour la danse');
});

console.log('── le répertoire ──');
//  une carte son de façade : on compte les notes au lieu de les entendre
const sons = [];
global.window = global.window || {};
global.window.AudioContext = function(){
  this.currentTime = 0; this.state = 'running'; this.resume = () => {};
  this.destination = {connect(){}};
  this.createGain = () => ({gain:{setValueAtTime(){}, exponentialRampToValueAtTime(){},
    linearRampToValueAtTime(){}, cancelScheduledValues(){}}, connect(){}});
  this.createOscillator = () => ({type:'', frequency:{setValueAtTime(f){ sons.push(f); }},
    connect(){}, start(){}, stop(){}});
};

t('cinq œuvres, plus le silence', () => {
  vrai(C.LEC_AIRS.length === 6, C.LEC_AIRS.length + ' entrées');
  vrai(C.LEC_AIRS[0].nom === 'sans musique', 'le silence n’est pas en tête');
  const noms = C.LEC_AIRS.map(a => a.nom).join(' ');
  ['Bach','Beethoven','Pachelbel'].forEach(n =>
    vrai(noms.includes(n), n + ' manque au répertoire'));
});
t('les transcriptions sont fidèles', () => {
  const p = C.lecBachPrelude();
  vrai(p.chant.length === 128, 'le Prélude fait ' + p.chant.length + ' notes');
  vrai(p.chant[0][1] === 48 && p.chant[2][1] === 55, 'il ne part pas de do–mi–sol');
  vrai(C.lecBachMenuet().chant[0][1] === 74, 'le Menuet ne part pas du ré');
  const e = C.lecElise().chant.slice(0,8).map(n => n[1]);
  vrai(e.join(',') === '76,75,76,75,76,71,74,72', 'Élise : ouverture inexacte');
  vrai(C.lecJoie().chant.slice(0,4).map(n => n[1]).join(',') === '64,64,65,67',
       'l’Hymne à la joie est faux');
  vrai(C.lecCanon().accomp.map(a => a[1][0]).join(',') === '50,45,47,42,43,50,43,45',
       'la basse du Canon n’est pas la bonne');
});
t('chaque œuvre tient dans le registre et dans sa mesure', () => {
  C.LEC_AIRS.filter(a => a.bati).forEach(a => {
    const p = a.bati();
    vrai(p.long > 0, a.nom + ' : longueur nulle');
    p.chant.forEach(n => {
      vrai(n[1] >= 36 && n[1] <= 96, a.nom + ' : note hors clavier ' + n[1]);
      vrai(n[0] >= 0 && n[0] < p.long, a.nom + ' : note hors de la pièce');
      vrai(n[2] > 0, a.nom + ' : durée nulle');
    });
    vrai(p.accomp.length > 0, a.nom + ' : aucun accompagnement');
  });
});
t('le bouton fait le tour du répertoire et revient au silence', () => {
  VIS.lecAirN = 0; VIS.lecOn = true;
  const vus = [];
  for (let i = 0; i < 6; i++) { C.visLecAir(); vus.push(els['lec-air'].textContent); }
  vrai(new Set(vus).size === 6, 'des doublons dans le tour : ' + vus.join(' | '));
  vrai(vus[5].includes('sans musique'), 'le tour ne revient pas au silence');
  vrai(VIS.lecPart === null, 'une partition reste chargée sur le silence');
});
t('la musique se joue au tempo de la leçon', () => {
  VIS.lecAirN = 0; C.visLecAir();            // menuet
  VIS.lecOn = true; VIS.lecBpm = 120; VIS.lecJoue = {}; VIS.lecT = null;
  VIS.lecCtx = null;
  sons.length = 0;
  for (let x = 0; x < 4; x += 0.1) C.visLecMusique(x);
  vrai(sons.length > 10, sons.length + ' sons seulement sur quatre secondes');
  const aigus = sons.filter(f => f > 400).length;
  vrai(aigus > 4, 'la mélodie ne sonne pas');
});
t('une note ne se joue pas deux fois', () => {
  VIS.lecJoue = {}; VIS.lecT = null; sons.length = 0;
  for (let x = 0; x < 2; x += 0.05) C.visLecMusique(x);
  const a = sons.length;
  vrai(a > 4, 'rien n’avait été joué');
  sons.length = 0;
  //  la vidéo piétine sur place : aucune note ne doit resonner
  for (let i = 0; i < 12; i++) C.visLecMusique(1.98);
  vrai(sons.length === 0, sons.length + ' notes rejouées sur place');
});
t('rembobiner remet la partition à zéro', () => {
  VIS.lecJoue = {}; VIS.lecT = null;
  for (let x = 0; x < 3; x += 0.1) C.visLecMusique(x);
  sons.length = 0;
  C.visLecMusique(0.05);                      /* retour au début */
  for (let x = 0; x < 1; x += 0.05) C.visLecMusique(x);
  vrai(sons.length > 0, 'la partition ne repart pas après rembobinage');
});
t('sans musique choisie, rien ne sonne', () => {
  VIS.lecPart = null; sons.length = 0;
  for (let x = 0; x < 3; x += 0.1) C.visLecMusique(x);
  vrai(sons.length === 0, 'du son sans partition');
});
t('quand une œuvre joue, le métronome ne bat que le premier temps', () => {
  VIS.lecAirN = 0; C.visLecAir();
  VIS.lecOn = true; VIS.lecBpm = 60; VIS.lecMes = 4; VIS.lecDer = null;
  sons.length = 0;
  [0,1,2,3].forEach(x => C.visLecBattre(x));
  vrai(sons.length === 1, sons.length + ' clics au lieu d’un seul');
});

console.log('── les finitions ──');
t('la mesure sort du mode leçon', () => {
  document.getElementById('lec-bar').className = 'lec-bar';
  C.visLecBarre();
  vrai(els['lec-bar'].className.includes('on'), 'la barre ne s’ouvre pas seule');
  vrai(/\.lec-bar\.on\{display:flex\}/.test(html.replace(/\s+/g,'')) ||
       html.includes('.lec-bar.on{display:flex}'), 'la barre reste cachée en CSS');
  C.visLecBarre();
  vrai(!els['lec-bar'].className.includes('on'), 'elle ne se referme pas');
});
t('le décompte précède la musique, en remontant vers zéro', () => {
  VIS.lecOn = true; VIS.lecBpm = 60; VIS.lecMes = 4; VIS.lecDer = null;
  VIS.lecT0 = 8;                                   // deux mesures à 60
  const lus = [];
  for (let x = 0; x < 8; x += 1) { C.visLecBattre(x); lus.push(els['lec-t'].textContent); }
  vrai(lus.join(' ') === '8 7 6 5 4 3 2 1', 'décompte lu : ' + lus.join(' '));
  vrai(els['lec-t'].className.includes('compte'), 'le décompte n’est pas distingué');
  C.visLecBattre(8.1);
  vrai(!els['lec-t'].className.includes('compte'), 'le décompte ne cède pas la place');
  vrai(els['lec-t'].textContent === 1, 'la mesure ne repart pas sur le premier temps');
});
t('rien ne sonne du répertoire pendant le décompte', () => {
  VIS.lecAirN = 0; C.visLecAir();                  // menuet
  VIS.lecOn = true; VIS.lecBpm = 60; VIS.lecT0 = 6; VIS.lecJoue = {}; VIS.lecT = null;
  sons.length = 0;
  for (let x = 0; x < 5.9; x += 0.1) C.visLecMusique(x);
  vrai(sons.length === 0, sons.length + ' notes jouées avant le départ');
  for (let x = 6; x < 8; x += 0.1) C.visLecMusique(x);
  vrai(sons.length > 4, 'la musique ne part pas après le décompte');
});
t('lancer la mesure arme deux mesures d’appel', () => {
  VIS.lecOn = false; VIS.lecBpm = 96; VIS.lecMes = 4;
  els['preview-video'].currentTime = 3;
  els['preview-video'].play = () => {};
  C.visLecMetro();
  const attendu = 3 + 8 * (60/96);
  vrai(Math.abs(VIS.lecT0 - attendu) < 1e-6,
       'départ armé à ' + VIS.lecT0 + ' au lieu de ' + attendu);
  C.visLecMetro();
  vrai(VIS.lecT0 === null, 'l’appel survit à l’arrêt');
});
t('« au mouvement » ramène le tempo de la danse', () => {
  VIS.phrase = [];
  for (let i = 0; i < 8; i++) VIS.phrase.push({nom:'x', t0:i*0.5, t1:i*0.5+0.5});
  C.visLecTempo(140);
  C.visLecAuMouvement();
  vrai(VIS.lecBpm === 120, 'tempo repris : ' + VIS.lecBpm + ' au lieu de 120');
  vrai(els['lec-msg'].textContent.includes('120'), 'le message ne le dit pas');
});
t('le volume tient entre zéro et un, et coupe vraiment', () => {
  C.visLecVolume(0);
  vrai(VIS.lecVol === 0, 'volume nul refusé');
  VIS.lecAirN = 0; C.visLecAir();
  VIS.lecOn = true; VIS.lecT0 = 0; VIS.lecJoue = {}; VIS.lecT = null;
  sons.length = 0;
  for (let x = 0; x < 2; x += 0.1) C.visLecMusique(x);
  vrai(sons.length > 0, 'la partition ne tourne plus du tout');
  C.visLecVolume(200);
  vrai(VIS.lecVol === 1, 'plafond du volume non tenu');
  C.visLecVolume(70);
});
t('la nuance suit l’engagement du corps', () => {
  VIS.lab = {cour:{poids:0}};
  const doux = C.visLecNuance();
  VIS.lab = {cour:{poids:1}};
  const fort = C.visLecNuance();
  vrai(fort > doux + 0.3, 'nuance immobile : ' + doux.toFixed(2) + ' / ' + fort.toFixed(2));
  vrai(doux > 0.5 && fort < 1.3, 'nuances hors bornes');
  VIS.lab = null;
  vrai(C.visLecNuance() === 1, 'sans lecture Laban, la nuance doit valoir 1');
});

console.log('── la tenue de l’outil ──');
t('la nuit couvre tout l’outil, pas seulement les lectures', () => {
  const i = html.lastIndexOf(':root{');
  vrai(i > 0, 'aucun thème redéfini');
  const bloc = html.slice(i, html.indexOf('}', i));
  vrai(/--bg:#0[0-9a-f]{5}/.test(bloc), 'le fond n’est pas sombre : ' + bloc.slice(0,60));
  vrai(/--ink:#[e-f]/.test(bloc), 'le texte n’est pas clair');
  vrai(html.includes('body{background:var(--bg);color:var(--ink)}'),
       'le corps de page garde l’ancien fond');
  vrai(html.includes('content="#070b12"'), 'la couleur de thème mobile n’a pas suivi');
});
t('les commandes suivent la nuit', () => {
  ['.vis-b,.btn-ctrl{', '.vis-o{', '.jtab{', '.upload-zone{'].forEach(sel =>
    vrai(html.includes(sel), 'non repeint : ' + sel));
  vrai(html.includes('::-webkit-scrollbar-thumb'), 'les ascenseurs restent clairs');
});
t('l’outil reste interactif : les commandes répondent', () => {
  const boutons = (html.match(/onclick="vis[A-Z]/g) || []).length;
  vrai(boutons >= 20, boutons + ' commandes seulement');
  ['visRejouer','visMurBascule','visLecon','visLecMetro','visLecAir','visPartition',
   'visReperePoser','visAnTout','visLecBarre'].forEach(f =>
    vrai(html.includes('onclick="' + f), f + ' n’est plus branché'));
});

console.log('── sur téléphone ──');
t('l’application installée s’appelle DanceTracker', () => {
  const m = html.match(/rel="manifest" href="data:application\/json;base64,([A-Za-z0-9+/=]+)"/);
  vrai(m, 'aucun manifeste');
  const j = JSON.parse(Buffer.from(m[1], 'base64').toString('utf8'));
  vrai(j.short_name === 'DanceTracker', 'nom court : ' + j.short_name);
  vrai(/DanceTracker/.test(j.name), 'nom complet : ' + j.name);
  vrai(!/OrthoScope/i.test(JSON.stringify(j)), 'OrthoScope subsiste dans le manifeste');
  vrai(j.theme_color === '#070b12' && j.background_color === '#070b12',
       'les couleurs du manifeste n’ont pas suivi');
  vrai(j.icons && j.icons.length === 1 && /^data:image\/svg/.test(j.icons[0].src),
       'icône absente ou mal formée');
  const svg = Buffer.from(j.icons[0].src.split(',')[1], 'base64').toString('utf8');
  vrai(/<svg/.test(svg) && /f0b429/.test(svg), 'l’icône n’est pas celle de DanceTracker');
});
t('plus une seule mention d’OrthoScope dans l’outil', () => {
  const n = (html.match(/OrthoScope/g) || []).length;
  vrai(n === 0, n + ' mentions subsistent : ' +
       (html.match(/OrthoScope.{0,30}/g) || []).slice(0,3).join(' · '));
});
t('plus aucune trace d’OrthoScope dans les noms de stockage', () => {
  vrai(!html.includes('OrthoScopeCoach'), 'la base « coach » garde l’ancien nom');
  vrai(!html.includes('OrthoScopeTestImages'), 'la base d’images garde l’ancien nom');
  vrai(!/app: 'OrthoScope'/.test(html), 'les exports s’annoncent encore OrthoScope');
});
t('le champ de fichier est atteignable au doigt', () => {
  vrai(!/id="file-input"[^>]*left:-9999px/.test(html),
       'le champ est toujours renvoyé hors de l’écran');
  vrai(/id="file-input"[\s\S]{0,220}class="dt-fichier"/.test(html),
       'le champ n’a pas reçu sa classe');
  vrai(html.includes('.dt-fichier{position:absolute;inset:0'),
       'le champ ne couvre pas la zone d’accueil');
  vrai(html.includes('.dt-depot .upload-zone{pointer-events:none}'),
       'la zone dessinée intercepte encore le toucher');
});
t('les formats des téléphones sont acceptés', () => {
  const m = html.match(/id="file-input"[\s\S]{0,300}?accept="([^"]+)"/);
  vrai(m, 'aucun filtre de format');
  ['video/*', '.mp4', '.mov', '.3gp', '.mkv', '.webm'].forEach(f =>
    vrai(m[1].includes(f), f + ' refusé'));
});
t('un secours ouvre le sélecteur si l’étiquette est ignorée', () => {
  vrai(html.includes("uz.addEventListener('click'"), 'aucun secours au clic');
  vrai(html.includes('fi.click()'), 'le sélecteur n’est pas ouvert de force');
  vrai(html.includes("if(f&&!f.type)loadVideo(f)"),
       'un fichier sans type MIME est encore refusé au dépôt');
});

console.log('── les onglets et les aveux ──');
t('trois lectures sont ouvertes au départ, sur un pied d’égalité', () => {
  VIS.anOuvert = null; C.visAnRendre();
  ['danse','kabat','bobath'].forEach(k =>
    vrai(els['an-vue-'+k].className.includes('on'), k + ' devrait être ouvert'));
  ['laban','eshkol','benesh','kineto'].forEach(k =>
    vrai(!els['an-vue-'+k].className.includes('on'), k + ' ne devrait pas l’être'));
  vrai(scene.className.includes('multi'), 'la scène ne sait pas qu’il y en a plusieurs');
});
t('on associe et on retire les lectures à volonté', () => {
  VIS.anOuvert = null; C.visAnRendre();
  C.visAnOnglet('kineto');
  vrai(els['an-vue-kineto'].className.includes('on'), 'la kinétographie ne s’ajoute pas');
  vrai(els['an-vue-kabat'].className.includes('on'), 'Kabat a été chassé');
  C.visAnOnglet('kineto');
  vrai(!els['an-vue-kineto'].className.includes('on'), 'elle ne se retire pas');
});
t('on ne peut pas tout éteindre', () => {
  VIS.anOuvert = {danse:1}; C.visAnRendre();
  C.visAnOnglet('danse');
  vrai(els['an-vue-danse'].className.includes('on'), 'l’écran est resté vide');
  vrai(!scene.className.includes('multi'), 'la scène se croit multiple');
});
t('« tout afficher » sort les sept, puis n’en garde qu’une', () => {
  VIS.anOuvert = null; C.visAnRendre();
  C.visAnTout();
  C.AN_VUES.forEach(k => vrai(els['an-vue-'+k].className.includes('on'),
    k + ' manque à l’appel'));
  vrai(els['an-b-tout'].textContent.includes('garder'), 'le bouton ne s’inverse pas');
  C.visAnTout();
  let n = 0; C.AN_VUES.forEach(k => { if (els['an-vue-'+k].className.includes('on')) n++; });
  vrai(n === 1, n + ' lectures restantes au lieu d’une');
});
t('Bobath est voisin de Kabat dans la barre', () => {
  vrai(html.indexOf('an-b-bobath') < html.indexOf('an-b-laban'),
       'Bobath est encore relégué après les notations');
  vrai(html.indexOf('an-b-kabat') < html.indexOf('an-b-bobath'),
       'Kabat et Bobath ne se suivent pas');
});
t('la portée se laisse lire : une clé pour les neuf signes et les trois niveaux', () => {
  const k = C.visKinCle();
  ['sur place','avant','arrière','droite','gauche'].forEach(n =>
    vrai(k.includes(n), 'direction « ' + n + ' » absente de la clé'));
  ['niveau bas','niveau moyen','niveau haut'].forEach(n =>
    vrai(k.includes(n), n + ' absent de la clé'));
  vrai((k.match(/<svg /g) || []).length === 12, 'douze vignettes attendues');
  vrai(els['an-vue-kineto'].innerHTML.includes('Comment lire'),
       'la portée ne dit pas comment se lire');
  vrai(els['an-vue-kineto'].innerHTML.includes('le temps monte') ||
       els['an-vue-kineto'].innerHTML.includes('Le temps monte'), 'le sens manque');
});
t('aucun avertissement ne s’affiche : c’est une démonstration', () => {
  ['eshkol','benesh','kineto','bobath','laban','kabat'].forEach(k => {
    const h = els['an-vue-' + k].innerHTML;
    ['simplifiée','non un bilan','étalonnés','ne se lisent pas','pas un dispositif']
      .forEach(m => vrai(!h.includes(m),
        'l’onglet ' + k + ' porte encore un avertissement : « ' + m + ' »'));
  });
});
t('les légendes utiles, elles, restent', () => {
  vrai(els['an-vue-kineto'].innerHTML.includes('Le temps monte'),
       'le sens de lecture a disparu avec les avertissements');
  vrai(els['an-vue-eshkol'].innerHTML.includes('huitièmes de tour'),
       'la légende d’Eshkol a disparu');
  vrai(els['an-vue-benesh'].innerHTML.includes('devant'), 'la légende de Benesh a disparu');
});

console.log('\n' + (ko ? '✘ ' + ko + ' échec(s)' : '✅ ' + ok + ' contrôles passés, 0 échec'));
process.exit(ko ? 1 : 0);

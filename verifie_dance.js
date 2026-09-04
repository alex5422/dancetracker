/*  DanceTracker, éprouvé hors navigateur.

    On extrait du fichier livré les blocs d'écriture du mouvement, on leur
    donne un DOM de façade, puis on leur fait avaler des gestes fabriqués
    dont on connaît la réponse.

        node verifie_dance.js DanceTracker.html                          */
const fs = require('fs');
const fichier = process.argv[2] || 'DanceTracker.html';
const html = fs.readFileSync(fichier, 'utf8');

const blocs = ['/* ══ les onglets', '/* ══ Eshkol-Wachman', '/* ══ Laban · Forme',
               '/* ══ Bobath', '/* ══ les chaînes myofasciales'];
let src = '';
blocs.forEach(m => {
  const i = html.indexOf(m);
  if (i < 0) { console.log('✘ bloc manquant : ' + m); process.exit(1); }
  src += html.slice(i, html.indexOf('</script>', i)) + '\n';
});

const els = {};
global.document = { getElementById: id => els[id] || (els[id] = {id, innerHTML:'', className:'', style:{}}) };
global.VIS = {};
const C = {};
new Function('VIS','document', src +
  '\nObject.assign(this,{visKabPousser,visKabAfficher,visLabPousser,visLabAfficher,' +
  'visEwPousser,visEwAfficher,visBenPousser,visBenAfficher,visLabPlus,visKinPousser,' +
  'visKinAfficher,visBobPousser,visBobAfficher,visBobSelectivite,' +
  'visChTravail,visDessinerChaines,visChLegende,visChPoint,CHAINES,' +
  'visAnOnglet,KAB_MEMBRES,LAB_ACTIONS,EW_SEG,KIN_COL});')
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
  VIS.bob=null;VIS.ch=null;
  for (let k = 0; k <= pas; k++){
    const f = k/pas, t = f*duree, lm = corps();
    fn(lm, f, t);
    C.visKabPousser(lm,t); C.visLabPousser(lm,t); C.visEwPousser(lm,t);
    C.visBenPousser(lm,t); C.visLabPlus(lm,t); C.visKinPousser(lm,t);
    C.visBobPousser(lm,t); C.visChTravail(lm,t);
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

console.log('── les onglets et les aveux ──');
t('chaque onglet s’allume seul', () => {
  ['danse','kabat','laban','eshkol','benesh','bobath','kineto'].forEach(k => {
    C.visAnOnglet(k);
    vrai(els['an-vue-'+k].className.includes('on'), k + ' ne s’affiche pas');
    ['danse','kabat','laban','eshkol','benesh','bobath','kineto'].filter(x => x !== k)
      .forEach(x => vrai(!els['an-vue-'+x].className.includes('on'),
                         x + ' reste affiché avec ' + k));
  });
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

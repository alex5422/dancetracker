# DanceTracker · Écriture du mouvement

Un outil pour la danse et la kinésithérapie. On dépose une vidéo, on la rejoue
avec les tracés, et le même mouvement se laisse lire de sept façons.

Tout se passe dans le navigateur : **aucune vidéo ne quitte l'appareil**.

## Les sept lectures

**Mouvement dansé** — le vocabulaire de la danse classique. Positions 1re à 5e
et parallèle, en dehors, plié, relevé, port de bras, épaulement croisé, effacé
ou écarté, retiré, attitude, arabesque, développé, fondu, grand battement, rond
de jambe. Les sauts sont nommés par leurs appuis de départ et d'arrivée — temps
levé, échappé, changement de pied, entrechat, jeté, assemblé, sissonne — et les
pirouettes sont comptées.

**Kabat** — les diagonales de facilitation. Un membre qui monte en croisant la
ligne médiane décrit une D1 flexion ; qui monte en s'ouvrant, une D2 flexion ;
et l'inverse en descendant. Chaque membre reçoit sa carte, sa silhouette avec
la flèche du trajet, son amplitude et la **pureté** de sa diagonale — un vrai
geste de Kabat est à 45°, ni vertical ni latéral.

**Bobath** — le contrôle postural. Alignement du tronc et de la tête,
**dissociation des ceintures** (l'écart entre l'obliquité des épaules et celle
du bassin), base de sustentation, **transfert de charge** sur la base d'appui
avec le temps passé à gauche, au centre, à droite, et les rattrapages ; enfin
la **sélectivité** : un membre dont l'épaule et le coude bougent par blocs
décrit une synergie, un membre qui dissocie ses segments décrit un mouvement
sélectif.

## Les chaînes musculaires sur le rejeu

Kabat et Bobath parlent de chaînes : il faut donc les voir. Huit écharpes
myofasciales — quatre, prises une fois par côté — sont tracées **sur le corps
qui bouge**, chacune de sa couleur :

| Chaîne | Couleur | Trajet |
|---|---|---|
| Oblique postérieure | orange | grand dorsal → fascia thoraco-lombaire → grand fessier opposé → bandelette → jambe |
| Oblique antérieure | cyan | grand oblique → ligne blanche → petit oblique opposé → adducteurs |
| Latérale | violet | moyen fessier → bandelette → péroniers |
| Longitudinale | vert | érecteurs → ligament sacro-tubéral → ischio-jambiers |

Une chaîne **s'allume quand elle travaille** — c'est-à-dire quand sa longueur
change, qu'elle s'étire ou se ferme. Au repos elle reste un fil ; en charge
elle s'épaissit et rayonne, en trois passes de lumière. Bouton **chaînes**
au-dessus de la vidéo, allumé d'emblée.

Les points ne sont pas les muscles : ce sont les repères que la vidéo donne. Le
tracé montre le trajet de la chaîne, pas son anatomie.

**Laban, complet** — les quatre catégories.

- *Effort* : Espace (indirect ↔ direct), Poids (léger ↔ fort), Temps (soutenu ↔
  soudain), Flux (contrôlé ↔ libre), et les huit actions d'effort — Flotter,
  Glisser, Tordre, Presser, Tapoter, Épousseter, Fouetter, Frapper.
- *Forme* : le flux de forme (la kinesphère grandit ou rétrécit), les trois
  qualités — monter/descendre, s'étendre/se refermer, avancer/reculer — et le
  mode de changement : arc, radial ou sculpté.
- *Espace* : le plan dominant (porte, table ou roue), la dimension, la
  kinesphère, le niveau.
- *Corps* : la connectivité — homologue, homolatérale ou controlatérale —,
  sa cohésion, et quel membre initie le geste.

**Eshkol-Wachman** — la notation géométrique. Chaque segment donne sa direction
en huitièmes de tour, colorée par teinte : la structure se voit sans lire les
chiffres.

**Benesh** — la portée à cinq lignes qui sont le corps lui-même : tête,
épaules, hanches, genoux, sol. Mains et pieds posés à leur hauteur réelle, une
image toutes les quatre dixièmes de seconde. Le signe dit la profondeur — trait
dans le plan, chevron devant, disque derrière.

**Kinétographie** — la portée verticale de Laban. Le temps monte, la ligne
centrale sépare la gauche de la droite. La forme du signe dit la direction, sa
trame dit le niveau — plein en bas, pointé au milieu, hachuré en haut —, sa
hauteur dit la durée.

## Le bilan articulaire

Le sélecteur d'articulation est conservé, avec ses mesures d'amplitude. Ce qui
a disparu, c'est le dossier clinique : identité du patient, CIM-10, CIF, ICOPE,
WHODAS, plan de soins. Ceux-là restent dans OrthoScope, à qui ils appartiennent.

## Le retour visuel

C'est un retour, pas un compte rendu. Un **fil du temps** partagé, à la même
échelle d'un onglet à l'autre, montre où se trouve chaque chose dans la
séquence : bandes colorées par diagonale, par action d'effort, par direction,
par appui. Sept boutons visibles seulement ; les autres réglages sont sous un
pli.

## Lancer

Ouvrir `public/index.html` dans un navigateur. Rien à installer : le suivi de
posture est chargé depuis son CDN, tout le reste tient dans le fichier.

## Vérifier

```
node verifie_dance.js public/index.html
```

29 contrôles, sans navigateur : on fait avaler au programme des gestes
fabriqués dont on connaît la réponse. Un bras qui monte en croisant **doit**
donner une D1 flexion. Un coup sec et droit **doit** donner Frapper. Un corps
qui penche d'un bloc ne **doit pas** montrer de dissociation des ceintures. Un
corps immobile ne **doit** rien se voir attribuer.

## Reconstruire

```
python dance.py
```

Lit `OrthoScope_v15_ux.html`, écrit `DanceTracker.html`. Le moteur de suivi est
celui d'OrthoScope ; tout le reste est propre à cet outil.

## Mettre en ligne

Dépôt GitHub, puis Cloudflare Pages : `wrangler.jsonc` désigne déjà `./public/`
comme dossier à servir. Laisser la commande de construction vide.

## Ce qui n'est pas mesuré

Écrit sur chaque écran, et je m'y tiens :

- Kabat — les **rotations** ne se lisent pas sur une silhouette. Seuls les
  trajets dans le plan de l'image sont relevés.
- Bobath — le **tonus**, la qualité du recrutement et la réponse à la
  facilitation ne se voient pas sur une vidéo. Ce qui est mesuré ici, ce sont
  des géométries.
- Laban — les repères d'effort sont étalonnés pour la démonstration : ils
  ordonnent correctement les gestes entre eux, mais les seuils absolus restent
  à caler sur des sujets réels.
- Eshkol-Wachman — seules les positions sont relevées, pas les types de trajet.
- Benesh et kinétographie — portées simplifiées : les transitions, les
  rotations, les supports et les changements de face ne sont pas écrits.

Outil d'analyse et d'enseignement, pas dispositif médical.

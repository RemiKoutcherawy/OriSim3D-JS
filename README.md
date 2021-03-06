OriSim3D 
===
OriSim3D origami folding simulation with three.js
===
OriSim3D origami folding simulation with WebGL and three.js.

Demo : [Cocotte](https://remikoutcherawy.github.io/cocotte.html) 
Demo : [Vue3dLocal](https://remikoutcherawy.github.io/vue3dLocal.html) 

This application is a work in progress, don't expect more.

## Usage

Download and open : [app.html](https://remikoutcherawy.github.io/app.html)
On the left the crease pattern, on the right the 3D view.  

To bundle all files in `app.js`, lauch `node build.js`  
This requires `npm update --save-dev` to download mocha and uglify-es.
Run  `./node_modules/mocha/bin/mocha --require babel-core/register --ui qunit` to execute node tests.

No compilation needed, just open Origami.html

## Comment est organisé le code ?
Dans le répertoire `js` :
- `Point.js` : x,y,z pour la 3D et xf,yf pour le CreasePattern.
  Les points n'ont pas de numéro. Ils sont juste identifiés par leur index dans le tableau.
- `Segment.js` : p1,p2 deux points pour les plis et les bords.
  Les segment sont identifiés par leur index dans le tableau.
- `Face.js` : points[] une liste de points en 3D et 2D.
  Les faces sont identifiées par leur index dans le tableau.
- `Plane.js : un plan défini par un point et un vecteur.
  Le plan permet de découper les faces.
- `Model.js` : points[], segments[], face[] avec des méthodes pour :
  - Découper les faces selon un plan (split)
    On y trouve les axiomes Origami :
     - pli passant entre 2 points (splitCross)
     - pli passant par 2 points (splitBy)
     - pli orthogonal (splitOrtho)
  - Tourner des points selon l'axe d'un segment (rotate)
    C'est le coeur du pliage : des points qui tournent autour d'un pli.
    Il n'y a aucune contrainte sur les rotations.
  - Ajuster des points en conservant la longueur des segments (adjust).
    Tous les points ne suivent pas un arc de cercle sur un pliage.
    Conserver la longueur des segments permet de les replacer, à peu près.
  - Déplacer des points (move).
    En dernier ressort, ce n'est plus de l'origami.
  - Tourner tous les points selon x, y, z (turn)
    Pour montrer le pliage, le retourner.
  - Ajouter un décalage à certaines faces pour qu'elles ne se superposent pas (offset)
  - Redimensionner (scaleModel, zoomFit)
- `Command.js` : décode une liste d'instructions et les applique sur le modèle
  La liste est découpée en token (toko) et le tableau toko[] est parcouru en incrémentant un index (iTok)
  - execute() prend un token "by" "rotate" avec les numéros qui suivent
   puis appelle la méthode correspondante du modèle.
  - command() prend une liste de commandes, 
   et appelle commandLoop() pour répéter une suite d'instructions
  - commandLoop() exécute une liste de commandes entre 't' et ')'
   en appelant execute() pour chacune.
- `View2d.js` : montre les points, segments, faces
  Utilise les coordonnées en 2D xf, yf du CreasePattern.
  Utile pour identifier les points, segments, faces par leurs numéros.
- `View3d.js` : montre les faces en 3D
  Utilise les coordonnées en 3D x, y, z du Model
  WebGL permet de présenter le modèle en 3D.
- `CommandArea.js` : permet d'envoyer des commandes en mode texte, sur la page html affichée
  Très basique...
- `Interpolator.js` : une suite de fonctions t : [0,1] => [0,1] qui donnent une impression aux mouvements

Sous la racine : 
 - `conception.html` : affiche View2d, View3d et CommandArea 
 - `vue2d.html` : affiche juste View2d
 - `vue3d.html` : affiche juste View3d
 - `vue3dLocal.html` : tout dans une seule page html.

`vue3dLocal.html` est conçu pour être téléchargé, modifié et exécuté en local.
  
Dans le répertoire `test` :
- les tests sous Mocha qui permettent de débugger en reconstituant le contexte d'un problème.
- `Interpolator.test.js` présente graphiquement les trajectoires suivies par les animations.

Dans le répertoire `textures` : les textures .jpg et .txt pour vue3dLocal.html`

Dans le répertoire `models` : les modeles .txt


## Comment plier ?

Les commandes sont de 4 types :
- Définition des plis :
  - `"d x y x y..."` ou `"define"` avec une liste de coordonnées en 2D :  
  `d -200 200  -200 -200  200 -200  200 200` // Carré de 200x 200
  - `"b pt pt"` ou `"by"` pli passant par 2 points :  
  `b 0 1` // plie en passant par le point 0 et par le point 1
  - `"c pt pt"` ou `"cross"` pli entre 2 points  
  `c 0 1` // plie pour placer le point 0 sur le point 1
  - `"p seg pt"` ou `"perpendicular"` pli orthogonal à un segment passant par un point   
  `p 0 1` // plie perpendiculaire au segment 0, passant par le point 1
  - `"lol seg seg"` line on line ou bissectrice entre deux segments.  
  `lol 0 1` // plie entre les segments 0 et 1

- Pliage : 
  - `"r axe angle pts"` pour `"rotate"` tourne autour d'un segment d'un angle une liste de points.  
  `r 0 90 1 2 3` // tourne autour de l'axe 0 d'un angle de 90° les points 1 2 et 3
  - `"a pt pt"`  ou  `"adjust"`  
  `a 1 2 // ajuste les points 1 et 2 sur leur segments respectifs.`


- Animation
  - `"t durée cdes )"` pour `"time"` exécute les `cdes` jusqu'à `)` pendant `durée` en millisecondes.  
  `t 1000 r 0 90 1 2 3)` // tourne en 1s autour du segment 0 d'un angle de 90° les points 1 2 et 3
- Le reste 
  - `"o val faces"` ou `"offset"` pour décaler des faces, juste à l'affichage
  `o 10 0 1 2` // décale de 10 unités les faces 0 1 à l'affichage
  - `"tx angle"` ou `"TurnX angle"` tourne le modèle selon l'axe X horizontal
  - `"ty angle"` ou `"TurnY angle"` tourne le modèle selon l'axe Y vertical
  - `"tz angle"` ou `"TurnZ angle"` tourne le modèle selon l'axe Z vers l'oeil
  - `"z scale x y"` Zoom en multipliant toutes des coordonnées par scale autour de x y    
  - `"zf"` ou `"zoom fit"` Zoom pour caler le modèle dans la fenêtre.
  - `"il"` interpolateur linéaire 
  - `"ib"` interpolateur avec rebond (bounce)
  - `"io"` interpolator avec dépassement (overshoot)

## TODO list
- Ajouter la saisie d'un point sur la vue WebGL.
- Déplacer un point en 3D avec la souris ou un doigt.
- Menu avec icones type Oripa pour saisir des points, segments et créer les plis.
- Sauvegarde en SVG, CP, OBJ.
- Chargement d'un CP, OPX.
- Mettre de la lumière, une image de fond et des ombres sur la vue WebGL.
- Passer sous THREE.js 

 

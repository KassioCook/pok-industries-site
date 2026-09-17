# POK Industries — Terminal (site du bot)

Dossier **indépendant** du bot de trading (`Bot Kassio`) — aucune interférence,
aucun lien avec son dépôt git. Ce dossier ne contient que le site (design).

## Fichiers

- `index.html` — la page complète (HTML + CSS + JS, un seul fichier, aucune dépendance
  sauf les polices Google Fonts (Sora, IBM Plex Mono) et l'image de fond).
- `bg.jpg` — l'image de fond (supercars néon rouge/noir), référencée en relatif par `index.html`.
- **Site en ligne (démo visuelle réelle, GitHub Pages)** :
  https://kassiocook.github.io/pok-industries-site/
  Dépôt : https://github.com/KassioCook/pok-industries-site (public, indépendant du dépôt du bot).
  Contient un `.nojekyll` (sinon le build GitHub Pages échoue sur ce repo).
- Aperçu Claude Artifact (moins fiable pour tester le scroll — rendu dans un iframe qui
  s'auto-dimensionne, donc certains effets liés au scroll de page n'y fonctionnent pas
  pareil que sur le vrai site) : https://claude.ai/artifact/Cu75S2iMauCqD2hmtAZ5Zs

Pour prévisualiser en local : double-clic sur `index.html`, ça s'ouvre dans le navigateur.
Toutes les données affichées sont **fictives** (mockup) — voir la section "Pour brancher
sur le vrai bot" plus bas.

Décision (2026-09-17) : on reste sur la démo visuelle statique (GitHub Pages) tant que le
design n'est pas figé — pas de branchement sur le vrai bot pour l'instant, voir la section
"Pour brancher sur le vrai bot" plus bas pour ce que ça demanderait.

## Ce qui existe déjà (état actuel du mockup)

### Identité / thème
- Nom du site : **POK Industries** (pensé comme la plateforme qui pourra héberger
  plusieurs bots/stratégies plus tard, pas seulement Bundle10k).
- Palette noir/rouge néon reprise de l'image de fond (voitures + néons rouges),
  avec du vert néon réservé uniquement au sens "gain/positif" et de l'ambre pour
  "en cours/attention" — pour ne pas tout confondre dans le rouge.
- Cartes en verre dépoli (glassmorphism) par-dessus l'image de fond fixe.
- Police d'affichage : Sora. Police pour les chiffres/adresses : IBM Plex Mono.

### Structure : 4 onglets
1. **Vue d'ensemble** — 3 KPI (PnL session, taux de réussite, positions actives)
   + courbe de PnL cumulé (graphique SVG avec survol/tooltip).
2. **Stratégie** — la pièce centrale, voir détail plus bas.
3. **Tâches** — liste des configs de copy-trade (une carte par wallet/stratégie).
4. **Activité** — journal compact des décisions du bot (BUY/SKIP/TP/SL).

(L'onglet "Positions" a été supprimé : il faisait doublon avec le détail par
stratégie et n'incluait pas la stratégie legacy — jugé inutile dans sa forme.)

### Fonctionnalités "spéciales" ajoutées au fil de la conversation

- **Bulles de trade en direct** (`live-trade-stack`) : flottent indépendamment
  en haut à droite de l'écran (position fixe, pas dans le header), une bulle
  par trade en cours. Si plusieurs trades sont ouverts en même temps, elles
  s'empilent verticalement. Chaque bulle affiche le **nom du coin** (ex. `$PUNCH`,
  `$DODGE` — fictifs pour l'instant, à remplacer par le vrai nom on-chain plus tard)
  et son PnL en direct. Cliquer sur une bulle ouvre directement la fiche détaillée
  de la stratégie (wallet) qui a pris ce trade.

- **Stratégie en tuiles cliquables** : l'onglet Stratégie montre une tuile
  compacte par stratégie (wallet d'achat → wallet cible, PnL, actif/inactif).
  Cliquer sur une tuile cache la grille et affiche une **vue détaillée plein
  écran** de cette seule stratégie (bouton "✕ Retour" pour revenir) avec :
  - ses propres KPI et sa propre courbe de PnL,
  - ses paramètres (TP/SL/slippage/plafond) en petites puces,
  - la liste de ses tokens tradés (nom du coin + CA + entrée/sortie MC + PnL,
    filtrable Tous/Gains/Pertes), chaque token ayant un **lien "Axiom ↗"**
    (vers `axiom.trade/meme/<mint>`) prêt à recevoir de vraies adresses,
  - une pastille **"● N trades en cours"** qui pulse quand la stratégie a des
    positions actives en ce moment,
  - un **badge de notification rouge "+N"** en coin de la tuile + sur l'onglet
    Stratégie dans la nav, qui indique combien de nouveaux trades ont été pris
    "pendant l'absence" (ex. dans la nuit). Le badge disparaît automatiquement
    dès qu'on ouvre la stratégie concernée (comme une notification lue).

- **Journal d'activité compact** : refondu en lignes alignées façon terminal
  (Heure · Type · Coin · Détail · Stratégie) plutôt qu'en phrases denses.
  Chaque ligne (BUY, SKIP, TP, SL) est cliquable et renvoie vers la stratégie
  responsable. Filtres par type. Pas de scroll horizontal, même sur mobile.

- **Tâches (configs par wallet)** : une carte par config (pas de tableau large
  à scroller) avec wallet d'achat → wallet cible, paramètres en puces, et
  surtout un **sélecteur Paper / Réel à deux boutons bien distincts**
  (pas un simple interrupteur, pour éviter les fausses manipulations) —
  base du futur système de paper trading par stratégie. Toutes les configs
  sont en `PAPER` par défaut.

- **Ticker SOL** dans le header (prix + variation, légère fluctuation simulée
  toutes les 4s) à la place d'un simple wallet suivi affiché en dur.

- **Lien Tâches ⇄ Stratégie** : une config dans "Tâches" et sa tuile/page dans
  "Stratégie" sont la même entité (même `data-strategy`). Modifier le nom, le
  wallet acheteur ou la description via le bouton ✎ "Modifier" (dans Tâches)
  met à jour les deux endroits en même temps, et c'est sauvegardé dans
  `localStorage` (`b10k_task_overrides`) donc ça survit à un rechargement.
  Chaque stratégie a maintenant une **description texte** de sa logique
  (règles A/B/C/D), affichée dans sa page détail et éditable depuis la modale.

## Pour brancher sur le vrai bot plus tard

Discuté avec l'utilisateur — pas fait pour l'instant, juste noté pour plus tard :

1. Il faudra une **API** côté bot (petit serveur à côté de `main.py` dans le
   dossier `Bot Kassio`) qui expose `positions.json`, `session.json`,
   `daily_halt.json` en JSON, que ce site viendrait interroger (polling ou WS).
2. Un **vrai hébergement** pour `index.html` — un Artifact Claude est fait pour
   prototyper le design, pas pour tourner en prod connecté à de l'argent réel.
3. Le bouton Paper/Réel par config suppose que le bot sache faire tourner
   certaines stratégies en DRY_RUN et d'autres en réel **en même temps** —
   aujourd'hui `DRY_RUN` est un seul flag global dans `.env` (`config.py`),
   pas par wallet. Ça demande une vraie modif d'architecture côté bot, pas
   juste l'UI.
4. Les noms de coins ($PUNCH, $DODGE, etc.) et les adresses de wallets dans le
   mockup sont fictifs — à remplacer par les vraies valeurs issues du bot
   (metadata pump.fun pour le nom, clés publiques réelles pour les wallets).

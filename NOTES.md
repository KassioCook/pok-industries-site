# POK Industries — Terminal (site du bot)

Dossier **indépendant** du bot de trading (`Bot Kassio`) — aucune interférence,
aucun lien avec son dépôt git. Ce dossier ne contient que le site (design).

## Fichiers

- `index.html` — la page complète (HTML + CSS + JS, un seul fichier, aucune dépendance
  sauf les polices Google Fonts (Sora, IBM Plex Mono) et l'image de fond).
- `bg.jpg` — l'image de fond (supercars néon violet/noir), référencée en relatif par `index.html`.
- `api/import.js` — fonction serverless Vercel : `POST /api/import`, appelée par
  l'outil de backtest d'un ami pour pousser une stratégie sur ce site (voir section
  "Connecter le backtest d'un ami" plus bas). Zéro dépendance (pas de `package.json`),
  utilise `fetch` global de Node.
- `api/strategies.js` — fonction serverless Vercel : `GET /api/strategies`, lue par
  l'onglet Importation du site pour afficher les stratégies reçues via `/api/import`.
- **Site en ligne sur Vercel (celui qui a l'import réel qui marche)** :
  https://pok-industries-site.vercel.app
  Projet Vercel relié à ce même dépôt GitHub, avec une base **KV** connectée et
  la variable d'environnement `IMPORT_API_KEY` configurée (mise en place et
  testée avec succès le 2026-09-17 — `POST /api/import` renvoie `201`, `GET
  /api/strategies` renvoie la liste). **C'est cette URL qu'il faut donner à
  l'ami**, pas celle de GitHub Pages ci-dessous.
- **Ancien site en ligne (démo visuelle, GitHub Pages — statique, sans `/api`)** :
  https://kassiocook.github.io/pok-industries-site/
  Dépôt : https://github.com/KassioCook/pok-industries-site (public, indépendant du dépôt du bot).
  Contient un `.nojekyll` (sinon le build GitHub Pages échoue sur ce repo).
  ⚠️ GitHub Pages ne sert que du statique : `/api/import` et `/api/strategies` n'y
  fonctionnent pas. Gardé en ligne mais l'URL Vercel ci-dessus est la référence
  à jour désormais.
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
- Palette noir/violet néon reprise de l'image de fond (voitures + néons violets,
  changée le 2026-09-17), avec du vert néon réservé uniquement au sens
  "gain/positif" et du rouge uniquement pour "perte/critique" (SL), et de
  l'ambre pour "en cours/attention" — pour ne pas tout confondre dans la
  couleur de marque.
- Cartes en verre dépoli (glassmorphism) par-dessus l'image de fond fixe.
- Police d'affichage : Sora. Police pour les chiffres/adresses : IBM Plex Mono.

### Structure : 6 onglets
1. **Vue d'ensemble** — 3 KPI (PnL session, taux de réussite, positions actives)
   + courbe de PnL cumulé (graphique SVG avec survol/tooltip).
2. **Stratégie** — la pièce centrale, voir détail plus bas.
3. **Importation** — catalogue de stratégies "backtestées" (mock), voir détail plus bas.
4. **Tâches** — liste des configs de copy-trade (une carte par wallet/stratégie).
5. **Activité** — journal compact des décisions du bot (BUY/SKIP/TP/SL).
6. **Block note** — fiches créées et personnalisées par l'utilisateur, façon Trello.
   Bouton « Nouvelle fiche » (nom + image facultative + description) → carte dans la grille
   avec son nom et son image. Cliquer une fiche ouvre une fenêtre style carte Trello : titre
   modifiable, bloc Description avec « Modifier », bouton Image, **sous-parties** (chacune avec
   son nom et sa description, ouverte dans la même fenêtre avec le nom de la fiche en pastille
   pour revenir), panneau **Activité** à droite (créations, renommages, descriptions…) et
   Supprimer en 2 clics. Stocké en `localStorage` (clé `b10k_notes`, propre à chaque
   navigateur, pas synchronisé). Images réduites à 900px max et ré-encodées en JPEG avant
   stockage pour ne pas saturer le quota (~5 Mo).

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

- **Importation (onglet)** : liste de stratégies "sorties d'un backtest" (nom,
  winrate, PnL simulé, nb de trades testés, TP/SL/slippage/mise, description)
  avec un bouton **"Importer →"**. Cliquer dessus crée immédiatement une carte
  dans **Tâches** (PAPER, INACTIVE, wallets "à définir") et une tuile + fiche
  détail dans **Stratégie** (mêmes clés `data-strategy`), donc ça branche
  visuellement Importation ⇄ Tâches ⇄ Stratégie comme le reste. Cette partie
  "transformer en Tâche" reste locale au navigateur (`localStorage`,
  `b10k_imported_backtests`), comme le reste des Tâches aujourd'hui.
  La **liste elle-même** est maintenant réelle et partagée : le site interroge
  `GET /api/strategies` au chargement (et toutes les 20s) ; si ça répond, la
  liste vient de là (donc de ce que le backtest de l'ami a réellement envoyé
  via `/api/import`) ; si l'API ne répond pas (site ouvert en fichier local,
  ou GitHub Pages, ou clé KV pas encore configurée sur Vercel), le site retombe
  silencieusement sur 3 exemples fictifs codés en dur, pour que l'onglet ne
  soit jamais vide pendant qu'on configure Vercel/KV.

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
5. Le bot de l'utilisateur (`Bot Kassio`) n'est **toujours pas branché** — décision
   du 2026-09-17 : il ne compte pas l'utiliser pour l'instant. En revanche l'import
   depuis le backtest d'un ami est en place côté site (voir section suivante) :
   c'est son bot à lui, et son site de backtest, qui viendront se connecter ici.

## Connecter le backtest d'un ami — état réel (2026-09-17)

Objectif de l'utilisateur : pouvoir envoyer ce site à un ami qui (1) connecte son
propre bot de trading, et (2) relie son site de backtest à celui-ci, pour qu'un
clic sur une stratégie backtestée l'importe directement ici (onglet Importation
→ Tâches/Stratégie), sans que l'utilisateur touche à son propre bot.

**✅ Fait et testé le 2026-09-17** : projet Vercel créé (relié à ce dépôt), base
KV créée et connectée, `IMPORT_API_KEY` configurée (type "Secret", les 3
environnements), redéployé. Test réel : `POST /api/import` → `201`, `GET
/api/strategies` → renvoie bien la stratégie. **Reste à faire** : nettoyer
l'entrée de test ("TEST — à supprimer") via Storage → la base KV → Data
Browser → supprimer/vider la clé `strategies`. Le token `IMPORT_API_KEY` actif
n'est pas noté ici (public) — il est dans les variables d'environnement Vercel
du projet ; le redonner à l'ami par un canal privé si besoin de le re-générer.

Ce qui a été construit côté code : `api/import.js` (écriture) + `api/strategies.js`
(lecture), stockage dans **Vercel KV** (Redis via l'API REST Upstash, appelée en
`fetch` brut — aucune dépendance npm ajoutée). Étapes suivies pour la mise en place
(pour référence si à refaire sur un autre projet) :

1. **Créer un projet Vercel** relié à ce dépôt GitHub
   (`KassioCook/pok-industries-site`) — importer depuis vercel.com/new.
2. Dans ce projet Vercel → onglet **Storage** → créer une base **KV** et la
   connecter au projet. Ça injecte automatiquement `KV_REST_API_URL` et
   `KV_REST_API_TOKEN` dans les variables d'environnement.
3. Ajouter une variable d'environnement **`IMPORT_API_KEY`** (Settings →
   Environment Variables, type **Secret**) — c'est la clé secrète que seul le
   backtest de l'ami doit connaître pour pouvoir écrire ici. **Ne jamais mettre
   sa valeur dans ce fichier ni ailleurs dans le dépôt : il est public.** La
   générer soi-même, par ex. `openssl rand -hex 24`, et la coller uniquement
   dans le dashboard Vercel (+ la transmettre à l'ami par un canal privé, pas
   par ce repo).
4. Redéployer (un push suffit, ou "Redeploy" dans le dashboard) pour que les
   variables d'environnement prennent effet.
5. Donner à l'ami : l'URL de l'endpoint (`https://pok-industries-site.vercel.app/api/import`),
   la clé, et le format ci-dessous.

**Format attendu par `POST /api/import`** (depuis le backtest de l'ami) :
```
POST https://pok-industries-site.vercel.app/api/import
Content-Type: application/json
x-api-key: <IMPORT_API_KEY>

{
  "name": "Nom de la stratégie",
  "winrate": 68,
  "pnl": "+1,240%",
  "trades": 312,
  "tp": "$180k",
  "sl": "$9k",
  "slip": "80% / 25%",
  "stake": "0.05",
  "desc": "Explication de la logique de la stratégie."
}
```
Réponse `201` avec la stratégie créée (avec sa `key` générée), `400` si un champ
manque, `401` si la clé est absente/fausse. `GET /api/strategies` (pas de clé,
lecture seule) renvoie `{ "strategies": [...] }` — c'est ce que lit le site.

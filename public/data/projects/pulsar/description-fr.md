**Description**  
Pulsar est une application web qui permet d’exécuter un modèle d’IA localement et d’échanger avec lui grâce à une interface de chat. Le frontend est construit avec Vue.js et Vite ; le backend avec Python et Flask. Le modèle utilisé est configurable via un fichier `.env` - nom de modèle ou chemin vers un modèle téléchargé localement - et l’application peut être lancée avec Docker Compose ou manuellement.

**Fonctionnalités clés**
- Interface de chat pour converser avec un modèle IA local.
- Gestion de plusieurs conversations.
- Création de conversations avec un prompt système personnalisé.
- Réglages par conversation : limite de tokens, température et nom de la conversation.
- Configuration du modèle via variables d’environnement.
- Paramétrage CORS pour contrôler les origines autorisées.
- Lancement simplifié avec Docker Compose ; exécution manuelle possible.
- Support optionnel de GPU via Docker.

**Stack technique**
- Frontend : Vue.js, Vite
- Backend : Python, Flask
- Conteneurisation : Docker, Docker Compose
- Modèles testés : famille Phi-3/Phi-3.5 (versions listées dans le README)

**Ce que le projet démontre**
- Intégration d’un modèle IA local dans une application web complète.
- Séparation claire entre frontend et backend.
- Configuration par variables d’environnement et conteneurisation.
- Conception d’une interface de chat avec des réglages utilisateur par conversation.


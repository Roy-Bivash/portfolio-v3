# WOT TRACK - Bot de surveillance de clan World of Tanks

**Description**  
WOT TRACK est un bot Python qui surveille automatiquement les membres d’un clan World of Tanks et envoie une notification Discord lorsqu’un nouveau joueur rejoint le clan. Le bot interroge régulièrement l’API officielle Wargaming (via la bibliothèque `requests`), compare la liste des membres actuels à celle connue, récupère les informations détaillées des nouveaux joueurs, puis publie un message formaté sur un webhook Discord.

**Fonctionnalités**
- Surveillance automatique et périodique de la liste des membres du clan.
- Détection des nouveaux membres par comparaison avec l’état précédent.
- Envoi de notifications Discord formatées avec :
  - le pseudo du joueur,
  - l’ID du compte,
  - le nombre total de batailles,
  - la date et l’heure d’adhésion au clan.
- Configuration centralisée (clé API Wargaming, URL du webhook Discord, ID du clan, région, intervalle de vérification).
- Script utilitaire pour retrouver l’ID d’un clan à partir de son tag.
- Script de test pour vérifier que les notifications Discord fonctionnent avant de lancer le bot.

**Stack technique**
- Python 3.7+
- `requests` pour les appels à l’API Wargaming et au webhook Discord
- API Wargaming (`clans/info`, `account/info`)
- Webhooks Discord pour les notifications

**Ce que le projet démontre**
- Consommation d’une API tierce (Wargaming) avec gestion des erreurs et des réponses.
- Logique de détection de changement par comparaison d’ensembles d’identifiants.
- Envoi de messages structurés (embeds Discord) à partir de données enrichies.
- Configuration externalisée et scripts utilitaires pour simplifier la mise en place.
- Boucle de surveillance continue avec arrêt propre via `Ctrl+C`.

**Portée**  
Projet volontairement simple et ciblé : une seule fonctionnalité (détection de nouveaux membres) et une seule sortie (notification Discord), avec une configuration manuelle documentée pas à pas.
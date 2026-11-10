# SPEED LOG - Suivi privé de trajets vélo et footing

**Description**  
SPEED LOG est une application mobile cross-plateforme (iOS/Android) développée avec React Native et Expo, conçue pour suivre ses trajets de vélo ou de footing sans inscription, sans compte et sans transfert de données personnelles. L’application a été créée pour un besoin personnel : lancer une session, suivre sa vitesse en temps réel, puis retrouver l’historique et les détails de chaque trajet. Toutes les données restent stockées localement sur le téléphone via SQLite.

**Fonctionnalités principales**
- Suivi en temps réel de la vitesse pendant l’effort.
- Mode veille : démarrer un trajet, éteindre l’écran, puis consulter les données à la fin de la séance.
- Historique complet des trajets enregistrés.
- Tracé coloré sur une carte interactive avec dégradé selon la vitesse.
- Métriques essentielles : date, heure, durée, vitesse moyenne et vitesse maximale.
- Dénivelé : suivi des montées et descentes du parcours.
- Aucune inscription, aucun compte, aucun transfert de données : tout reste sur le téléphone.

**Stack technique**
- React Native et Expo pour le développement mobile cross-plateforme.
- NativeWind pour le styling.
- SQLite pour le stockage local des trajets.
- Fonctionnalités GPS du téléphone pour le suivi des parcours.
- Application testée sur Android et sur simulateur iOS.

**Ce que le projet démontre**
- Développement d’une application mobile cross-plateforme avec React Native et Expo.
- Conception d’une application “local-first” respectueuse de la vie privée : pas de compte, pas de cloud, pas de transfert de données.
- Utilisation du GPS et gestion d’un mode veille pendant l’activité.
- Stockage local et restitution de données de trajets via SQLite.
- Visualisation cartographique avec tracé coloré selon la vitesse et calcul de métriques sportives.
- Livraison d’une version 1.0.0 utilisable au quotidien sur Android.

**Portée et limites**
Projet personnel réalisé pour un usage propre. Une release 1.0.0 existe uniquement sur Android pour un usage personnel. L’application fonctionne aussi sur iOS, mais a été testée dans le simulateur. Elle ne propose ni compte utilisateur ni synchronisation cloud.

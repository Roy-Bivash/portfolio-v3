# Étude de Cas : Optimisation des Performances PHP à la DGFIP

**ÉTUDE DE CAS D'INGÉNIERIE LOGICIELLE — PORTFOLIO**

**Optimisation des performances des applications PHP en environnement critique**

**Diagnostic, benchmarks et plan d'action pour le parc applicatif interne de la DGFIP**

**Auteur :** Bivash ROY
**Formation :** Ingénieur Informatique (CNAM / CFA numiA — 2e année)
**Organisation :** DGFIP — ESI de Montreuil
**Rôle :** Développeur PHP / PostgreSQL en alternance (2024–2025)
**Encadrement :** Jeremy RAOUL
**Tuteur académique :** Elena KORNYSHOVA (CNAM)

---

## 🚀 Synthèse Exécutive — Ce qu'il faut retenir

**Le Défi :** À l'Établissement des Services Informatiques (ESI) de Montreuil, plusieurs applications métiers internes développées en PHP sans framework traitent d'importants volumes de données administratives. Soumises à des règles strictes de sécurité (versions logicielles durcies, cloud privé souverain OpenStack, conformité RGPD), certaines souffrent de lenteurs critiques lors du chargement de pages ou d'imports de fichiers CSV volumineux.

**La Démarche & les Résultats :** À travers une étude comparative chiffrée et l'audit du parc existant (notamment l'application interne LISST), ce travail démontre qu'une combinaison d'actions ciblées — **montée de version vers PHP 8, activation d'OPcache, suppression des avertissements silencieux, mise en cache RAM via Redis, pagination côté serveur et délégation des calculs lourds à C/Rust** — permet de diviser les temps de traitement par un facteur allant de **3,8 à plus de 100**, tout en maîtrisant les coûts d'infrastructure.

---

## 1. Contexte métier et genèse du problème

La Direction Générale des Finances Publiques (DGFIP) pilote l'un des systèmes d'information les plus vastes de l'État français pour assurer ses missions fiscales, comptables et foncières. Si le cœur historique repose sur des systèmes grands systèmes en COBOL, un écosystème d'applications web en PHP s'est développé en parallèle pour répondre rapidement aux besoins opérationnels des agents.

À l'origine, bon nombre de ces outils ont été conçus localement par des agents non informaticiens afin d'automatiser leurs tâches quotidiennes. Leur efficacité ayant permis à certains services de traiter davantage de dossiers que d'autres régions, ces outils ont été adoptés plus largement puis confiés aux développeurs de l'ESI de Montreuil pour être maintenus, sécurisés et pérennisés.

**Problématique :** Comment optimiser durablement les performances des applications PHP existantes de l'ESI afin de garantir une expérience utilisateur fluide, tout en respectant les contraintes techniques, sécuritaires et budgétaires propres à la DGFIP ?

---

## 2. Un environnement technique hautement contraint

Contrairement à un projet web classique, l'optimisation au sein d'une administration publique ne peut pas s'appuyer sur des services cloud publics ni sur l'ajout libre de bibliothèques tierces. L'analyse du terrain à l'ESI de Montreuil met en évidence cinq contraintes structurantes :

1. **Hétérogénéité du parc :** Les applications maintenues couvrent un spectre allant de PHP 4 et PHP 5 (dette technique ancienne) jusqu'à PHP 8.3 pour les projets récents, adossées principalement à PostgreSQL (ainsi qu'à MariaDB et Oracle sur d'anciens périmètres).
2. **Interdiction des frameworks externes :** Pour garder une maîtrise totale du code et de la surface d'attaque, l'usage de frameworks comme Symfony ou Laravel est proscrit. Les développements s'effectuent en « PHP pur », avec un recours limité à AJAX.
3. **Socles logiciels durcis :** La DGFIP maintient ses propres dépôts internes. Les moteurs PHP et PostgreSQL sont modifiés en interne pour désactiver les fonctions jugées risquées et renforcer les contrôles de sécurité.
4. **Infrastructure souveraine OpenStack :** En raison des exigences de confidentialité et de conformité RGPD/CNIL, l'hébergement repose sur un cloud privé interne (OpenStack) et des serveurs dédiés, aux ressources matérielles et budgétaires finies.
5. **Traitements massifs de données :** Plusieurs applications ingèrent quotidiennement ou hebdomadairement des fichiers CSV de plusieurs dizaines de mégaoctets, générant des pics de consommation mémoire et CPU.

---

## 3. Diagnostic technique : comprendre les goulots d'étranglement

Pour cibler les leviers les plus rentables, l'étude a décomposé le temps de réponse global d'une application PHP en trois maillons : l'exécution côté serveur, l'accès aux données et le rendu côté navigateur client.

### 3.1. L'impact décisif de la version du moteur PHP

PHP est un langage interprété : à chaque requête, le serveur lit le code, l'analyse et le compile en instructions intermédiaires (opcodes) exécutées par le moteur Zend. Les évolutions majeures entre PHP 5 et PHP 8 (notamment l'arrivée du compilateur Just-In-Time ou JIT) ont transformé l'efficacité du moteur.

**Tableau 1 — Comparatif des temps d'exécution par version de PHP sur des opérations standards (source : OnlinePHP.io Benchmarks).**

| Version PHP | Calculs math. (s) | Chaînes de texte (s) | Boucles (s) | Conditions (s) | Temps total (s) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| PHP 5.3.29 | 21,14 | 17,27 | 5,03 | 4,31 | 39,01 |
| PHP 5.6.40 | 16,45 | 16,20 | 4,75 | 4,63 | 25,91 |
| PHP 7.4.33 | 4,39 | 3,75 | 4,39 | 3,19 | 11,77 |
| PHP 8.2.27 | 4,38 | 4,74 | 4,80 | 3,76 | 17,68 |
| PHP 8.3.18 | 4,38 | 4,74 | 4,80 | 3,76 | (À compléter) |

> **Observation Clé :** Le simple passage de PHP 5.6 à PHP 7.4 ou 8.2 divise le temps d'exécution brut par **3,8 à 3,9** (passant de 69,19 s à 17,52 s), sans même modifier la logique métier des scripts.

### 3.2. Ressources matérielles : la règle du « single-thread » et de la RAM

Une subtilité architecturale majeure conditionne le dimensionnement des serveurs PHP : PHP est **monothread**. Une requête HTTP donnée n'utilise qu'un seul cœur processeur à la fois. Par conséquent :

*   **Fréquence du processeur (GHz) :** Détermine la vitesse d'exécution d'une page individuelle et réduit le Time To First Byte (TTFB). Le passage d'un cœur de 2,0 GHz à 3,0 GHz améliore le débit maximal d'un serveur de plus de 30 %.
*   **Nombre de cœurs :** Augmente uniquement la capacité à traiter plusieurs utilisateurs simultanément, sans accélérer un script lourd isolé.
*   **Mémoire vive (RAM) :** Évite le recours au fichier d'échange disque (SWAP). Les mesures matérielles comparatives rappellent qu'une RAM moderne est en moyenne 11 fois plus rapide que les meilleurs SSD NVMe.

### 3.3. Les limites structurelles de PHP sur les gros volumes de données

Lorsqu'une application doit trier, filtrer ou agréger des centaines de milliers de lignes issues de fichiers CSV, PHP atteint ses limites face aux langages compilés comme le C ou Rust. En PHP, chaque variable est encapsulée dans une structure interne accompagnée d'un ramasse-miettes (garbage collector) : un simple entier occupe environ 24 octets contre 8 octets en C/Rust.

**Tableau 2 — Empreinte mémoire comparative pour le stockage de 100 000 entiers en mémoire vive.**

| Langage d'exécution | Type d'exécution | Mémoire pour 100 000 entiers | Surcoût mémoire |
| :--- | :--- | :--- | :--- |
| C | Compilé natif (multithread possible) | 0,76 Mo | Référence (1×) |
| Rust | Compilé natif (multithread possible) | 0,80 Mo | $\sim 1,05\times$ |
| PHP | Interprété (monothread par requête) | 14,60 Mo | 18$\times$ plus gourmand |

---

## 4. Expérimentations et benchmarks de code réalisés

Au-delà de l'état de l'art, plusieurs protocoles de test ont été exécutés en environnement local (PHP 8.3.6) afin de mesurer concrètement le coût caché de certaines habitudes de programmation observées dans le code historique.

### 4.1. Le coût caché des avertissements (Warnings) et de l'opérateur `@`

Dans les applications anciennes, il est fréquent de masquer les avertissements liés à des index de tableaux indéfinis à l'aide de l'opérateur de silence `@` ou en désactivant l'affichage des erreurs. Or, PHP construit et formate intégralement le message d'erreur en arrière-plan avant de l'ignorer.

**Tableau 3 — Impact mesuré de la gestion des erreurs PHP sur une boucle d'un million d'itérations.**

| Scénario testé (1 000 000 Essai 1 (s)) | Essai 2 (s) | Essai 3 (s) | Facteur de ralentissement |
| :--- | :--- | :--- | :--- |
| Code propre (sans warning généré) | 0,0113 | 0,0116 | 0,0118 | Référence (1×) |
| Opérateur de fusion null (`?? null`) | 0,0249 | 0,0240 | 0,0237 | $\sim 2,1\times$ |
| Warning masqué avec l'opérateur `@` | 0,1962 | 0,1928 | 0,1957 | $\sim 17\times$ plus lent |
| Warning traité par le gestionnaire par défaut | 5,1034 | 5,3212 | 5,3748 | $\sim 450\times$ plus lent |

> **Enseignement :** Masquer une erreur avec `@` ralentit tout de même le traitement d'un facteur 17, tandis qu'un warning non intercepté multiplie le temps d'exécution par plus de 450. L'utilisation systématique de l'opérateur `??` (null coalescing) élimine ce goulot d'étranglement.

### 4.2. Fonctions natives en C et complexité algorithmique

Deux autres expérimentations illustrent l'impact direct de la qualité d'écriture du code PHP :

*   **Privilégier les fonctions natives écrites en C :** Sur un tableau de 10 millions d'éléments (moyenne sur 100 exécutions), le comptage via la fonction native `count()` prend **138 nanosecondes**, contre **82,6 millisecondes** pour un comptage manuel par boucle `foreach` — soit un écart de performance supérieur à un facteur 500 000. De même, préférer `str_replace()` à `preg_replace()` pour un texte fixe évite l'initialisation coûteuse du moteur d'expressions régulières, et écrire `$array[] = $val` évite le surcoût d'appel de fonction de `array_push()`.
*   **Éviter les recherches imbriquées :** Rechercher un identifiant dans une liste à l'intérieur d'une boucle via `in_array()` génère une complexité quadratique de $O(N \times M)$. En convertissant préalablement la liste autorisée en tableau associatif via `array_flip()` puis en testant l'existence par clé avec `isset()`, la recherche passe en temps constant $O(1)$ et l'algorithme global devient linéaire $O(N)$.

---

## 5. Application terrain : audit et solutions pour l'ESI de Montreuil

L'analyse du fonctionnement réel des applications de l'ESI — illustrée notamment par l'outil interne LISST (application majoritairement en lecture seule alimentée par un import CSV hebdomadaire massif) — a permis d'identifier des dysfonctionnements concrets et d'y apporter des réponses architecturales adaptées aux contraintes de la DGFIP.

### 5.1. Diagnostic sur le cas concret de l'application LISST

L'inspection réseau d'une fonctionnalité de LISST (`parcParAgent.php`) a révélé deux anomalies majeures dégradant fortement l'expérience des agents :

*   **Surcharge massive du DOM HTML :** La page génère en une seule fois un tableau contenant l'intégralité des enregistrements, atteignant un poids transféré de **464,18 Mo** (pour un total de 476,36 Mo et 1 min 35 s de chargement complet), alors qu'une page web fluide ne devrait pas excéder 5 Mo. Le serveur PHP consomme un temps considérable à assembler des milliers de balises HTML et le navigateur de l'agent sature en mémoire.
*   **Attente serveur sur les feuilles de style :** Les ressources statiques (`all.min.css`, `Font.css`, `global.css`) passent 99 % de leur temps de chargement en attente de réponse serveur (TTFB de 613 ms) faute d'en-têtes de cache navigateur adaptés.

### 5.2. Catalogue des leviers d'optimisation retenus

Six leviers techniques directement compatibles avec les règles de sécurité et les dépôts internes de la DGFIP ont été formalisés :

**Tableau 4 — Synthèse des leviers d'optimisation adaptés au contexte technique de l'ESI de Montreuil.**

| Couche technique | Solution préconisée | Mécanisme et bénéfice attendu |
| :--- | :--- | :--- |
| Moteur PHP & Serveur | Migration PHP 8 + configuration fine | Stocke les scripts précompilés en mémoire partagée. Réduit l'usage CPU de 90–100 % à 25–30 % et divise le temps de traitement global par près de 3. |
| Gestion mémoire | Générateurs (`yield`) et `unset()` | Permet de lire les fichiers CSV ligne par ligne sans charger l'intégralité du fichier en RAM, évitant les dépassements de `memory_limit`. |
| Traitements lourds | Délégation des imports | Exécution via `exec()` ou `shell_exec()` depuis PHP vers un binaire C/C++ ou Rust. Vitesse jusqu'à 100$\times$ supérieure et empreinte RAM minimale. |
| Base de données | Audit `EXPLAIN ANALYZE` | Identifie les requêtes lentes et pré-calcule physiquement (PostgreSQL) les agrégations complexes sur des données peu volatiles via vues matérialisées. |
| Cache applicatif | Déploiement de Redis ou Memcached en RAM | Mémorise les résultats des filtres fréquents de LISST, évitant des requêtes SQL de près d'une minute. |
| Interface client (Frontend) | Pagination serveur, Lazy Loading et cache HTTP | Ramène le poids des pages de >460 Mo à quelques centaines de kilo-octets et supprime le re-téléchargement des fichiers CSS/JS. |

### 5.3. Exemple de configuration serveur OPcache recommandée

Bien qu'activé par défaut depuis PHP 5.5, OPcache nécessite un paramétrage adapté aux applications métiers de production :


```ini
opcache.memory_consumption = 128      ; Alloue 128 Mo de RAM partagée pour le bytecode
opcache.max_accelerated_files = 2000  ; Nombre maximal de fichiers PHP mis en cache
opcache.validate_timestamps = 0       ; Désactive la vérification disque à chaque requête
opcache.save_comments = 0             ; Économise la mémoire en ignorant les commentaires
opcache.enable_cli = 1                ; Active OPcache pour les scripts CLI d'import CSV
```

---

## 6. Plan d'action, gouvernance et retour sur investissement

Pour transformer ces préconisations techniques en gains durables à l'échelle de l'ESI de Montreuil sans risquer de régression sur des outils critiques, une feuille de route méthodologique en cinq étapes a été définie :

1. **Audit ciblé des applications critiques :** Cartographier le parc par version de PHP, identifier les requêtes SQL coûteuses (`EXPLAIN ANALYZE`), mesurer le poids des pages et contrôler la configuration serveur existante.
2. **Priorisation par ratio impact/effort :** Déployer en premier lieu les gains rapides à faible risque (activation d'OPcache, cache HTTP statique, pagination des tableaux géants), suivis des migrations vers les versions PHP 8 et PostgreSQL validées en interne (en remplaçant les fonctions obsolètes comme `pg_exec()`).
3. **Tests rigoureux de performance et de non-régression :** Valider chaque évolution sur des environnements virtualisés iso-production avant toute mise en service.
4. **Déploiement progressif et monitoring :** Suivre les métriques clés (TTFB, charge CPU, consommation RAM) après chaque mise en production.
5. **Ancrage d'une « culture de la performance » :** Former les équipes de développement aux bonnes pratiques PHP moderne, aux tests automatisés et aux langages compilés (C/Rust), et instaurer une collaboration étroite entre développeurs et équipes d'infrastructure OpenStack.

### Bilan coûts / bénéfices pour la DGFIP

* **Investissement initial :** La démarche mobilise un temps d'ingénierie significatif pour l'audit du code historique (dette technique issue d'anciens développements PHP 4/5), la refonte des requêtes et la montée en compétence des équipes.
* **Bénéfices stratégiques et opérationnels :** À moyen terme, l'optimisation réduit directement la facture matérielle en évitant le surdimensionnement des machines virtuelles sur le cloud privé OpenStack. Elle garantit aux agents des finances publiques un outil de travail réactif, réduit les risques d'interruption lors des traitements massifs et renforce la sécurité globale ainsi que la conformité réglementaire (RGPD) du système d'information.

---

## 7. Glossaire des notions clés

| Terme | Définition accessible |
| :--- | :--- |
| **OPcache / Opcode** | Mécanisme qui conserve en mémoire vive la traduction intermédiaire (opcode) d'un script PHP afin d'éviter à l'ordinateur de relire et retraduire le fichier à chaque visite. |
| **Redis** | Base de données ultra-rapide stockée directement en mémoire vive (RAM), utilisée comme mémoire tampon pour éviter d'interroger sans cesse la base de données principale. |
| **TTFB (Time To First Byte)** | Temps écoulé entre le clic de l'utilisateur et la réception du tout premier octet de réponse envoyé par le serveur. Indicateur clé de la réactivité serveur. |
| **Monothread** | Mode d'exécution où un programme traite les instructions l'une après l'autre sur un seul cœur de processeur, sans pouvoir diviser une même tâche en parallèle. |
| **Pagination serveur** | Technique consistant à n'envoyer au navigateur que les 20 ou 50 lignes visibles à l'écran plutôt que l'intégralité d'un fichier de plusieurs centaines de milliers de lignes. |
<?php
declare(strict_types=1);

/* ---------- Configuration ---------- */
const BASE         = __DIR__;
const SESSION_TTL  = 1800;   // 30 min d'inactivité
const MAX_ATTEMPTS = 5;      // tentatives échouées avant blocage
const LOCK_SECONDS = 900;    // durée du blocage (15 min)

$DATA = BASE . '/data';
$OLD  = BASE . '/data-old';
$VAR  = BASE . '/var';

/* ---------- .env ---------- */
function load_env(string $file): array
{
    $env = [];
    if (!is_file($file)) {
        return $env;
    }
    foreach (file($file, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) as $line) {
        $line = trim($line);
        if ($line === '' || $line[0] === '#' || !str_contains($line, '=')) {
            continue;
        }
        [$k, $v] = explode('=', $line, 2);
        $v = trim($v);
        if (strlen($v) >= 2 && ($v[0] === '"' || $v[0] === "'") && $v[-1] === $v[0]) {
            $v = substr($v, 1, -1);
        }
        $env[trim($k)] = $v;
    }
    return $env;
}
$env = load_env(BASE . '/.env');

/* ---------- En-têtes de sécurité ---------- */
$nonce = base64_encode(random_bytes(16));
header("Content-Security-Policy: default-src 'none'; script-src 'nonce-$nonce'; form-action 'self'; frame-ancestors 'none'; base-uri 'none'");
header('X-Frame-Options: DENY');
header('X-Content-Type-Options: nosniff');
header('Referrer-Policy: no-referrer');
header('Cache-Control: no-store');
header('X-Robots-Tag: noindex, nofollow');
header_remove('X-Powered-By');

/* ---------- Session ---------- */
$https = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off');
ini_set('session.use_strict_mode', '1');
ini_set('session.use_only_cookies', '1');
session_set_cookie_params([
    'lifetime' => 0,
    'path'     => '/',
    'secure'   => $https,
    'httponly' => true,
    'samesite' => 'Strict',
]);
session_name('updater_sid');
session_start();

if (isset($_SESSION['auth'], $_SESSION['last'])) {
    if (time() - $_SESSION['last'] > SESSION_TTL) {
        destroy_session();
        session_start();
    } else {
        $_SESSION['last'] = time();
    }
}
if (empty($_SESSION['csrf'])) {
    $_SESSION['csrf'] = bin2hex(random_bytes(32));
}

function destroy_session(): void
{
    $_SESSION = [];
    if (ini_get('session.use_cookies')) {
        $p = session_get_cookie_params();
        setcookie(session_name(), '', time() - 3600, $p['path'], $p['domain'], $p['secure'], $p['httponly']);
    }
    session_destroy();
}

function e(string $s): string
{
    return htmlspecialchars($s, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}

function flash(string $type, string $msg): void
{
    $_SESSION['flash'] = [$type, $msg];
}

function redirect(): never
{
    header('Location: ' . strtok($_SERVER['REQUEST_URI'] ?? '/', '?'), true, 303);
    exit;
}

function check_secret(string $input, string $expected): bool
{
    if ($expected === '') {
        return false;
    }
    // Le .env peut contenir soit la clé en clair, soit un hash (password_hash)
    if (str_starts_with($expected, '$2y$') || str_starts_with($expected, '$argon2')) {
        return password_verify($input, $expected);
    }
    return hash_equals($expected, $input);
}

/* ---------- Anti brute-force (par IP) ---------- */
function attempts_file(): string
{
    global $VAR;
    if (!is_dir($VAR)) {
        mkdir($VAR, 0750, true);
    }
    return $VAR . '/attempts_' . hash('sha256', $_SERVER['REMOTE_ADDR'] ?? 'x') . '.json';
}

function attempts_read(): array
{
    $f = attempts_file();
    $d = is_file($f) ? json_decode((string)file_get_contents($f), true) : null;
    return is_array($d) ? $d + ['count' => 0, 'until' => 0] : ['count' => 0, 'until' => 0];
}

function attempts_write(array $d): void
{
    file_put_contents(attempts_file(), json_encode($d), LOCK_EX);
}

/* ---------- Opérations fichiers ---------- */
function rm_rf(string $path): void
{
    if (is_link($path) || is_file($path)) {
        unlink($path);
        return;
    }
    if (!is_dir($path)) {
        return;
    }
    $it = new RecursiveIteratorIterator(
        new RecursiveDirectoryIterator($path, FilesystemIterator::SKIP_DOTS),
        RecursiveIteratorIterator::CHILD_FIRST
    );
    foreach ($it as $f) {
        ($f->isLink() || $f->isFile()) ? unlink($f->getPathname()) : rmdir($f->getPathname());
    }
    rmdir($path);
}

function copy_r(string $src, string $dst): void
{
    mkdir($dst, 0750, true);
    $it = new RecursiveIteratorIterator(
        new RecursiveDirectoryIterator($src, FilesystemIterator::SKIP_DOTS),
        RecursiveIteratorIterator::SELF_FIRST
    );
    foreach ($it as $f) {
        if ($f->isLink()) {
            continue; // on ne suit pas les liens symboliques
        }
        $target = $dst . '/' . $it->getSubPathname();
        $f->isDir() ? mkdir($target, 0750, true) : copy($f->getPathname(), $target);
    }
}

function run_git(array $args): int
{
    global $VAR;
    $log  = $VAR . '/git.log';
    $cmd  = array_merge(['git'], $args);
    $proc = proc_open(
        $cmd,
        [1 => ['file', $log, 'a'], 2 => ['file', $log, 'a']],
        $pipes,
        BASE,
        [
            'GIT_TERMINAL_PROMPT' => '0',
            'HOME'                => $VAR,
            'PATH'                => '/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin',
        ]
    );
    if (!is_resource($proc)) {
        return -1;
    }
    // Délai maximum de 120 s, géré en PHP (pas de dépendance à la commande "timeout")
    $deadline = time() + 120;
    while (true) {
        $st = proc_get_status($proc);
        if (!$st['running']) {
            $code = $st['exitcode'];
            proc_close($proc);
            return $code;
        }
        if (time() > $deadline) {
            proc_terminate($proc, 9);
            proc_close($proc);
            return -1;
        }
        usleep(200000);
    }
}

function with_lock(callable $fn): void
{
    global $VAR;
    $h = fopen($VAR . '/lock', 'c');
    if (!$h || !flock($h, LOCK_EX | LOCK_NB)) {
        throw new RuntimeException('Une opération est déjà en cours.');
    }
    try {
        $fn();
    } finally {
        flock($h, LOCK_UN);
        fclose($h);
    }
}

function do_update(string $repo, string $branch, string $subdir = ''): void
{
    global $DATA, $OLD;
    if (!preg_match('#^(https://|ssh://|git@)[^\s]+$#', $repo)) {
        throw new RuntimeException('REPO_URL invalide dans le .env.');
    }
    $new = BASE . '/data-new';
    rm_rf($new);

    $args = ['clone', '--quiet', '--depth', '1'];
    if ($branch !== '') {
        if (!preg_match('/^[A-Za-z0-9._\/-]+$/', $branch) || $branch[0] === '-') {
            throw new RuntimeException('REPO_BRANCH invalide dans le .env.');
        }
        array_push($args, '--branch', $branch);
    }
    array_push($args, '--', $repo, $new);

    if (run_git($args) !== 0) {
        rm_rf($new);
        throw new RuntimeException('Le clonage du dépôt a échoué (voir var/git.log).');
    }
    rm_rf($new . '/.git');

    // Si REPO_SUBDIR est défini, seul ce sous-dossier du dépôt devient le contenu de data
    $subdir = trim($subdir, '/');
    if ($subdir !== '') {
        if (!preg_match('#^[A-Za-z0-9._-]+(/[A-Za-z0-9._-]+)*$#', $subdir) || str_contains($subdir, '..')) {
            rm_rf($new);
            throw new RuntimeException('REPO_SUBDIR invalide dans le .env.');
        }
        $src = $new . '/' . $subdir;
        if (!is_dir($src) || is_link($src)) {
            rm_rf($new);
            throw new RuntimeException('Le dossier "' . $subdir . '" est introuvable dans le dépôt.');
        }
        $stage = BASE . '/data-stage';
        rm_rf($stage);
        if (!rename($src, $stage)) {
            rm_rf($new);
            throw new RuntimeException('Impossible d\'extraire le sous-dossier du dépôt.');
        }
        rm_rf($new);
        rename($stage, $new);
    }

    // Sauvegarde de l'ancien contenu puis mise en place du nouveau
    if (is_dir($DATA)) {
        rm_rf($OLD);
        if (!rename($DATA, $OLD)) {
            rm_rf($new);
            throw new RuntimeException('Impossible de sauvegarder data vers data-old.');
        }
    }
    if (!rename($new, $DATA)) {
        if (is_dir($OLD)) {
            rename($OLD, $DATA); // rollback
        }
        throw new RuntimeException('Impossible de mettre en place le nouveau contenu.');
    }
}

function do_recover(): void
{
    global $DATA, $OLD;
    if (!is_dir($OLD)) {
        throw new RuntimeException('Aucune sauvegarde (data-old) disponible.');
    }
    $tmp   = BASE . '/data-tmp';
    $trash = BASE . '/data-trash';
    rm_rf($tmp);
    rm_rf($trash);
    copy_r($OLD, $tmp);
    if (is_dir($DATA) && !rename($DATA, $trash)) {
        rm_rf($tmp);
        throw new RuntimeException('Impossible de remplacer data.');
    }
    if (!rename($tmp, $DATA)) {
        if (is_dir($trash)) {
            rename($trash, $DATA); // rollback
        }
        throw new RuntimeException('Impossible de restaurer data-old.');
    }
    rm_rf($trash);
}

/* ---------- Traitement des formulaires (POST uniquement) ---------- */
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $token = (string)($_POST['csrf'] ?? '');
    if (!hash_equals($_SESSION['csrf'], $token)) {
        http_response_code(403);
        exit('Requête invalide.');
    }
    $action = (string)($_POST['action'] ?? '');

    if ($action === 'login') {
        $a = attempts_read();
        if ($a['until'] > time()) {
            flash('err', 'Trop de tentatives. Réessayez plus tard.');
            redirect();
        }
        $k1 = (string)($_POST['key1'] ?? '');
        $k2 = (string)($_POST['key2'] ?? '');
        // Les deux vérifications sont toujours exécutées (pas de court-circuit)
        $ok1 = check_secret($k1, $env['KEY1'] ?? '');
        $ok2 = check_secret($k2, $env['KEY2'] ?? '');

        if ($ok1 && $ok2) {
            attempts_write(['count' => 0, 'until' => 0]);
            session_regenerate_id(true);
            $_SESSION['auth']  = true;
            $_SESSION['last']  = time();
            $_SESSION['csrf']  = bin2hex(random_bytes(32));
            redirect();
        }
        $a['count']++;
        if ($a['count'] >= MAX_ATTEMPTS) {
            $a = ['count' => 0, 'until' => time() + LOCK_SECONDS];
        }
        attempts_write($a);
        usleep(random_int(400000, 900000));
        flash('err', 'Identifiants incorrects.');
        redirect();
    }

    // Toutes les autres actions exigent d'être connecté
    if (empty($_SESSION['auth'])) {
        http_response_code(403);
        exit('Non autorisé.');
    }

    if ($action === 'logout') {
        destroy_session();
        session_start();
        flash('ok', 'Vous êtes déconnecté.');
        redirect();
    }

    try {
        if (!is_dir($VAR)) {
            mkdir($VAR, 0750, true);
        }
        if ($action === 'update') {
            with_lock(fn() => do_update($env['REPO_URL'] ?? '', $env['REPO_BRANCH'] ?? '', $env['REPO_SUBDIR'] ?? ''));
            flash('ok', 'Mise à jour effectuée. L\'ancien contenu est sauvegardé dans data-old.');
        } elseif ($action === 'recover') {
            with_lock(fn() => do_recover());
            flash('ok', 'Restauration effectuée : data a été remplacé par data-old.');
        }
    } catch (Throwable $t) {
        flash('err', 'Erreur : ' . $t->getMessage());
    }
    redirect();
}

/* ---------- Affichage ---------- */
$flash = $_SESSION['flash'] ?? null;
unset($_SESSION['flash']);
$logged = !empty($_SESSION['auth']);
?>
<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>Mise à jour</title>
</head>
<body>
<h1>Mise à jour</h1>

<?php if ($flash): ?>
    <p><strong><?= $flash[0] === 'ok' ? '✅' : '❌' ?> <?= e($flash[1]) ?></strong></p>
<?php endif; ?>

<?php if (!$logged): ?>
    <form method="post" autocomplete="off">
        <input type="hidden" name="csrf" value="<?= e($_SESSION['csrf']) ?>">
        <input type="hidden" name="action" value="login">
        <p><label>Clée 1 <input type="password" name="key1" required autocomplete="off"></label></p>
        <p><label>Clée 2 <input type="password" name="key2" required autocomplete="off"></label></p>
        <p><button type="submit">Se connecter</button></p>
    </form>
<?php else: ?>
    <form method="post" data-confirm="Lancer la mise à jour ?">
        <input type="hidden" name="csrf" value="<?= e($_SESSION['csrf']) ?>">
        <input type="hidden" name="action" value="update">
        <button type="submit">Faire la mise a jour</button>
    </form>
    <br>
    <form method="post" data-confirm="Écraser data avec data-old ?">
        <input type="hidden" name="csrf" value="<?= e($_SESSION['csrf']) ?>">
        <input type="hidden" name="action" value="recover">
        <button type="submit">Recover old data</button>
    </form>
    <br>
    <form method="post">
        <input type="hidden" name="csrf" value="<?= e($_SESSION['csrf']) ?>">
        <input type="hidden" name="action" value="logout">
        <button type="submit">Se déconnecter</button>
    </form>
<?php endif; ?>
<script nonce="<?= e($nonce) ?>">
document.querySelectorAll('form[data-confirm]').forEach(function (f) {
    f.addEventListener('submit', function (ev) {
        if (!confirm(f.dataset.confirm)) { ev.preventDefault(); }
    });
});
</script>
</body>
</html>
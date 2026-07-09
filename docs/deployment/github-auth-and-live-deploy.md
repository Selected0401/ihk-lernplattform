# GitHub Auth + Live-Deploy — manueller Eingriff

Stand: 2026-07-09

## Warum ein manueller Schritt nötig ist

Der lokale Stand ist bereit, aber der Server kann aktuell nicht nach GitHub pushen:

```text
git@github.com: Permission denied (publickey).
fatal: Could not read from remote repository.
```

Es gibt außerdem kein `gh` CLI und keinen `GITHUB_TOKEN`/`GH_TOKEN` im Environment.

## Was bereits vorbereitet ist

- Repo-spezifischer SSH-Key wurde auf dem Server erzeugt.
- Git ist lokal so konfiguriert, dass genau dieser Key für dieses Repo benutzt wird.
- Deploy-Script liegt unter:

```bash
scripts/push-public-shell-after-auth.sh
```

Dieses Script macht nach erfolgreicher GitHub-Freischaltung automatisch:

1. Working Tree prüfen
2. `npm test`
3. `npm run build`
4. `npm audit --audit-level=high`
5. `git diff --check`
6. `git push --dry-run origin main`
7. `git push origin main`
8. GitHub-Pages-Live-Smoke mit Cachebuster

## Manueller Schritt A — empfohlen: Deploy Key bei GitHub eintragen

Öffne im Browser:

```text
https://github.com/Selected0401/ihk-lernplattform/settings/keys
```

Dann:

1. `Add deploy key` klicken
2. Titel: `Hermes IHK Lernplattform Deploy Key`
3. Public Key einfügen aus:

```bash
cat /opt/data/.ssh/ihk_lernplattform_github_ed25519.pub
```

4. Wichtig: `Allow write access` aktivieren
5. Speichern

Danach auf dem Server ausführen:

```bash
cd /opt/data/ihk-lernplattform
bash scripts/push-public-shell-after-auth.sh
```

## Manueller Schritt B — Alternative: Personal Access Token

Wenn du keinen Deploy Key willst, erstelle einen GitHub Token mit Repo-Schreibrecht und pushe ohne Speicherung:

```bash
cd /opt/data/ihk-lernplattform
read -s GITHUB_TOKEN
git push "https://Selected0401:${GITHUB_TOKEN}@github.com/Selected0401/ihk-lernplattform.git" main
unset GITHUB_TOKEN
python3 scripts/verify-public-shell-live.py --cachebuster $(git rev-parse --short HEAD)
```

Token niemals in Chat, Screenshots oder Doku posten.

## Nach erfolgreichem Push

Die öffentliche GitHub-Pages-Shell muss grün sein:

```text
public-shell-live-smoke=PASS
```

Paid Launch bleibt trotzdem gesperrt, bis Recht/ZFU/FernUSG, Digistore24-Testkauf, Cloudflare-Worker-Staging und Git-History-Entscheidung erledigt sind.

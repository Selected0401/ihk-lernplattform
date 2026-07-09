#!/usr/bin/env python3
"""Validate learning-object/task contracts and public-shell safety.

Phase 1 keeps paid/protected content out of GitHub Pages. When a local
`.protected-content/source/` export exists, validate it. Always fail if
protected JSON reappears in public deploy folders such as `data/` or `www/data/`.
"""

from __future__ import annotations

import hashlib
import json
import re
import sys
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PROTECTED_SOURCE_ROOT = ROOT / ".protected-content" / "source"
TASK_FILES = [
    PROTECTED_SOURCE_ROOT / "data" / "aufgaben-optimiert.json",
    PROTECTED_SOURCE_ROOT / "data" / "aufgaben.json",
    PROTECTED_SOURCE_ROOT / "data" / "lernfeld-1-3.json",
    PROTECTED_SOURCE_ROOT / "data" / "lernfeld-4-6.json",
]
PUBLIC_CONTENT_DIRS = [
    ROOT / "data",
    ROOT / "www" / "data",
    ROOT / "ios" / "App" / "App" / "public" / "data",
]
SYNC_GROUPS = [
    [
        ROOT / "learning-environment.js",
        ROOT / "www" / "js" / "learning-environment.js",
        ROOT / "js" / "learning-environment.js",
        ROOT / "ios" / "App" / "App" / "public" / "js" / "learning-environment.js",
    ],
    [ROOT / "landing.html", ROOT / "www" / "landing.html"],
    [ROOT / "login.html", ROOT / "www" / "login.html"],
    [ROOT / "sales-config.js", ROOT / "www" / "sales-config.js"],
]
RUNTIME_BASES = [ROOT, ROOT / "www", ROOT / "ios" / "App" / "App" / "public"]
PUBLIC_RUNTIME_FILES = [
    ROOT / "index.html",
    ROOT / "www" / "index.html",
    ROOT / "landing.html",
    ROOT / "www" / "landing.html",
    ROOT / "login.html",
    ROOT / "www" / "login.html",
    ROOT / "sales-config.js",
    ROOT / "www" / "sales-config.js",
]
RISKY_CLAIM_PATTERNS = [
    re.compile(pattern, re.I)
    for pattern in [
        r"bestehe\s+garantiert",
        r"offizielle\s+IHK-App",
        r"IHK-zertifiziert",
        r"originale\s+IHK-Prüfungen",
        r"100%\s+kostenlos",
        r"95%\s+Erfolgsquote",
        r"statt\s+399",
        r"Jetzt\s+sicher\s+über\s+Digistore24",
    ]
]
ALLOWED_CATEGORIES = {"excel", "word", "powerpoint", "outlook"}
ALLOWED_DIFFICULTIES = {"anfaenger", "mittel", "fortgeschritten"}
REQUIRED_FIELDS = [
    "id",
    "kategorie",
    "titel",
    "beschreibung",
    "schwierigkeit",
    "punkte",
    "zeit",
    "hinweise",
    "loesung",
]


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def load_tasks(path: Path) -> list[dict]:
    data = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(data, dict) or not isinstance(data.get("aufgaben"), list):
        raise ValueError("top-level object must contain list field 'aufgaben'")
    return data["aufgaben"]


def issue(issues: list[tuple[str, str, str]], path: Path, task_id: str, message: str) -> None:
    issues.append((str(path.relative_to(ROOT)), task_id, message))


def task_text(task: dict) -> str:
    return " ".join(
        str(part)
        for part in [
            task.get("titel", ""),
            task.get("beschreibung", ""),
            task.get("loesung", ""),
            " ".join(task.get("hinweise", [])) if isinstance(task.get("hinweise"), list) else "",
        ]
    ).lower()


def validate_elements_quality(path: Path, task: dict, issues: list[tuple[str, str, str]]) -> None:
    task_id = str(task.get("id", "#unknown"))
    category = task.get("kategorie")
    content = task.get("content") if isinstance(task.get("content"), dict) else {}
    elements = content.get("elements") if isinstance(content, dict) else None
    if not isinstance(elements, list):
        return

    lower_text = task_text(task)
    lower_elements = [str(element).lower() for element in elements]

    if re.search(r"[\u4e00-\u9fff]", " ".join([str(task.get("titel", "")), str(task.get("beschreibung", "")), str(task.get("loesung", ""))])):
        issue(issues, path, task_id, "contains non-German/CJK stray characters")

    if category == "word" and not any(term in lower_text for term in ["geschäftsbrief", "din 5008", "serienbrief", "brief", "mailing"]):
        forbidden = {"absender", "empfänger", "betreff", "anrede", "grußformel"}
        if any(element in forbidden for element in lower_elements):
            issue(issues, path, task_id, "word content.elements contains copied business-letter boilerplate")

    if category == "powerpoint":
        generic_master_terms = {"folienmaster", "corporate design", "farbschema"}
        task_mentions_master = any(term in lower_text for term in ["master", "vorlage", "corporate", "farbschema", "design"])
        if not task_mentions_master and any(element in generic_master_terms for element in lower_elements):
            issue(issues, path, task_id, "powerpoint content.elements contains unrelated master/design boilerplate")

    if category == "outlook":
        generic_rule_terms = {"regel", "bedingung", "aktion", "ordner"}
        task_mentions_rules = any(term in lower_text for term in ["regel", "bedingung", "aktion", "ordner", "filter"])
        if not task_mentions_rules and any(element in generic_rule_terms for element in lower_elements):
            issue(issues, path, task_id, "outlook content.elements contains unrelated rule boilerplate")


def validate_task_file(path: Path) -> list[tuple[str, str, str]]:
    issues: list[tuple[str, str, str]] = []
    try:
        tasks = load_tasks(path)
    except Exception as exc:  # noqa: BLE001 - CLI validator should report any parse failure
        return [(str(path.relative_to(ROOT)), "FILE", f"JSON parse/schema failure: {exc}")]

    seen: set[str] = set()
    for index, task in enumerate(tasks):
        task_id = str(task.get("id") or f"#{index}")

        if task_id in seen:
            issue(issues, path, task_id, "duplicate id")
        seen.add(task_id)

        for field in REQUIRED_FIELDS:
            value = task.get(field)
            if value is None or value == "" or value == []:
                issue(issues, path, task_id, f"missing/empty required field '{field}'")

        category = task.get("kategorie")
        difficulty = task.get("schwierigkeit")
        if category not in ALLOWED_CATEGORIES:
            issue(issues, path, task_id, f"invalid kategorie '{category}'")
        if difficulty not in ALLOWED_DIFFICULTIES:
            issue(issues, path, task_id, f"invalid schwierigkeit '{difficulty}'")

        points = task.get("punkte")
        minutes = task.get("zeit")
        if not isinstance(points, int) or not 10 <= points <= 50:
            issue(issues, path, task_id, "punkte must be integer between 10 and 50")
        if not isinstance(minutes, int) or not 5 <= minutes <= 60:
            issue(issues, path, task_id, "zeit must be integer between 5 and 60")

        hints = task.get("hinweise")
        if not isinstance(hints, list) or len(hints) < 2:
            issue(issues, path, task_id, "hinweise must contain at least two hints")
        if len(str(task.get("beschreibung", "")).strip()) < 70:
            issue(issues, path, task_id, "beschreibung is too short/action-poor")
        if len(str(task.get("loesung", "")).strip()) < 15:
            issue(issues, path, task_id, "loesung is too short")

        content = task.get("content")
        if not isinstance(content, dict):
            issue(issues, path, task_id, "missing content object for LearningEnvironment")
            continue

        if not content.get("solution"):
            issue(issues, path, task_id, "content.solution missing")
        elif content.get("solution") != task.get("loesung"):
            issue(issues, path, task_id, "content.solution differs from loesung")

        if category == "excel":
            data = content.get("data")
            if not isinstance(data, list) or len(data) < 2:
                issue(issues, path, task_id, "excel content.data must contain at least header + one row")
            elif len({len(row) if isinstance(row, list) else -1 for row in data}) > 1:
                issue(issues, path, task_id, "excel content.data rows are ragged")
        elif category in {"word", "powerpoint", "outlook"}:
            elements = content.get("elements")
            if not isinstance(elements, list) or not elements:
                issue(issues, path, task_id, f"{category} content.elements missing/empty")
            else:
                validate_elements_quality(path, task, issues)

    return issues


def validate_sync_groups() -> list[tuple[str, str, str]]:
    issues: list[tuple[str, str, str]] = []
    for group in SYNC_GROUPS:
        existing = [path for path in group if path.exists()]
        if len(existing) != len(group):
            for path in group:
                if not path.exists():
                    issues.append((str(path.relative_to(ROOT)), "FILE", "expected synchronized copy missing"))
            continue
        hashes = {sha256(path) for path in existing}
        if len(hashes) > 1:
            summary = ", ".join(f"{p.relative_to(ROOT)}={sha256(p)[:10]}" for p in existing)
            issues.append(("SYNC", "FILES", f"synchronized copies differ: {summary}"))
    return issues


def validate_no_public_content() -> list[tuple[str, str, str]]:
    issues: list[tuple[str, str, str]] = []
    for directory in PUBLIC_CONTENT_DIRS:
        if not directory.exists():
            continue
        for path in sorted(directory.glob("*.json")):
            issues.append((str(path.relative_to(ROOT)), "PUBLIC_CONTENT", "protected learning JSON must not be in public deploy shell"))
    return issues


def normalize_runtime_ref(ref: str) -> str | None:
    ref = ref.split("?", 1)[0].strip()
    if not ref or ref.startswith(("http:", "https:", "data:", "#")):
        return None
    return ref[2:] if ref.startswith("./") else ref


def validate_runtime_assets() -> list[tuple[str, str, str]]:
    issues: list[tuple[str, str, str]] = []
    for base in RUNTIME_BASES:
        if not base.exists():
            continue
        rel_base = str(base.relative_to(ROOT)) if base != ROOT else "."
        index = base / "index.html"
        if index.exists():
            html = index.read_text(encoding="utf-8")
            refs = re.findall(r'<script[^>]+src="([^"]+)"', html)
            refs += re.findall(r'<link[^>]+href="([^"]+)"', html)
            for ref in refs:
                normalized = normalize_runtime_ref(ref)
                if normalized and not (base / normalized).exists():
                    issues.append((rel_base, "INDEX", f"missing referenced asset '{normalized}'"))

        service_worker = base / "sw.js"
        if service_worker.exists():
            sw_text = service_worker.read_text(encoding="utf-8")
            match = re.search(r"CRITICAL_ASSETS\s*=\s*\[(.*?)\];", sw_text, flags=re.S)
            if match:
                for ref in re.findall(r"['\"]([^'\"]+)['\"]", match.group(1)):
                    normalized = normalize_runtime_ref(ref)
                    if not normalized:
                        continue
                    if normalized == ".":
                        normalized = "index.html"
                    if "*" in normalized:
                        continue
                    if not (base / normalized).exists():
                        issues.append((rel_base, "SW", f"missing CRITICAL_ASSETS entry '{normalized}'"))
    return issues


def validate_runtime_code_patterns() -> list[tuple[str, str, str]]:
    issues: list[tuple[str, str, str]] = []
    learning_env = (ROOT / "learning-environment.js").read_text(encoding="utf-8")
    if "this.activeCell" not in learning_env or "saveAnswer(activeCell.id, formula)" not in learning_env:
        issues.append(("learning-environment.js", "ExcelSimulator", "formula bar must persist selected cell and save formula text for grading"))
    if "const correct = hasTitle" in learning_env:
        issues.append(("learning-environment.js", "PowerPointEditor", "powerpoint grading must not pass from task requirements alone"))
    if "powerpoint-state" not in learning_env:
        issues.append(("learning-environment.js", "PowerPointEditor", "powerpoint grading must track user-created slide state"))

    for index_path in [ROOT / "index.html", ROOT / "www" / "index.html"]:
        html = index_path.read_text(encoding="utf-8")
        if "attempts >= 100" not in html or "Lernumgebung konnte nicht geladen werden" not in html:
            issues.append((str(index_path.relative_to(ROOT)), "startTask", "missing visible timeout when learningEnv fails to load"))
        if "data/aufgaben-optimiert.json" in html:
            issues.append((str(index_path.relative_to(ROOT)), "PUBLIC_CONTENT", "runtime must not fetch public data/aufgaben-optimiert.json"))
        if "taskItem.innerHTML" in html or "taskDetail.innerHTML" in html:
            issues.append((str(index_path.relative_to(ROOT)), "XSS", "task data from protected backend must render via DOM APIs/textContent, not innerHTML templates"))
        if "onclick=\"startTask('${fullTask.id}')\"" in html:
            issues.append((str(index_path.relative_to(ROOT)), "XSS", "task detail start button must use addEventListener, not inline onclick from task data"))
        if "Date.parse(localStorage.getItem('ihk_access_expires_at') || '')" not in html or "clearAccessStorage" not in html:
            issues.append((str(index_path.relative_to(ROOT)), "ACCESS", "frontend access gate must clear expired or malformed token sessions"))
    return issues


def validate_commerce_safety() -> list[tuple[str, str, str]]:
    issues: list[tuple[str, str, str]] = []
    for path in PUBLIC_RUNTIME_FILES:
        if not path.exists():
            continue
        text = path.read_text(encoding="utf-8")
        rel = str(path.relative_to(ROOT))

        for pattern in RISKY_CLAIM_PATTERNS:
            if pattern.search(text):
                issues.append((rel, "CLAIM", f"risky public claim pattern found: {pattern.pattern}"))

        if "regularTargetPrice" in text:
            issues.append((rel, "CLAIM", "unsupported anchor price config must not ship in public shell"))

        if path.name == "sales-config.js":
            checkout_active = re.search(r"checkoutActive\s*:\s*true", text)
            checkout_url_match = re.search(r"checkoutUrl\s*:\s*['\"]([^'\"]*)['\"]", text)
            checkout_url = checkout_url_match.group(1) if checkout_url_match else ""
            if checkout_active and not re.match(r"https://(www\.)?digistore24\.(com|app)/", checkout_url):
                issues.append((rel, "CHECKOUT", "active checkout must use a real Digistore24 order-form URL"))

        if path.name == "login.html" and "const VALID_CODES = []" not in text:
            issues.append((rel, "ACCESS", "public frontend VALID_CODES must stay empty"))

        if path.name in {"index.html", "login.html"} and "https://*.workers.dev" not in text:
            issues.append((rel, "CSP", "CSP must allow configured Cloudflare Worker staging origin"))

        if path.name == "index.html":
            if "logoutAccessSession" not in text or "nav-link-logout" not in text:
                issues.append((rel, "ACCESS", "authenticated shell must expose logout"))
            if "ihk_access_since" not in text or "ihk_preview_mode" not in text:
                issues.append((rel, "ACCESS", "logout/session cleanup must remove all legacy access flags"))
            if "clearProtectedSessionCaches" not in text or "pruefungskern-(api|dynamic)" not in text:
                issues.append((rel, "ACCESS", "logout must clear protected API/dynamic caches without deleting static PWA cache"))

        if any(marker in text for marker in ["ihk_preview_mode", "access=granted", "preview=true"]):
            if "localStorage.removeItem('ihk_preview_mode')" not in text:
                issues.append((rel, "ACCESS", "preview/access bypass marker must not ship in public shell"))
    return issues
    return issues


def main() -> int:
    issues: list[tuple[str, str, str]] = []
    protected_files = [path for path in TASK_FILES if path.exists()]
    for path in protected_files:
        issues.extend(validate_task_file(path))
    issues.extend(validate_no_public_content())
    issues.extend(validate_sync_groups())
    issues.extend(validate_runtime_assets())
    issues.extend(validate_runtime_code_patterns())
    issues.extend(validate_commerce_safety())

    print("IHK learning-object validation")
    print(f"Files checked: {len(protected_files)} protected task files + {len(SYNC_GROUPS)} sync groups + public-shell/runtime assets/code")
    if not protected_files:
        print("WARN: local .protected-content export missing; skipped private task quality validation")
    if not issues:
        print("OK: 0 issues")
        return 0

    print(f"FAIL: {len(issues)} issue(s)")
    counts = Counter(message for _, _, message in issues)
    for message, count in counts.most_common():
        print(f"- {count}x {message}")
    print("\nDetails:")
    for file_name, task_id, message in issues:
        print(f"{file_name}: {task_id}: {message}")
    return 1


if __name__ == "__main__":
    sys.exit(main())

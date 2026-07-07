#!/usr/bin/env python3
"""Validate IHK Lernplattform learning-object/task contracts.

Checks the canonical JSON and deployed copies used by GitHub Pages/Capacitor so
broken or stale learning objects are caught before users hit them.
"""

from __future__ import annotations

import hashlib
import json
import re
import sys
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
TASK_FILES = [
    ROOT / "data" / "aufgaben-optimiert.json",
    ROOT / "www" / "data" / "aufgaben-optimiert.json",
    ROOT / "ios" / "App" / "App" / "public" / "data" / "aufgaben-optimiert.json",
]
SYNC_GROUPS = [
    [
        ROOT / "data" / "aufgaben-optimiert.json",
        ROOT / "www" / "data" / "aufgaben-optimiert.json",
        ROOT / "ios" / "App" / "App" / "public" / "data" / "aufgaben-optimiert.json",
    ],
    [
        ROOT / "learning-environment.js",
        ROOT / "www" / "js" / "learning-environment.js",
        ROOT / "js" / "learning-environment.js",
        ROOT / "ios" / "App" / "App" / "public" / "js" / "learning-environment.js",
    ],
]
RUNTIME_BASES = [ROOT, ROOT / "www", ROOT / "ios" / "App" / "App" / "public"]
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


def main() -> int:
    issues: list[tuple[str, str, str]] = []
    for path in TASK_FILES:
        issues.extend(validate_task_file(path))
    issues.extend(validate_sync_groups())
    issues.extend(validate_runtime_assets())

    print("IHK learning-object validation")
    print(f"Files checked: {len(TASK_FILES)} task files + {len(SYNC_GROUPS)} sync groups + runtime assets")
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

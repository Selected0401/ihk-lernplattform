#!/usr/bin/env python3
"""Regression checks for desktop and iPhone PWA installation metadata."""

from __future__ import annotations

import json
import re
import struct
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PUBLIC_ROOTS = (ROOT, ROOT / "www")
EXPECTED_ICONS = {
    "icon-192.png": (192, 192),
    "icon-512.png": (512, 512),
}
EXPECTED_SCREENSHOTS = {
    "screenshot-narrow.png": ((750, 1334), "narrow"),
    "screenshot-wide.png": ((1280, 720), "wide"),
}


def png_dimensions(path: Path) -> tuple[int, int]:
    data = path.read_bytes()
    if data[:8] != b"\x89PNG\r\n\x1a\n" or data[12:16] != b"IHDR":
        raise AssertionError(f"not a valid PNG: {path.relative_to(ROOT)}")
    return struct.unpack(">II", data[16:24])


def assert_public_root(public_root: Path) -> None:
    manifest_path = public_root / "manifest.json"
    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    relative_root = public_root.relative_to(ROOT) or Path(".")

    assert manifest.get("id") == "./", f"{relative_root}/manifest.json must define id='./'"
    assert manifest.get("start_url") == "./"
    assert manifest.get("scope") == "./"
    assert manifest.get("display") == "standalone"

    icons = {item.get("src"): item for item in manifest.get("icons", [])}
    for filename, expected_dimensions in EXPECTED_ICONS.items():
        icon = icons.get(filename)
        assert icon, f"missing manifest icon {filename} in {relative_root}"
        assert icon.get("type") == "image/png"
        assert "any" in icon.get("purpose", "").split()
        assert "maskable" in icon.get("purpose", "").split()
        assert not filename.startswith("data:")
        assert png_dimensions(public_root / filename) == expected_dimensions

    screenshots = {item.get("src"): item for item in manifest.get("screenshots", [])}
    for filename, (expected_dimensions, expected_form_factor) in EXPECTED_SCREENSHOTS.items():
        screenshot = screenshots.get(filename)
        assert screenshot, f"missing manifest screenshot {filename} in {relative_root}"
        assert screenshot.get("type") == "image/png"
        assert screenshot.get("form_factor") == expected_form_factor
        assert not filename.startswith("data:")
        assert png_dimensions(public_root / filename) == expected_dimensions

    assert png_dimensions(public_root / "apple-touch-icon.png") == (180, 180)

    html = (public_root / "index.html").read_text(encoding="utf-8")
    assert re.search(r'<link\s+rel="manifest"\s+href="manifest\.json\?v=[^"]+">', html), (
        f"{relative_root}/index.html must cache-bust the manifest URL"
    )
    assert '<link rel="apple-touch-icon" sizes="180x180" href="apple-touch-icon.png">' in html

    service_worker = (public_root / "sw.js").read_text(encoding="utf-8")
    for filename in (*EXPECTED_ICONS, *EXPECTED_SCREENSHOTS, "apple-touch-icon.png"):
        assert f"'{filename}'" in service_worker, f"{filename} must be pre-cached in {relative_root}/sw.js"


def main() -> int:
    for public_root in PUBLIC_ROOTS:
        assert_public_root(public_root)

    assert (ROOT / "manifest.json").read_bytes() == (ROOT / "www" / "manifest.json").read_bytes()
    for filename in (*EXPECTED_ICONS, *EXPECTED_SCREENSHOTS, "apple-touch-icon.png"):
        assert (ROOT / filename).read_bytes() == (ROOT / "www" / filename).read_bytes(), filename

    print("pwa-installability-regression=PASS icons=2 screenshots=2 apple_touch=180x180")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

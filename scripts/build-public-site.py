#!/usr/bin/env python3
"""Build the minimal, curated GitHub Pages artifact for PrüfBlick Release A."""

from __future__ import annotations

import argparse
import shutil
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "www"
DEFAULT_OUTPUT = ROOT / "dist-public"
PUBLIC_FILES = (
    "apple-touch-icon.png",
    "brand-config.js",
    "icon-192.png",
    "icon-512.png",
    "index.html",
    "js/learning-environment.js",
    "login.html",
    "manifest.json",
    "screenshot-narrow.png",
    "screenshot-wide.png",
    "style.css",
    "sw.js",
)


def assert_safe_output(output: Path) -> None:
    if output == DEFAULT_OUTPUT:
        return
    if output == ROOT or output in ROOT.parents or ROOT in output.parents:
        raise ValueError("only dist-public may be used as output inside the repository")
    if output.exists():
        raise ValueError("refusing to replace an existing output outside the repository")


def build(output: Path) -> None:
    output = output.resolve()
    assert_safe_output(output)

    missing = [relative for relative in PUBLIC_FILES if not (SOURCE / relative).is_file()]
    if missing:
        raise FileNotFoundError(f"missing public source files: {', '.join(missing)}")

    if output.exists():
        shutil.rmtree(output)
    output.mkdir(parents=True)

    for relative in PUBLIC_FILES:
        source = SOURCE / relative
        if source.is_symlink():
            raise ValueError(f"public source must not be a symlink: {relative}")
        destination = output / relative
        destination.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(source, destination)

    (output / ".nojekyll").write_text("", encoding="utf-8")
    print(f"public-artifact=PASS files={len(PUBLIC_FILES) + 1} output={output}")


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output", type=Path, default=DEFAULT_OUTPUT)
    args = parser.parse_args()
    build(args.output)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

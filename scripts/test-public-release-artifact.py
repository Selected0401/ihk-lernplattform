#!/usr/bin/env python3
"""Fail-closed checks for the curated GitHub Pages release artifact."""

from __future__ import annotations

import argparse
import importlib.util
import json
import re
import shutil
import subprocess
import tempfile
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
EXPECTED_FILES = {
    ".nojekyll",
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
}
FORBIDDEN_PUBLIC_TEXT = (
    "Prüfungskern",
    "Emilia",
    "Prüfaro",
    "Pruefaro",
    "Digistore24",
    "99€",
    "Zugang kaufen",
    "Verkaufsseite ansehen",
)


def relative_files(root: Path) -> set[str]:
    return {
        path.relative_to(root).as_posix()
        for path in root.rglob("*")
        if path.is_file()
    }


class PublicArtifactTests(unittest.TestCase):
    def test_builder_rejects_repository_ancestors_as_output(self) -> None:
        builder_path = ROOT / "scripts" / "build-public-site.py"
        spec = importlib.util.spec_from_file_location("build_public_site", builder_path)
        if spec is None or spec.loader is None:
            self.fail("could not import curated artifact builder")
        module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)

        with self.assertRaises(ValueError):
            module.assert_safe_output(ROOT.parent)

    def test_builder_emits_only_the_approved_public_allowlist(self) -> None:
        builder = ROOT / "scripts" / "build-public-site.py"
        self.assertTrue(builder.is_file(), "curated public artifact builder is missing")

        with tempfile.TemporaryDirectory(prefix="pruefblick-public-") as temp_dir:
            output = Path(temp_dir) / "site"
            subprocess.run(
                ["python3", str(builder), "--output", str(output)],
                cwd=ROOT,
                check=True,
                capture_output=True,
                text=True,
            )

            files = relative_files(output)
            self.assertEqual(files, EXPECTED_FILES)
            self.assertFalse(any(path.endswith((".md", ".zip", ".env")) for path in files))
            self.assertFalse(any(path.startswith(("docs/", "node_modules/", "scripts/")) for path in files))

            manifest = json.loads((output / "manifest.json").read_text(encoding="utf-8"))
            self.assertEqual(manifest["name"], "PrüfBlick Büromanagement")
            self.assertEqual(manifest["short_name"], "PrüfBlick")

            for relative_path in files:
                path = output / relative_path
                if path.suffix not in {".html", ".js", ".json", ".css"}:
                    continue
                content = path.read_text(encoding="utf-8")
                for forbidden in FORBIDDEN_PUBLIC_TEXT:
                    self.assertNotIn(forbidden, content, f"{forbidden!r} leaked through {relative_path}")

            for html_name in ("index.html", "login.html"):
                html = (output / html_name).read_text(encoding="utf-8")
                for reference in re.findall(r'(?:src|href)="([^"?#]+)', html):
                    if reference.startswith(("http://", "https://", "data:", "#")):
                        continue
                    self.assertTrue((output / reference).is_file(), f"missing {reference} referenced by {html_name}")

            service_worker = (output / "sw.js").read_text(encoding="utf-8")
            critical_block = service_worker.split("const CRITICAL_ASSETS = [", 1)[1].split("];", 1)[0]
            for reference in re.findall(r"'([^']+)'", critical_block):
                if reference == "./":
                    continue
                self.assertTrue((output / reference).is_file(), f"missing precache asset {reference}")
            self.assertNotIn("images/", service_worker)
            self.assertIn("icon: 'icon-192.png'", service_worker)
            self.assertIn("badge: 'icon-192.png'", service_worker)
            self.assertIn("clients.openWindow('index.html#tasks')", service_worker)

    def test_pages_workflow_publishes_only_the_curated_artifact(self) -> None:
        workflow = (ROOT / ".github" / "workflows" / "pages.yml").read_text(encoding="utf-8")

        self.assertNotIn("pull_request:", workflow)
        self.assertIn("python3 scripts/test-brand-release-a.py", workflow)
        self.assertIn("python3 scripts/test-pwa-installability.py", workflow)
        self.assertIn("python3 scripts/test-public-release-artifact.py", workflow)
        self.assertIn("python3 scripts/build-public-site.py --output dist-public", workflow)
        self.assertIn("path: dist-public", workflow)
        self.assertNotIn("path: .\n", workflow)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(add_help=False)
    parser.parse_known_args()
    unittest.main(verbosity=2)

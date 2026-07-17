#!/usr/bin/env python3
"""Regression contract for the isolated PrüfBlick Release A."""

from __future__ import annotations

import hashlib
import json
import subprocess
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
EXPECTED_BRAND = {
    "name": "PrüfBlick",
    "productName": "PrüfBlick Büromanagement",
    "shortName": "PrüfBlick",
    "proProductName": "PrüfBlick Büromanagement Pro",
    "tagline": "Prüfungen klar im Blick.",
    "status": "CANDIDATE_NOT_LEGALLY_CLEARED",
    "gates": {
        "professionalTrademarkReviewCompleted": False,
        "trademarkApplicationAuthorized": False,
        "domainPurchaseAuthorized": False,
        "paidLaunchAuthorized": False,
        "checkoutAuthorized": False,
    },
}
EXPECTED_ASSET_HASHES = {
    "icon-192.png": "fd33b97f2bd2b0bd24a58294715cba4c0dce1185cc9393cafdd474c133a0aef3",
    "icon-512.png": "36ccd0e2818726cddbce2d9379f994cf3a3ff1aebe29307370c871d4575668bd",
    "apple-touch-icon.png": "f6e5ce8f9fa197c2de0e9d7f62ef0a9c31dae77bc116d7138271c04b518aaac6",
    "screenshot-narrow.png": "0792aa3831b44a56e7be947a49395c92a7e008da1a30bac5bf3dd2245ae0e057",
    "screenshot-wide.png": "868a342dfa01e8630d6d1cf0f869081e72b5695fc5f4af293014c55117e4c807",
}


def load_javascript_brand(path: Path) -> dict[str, object]:
    probe = """
const fs = require('fs');
const vm = require('vm');
const window = {};
vm.runInNewContext(fs.readFileSync(process.argv[1], 'utf8'), { window });
process.stdout.write(JSON.stringify(window.PRUEFBLICK_BRAND));
"""
    result = subprocess.run(
        ["node", "-e", probe, str(path)],
        cwd=ROOT,
        check=True,
        capture_output=True,
        text=True,
    )
    return json.loads(result.stdout)


class BrandContractTests(unittest.TestCase):
    def test_canonical_brand_config_is_identical_and_fail_closed(self) -> None:
        root_config = ROOT / "brand-config.js"
        public_config = ROOT / "www" / "brand-config.js"

        self.assertTrue(root_config.is_file(), "root brand-config.js is missing")
        self.assertTrue(public_config.is_file(), "www/brand-config.js is missing")
        self.assertEqual(root_config.read_bytes(), public_config.read_bytes())
        self.assertEqual(load_javascript_brand(root_config), EXPECTED_BRAND)

    def test_pwa_brand_metadata_preserves_identity_and_assets(self) -> None:
        for public_root in (ROOT, ROOT / "www"):
            manifest = json.loads((public_root / "manifest.json").read_text(encoding="utf-8"))
            self.assertEqual(manifest["name"], EXPECTED_BRAND["productName"])
            self.assertEqual(manifest["short_name"], EXPECTED_BRAND["shortName"])
            self.assertEqual(manifest["id"], "./")
            self.assertEqual(manifest["start_url"], "./")
            self.assertEqual(manifest["scope"], "./")
            self.assertEqual(manifest["display"], "standalone")
            self.assertEqual(
                [item["label"] for item in manifest["screenshots"]],
                [
                    "PrüfBlick Büromanagement - Startseite",
                    "PrüfBlick Büromanagement - Lernfortschritt",
                ],
            )

            for filename, expected_hash in EXPECTED_ASSET_HASHES.items():
                digest = hashlib.sha256((public_root / filename).read_bytes()).hexdigest()
                self.assertEqual(digest, expected_hash, filename)

    def test_primary_pages_use_pruefblick_without_sales_calls_to_action(self) -> None:
        for public_root in (ROOT, ROOT / "www"):
            index = (public_root / "index.html").read_text(encoding="utf-8")
            login = (public_root / "login.html").read_text(encoding="utf-8")

            self.assertIn("<title>PrüfBlick Büromanagement</title>", index)
            self.assertIn('href="manifest.json?v=20260717-brand-a-1"', index)
            self.assertIn('content="PrüfBlick"', index)
            self.assertIn('data-brand-text="productName">PrüfBlick Büromanagement', index)
            self.assertIn('data-brand-text="tagline">Prüfungen klar im Blick.', index)
            self.assertIn('<script src="brand-config.js?v=20260717-brand-a-1"></script>', index)
            self.assertIn("<title>Zugangscode eingeben · PrüfBlick</title>", login)
            self.assertIn('<script src="brand-config.js?v=20260717-brand-a-1"></script>', login)

            combined = index + login
            self.assertNotIn("Prüfungskern", combined)
            self.assertNotIn("Emilia", combined)
            self.assertNotIn("landing.html", combined)
            self.assertNotIn("Zugang kaufen", combined)
            self.assertNotIn("Verkaufsseite ansehen", combined)

    def test_service_worker_rolls_cache_and_uses_public_brand(self) -> None:
        for public_root in (ROOT, ROOT / "www"):
            service_worker = (public_root / "sw.js").read_text(encoding="utf-8")

            self.assertIn("pruefungskern-v2.1.2-brand-a", service_worker)
            self.assertIn("pruefungskern-static-v2.1.2-brand-a", service_worker)
            self.assertIn("'brand-config.js'", service_worker)
            self.assertIn("'login.html'", service_worker)
            self.assertNotIn("'index-optimized.html'", service_worker)
            self.assertNotIn("'app.js'", service_worker)
            self.assertIn("<title>Offline - PrüfBlick</title>", service_worker)
            self.assertIn("showNotification('PrüfBlick', options)", service_worker)
            self.assertNotIn("Emilia", service_worker)


if __name__ == "__main__":
    unittest.main(verbosity=2)

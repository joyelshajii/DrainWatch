import unittest
import json
import os
import sys

sys.path.insert(0, os.path.dirname(__file__))
from server import identify_ward, point_in_polygon, KOCHI_WARDS, compute_sla, app

class TestDrainWatchBackend(unittest.TestCase):
    def setUp(self):
        self.app = app.test_client()
        self.app.testing = True

    def test_point_in_polygon_kadavanthra(self):
        # Coordinates inside Kadavanthra (Ward 48)
        ward, exact = identify_ward(9.9674, 76.2995)
        self.assertEqual(ward["id"], "W48")
        self.assertEqual(ward["number"], 48)
        self.assertTrue(exact)

    def test_point_in_polygon_thevara(self):
        # Coordinates inside Thevara (Ward 58)
        ward, exact = identify_ward(9.9400, 76.2950)
        self.assertEqual(ward["id"], "W58")
        self.assertEqual(ward["number"], 58)
        self.assertTrue(exact)

    def test_point_in_polygon_fort_kochi(self):
        # Coordinates inside Fort Kochi (Ward 60)
        ward, exact = identify_ward(9.9650, 76.2420)
        self.assertEqual(ward["id"], "W60")
        self.assertEqual(ward["number"], 60)
        self.assertTrue(exact)

    def test_sla_calculation(self):
        hours_crit, _ = compute_sla("CRITICAL")
        self.assertEqual(hours_crit, 24)

        hours_high, _ = compute_sla("HIGH")
        self.assertEqual(hours_high, 48)

        hours_mod, _ = compute_sla("MODERATE")
        self.assertEqual(hours_mod, 72)

        hours_min, _ = compute_sla("MINOR")
        self.assertEqual(hours_min, 96)

    def test_api_wards_geojson(self):
        response = self.app.get('/api/wards')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertEqual(data["type"], "FeatureCollection")
        self.assertGreater(len(data["features"]), 0)

    def test_api_stats(self):
        response = self.app.get('/api/stats')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertIn("total_reports", data)
        self.assertIn("active_blockages", data)

    def test_api_leaderboard(self):
        response = self.app.get('/api/leaderboard')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertIsInstance(data, list)

if __name__ == '__main__':
    unittest.main()

import json
import unittest
from pathlib import Path


class TestSchema(unittest.TestCase):
	def test_relationships_and_names(self):
		root = Path(__file__).resolve().parents[1] / "eola" / "doctype"
		docs = {d["name"]: d for p in root.glob("*/*.json") if (d := json.loads(p.read_text()))}
		self.assertEqual(len(docs), 14)
		children = {"Telemetry Equipment", "Hourly Telemetry Reading", "Performance Baseline Hour"}
		for name, doc in docs.items():
			self.assertEqual(doc["module"], "EOLA")
			self.assertEqual(bool(doc["istable"]), name in children)
			fields = {f["fieldname"]: f for f in doc["fields"]}
			self.assertEqual(len(fields), len(doc["fields"]))
			self.assertEqual(list(fields), doc["field_order"])
			if name not in children:
				self.assertIn(doc["title_field"], fields)
				self.assertIn("#####", doc["autoname"])
			for field in fields.values():
				if field["fieldtype"] in ("Link", "Table"):
					self.assertIn(field["options"], set(docs) | {"User"})
				if field["fieldtype"] == "Table":
					self.assertIn(field["options"], children)

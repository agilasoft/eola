import copy
import io
import json
import unittest
from types import SimpleNamespace
from unittest.mock import patch
from urllib.error import HTTPError

from eola import openai_provider as provider


class TestOpenAIProvider(unittest.TestCase):
	def setUp(self):
		self.fields = dict(finding="Production below baseline.", possible_causes=[f"Possible cause {i}." for i in range(5)], recommended_action=[f"Verify cause {i}." for i in range(5)], recommended_type_of_service="Remote Work", supporting_evidence="Measured deficit.", confidence=60)
		self.response = dict(status="completed", model="gpt-4.1-mini-2025-04-14", output=[dict(type="message", content=[dict(type="output_text", text=json.dumps(self.fields))])])
		patcher = patch.object(provider, "frappe", SimpleNamespace(conf={"openai_api_key": "test-secret"}, throw=lambda message: (_ for _ in ()).throw(ValueError(message))))
		patcher.start()
		self.addCleanup(patcher.stop)

	def test_request_and_mapping(self):
		with patch.object(provider, "urlopen", return_value=io.BytesIO(json.dumps(self.response).encode())) as call:
			result = provider.generate_recommendation({"evidence": "Measured deficit"})
		request = call.call_args.args[0]
		payload = json.loads(request.data)
		self.assertEqual(request.full_url, "https://api.openai.com/v1/responses")
		self.assertEqual(request.get_header("Authorization"), "Bearer test-secret")
		self.assertNotIn("test-secret", request.data.decode())
		self.assertFalse(payload["store"])
		self.assertTrue(payload["text"]["format"]["strict"])
		self.assertEqual(call.call_args.kwargs["timeout"], 30)
		self.assertEqual(result["ai_model"], "openai/gpt-4.1-mini-2025-04-14")
		self.assertEqual(result["possible_causes"].splitlines()[4], "5. Possible cause 4.")

	def test_missing_key_does_not_call_api(self):
		provider.frappe.conf = {}
		with patch.dict(provider.os.environ, {}, clear=True), patch.object(provider, "urlopen") as call:
			with self.assertRaisesRegex(ValueError, "openai_api_key"):
				provider.generate_recommendation({})
			call.assert_not_called()

	def test_refusal_and_incomplete_are_rejected(self):
		for response in [dict(status="incomplete"), dict(status="completed", output=[dict(type="message", content=[dict(type="refusal")])])]:
			with self.assertRaises(ValueError):
				provider.parse_response(response)

	def test_invalid_fields_are_rejected(self):
		for field, value in [("possible_causes", ["Only one"]), ("recommended_action", [""] * 5), ("confidence", 101), ("confidence", True), ("recommended_type_of_service", "Automatic repair")]:
			response = copy.deepcopy(self.response)
			response["output"][0]["content"][0]["text"] = json.dumps({**self.fields, field: value})
			with self.assertRaises(ValueError):
				provider.parse_response(response)

	def test_provider_errors_do_not_expose_response_body(self):
		for status in [401, 403, 429, 500]:
			with patch.object(provider, "urlopen", side_effect=HTTPError("https://api.openai.com/v1/responses", status, "secret detail", {}, io.BytesIO(b"secret body"))):
				with self.assertRaises(ValueError) as caught:
					provider.generate_recommendation({})
				self.assertNotIn("secret", str(caught.exception))

	def test_timeout_is_actionable(self):
		with patch.object(provider, "urlopen", side_effect=TimeoutError):
			with self.assertRaisesRegex(ValueError, "timeout"):
				provider.generate_recommendation({})

import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../backend')))

from scanner_secrets import scan_code_for_secrets

def test_aws_key_detection():
    code_snippet = """
    def get_credentials():
        aws_key = "AKIAIOSFODNN7EXAMPLE"
        return aws_key
    """
    result = scan_code_for_secrets(code_snippet)
    
    assert result.status == "FAILED", "Scanner failed to block the AWS Key!"
    assert result.total_secrets == 1, "Scanner found incorrect number of secrets"
    assert result.secrets_found[0].type == "AWS Access Key ID", "Scanner misidentified the secret type"

def test_clean_code():
    code_snippet = """
    def calculate_sum(a, b):
        return a + b
    """
    result = scan_code_for_secrets(code_snippet)
    
    assert result.status == "PASSED", "Scanner incorrectly blocked clean code!"
    assert result.total_secrets == 0, "Scanner hallucinated a secret!"

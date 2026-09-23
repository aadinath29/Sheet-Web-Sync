import os
import json
import base64
from dotenv import load_dotenv
from google.oauth2.service_account import Credentials

load_dotenv()

SPREADSHEET_ID = os.getenv("SPREADSHEET_ID")
WEBHOOK_URL = os.getenv("WEBHOOK_URL")

# Decode Base64 credentials
b64_creds = os.getenv("GOOGLE_CREDENTIALS_B64")
if b64_creds:
    creds_json = base64.b64decode(b64_creds).decode('utf-8')
    creds_dict = json.loads(creds_json)
    SCOPES = ['https://www.googleapis.com/auth/spreadsheets']
    GOOGLE_CREDS = Credentials.from_service_account_info(creds_dict, scopes=SCOPES)
else:
    raise ValueError("GOOGLE_CREDENTIALS_B64 not found in environment")

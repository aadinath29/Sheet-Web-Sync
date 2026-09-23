import asyncio
import httpx
import copy
from typing import List
from googleapiclient.discovery import build
from app.config import GOOGLE_CREDS, SPREADSHEET_ID, WEBHOOK_URL

class SheetService:
    def __init__(self):
        self.service = build('sheets', 'v4', credentials=GOOGLE_CREDS)
        self.sheet = self.service.spreadsheets()
        self.RANGE_NAME = 'Sheet1!A1:C4'
        self.snapshot = []

    def fetch_data(self):
        try:
            result = self.sheet.values().get(spreadsheetId=SPREADSHEET_ID, range=self.RANGE_NAME).execute()
            return result.get('values', [])
        except Exception as e:
            print(f"Error fetching data: {e}")
            return []

    def update_row(self, index: int, row_data: List[str]):
        row_num = index + 1
        update_range = f'Sheet1!A{row_num}:C{row_num}'
        body = {'values': [row_data]}
        self.sheet.values().update(
            spreadsheetId=SPREADSHEET_ID, 
            range=update_range,
            valueInputOption='USER_ENTERED', 
            body=body
        ).execute()
        
        # Update snapshot immediately
        while len(self.snapshot) <= index:
            self.snapshot.append(["", "", ""])
        self.snapshot[index] = row_data

    async def poll_google_sheet(self):
        async with httpx.AsyncClient() as client:
            while True:
                await asyncio.sleep(3)
                current_data = self.fetch_data()
                if current_data != self.snapshot:
                    print("Change detected in Google Sheet (External Edit)!")
                    self.snapshot = copy.deepcopy(current_data)
                    try:
                        await client.post(WEBHOOK_URL, json={'data': self.snapshot})
                        print("Webhook sent to Node.js")
                    except Exception as e:
                        print(f"Failed to notify Node.js: {e}")

sheet_service = SheetService()

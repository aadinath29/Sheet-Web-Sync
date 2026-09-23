from typing import List
from pydantic import BaseModel
from app.services.sheet_service import sheet_service

class RowUpdate(BaseModel):
    values: List[str]

class SheetController:
    @staticmethod
    def get_all_rows():
        return {"rows": sheet_service.snapshot}

    @staticmethod
    def edit_row(index: int, payload: RowUpdate):
        try:
            sheet_service.update_row(index, payload.values)
            print(f"Successfully processed update for row {index}")
            return {"status": "ok", "rows": sheet_service.snapshot}
        except Exception as e:
            print(f"Error processing update: {e}")
            return {"status": "error", "message": str(e)}

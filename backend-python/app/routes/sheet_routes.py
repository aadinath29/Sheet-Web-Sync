from fastapi import APIRouter
from app.controllers.sheet_controller import SheetController, RowUpdate

router = APIRouter()

@router.get("/rows")
def get_rows():
    return SheetController.get_all_rows()

@router.post("/rows/{index}")
def edit_row(index: int, payload: RowUpdate):
    return SheetController.edit_row(index, payload)

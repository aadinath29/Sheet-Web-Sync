import asyncio
from fastapi import FastAPI
from app.routes.sheet_routes import router as sheet_router
from app.services.sheet_service import sheet_service

app = FastAPI()

app.include_router(sheet_router)

@app.on_event("startup")
async def startup_event():
    print("Initializing snapshot from Google Sheets...")
    sheet_service.snapshot = sheet_service.fetch_data()
    print(f"Loaded {len(sheet_service.snapshot)} rows.")
    asyncio.create_task(sheet_service.poll_google_sheet())

from fastapi import APIRouter
from backend.app.api.v1.dataset import router as dataset_router

api_v1_router = APIRouter()
api_v1_router.include_router(dataset_router, prefix="/dataset", tags=["Dataset Intelligence"])

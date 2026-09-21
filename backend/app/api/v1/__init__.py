from fastapi import APIRouter
try:
    from backend.app.api.v1.dataset import router as dataset_router
    from backend.app.api.v1.agent import router as agent_router
    from backend.app.api.v1.powerbi import router as powerbi_router
except ImportError:
    from app.api.v1.dataset import router as dataset_router
    from app.api.v1.agent import router as agent_router
    from app.api.v1.powerbi import router as powerbi_router

api_v1_router = APIRouter()
api_v1_router.include_router(dataset_router, prefix="/dataset", tags=["Dataset Intelligence"])
api_v1_router.include_router(agent_router, prefix="", tags=["AI Agent & Analytics"])
api_v1_router.include_router(powerbi_router, prefix="/powerbi", tags=["Power BI Automation"])

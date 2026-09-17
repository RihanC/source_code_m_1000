"""
Main entrypoint for OCEANEMBED FastAPI Backend
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.routes import router as api_router

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Satellite Embedding-Based Deep Learning Framework for Subsurface Ocean Temperature Reconstruction",
    version=settings.VERSION,
    docs_url="/docs",
    redoc_url="/redoc"
)

# Enable CORS for local frontend development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api")

@app.get("/")
def root():
    return {
        "title": settings.PROJECT_TITLE,
        "api_docs": "/docs",
        "demo_mode": settings.IS_DEMO_MODE,
        "region": "North Indian Ocean (5°N–30°N, 45°E–105°E)"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)

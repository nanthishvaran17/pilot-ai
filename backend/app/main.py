import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.db.database import engine, Base, SessionLocal
from app.db.seeds import seed_database
from app.api.auth import router as auth_router
from app.api.projects import router as projects_router
from app.api.questions import router as questions_router
from app.api.blueprint import router as blueprint_router
from app.api.admin import router as admin_router
from app.api.academic import router as academic_router

# Initialize database tables and seed baseline data
Base.metadata.create_all(bind=engine)
with SessionLocal() as db:
    seed_database(db)

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Intelligent requirements gathering, adaptive questionnaire, and project blueprint generation platform.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Enable CORS for development & cross-origin frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API routers under versioned prefix
app.include_router(auth_router, prefix=settings.API_V1_STR)
app.include_router(projects_router, prefix=settings.API_V1_STR)
app.include_router(questions_router, prefix=settings.API_V1_STR)
app.include_router(blueprint_router, prefix=settings.API_V1_STR)
app.include_router(admin_router, prefix=settings.API_V1_STR)
app.include_router(academic_router, prefix=settings.API_V1_STR)


@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "app_name": settings.PROJECT_NAME,
        "database": "connected"
    }

@app.get("/")
def root():
    return {
        "message": f"Welcome to {settings.PROJECT_NAME} API. Access documentation at /docs",
        "version": "1.0.0"
    }

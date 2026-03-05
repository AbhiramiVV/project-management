from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
import time
from fastapi import Request
from app.api import auth, users, projects, tasks

app = FastAPI(
    title="Mini Project Management System Backend",
    description="A robust backend REST API for tracking projects, tasks, and users.",
    version="0.1.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = str(process_time)
    return response

app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(users.router, prefix="/users", tags=["users"])
app.include_router(projects.router, prefix="/projects", tags=["projects"])
app.include_router(tasks.router, prefix="/tasks", tags=["tasks"])

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

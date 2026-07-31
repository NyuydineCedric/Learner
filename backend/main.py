from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware

from database import engine, Base, SessionLocal
import models
from seed_data import seed_if_empty
from routers import auth, academics, socials   # include the social router for conversations/messages

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Smart School AI Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5175",
        "http://127.0.0.1:5175",
    ],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include only the routers you have
app.include_router(auth.router)
app.include_router(academics.router)
app.include_router(socials.router)

@app.on_event("startup")
def on_startup():
    db = SessionLocal()
    try:
        seed_if_empty(db)
    finally:
        db.close()

@app.get("/")
def root():
    return {"status": "ok"}
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

# Load the .env file from the root directory
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), "../..", ".env"))

# Fallback to SQLite if DATABASE_URL is not set
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./data/articles.db")

# Create Database Engine
# We only add check_same_thread for SQLite connections. PostgreSQL handles connections differently.
connect_args = {}
if SQLALCHEMY_DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}
    os.makedirs("data", exist_ok=True)

from sqlalchemy_utils import database_exists, create_database

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args=connect_args
)

if not database_exists(engine.url):
    create_database(engine.url)

# SessionLocal class for database sessions
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for models
Base = declarative_base()

# Dependency to get DB session per request
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

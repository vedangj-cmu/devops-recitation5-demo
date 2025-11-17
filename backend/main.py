from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import SQLModel, Field, Session, select
from sqlalchemy import Column, String, Float, create_engine
import os
import time

db_host = os.getenv("DB_HOST", "db")
db_user = os.getenv("DB_USER", "root")
db_password = os.getenv("DB_PASSWORD", "password")
db_name = os.getenv("DB_NAME", "benchmarks")

DATABASE_URL = (
    f"mysql+mysqlconnector://{db_user}:{db_password}@{db_host}:3306/{db_name}"
)

engine = create_engine(DATABASE_URL, pool_pre_ping=True)


class Leaderboard(SQLModel, table=True):
    __tablename__ = "leaderboard"

    Model: str = Field(sa_column=Column("Model", String(255), primary_key=True))
    Organization: str = Field(sa_column=Column("Organization", String(255), nullable=False))
    global_average: float | None = Field(default=None, sa_column=Column("Global Average", Float))
    reasoning_average: float | None = Field(default=None, sa_column=Column("Reasoning Average", Float))
    coding_average: float | None = Field(default=None, sa_column=Column("Coding Average", Float))
    agentic_coding_average: float | None = Field(default=None, sa_column=Column("Agentic Coding Average", Float))
    mathematics_average: float | None = Field(default=None, sa_column=Column("Mathematics Average", Float))
    data_analysis_average: float | None = Field(default=None, sa_column=Column("Data Analysis Average", Float))
    language_average: float | None = Field(default=None, sa_column=Column("Language Average", Float))
    if_average: float | None = Field(default=None, sa_column=Column("IF Average", Float))



# ---------------------
# Retry mechanism for DB
# ---------------------
def wait_for_db(max_retries: int = 30, delay: float = 2.0):
    for i in range(max_retries):
        try:
            with engine.connect() as conn:
                conn.exec_driver_sql("SELECT 1")
            print("DB connection OK")
            return
        except Exception as e:
            print(f"DB not ready (attempt {i + 1}/{max_retries}): {e}")
            time.sleep(delay)
    raise RuntimeError("Could not connect to DB after retries")



app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["GET"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup():
    wait_for_db()


@app.get("/leaderboard")
def get_leaderboard():
    with Session(engine) as session:
        results = session.exec(select(Leaderboard)).all()

    data = []
    for r in results:
        data.append(
            {
                "Model": r.Model,
                "Organization": r.Organization,
                "Global Average": r.global_average,
                "Reasoning Average": r.reasoning_average,
                "Coding Average": r.coding_average,
                "Agentic Coding Average": r.agentic_coding_average,
                "Mathematics Average": r.mathematics_average,
                "Data Analysis Average": r.data_analysis_average,
                "Language Average": r.language_average,
                "IF Average": r.if_average,
            }
        )
    return data

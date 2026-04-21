"""
Store rows as article_id + title + description in PostgreSQL.

Upload file: columns title and description only (no article_id in the file).
Each new row receives a generated article_id (UUID). Existing rows are kept and new rows appended.
"""
import uuid
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from sqlalchemy.orm import Session
import pandas as pd
import io
import os

from . import database, schemas, crud, auth, models

router = APIRouter()

REQUIRED = ("title", "description")


def _normalize_columns(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()
    df.columns = (
        df.columns.astype(str)
        .str.replace("\ufeff", "", regex=False)
        .str.strip()
        .str.lower()
    )
    return df


def _read_df(contents: bytes, filename: str) -> pd.DataFrame:
    name = (filename or "").lower()
    if name.endswith(".csv"):
        return pd.read_csv(io.BytesIO(contents), encoding="utf-8-sig")
    return pd.read_json(io.BytesIO(contents))


@router.post("/articles/upload")
async def upload_dataset(file: UploadFile = File(...), db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    raw_name = file.filename or ""
    if not raw_name.lower().endswith((".csv", ".json")):
        raise HTTPException(status_code=400, detail="Only .csv or .json files.")

    contents = await file.read()
    if not contents:
        raise HTTPException(status_code=400, detail="Empty file.")

    try:
        df_new = _read_df(contents, raw_name)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Could not read file: {e}")

    df_new = _normalize_columns(df_new)
    missing = [c for c in REQUIRED if c not in df_new.columns]
    if missing:
        raise HTTPException(
            status_code=400,
            detail=f"Missing columns {missing}. Need title and description. Got: {list(df_new.columns)}",
        )

    df_new = df_new.dropna(subset=["description"])
    df_new["title"] = df_new["title"].fillna("").astype(str)
    df_new["description"] = df_new["description"].astype(str)
    df_new = df_new[df_new["description"].str.strip() != ""]

    if len(df_new) == 0:
        raise HTTPException(status_code=400, detail="No rows left after cleaning.")

    df_new["article_id"] = [str(uuid.uuid4()) for _ in range(len(df_new))]

    existing = crud.get_all_articles(db, user_id=current_user.id)
    if existing:
        old = pd.DataFrame(
            [{"article_id": a.article_id, "title": a.title or "", "description": a.description} for a in existing]
        )
        df = pd.concat([old, df_new], ignore_index=True)
    else:
        df = df_new

    crud.delete_all_articles(db, user_id=current_user.id)

    n = 0
    for _, row in df.iterrows():
        article_in = schemas.ArticleCreate(
            article_id=row["article_id"],
            title=row["title"] or None,
            description=str(row["description"]),
        )
        try:
            crud.create_article(db, article=article_in, user_id=current_user.id)
            n += 1
        except Exception as e:
            print(f"Skip {row['article_id']}: {e}")
            db.rollback()

    os.makedirs("data", exist_ok=True)
    return {"status": "uploaded", "rows": n}


@router.delete("/articles/dataset")
def delete_dataset(db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    legacy = os.path.join("data", "articles.csv")
    if os.path.isfile(legacy):
        os.remove(legacy)
    crud.delete_all_articles(db, user_id=current_user.id)
    return {"status": "cleared", "detail": "All articles removed."}

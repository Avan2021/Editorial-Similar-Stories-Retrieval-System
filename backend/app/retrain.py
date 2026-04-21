import os
import re
from typing import Optional
import joblib
import pandas as pd
import numpy as np
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session

from . import ml, database, crud, auth, models

router = APIRouter()


def preprocess(text: str) -> str:
    text = text.lower()
    text = re.sub(r"[^a-z ]", " ", text)
    text = re.sub(r"\s+", " ", text)
    return text.strip()


def _combined_text(title: Optional[str], description: str) -> str:
    t = (title or "").strip()
    d = (description or "").strip()
    return f"{t} {d}".strip() if t else d


@router.post("/admin/retrain")
def update_vectors_with_pretrained_model(db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    articles = crud.get_all_articles(db, user_id=current_user.id)
    if not articles:
        raise HTTPException(status_code=404, detail="No articles in the database. Upload a dataset first.")

    rows = []
    for a in articles:
        body = _combined_text(a.title, a.description)
        if body:
            rows.append({"article_id": a.article_id, "body": body})

    df = pd.DataFrame(rows)
    df = df.drop_duplicates(subset=["body"])
    df["clean_text"] = df["body"].astype(str).apply(preprocess)
    contents = df["clean_text"].tolist()
    article_ids = df["article_id"].astype(str).values

    if len(contents) == 0:
        raise HTTPException(status_code=400, detail="No valid text to train on.")

    req = ["artifacts/tfidf.pkl", "artifacts/pca.pkl", "artifacts/kmeans.pkl"]
    for path in req:
        if not os.path.exists(path):
            raise HTTPException(status_code=404, detail=f"Missing {path}. Train models in the notebook first.")

    try:
        tfidf = joblib.load("artifacts/tfidf.pkl")
        pca = joblib.load("artifacts/pca.pkl")
        kmeans = joblib.load("artifacts/kmeans.pkl")

        X_tfidf = tfidf.transform(contents).toarray()
        X_pca = pca.transform(X_tfidf)
        kmeans.predict(X_pca)

        np.save(f"artifacts/vectors_{current_user.id}.npy", X_pca)
        np.save(f"artifacts/article_ids_{current_user.id}.npy", article_ids)
        ml.load_artifacts(current_user.id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Retrain failed: {e}")

    # Log training history
    score_str = f"Trained on {len(contents)} unique vectors successfully."
    crud.create_training_history(db, user_id=current_user.id, score=score_str)

    return {"status": "vectors_updated", "processed_documents": len(contents)}

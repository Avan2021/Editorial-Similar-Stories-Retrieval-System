"""
FastAPI entry: DB setup, ML load on startup, article and similarity routes.
"""
from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import inspect, text
from sqlalchemy.orm import Session
from contextlib import asynccontextmanager

from . import models, schemas, crud, database, ml, upload, retrain, auth

models.Base.metadata.create_all(bind=database.engine)

# create_all() never alters old tables; drop and recreate if the schema is still content/category.
_insp = inspect(database.engine)
if "articles" in _insp.get_table_names():
    _cols = {c["name"] for c in _insp.get_columns("articles")}
    if "content" in _cols or "title" not in _cols or "description" not in _cols:
        with database.engine.begin() as conn:
            conn.execute(text("DROP TABLE IF EXISTS articles CASCADE"))
        models.Article.__table__.create(bind=database.engine)


def _preview(text: str, limit: int = 200) -> str:
    if not text:
        return ""
    if len(text) > limit:
        return text[:limit] + "..."
    return text


@asynccontextmanager
async def lifespan(app: FastAPI):
    yield


app = FastAPI(
    title="Similar Stories Retrieval System",
    description="Serve and query similar articles.",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://lively-daffodil-8eb73d.netlify.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(upload.router)
app.include_router(retrain.router)


@app.get("/health")
def health_check():
    return {"status": "ok", "version": "1.0.0"}


@app.get("/articles", response_model=list[schemas.ArticleSnippet])
def get_articles(page: int = 1, size: int = 50, q: str = None, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    skip = (page - 1) * size
    
    # We map q to title or description search so the search bar works
    query = db.query(models.Article).filter(models.Article.user_id == current_user.id)
    if q:
        query = query.filter((models.Article.description.ilike(f"%{q}%")) | (models.Article.title.ilike(f"%{q}%")))
        
    articles = query.offset(skip).limit(size).all()
    out = []
    for art in articles:
        out.append(
            schemas.ArticleSnippet(
                article_id=art.article_id,
                title=art.title,
                description=art.description[:200] + "..." if len(art.description or "") > 200 else (art.description or ""),
            )
        )
    return out


@app.get("/articles/{article_id}", response_model=schemas.ArticleSnippet)
def get_single_article(article_id: str, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    article = crud.get_article(db, article_id=article_id, user_id=current_user.id)
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
    return schemas.ArticleSnippet(
        article_id=article.article_id,
        title=article.title,
        description=article.description or "",
    )


@app.get("/articles/{article_id}/similar")
def get_similar_articles(article_id: str, k: int = Query(5, description="Number of similar articles"), db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    # Verify article is owned by user
    article = crud.get_article(db, article_id=article_id, user_id=current_user.id)
    if not article:
        raise HTTPException(status_code=404, detail="Article not found or not owned by you")
        
    if k <= 0:
        raise HTTPException(status_code=400, detail="k must be a positive integer.")

    results = ml.get_similar_articles(article_id, user_id=current_user.id, k=k)
    if isinstance(results, dict) and "error" in results:
        raise HTTPException(status_code=404, detail=results["error"])

    enriched = []
    for r in results:
        aid = str(r["article_id"])
        sim = float(r["similarity"])
        other = crud.get_article(db, article_id=aid, user_id=current_user.id)
        enriched.append(
            {
                "article_id": aid,
                "similarity": sim,
                "title": (other.title if other else "") or "",
                "description": _preview((other.description if other else "") or "", 120),
            }
        )

    return {"article_id": article_id, "similar_articles": enriched}


@app.get("/history", response_model=list[schemas.TrainingHistory])
def get_history(db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    return crud.get_training_history(db, user_id=current_user.id)

from sqlalchemy.orm import Session
import bcrypt
from . import models, schemas

def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

def get_user(db: Session, user_id: int):
    return db.query(models.User).filter(models.User.id == user_id).first()

def create_user(db: Session, user: schemas.UserCreate):
    salt = bcrypt.gensalt()
    hashed_password_bytes = bcrypt.hashpw(user.password.encode('utf-8'), salt)
    hashed_password = hashed_password_bytes.decode('utf-8')
    
    db_user = models.User(email=user.email, hashed_password=hashed_password)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def get_article(db: Session, article_id: str, user_id: int):
    return db.query(models.Article).filter(models.Article.article_id == article_id, models.Article.user_id == user_id).first()

def get_articles(db: Session, user_id: int, skip: int = 0, limit: int = 50):
    return db.query(models.Article).filter(models.Article.user_id == user_id).offset(skip).limit(limit).all()

def get_all_articles(db: Session, user_id: int):
    return db.query(models.Article).filter(models.Article.user_id == user_id).all()

def create_article(db: Session, article: schemas.ArticleCreate, user_id: int):
    db_article = models.Article(**article.model_dump(), user_id=user_id)
    db.add(db_article)
    db.commit()
    db.refresh(db_article)
    return db_article

def delete_all_articles(db: Session, user_id: int):
    db.query(models.Article).filter(models.Article.user_id == user_id).delete()
    db.commit()

def create_training_history(db: Session, user_id: int, score: str):
    db_history = models.TrainingHistory(score=score, user_id=user_id)
    db.add(db_history)
    db.commit()
    db.refresh(db_history)
    return db_history

def get_training_history(db: Session, user_id: int):
    return db.query(models.TrainingHistory).filter(models.TrainingHistory.user_id == user_id).order_by(models.TrainingHistory.created_at.desc()).all()

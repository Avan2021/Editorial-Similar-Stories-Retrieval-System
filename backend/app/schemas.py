from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

class UserBase(BaseModel):
    email: EmailStr

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class ArticleBase(BaseModel):
    title: Optional[str] = None
    description: str

class ArticleCreate(ArticleBase):
    article_id: str

class Article(ArticleBase):
    article_id: str
    user_id: int
    class Config:
        from_attributes = True

class ArticleSnippet(BaseModel):
    article_id: str
    title: Optional[str] = None
    description: str

class SimilarArticle(BaseModel):
    article_id: str
    similarity: float

class TrainingHistory(BaseModel):
    id: int
    score: Optional[str] = None
    created_at: datetime
    class Config:
        from_attributes = True

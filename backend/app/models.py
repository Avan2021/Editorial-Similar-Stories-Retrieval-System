from sqlalchemy import Column, String, Text, Integer, ForeignKey, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from .database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    
    articles = relationship("Article", back_populates="owner")
    histories = relationship("TrainingHistory", back_populates="owner")

class Article(Base):
    __tablename__ = "articles"

    # Using string to support both numeric and text IDs from CSV files
    article_id = Column(String, primary_key=True, index=True)
    title = Column(String, index=True, nullable=True)
    description = Column(Text, nullable=False)
    
    user_id = Column(Integer, ForeignKey("users.id"))
    owner = relationship("User", back_populates="articles")

class TrainingHistory(Base):
    __tablename__ = "training_history"
    id = Column(Integer, primary_key=True, index=True)
    score = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    user_id = Column(Integer, ForeignKey("users.id"))
    owner = relationship("User", back_populates="histories")

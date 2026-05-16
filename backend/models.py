from sqlalchemy import Column, Integer, String, Float

from database import Base

# ====================================
# USER TABLE
# ====================================

class User(Base):

    __tablename__ = "users"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    username = Column(
        String,
        nullable=False
    )

    email = Column(
        String,
        unique=True,
        nullable=False
    )

    password = Column(
        String,
        nullable=False
    )

# ====================================
# RESUME TABLE
# ====================================

class ResumeData(Base):

    __tablename__ = "resume_data"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    filename = Column(
        String,
        nullable=False
    )

    ats_score = Column(
        Float,
        nullable=False
    )

    matched_skills = Column(
        String
    )

    missing_skills = Column(
        String
    )
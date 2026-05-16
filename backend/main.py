from sentence_transformers import SentenceTransformer

from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware

import shutil
import os
import spacy

from docx import Document
from PyPDF2 import PdfReader

from sklearn.metrics.pairwise import cosine_similarity

from database import engine, SessionLocal, Base
from models import ResumeData, User

from schemas import UserCreate, UserLogin

from auth import (
    hash_password,
    verify_password,
    create_access_token
)

# ====================================
# LOAD NLP MODEL
# ====================================

nlp = spacy.load("en_core_web_sm")

model = SentenceTransformer(
    "all-MiniLM-L6-v2"
)
# ====================================
# CREATE FASTAPI APP
# ====================================

app = FastAPI()

# ====================================
# CREATE DATABASE TABLES
# ====================================

Base.metadata.create_all(bind=engine)

# ====================================
# CORS
# ====================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ====================================
# UPLOAD FOLDER
# ====================================

UPLOAD_FOLDER = "uploads"

if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

# ====================================
# SKILLS DATABASE
# ====================================

SKILLS_DB = [

    "python",
    "java",
    "c++",
    "javascript",
    "typescript",
    "react",
    "next.js",
    "node.js",
    "sql",
    "mongodb",
    "mysql",
    "machine learning",
    "deep learning",
    "ai",
    "data science",
    "fastapi",
    "django",
    "docker",
    "kubernetes",
    "aws",
    "azure",
    "html",
    "css",
    "tailwind",
    "git",
    "github",
    "pandas",
    "numpy",
    "tensorflow",
    "pytorch"

]

# ====================================
# HOME ROUTE
# ====================================

@app.get("/")
def home():

    return {
        "message": "ATS Resume Scanner Backend Running 🚀"
    }

# ====================================
# SIGNUP API
# ====================================

# ====================================
# SIGNUP API
# ====================================

@app.post("/signup")
def signup(user: UserCreate):

    db = SessionLocal()

    existing_user = db.query(User).filter(
        User.email == user.email
    ).first()

    if existing_user:

        db.close()

        return {
            "message": "User already exists"
        }

    hashed_password = hash_password(
        user.password
    )

    new_user = User(

        username=user.username,

        email=user.email,

        password=hashed_password

    )

    db.add(new_user)

    db.commit()

    db.close()

    return {
        "message": "Signup successful ✅"
    }

# ====================================
# LOGIN API
# ====================================

@app.post("/login")
def login(user: UserLogin):

    db = SessionLocal()

    existing_user = db.query(User).filter(
        User.email == user.email
    ).first()

    if not existing_user:

        db.close()

        return {
            "message": "User not found"
        }

    valid_password = verify_password(
        user.password,
        existing_user.password
    )

    if not valid_password:

        db.close()

        return {
            "message": "Invalid password"
        }

    access_token = create_access_token(
        data={
            "sub": existing_user.email
        }
    )

    db.close()

    return {

        "access_token": access_token,

        "token_type": "bearer"

    }

# ====================================
# EXTRACT TEXT FUNCTION
# ====================================

def extract_text(file_path):

    text = ""

    # PDF

    if file_path.endswith(".pdf"):

        pdf = PdfReader(file_path)

        for page in pdf.pages:

            extracted = page.extract_text()

            if extracted:
                text += extracted + "\n"

    # DOCX

    elif file_path.endswith(".docx"):

        doc = Document(file_path)

        for para in doc.paragraphs:

            text += para.text + "\n"

    return text

# ====================================
# ATS SCORE FUNCTION
# ====================================
def calculate_ats_score(
    resume_text,
    job_description
):

    try:

        if not resume_text.strip():
            return 0

        if not job_description.strip():
            return 0

        embeddings = model.encode([
            resume_text,
            job_description
        ])

        similarity = cosine_similarity(
            [embeddings[0]],
            [embeddings[1]]
        )[0][0]

        score = float(round(
            similarity * 100,
            2
        ))

        return score

    except Exception as e:

        print("ATS ERROR:", e)

        return 0
# ====================================
# SKILL ANALYSIS FUNCTION
# ====================================

def analyze_skills(
    resume_text,
    job_description
):

    resume_doc = nlp(
        resume_text.lower()
    )

    jd_doc = nlp(
        job_description.lower()
    )

    resume_text_clean = resume_doc.text

    jd_text_clean = jd_doc.text

    matched_skills = []

    missing_skills = []

    for skill in SKILLS_DB:

        if (
            skill in resume_text_clean
            and skill in jd_text_clean
        ):

            matched_skills.append(skill)

        elif (
            skill not in resume_text_clean
            and skill in jd_text_clean
        ):

            missing_skills.append(skill)

    return matched_skills, missing_skills

# ====================================
# AI SUGGESTIONS FUNCTION
# ====================================

def generate_suggestions(
    ats_score,
    missing_skills
):

    suggestions = []

    if ats_score < 30:

        suggestions.append(
            "Your resume is poorly optimized for this role."
        )

    elif ats_score < 60:

        suggestions.append(
            "Your resume partially matches the job description."
        )

    else:

        suggestions.append(
            "Your resume is highly optimized for this role."
        )

    if len(missing_skills) > 0:

        suggestions.append(
            "Add these skills to improve ATS score:"
        )

        for skill in missing_skills[:10]:

            suggestions.append(skill)

    return suggestions

# ====================================
# UPLOAD RESUME API
# ====================================

@app.post("/upload-resume/")
async def upload_resume(

    files: list[UploadFile] = File(...),

    job_description: str = Form("")

):

    try:

        results = []

        for file in files:

            # SAVE FILE

            file_path = os.path.join(
                UPLOAD_FOLDER,
                file.filename
            )

            with open(file_path, "wb") as buffer:

                shutil.copyfileobj(
                    file.file,
                    buffer
                )

            # EXTRACT TEXT

            resume_text = extract_text(
                file_path
            )

            # ATS SCORE

            ats_score = calculate_ats_score(
                resume_text,
                job_description
            )

            # ANALYZE SKILLS

            matched_skills, missing_skills = analyze_skills(
                resume_text,
                job_description
            )

            # AI SUGGESTIONS

            suggestions = generate_suggestions(
                ats_score,
                missing_skills
            )

            # SAVE DATABASE

            db = SessionLocal()

            resume_entry = ResumeData(

                filename=file.filename,

                ats_score=ats_score,

                matched_skills=",".join(
                    matched_skills
                ),

                missing_skills=",".join(
                    missing_skills
                )

            )

            db.add(resume_entry)

            db.commit()

            db.close()

            # STORE RESULT

            results.append({

                "filename": file.filename,

                "ats_score": ats_score,

                "matched_skills": matched_skills,

                "missing_skills": missing_skills,

                "suggestions": suggestions

            })

        # SORT RESULTS

        ranked_results = sorted(

            results,

            key=lambda x: x["ats_score"],

            reverse=True

        )

        return {

            "status": "success",

            "ranked_candidates": ranked_results

        }

    except Exception as e:

        return {

            "status": "error",

            "message": str(e)

        }

# ====================================
# GET ALL CANDIDATES
# ====================================

@app.get("/candidates/")
def get_candidates():

    db = SessionLocal()

    candidates = db.query(
        ResumeData
    ).all()

    results = []

    for candidate in candidates:

        results.append({

            "id": candidate.id,

            "filename": candidate.filename,

            "ats_score": candidate.ats_score,

            "matched_skills": candidate.matched_skills.split(","),

            "missing_skills": candidate.missing_skills.split(",")

        })

    db.close()

    return {

        "status": "success",

        "candidates": results

    }
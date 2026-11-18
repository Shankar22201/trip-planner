
import os
from dotenv import load_dotenv
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
import cloudinary

# Load environment variables from .env
load_dotenv()


# ================= CLOUDINARY CONFIGURATION =================

required_cloudinary_vars = [
    "CLOUDINARY_CLOUD_NAME",
    "CLOUDINARY_API_KEY",
    "CLOUDINARY_API_SECRET"
]

missing_vars = [
    var for var in required_cloudinary_vars
    if not os.getenv(var)
]

if missing_vars:
    raise RuntimeError(
        f"Missing Cloudinary configuration: {', '.join(missing_vars)}"
    )

cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET"),
    secure=True
)


# ================= DATABASE CONFIGURATION =================

db = SQLAlchemy()


# ================= PROJECT CONFIGURATION =================

BASE_DIR = os.path.abspath(os.path.dirname(__file__))

ALLOWED_IMAGE_EXTENSIONS = {"png", "jpg", "jpeg", "webp"}

MAX_CONTENT_LENGTH = 5 * 1024 * 1024


# ================= APPLICATION FACTORY =================

def create_app():

    app = Flask(__name__)

    # -------- SECRET KEY --------

    app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")

    if not app.config["SECRET_KEY"]:
        raise RuntimeError("SECRET_KEY is not configured")

    # -------- DATABASE --------

    database_url = os.getenv("DATABASE_URL")

    if not database_url:
        raise RuntimeError("DATABASE_URL is not configured")

    app.config["SQLALCHEMY_DATABASE_URI"] = database_url

    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

    # -------- IMAGE UPLOAD LIMIT --------

    app.config["MAX_CONTENT_LENGTH"] = MAX_CONTENT_LENGTH

    # -------- FRONTEND CORS --------

    frontend_origins = os.getenv(
        "FRONTEND_URL",
        "http://localhost:5173"
    ).split(",")

    CORS(
        app,
        supports_credentials=True,
        origins=[origin.strip() for origin in frontend_origins],
        methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allow_headers=["Content-Type", "Authorization"],
    )

    # -------- INITIALIZE DATABASE --------

    db.init_app(app)

    return app

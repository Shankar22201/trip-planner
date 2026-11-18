import jwt
from datetime import datetime, timedelta, timezone
from flask import request, jsonify, current_app
from functools import wraps


# ================= Generate JWT token =================
def generate_token(user):
    now = datetime.now(timezone.utc)

    payload = {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "role": user.role,
        "iat": now,
        "exp": now + timedelta(days=7)
    }

    secret_key = current_app.config["SECRET_KEY"]

    return jwt.encode(
        payload,
        secret_key,
        algorithm="HS256"
    )


# ================= JWT decorator =================
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):

        token = None
        auth_header = request.headers.get("Authorization")

        if auth_header:
            parts = auth_header.split()

            if len(parts) == 2 and parts[0].lower() == "bearer":
                token = parts[1]

        if not token:
            return jsonify({"message": "Token is missing"}), 401

        try:
            secret_key = current_app.config["SECRET_KEY"]

            data = jwt.decode(
                token,
                secret_key,
                algorithms=["HS256"]
            )

            user_id = data.get("id")

            if not user_id:
                return jsonify({"message": "Invalid token"}), 401

            # Import here to avoid circular imports
            from models import db, User

            user = db.session.get(User, user_id)

            if not user:
                return jsonify({"message": "User no longer exists"}), 401

            request.user = data
            request.current_user = user

        except jwt.ExpiredSignatureError:
            return jsonify({"message": "Token expired"}), 401

        except jwt.InvalidTokenError:
            return jsonify({"message": "Invalid token"}), 401

        return f(*args, **kwargs)

    return decorated


# ================= Admin-only decorator =================
def admin_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):

        user = getattr(request, "current_user", None)

        if not user or user.role != "admin":
            return jsonify({"message": "Admin access only"}), 403

        return f(*args, **kwargs)

    return decorated

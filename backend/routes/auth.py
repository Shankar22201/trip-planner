from flask import Blueprint, request, jsonify
from models import db, User
from utils.jwt_utils import generate_token

auth_bp = Blueprint("auth", __name__, url_prefix="/api")

# ================= REGISTER =================
@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json()

    if User.query.filter_by(email=data.get("email")).first():
        return jsonify({"message": "Email already registered"}), 400

    new_user = User(
        name=data.get("name"),
        email=data.get("email"),
        mobile=data.get("mobile"),
        # role=data.get("role", "user")
         role="user"
    )
    new_user.set_password(data.get("password"))

    try:
        db.session.add(new_user)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

    token = generate_token(new_user)

    return jsonify({
        "message": "User registered successfully",
        "token": token,
        "user": {
            "id": new_user.id,
            "name": new_user.name,
            "email": new_user.email,
            "mobile": new_user.mobile,
            "role": new_user.role
        }
    }), 201


# ================= LOGIN =================
@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()

    user = User.query.filter_by(email=data.get("email")).first()
    if not user or not user.check_password(data.get("password")):
        return jsonify({"message": "Invalid email or password"}), 401

    token = generate_token(user)

    return jsonify({
        "message": "Login successful",
        "token": token,
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "mobile": user.mobile,
            "role": user.role
        }
    }), 200


# ================= LOGOUT =================
@auth_bp.route("/logout", methods=["POST"])
def logout():
    return jsonify({"message": "Logout successful"}), 200

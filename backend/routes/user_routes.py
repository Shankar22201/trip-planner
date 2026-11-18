
from flask import Blueprint, request, jsonify
from models import db, User
from utils.jwt_utils import token_required
from utils.upload_utils import save_image, delete_image

user_bp = Blueprint("user", __name__, url_prefix="/api/user")


# ================= HELPERS =================

def get_current_user_from_jwt():
    user_data = getattr(request, "user", None)

    if not user_data:
        return None

    return User.query.get(user_data["id"])


def serialize_user(user):
    """Single source of truth for frontend user object."""

    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "mobile": user.mobile,
        "role": user.role,
        "image": user.profile_image
    }


# ================= GET PROFILE =================

@user_bp.route("/profile", methods=["GET"])
@token_required
def get_profile():

    user = get_current_user_from_jwt()

    if not user:
        return jsonify({"message": "User not found"}), 404

    return jsonify(serialize_user(user)), 200


# ================= UPDATE PROFILE =================

@user_bp.route("/profile", methods=["PUT"])
@token_required
def update_profile():

    user = get_current_user_from_jwt()

    if not user:
        return jsonify({"message": "User not found"}), 404

    image_result = None

    try:
        name = request.form.get("name")
        email = request.form.get("email")
        mobile = request.form.get("mobile")

        image_file = request.files.get("image")

        # -------- VALIDATION --------

        if not name or not email or not mobile:
            return jsonify({
                "message": "All fields are required"
            }), 400

        # Check whether another user already uses this email
        existing_email = User.query.filter(
            User.email == email,
            User.id != user.id
        ).first()

        if existing_email:
            return jsonify({
                "message": "Email already exists"
            }), 409

        # Check whether another user already uses this mobile
        existing_mobile = User.query.filter(
            User.mobile == mobile,
            User.id != user.id
        ).first()

        if existing_mobile:
            return jsonify({
                "message": "Mobile number already exists"
            }), 409

        # -------- SAVE OLD IMAGE DETAILS --------

        old_public_id = user.profile_image_public_id

        # -------- UPDATE PROFILE IMAGE --------

        if image_file and image_file.filename:

            image_result = save_image(image_file, "users")

            user.profile_image = image_result["image_url"]

            user.profile_image_public_id = image_result["public_id"]

        # -------- UPDATE USER DETAILS --------

        user.name = name
        user.email = email
        user.mobile = mobile

        db.session.commit()

        # -------- DELETE OLD CLOUDINARY IMAGE --------

        cleanup_pending = False

        if image_result and old_public_id:
            try:
                delete_image(old_public_id)

            except Exception as cleanup_error:
                cleanup_pending = True
                print("Old profile image cleanup failed:", cleanup_error)

        return jsonify({
            "message": "Profile updated successfully",
            "user": serialize_user(user),
            "old_image_cleanup_pending": cleanup_pending
        }), 200

    except Exception as e:

        db.session.rollback()

        # Remove newly uploaded image if database update fails
        if image_result:
            try:
                delete_image(image_result["public_id"])

            except Exception as cleanup_error:
                print("New image cleanup failed:", cleanup_error)

        print("Error updating profile:", e)

        return jsonify({
            "message": "Internal server error"
        }), 500

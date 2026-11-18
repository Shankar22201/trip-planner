from flask import Blueprint, request, jsonify
from models import db, Destination, DestinationImage
from utils.jwt_utils import token_required, admin_required
from utils.upload_utils import save_image, delete_image

dest_bp = Blueprint("destinations", __name__, url_prefix="/api")


@dest_bp.route("/destinations", methods=["POST"])
@token_required
@admin_required
def add_destination():
    try:
        data = request.get_json() or request.form

        if not data or not data.get("name"):
            return jsonify({"message": "Destination name is required"}), 400

        if Destination.query.filter_by(name=data["name"]).first():
            return jsonify({"message": "Destination already exists"}), 400

        destination = Destination(
            name=data["name"],
            description=data.get("description", "")
        )

        db.session.add(destination)
        db.session.commit()

        return jsonify({
            "message": "Destination added successfully",
            "destination_id": destination.id
        }), 201

    except Exception as e:
        db.session.rollback()
        print("Error adding destination:", e)
        return jsonify({"message": "Internal server error"}), 500


@dest_bp.route("/destinations", methods=["GET"])
@token_required
def get_destinations():
    try:
        destinations = Destination.query.all()

        return jsonify([
            {
                "id": d.id,
                "name": d.name,
                "description": d.description,
                "images": [img.image_url for img in d.images]
            }
            for d in destinations
        ]), 200

    except Exception as e:
        print("Error fetching destinations:", e)
        return jsonify({"message": "Internal server error"}), 500


@dest_bp.route("/destinations/<int:destination_id>", methods=["DELETE"])
@token_required
@admin_required
def delete_destination(destination_id):
    try:
        destination = Destination.query.get_or_404(destination_id)

        # Collect Cloudinary IDs before deleting database records
        public_ids = [
            img.cloudinary_public_id
            for img in destination.images
            if img.cloudinary_public_id
        ]

        # Delete destination and related image records from Neon
        db.session.delete(destination)
        db.session.commit()

        # Delete actual image files from Cloudinary
        cleanup_failed = []

        for public_id in public_ids:
            try:
                delete_image(public_id)
            except Exception as e:
                print(f"Cloudinary cleanup failed for {public_id}: {e}")
                cleanup_failed.append(public_id)

        return jsonify({
            "message": "Destination deleted successfully",
            "cloudinary_cleanup_pending": cleanup_failed
        }), 200

    except Exception as e:
        db.session.rollback()
        print("Error deleting destination:", e)
        return jsonify({"message": "Internal server error"}), 500


@dest_bp.route("/admin/destinations/<int:destination_id>/images", methods=["POST"])
@token_required
@admin_required
def upload_destination_images(destination_id):
    uploaded_public_ids = []

    try:
        destination = Destination.query.get_or_404(destination_id)

        if "images" not in request.files:
            return jsonify({"message": "No images provided"}), 400

        files = request.files.getlist("images")

        if not files or all(not file.filename for file in files):
            return jsonify({"message": "No images selected"}), 400

        uploaded_images = []

        for file in files:

            result = save_image(file, "destinations")

            image_url = result["image_url"]
            public_id = result["public_id"]

            uploaded_public_ids.append(public_id)

            img = DestinationImage(
                destination_id=destination.id,
                image_url=image_url,
                cloudinary_public_id=public_id
            )

            db.session.add(img)
            uploaded_images.append(image_url)

        db.session.commit()

        return jsonify({
            "message": "Images uploaded successfully",
            "images": uploaded_images
        }), 201

    except Exception as e:
        db.session.rollback()

        # Clean up Cloudinary files if the database operation fails
        for public_id in uploaded_public_ids:
            try:
                delete_image(public_id)
            except Exception as cleanup_error:
                print(f"Cloudinary cleanup failed: {cleanup_error}")

        print("Error uploading images:", e)

        return jsonify({
            "message": "Internal server error"
        }), 500

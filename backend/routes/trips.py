
from flask import Blueprint, request, jsonify
from models import db, Trip, Destination, TripImage
from utils.jwt_utils import token_required, admin_required
from utils.upload_utils import save_image, delete_image

trip_bp = Blueprint("trips", __name__, url_prefix="/api")


# ---------------- ADMIN: GET/POST trips ----------------

@trip_bp.route("/admin/trips", methods=["GET", "POST"])
@token_required
@admin_required
def admin_trips():

    # ================= GET =================
    if request.method == "GET":
        try:
            destination_id = request.args.get("destination", type=int)

            query = Trip.query

            if destination_id:
                query = query.filter_by(destination_id=destination_id)

            trips = query.all()

            return jsonify([
                {
                    "trip_id": t.id,
                    "destination_id": t.destination_id,
                    "destination_name": t.destination.name if t.destination else "",
                    "title": t.title or "",
                    "description": t.description or "",
                    "trip_type": t.trip_type or "",
                    "duration": t.duration or 0,
                    "activities": t.activities or "",
                    "price": t.price or 0,
                    "images": [img.image_url for img in t.images]
                }
                for t in trips
            ]), 200

        except Exception as e:
            print("Error fetching trips:", e)
            return jsonify({"message": "Internal server error"}), 500

    # ================= POST =================
    uploaded_public_ids = []

    try:
        data = request.form

        required_fields = [
            "destination_id",
            "title",
            "trip_type",
            "duration",
            "price"
        ]

        for field in required_fields:
            if not data.get(field):
                return jsonify({
                    "message": f"{field} is required"
                }), 400

        destination = Destination.query.get(data["destination_id"])

        if not destination:
            return jsonify({"message": "Destination not found"}), 404

        trip = Trip(
            destination_id=destination.id,
            title=data.get("title", ""),
            description=data.get("description", ""),
            trip_type=data.get("trip_type", ""),
            duration=data.get("duration", 0),
            activities=data.get("activities", ""),
            price=data.get("price", 0)
        )

        db.session.add(trip)

        # Generate trip ID without committing yet
        db.session.flush()

        # Upload images to Cloudinary
        if "images" in request.files:

            for file in request.files.getlist("images"):

                if not file.filename:
                    continue

                result = save_image(file, "trips")

                image_url = result["image_url"]
                public_id = result["public_id"]

                uploaded_public_ids.append(public_id)

                trip_image = TripImage(
                    trip_id=trip.id,
                    image_url=image_url,
                    cloudinary_public_id=public_id
                )

                db.session.add(trip_image)

        db.session.commit()

        return jsonify({
            "message": "Trip created successfully",
            "trip_id": trip.id
        }), 201

    except Exception as e:
        db.session.rollback()

        # Remove newly uploaded images if database operation fails
        for public_id in uploaded_public_ids:
            try:
                delete_image(public_id)
            except Exception as cleanup_error:
                print("Cloudinary cleanup failed:", cleanup_error)

        print("Error creating trip:", e)

        return jsonify({
            "message": "Internal server error"
        }), 500


# ---------------- ADMIN: UPDATE TRIP ----------------

@trip_bp.route("/admin/trips/<int:trip_id>", methods=["PUT"])
@token_required
@admin_required
def update_trip(trip_id):

    uploaded_public_ids = []

    try:
        trip = Trip.query.get(trip_id)

        if not trip:
            return jsonify({"message": "Trip not found"}), 404

        data = request.form

        trip.title = data.get("title", trip.title)
        trip.description = data.get("description", trip.description)
        trip.trip_type = data.get("trip_type", trip.trip_type)
        trip.duration = data.get("duration", trip.duration)
        trip.price = data.get("price", trip.price)

        # Identify images that should remain
        existing_images = request.form.getlist("existingImages")

        # Collect images that need deletion
        images_to_delete = []

        for img in list(trip.images):

            if img.image_url not in existing_images:

                if img.cloudinary_public_id:
                    images_to_delete.append(img.cloudinary_public_id)

                db.session.delete(img)

        # Upload new images
        if "images" in request.files:

            for file in request.files.getlist("images"):

                if not file.filename:
                    continue

                result = save_image(file, "trips")

                image_url = result["image_url"]
                public_id = result["public_id"]

                uploaded_public_ids.append(public_id)

                new_image = TripImage(
                    trip_id=trip.id,
                    image_url=image_url,
                    cloudinary_public_id=public_id
                )

                db.session.add(new_image)

        # Save database changes first
        db.session.commit()

        # Delete removed images from Cloudinary after DB commit
        cleanup_failed = []

        for public_id in images_to_delete:
            try:
                delete_image(public_id)
            except Exception as cleanup_error:
                print("Cloudinary cleanup failed:", cleanup_error)
                cleanup_failed.append(public_id)

        return jsonify({
            "message": "Trip updated successfully",
            "cloudinary_cleanup_pending": cleanup_failed
        }), 200

    except Exception as e:
        db.session.rollback()

        # Clean up newly uploaded images if DB update fails
        for public_id in uploaded_public_ids:
            try:
                delete_image(public_id)
            except Exception as cleanup_error:
                print("Cloudinary cleanup failed:", cleanup_error)

        print("Error updating trip:", e)

        return jsonify({
            "message": "Internal server error"
        }), 500


# ---------------- ADMIN: DELETE TRIP ----------------

@trip_bp.route("/admin/trips/<int:trip_id>", methods=["DELETE"])
@token_required
@admin_required
def delete_trip(trip_id):

    try:
        trip = Trip.query.get(trip_id)

        if not trip:
            return jsonify({"message": "Trip not found"}), 404

        trip_id_value = trip.id

        # Collect Cloudinary public IDs before deleting records
        public_ids = [
            img.cloudinary_public_id
            for img in trip.images
            if img.cloudinary_public_id
        ]

        # Delete trip and related image records from Neon
        db.session.delete(trip)
        db.session.commit()

        # Delete actual images from Cloudinary
        cleanup_failed = []

        for public_id in public_ids:
            try:
                delete_image(public_id)
            except Exception as cleanup_error:
                print("Cloudinary cleanup failed:", cleanup_error)
                cleanup_failed.append(public_id)

        return jsonify({
            "message": "Trip deleted successfully",
            "trip_id": trip_id_value,
            "cloudinary_cleanup_pending": cleanup_failed
        }), 200

    except Exception as e:
        db.session.rollback()

        print("Error deleting trip:", e)

        return jsonify({
            "message": "Internal server error"
        }), 500


# ---------------- USER: VIEW ALL TRIPS ----------------

@trip_bp.route("/trips", methods=["GET"])
@token_required
def view_trips():

    try:
        trips = Trip.query.all()

        return jsonify([
            {
                "trip_id": t.id,
                "destination_id": t.destination_id,
                "destination_name": t.destination.name if t.destination else "",
                "title": t.title or "",
                "trip_type": t.trip_type or "",
                "duration": t.duration or 0,
                "activities": t.activities or "",
                "price": t.price or 0,
                "images": [img.image_url for img in t.images]
            }
            for t in trips
        ]), 200

    except Exception as e:
        print("Error fetching trips:", e)

        return jsonify({
            "message": "Internal server error"
        }), 500


# ---------------- USER: VIEW ALL DESTINATIONS ----------------

@trip_bp.route("/destinations", methods=["GET"])
@token_required
def view_destinations():

    try:
        destinations = Destination.query.all()

        return jsonify([
            {
                "destination_id": d.id or f"fallback-{idx}",
                "name": d.name or "Unknown"
            }
            for idx, d in enumerate(destinations)
        ]), 200

    except Exception as e:
        print("Error fetching destinations:", e)

        return jsonify({
            "message": "Internal server error"
        }), 500


# ---------------- USER: VIEW SINGLE TRIP ----------------

@trip_bp.route("/trips/<int:trip_id>", methods=["GET"])
@token_required
def get_trip_details(trip_id):

    try:
        trip = Trip.query.get_or_404(trip_id)

        return jsonify({
            "trip_id": trip.id,
            "destination_id": trip.destination_id,
            "destination_name": trip.destination.name if trip.destination else "",
            "title": trip.title or "",
            "description": trip.description or "",
            "trip_type": trip.trip_type or "",
            "duration": trip.duration or 0,
            "activities": trip.activities or "",
            "price": trip.price or 0,
            "images": [img.image_url for img in trip.images]
        }), 200

    except Exception as e:
        print("Error fetching trip details:", e)

        return jsonify({
            "message": "Internal server error"
        }), 500

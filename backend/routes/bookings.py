




from flask import Blueprint, request, jsonify
from models import db, Booking, User, Trip, Payment
from utils.jwt_utils import token_required, admin_required
from datetime import datetime

booking_bp = Blueprint("bookings", __name__, url_prefix="/api")


def get_current_user_from_jwt():
    user_data = getattr(request, "user", None)
    if not user_data:
        return None
    return User.query.get(user_data["id"])


# =========================
# CREATE BOOKING (User)
# =========================
@booking_bp.route("/bookings", methods=["POST"])
@token_required
def create_booking():
    user = get_current_user_from_jwt()
    if not user or user.role != "user":
        return jsonify({"message": "Login required"}), 401

    data = request.get_json()
    trip = Trip.query.get(data.get("trip_id"))
    if not trip:
        return jsonify({"message": "Trip not found"}), 404

    budget = data.get("budget", trip.price)

    booking = Booking(
        user_id=user.id,
        trip_id=trip.id,
        budget=budget,
        status="PENDING",
        booking_date=datetime.utcnow()
    )

    db.session.add(booking)
    db.session.commit()

    return jsonify({
        "message": "Booking created successfully",
        "booking_id": booking.id,
        "status": booking.status
    }), 201


# =========================
# GET SINGLE BOOKING (User)
# =========================
@booking_bp.route("/bookings/<int:booking_id>", methods=["GET"])
@token_required
def get_booking_by_id(booking_id):
    user = get_current_user_from_jwt()
    if not user:
        return jsonify({"message": "Unauthorized"}), 401

    booking = Booking.query.get(booking_id)
    if not booking or booking.user_id != user.id:
        return jsonify({"message": "Booking not found"}), 404

    return jsonify({
        "booking_id": booking.id,
        "status": booking.status,
        "budget": booking.budget,
        "payment_status": booking.payment.status if booking.payment else None,
        "payment_method": booking.payment.method if booking.payment else None,
        "trip": {
            "id": booking.trip.id,
            "title": booking.trip.title, 
            "duration": booking.trip.duration,
            "image_url": getattr(booking.trip, "image", None)
                or getattr(booking.trip, "image_path", None)
        }
    }), 200


# =========================
# GET MY BOOKINGS (User)
# =========================
@booking_bp.route("/bookings/my", methods=["GET"])
@token_required
def get_my_bookings():
    user = get_current_user_from_jwt()
    if not user or user.role != "user":
        return jsonify({"message": "Login required"}), 401

    bookings = (
        Booking.query
        .filter_by(user_id=user.id)
        .order_by(Booking.booking_date.desc())
        .all()
    )

    result = []

    for b in bookings:
        trip = b.trip
        destination = trip.destination

        images = []
        if trip.images:
            images = [img.image_url for img in trip.images]

        result.append({
            "booking_id": b.id,
            "trip_title": trip.title,
            "destination_name": destination.name,
            "duration": trip.duration,
            "activities": trip.activities,
            "budget": b.budget,
            "status": b.status,
            "payment_status": b.payment.status if b.payment else None,
            "images": images
        })

    return jsonify(result), 200


# =========================
# CANCEL BOOKING (User)
# =========================
@booking_bp.route("/bookings/cancel/<int:booking_id>", methods=["PUT"])
@token_required
def cancel_booking(booking_id):
    user = get_current_user_from_jwt()
    if not user or user.role != "user":
        return jsonify({"message": "Login required"}), 401

    booking = Booking.query.get(booking_id)
    if not booking or booking.user_id != user.id:
        return jsonify({"message": "Booking not found"}), 404

    if booking.status not in ["PENDING", "PAYMENT_PENDING"]:
        return jsonify({"message": "Only pending bookings can be cancelled"}), 400

    booking.status = "CANCELLED"

    if booking.payment and booking.payment.status == "PENDING":
        booking.payment.status = "REFUNDED"

    db.session.commit()

    return jsonify({"message": "Booking cancelled successfully"}), 200


# =========================
# GET ALL BOOKINGS (Admin)
# =========================

@booking_bp.route("/admin/bookings", methods=["GET"])
@token_required
@admin_required
def get_all_bookings():
    bookings = Booking.query.order_by(Booking.booking_date.desc()).all()
    result = []

    for b in bookings:
        result.append({
            "booking_id": b.id,
            "user": b.user.name,
            "trip_title": b.trip.title,
            "budget": b.budget,
            "status": b.status,
            "payment_status": b.payment.status if b.payment else None,
            "booking_date": b.booking_date.isoformat() if b.booking_date else None
        })

    return jsonify(result), 200


# =========================
# APPROVE BOOKING (Admin)
# =========================
@booking_bp.route("/admin/bookings/approve/<int:booking_id>", methods=["PUT"])
@token_required
@admin_required
def approve_booking(booking_id):
    booking = Booking.query.get(booking_id)
    if not booking:
        return jsonify({"message": "Booking not found"}), 404

    if booking.status in ["REJECTED", "CANCELLED", "CONFIRMED"]:
        return jsonify({"message": f"Cannot approve booking in status {booking.status}"}), 400

    booking.status = "CONFIRMED"

    if booking.payment and booking.payment.status == "PENDING":
        booking.payment.status = "SUCCESS"

    db.session.commit()

    return jsonify({
        "message": "Booking approved",
        "booking_status": booking.status,
        "payment_status": booking.payment.status if booking.payment else None
    }), 200


# =========================
# REJECT BOOKING (Admin)
# =========================
@booking_bp.route("/admin/bookings/reject/<int:booking_id>", methods=["PUT"])
@token_required
@admin_required
def reject_booking(booking_id):
    booking = Booking.query.get(booking_id)
    if not booking:
        return jsonify({"message": "Booking not found"}), 404

    if booking.status in ["REJECTED", "CANCELLED"]:
        return jsonify({"message": "Booking already processed"}), 400

    booking.status = "REJECTED"

    if booking.payment:
        booking.payment.status = "REFUNDED"

    db.session.commit()

    return jsonify({
        "message": "Booking rejected",
        "booking_status": booking.status,
        "payment_status": booking.payment.status if booking.payment else None
    }), 200



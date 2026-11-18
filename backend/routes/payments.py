from flask import Blueprint, request, jsonify
from models import db, Payment, Booking, User, Trip
from utils.jwt_utils import token_required, admin_required
from datetime import datetime

payment_bp = Blueprint("payments", __name__, url_prefix="/api")


def get_current_user_from_jwt():
    user_data = getattr(request, "user", None)
    if not user_data:
        return None
    return User.query.get(user_data["id"])


# ================= USER ROUTES =================

@payment_bp.route("/payments", methods=["POST", "OPTIONS"])
@token_required
def make_payment():
    #  Handle CORS preflight
    if request.method == "OPTIONS":
        return jsonify({}), 200

    user = get_current_user_from_jwt()
    if not user or user.role != "user":
        return jsonify({"message": "Login required"}), 401

    data = request.get_json()
    method = data.get("method")        # CARD | UPI | CASH
    booking_id = data.get("booking_id")
    trip_id = data.get("trip_id")

    if not method:
        return jsonify({"message": "Payment method is required"}), 400

    if method not in ["CARD", "UPI", "CASH"]:
        return jsonify({"message": "Invalid payment method"}), 400

    booking = None

    # ---------------- NEW FLOW (Trip → Payment → Booking) ----------------
    if trip_id:
        trip = Trip.query.get(trip_id)
        if not trip:
            return jsonify({"message": "Trip not found"}), 404

        booking_status = (
            "CONFIRMED" if method in ["CARD", "UPI"] else "PAYMENT_PENDING"
        )

        booking = Booking(
            user_id=user.id,
            trip_id=trip.id,
            budget=trip.price,
            status=booking_status,
            booking_date=datetime.utcnow(),
        )
        db.session.add(booking)
        db.session.commit()

    # ---------------- OLD FLOW (Booking → Payment) ----------------
    elif booking_id:
        booking = Booking.query.get(booking_id)
        if not booking or booking.user_id != user.id:
            return jsonify({"message": "Invalid booking"}), 400

        if booking.status == "CANCELLED":
            return jsonify({"message": "Booking cancelled"}), 400

        # ❗ Prevent double SUCCESS payments
        existing_payment = Payment.query.filter_by(
            booking_id=booking.id
        ).order_by(Payment.id.desc()).first()

        if existing_payment and existing_payment.status == "SUCCESS":
            return jsonify({"message": "Payment already completed"}), 400

        booking.status = (
            "CONFIRMED" if method in ["CARD", "UPI"] else "PAYMENT_PENDING"
        )

    else:
        return jsonify({"message": "trip_id or booking_id is required"}), 400

    # ---------------- PAYMENT LOGIC ----------------
    payment_status = "SUCCESS" if method in ["CARD", "UPI"] else "PENDING"

    #  If CASH exists → user switches to CARD/UPI → update payment
    existing_payment = Payment.query.filter_by(
        booking_id=booking.id
    ).order_by(Payment.id.desc()).first()

    if existing_payment and existing_payment.status == "PENDING":
        existing_payment.method = method
        existing_payment.status = payment_status
        existing_payment.payment_date = datetime.utcnow()
        payment = existing_payment
    else:
        payment = Payment(
            booking_id=booking.id,
            user_id=user.id,
            amount=booking.budget,
            method=method,
            status=payment_status,
            payment_date=datetime.utcnow(),
        )
        db.session.add(payment)

    db.session.commit()

    return jsonify({
        "message": "Payment processed successfully",
        "payment_id": payment.id,
        "booking_id": booking.id,
        "payment_status": payment.status,
        "booking_status": booking.status,
    }), 201


# ================= USER: VIEW MY PAYMENTS =================

@payment_bp.route("/payments/my", methods=["GET"])
@token_required
def my_payments():
    user = get_current_user_from_jwt()
    if not user or user.role != "user":
        return jsonify({"message": "Login required"}), 401

    payments = Payment.query.filter_by(user_id=user.id).order_by(
        Payment.payment_date.desc()
    ).all()

    return jsonify([
        {
            "payment_id": p.id,
            "booking_id": p.booking_id,
            "amount": p.amount,
            "method": p.method,
            "status": p.status,
            "booking_status": p.booking.status,
            "payment_date": p.payment_date,
        }
        for p in payments
    ]), 200


# ================= ADMIN ROUTES (UNCHANGED) =================

@payment_bp.route("/admin/payments", methods=["GET"])
@token_required
@admin_required
def get_all_payments():
    payments = Payment.query.all()
    return jsonify([
        {
            "payment_id": p.id,
            "user": p.user.name,
            "booking_id": p.booking_id,
            "amount": p.amount,
            "method": p.method,
            "status": p.status,
            "booking_status": p.booking.status,
            "payment_date": p.payment_date,
        }
        for p in payments
    ]), 200

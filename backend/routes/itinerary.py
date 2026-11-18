from flask import Blueprint, request, jsonify
from models import (
    db,
    User,
    Trip,
    Itinerary,
    ItineraryDay,
    ItineraryItem
)
from datetime import datetime
from utils.jwt_utils import token_required, admin_required

itinerary_bp = Blueprint("itinerary", __name__, url_prefix="/api")


# ================= HELPER =================
def get_current_user_from_jwt():
    user_data = getattr(request, "user", None)
    if not user_data:
        return None
    return User.query.get(user_data["id"])


# ================= CREATE ITINERARY (ADMIN) =================
@itinerary_bp.route("/admin/trips/<int:trip_id>/itinerary", methods=["POST"])
@token_required
@admin_required
def create_itinerary(trip_id):
    trip = Trip.query.get_or_404(trip_id)

    if trip.itinerary:
        return jsonify({"error": "Itinerary already exists"}), 400

    itinerary = Itinerary(trip_id=trip_id)
    db.session.add(itinerary)
    db.session.commit()

    return jsonify({
        "message": "Itinerary created successfully",
        "itinerary_id": itinerary.id
    }), 201


# ================= ADD DAY (ADMIN) =================
@itinerary_bp.route("/admin/itineraries/<int:itinerary_id>/days", methods=["POST"])
@token_required
@admin_required
def add_day(itinerary_id):
    data = request.get_json()

    if not data or "day_number" not in data:
        return jsonify({"error": "day_number is required"}), 400

    existing_day = ItineraryDay.query.filter_by(
        itinerary_id=itinerary_id,
        day_number=data["day_number"]
    ).first()

    if existing_day:
        return jsonify({
            "error": f"Day {data['day_number']} already exists"
        }), 400

    day = ItineraryDay(
        itinerary_id=itinerary_id,
        day_number=data["day_number"],
        title=data.get("title"),
        description=data.get("description")
    )

    db.session.add(day)
    db.session.commit()

    return jsonify({
        "message": "Day added successfully",
        "day_id": day.id
    }), 201


# ================= ADD ACTIVITY (ADMIN) =================
@itinerary_bp.route("/admin/itinerary-days/<int:day_id>/items", methods=["POST"])
@token_required
@admin_required
def add_item(day_id):
    data = request.get_json()

    if not data or "activity_name" not in data or "order_index" not in data:
        return jsonify({
            "error": "activity_name and order_index are required"
        }), 400

    start_time = (
        datetime.strptime(data["start_time"], "%H:%M").time()
        if data.get("start_time") else None
    )

    end_time = (
        datetime.strptime(data["end_time"], "%H:%M").time()
        if data.get("end_time") else None
    )

    item = ItineraryItem(
        itinerary_day_id=day_id,
        activity_name=data["activity_name"],
        order_index=data["order_index"],
        start_time=start_time,
        end_time=end_time,
        destination_id=data.get("destination_id")
    )

    db.session.add(item)
    db.session.commit()

    return jsonify({
        "message": "Activity added successfully",
        "item_id": item.id
    }), 201


# ================= DELETE DAY (ADMIN) =================
@itinerary_bp.route("/admin/itinerary-days/<int:day_id>", methods=["DELETE"])
@token_required
@admin_required
def delete_day(day_id):
    day = ItineraryDay.query.get_or_404(day_id)

    # delete all activities first
    ItineraryItem.query.filter_by(itinerary_day_id=day.id).delete()

    db.session.delete(day)
    db.session.commit()

    return jsonify({
        "message": "Day deleted successfully"
    }), 200


# ================= DELETE ACTIVITY (ADMIN) =================
@itinerary_bp.route("/admin/itinerary-items/<int:item_id>", methods=["DELETE"])
@token_required
@admin_required
def delete_activity(item_id):
    item = ItineraryItem.query.get_or_404(item_id)

    db.session.delete(item)
    db.session.commit()

    return jsonify({
        "message": "Activity deleted successfully"
    }), 200


# ================= VIEW ITINERARY (USER + ADMIN) =================
@itinerary_bp.route("/trips/<int:trip_id>/itinerary", methods=["GET"])
@token_required
def view_itinerary(trip_id):
    trip = Trip.query.get_or_404(trip_id)

    #  return empty itinerary instead of 404
    if not trip.itinerary:
        return jsonify({
            "trip_id": trip.id,
            "itinerary_id": None,
            "itinerary": []
        }), 200

    itinerary_days = []
    for day in trip.itinerary.days:
        itinerary_days.append({
            "day_id": day.id,
            "day": day.day_number,
            "title": day.title,
            "description": day.description,
            "items": [
                {
                    "item_id": item.id,
                    "activity": item.activity_name,
                    "order": item.order_index,
                    "start_time": str(item.start_time) if item.start_time else None,
                    "end_time": str(item.end_time) if item.end_time else None,
                }
                for item in day.items
            ]
        })

    return jsonify({
        "trip_id": trip.id,
        "itinerary_id": trip.itinerary.id,
        "itinerary": itinerary_days
    }), 200

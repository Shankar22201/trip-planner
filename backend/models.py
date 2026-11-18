
from config import db
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime


# ================= USER =================
class User(db.Model):
    __tablename__ = "user"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password_hash = db.Column(db.String(200), nullable=False)
    mobile = db.Column(db.String(10), unique=True, nullable=False)
    role = db.Column(db.String(20), default="user")  # user/admin
    profile_image = db.Column(db.String(500), nullable=True)
    profile_image_public_id = db.Column(db.String(255), nullable=True)

    # profile_image = db.Column(db.String(255), nullable=True)  # 👈 NEW

    bookings = db.relationship("Booking", backref="user", lazy=True)
    payments = db.relationship("Payment", backref="user", lazy=True)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)


# ================= DESTINATION =================
class Destination(db.Model):
    __tablename__ = "destination"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), unique=True, nullable=False)
    description = db.Column(db.Text, nullable=False)

    trips = db.relationship("Trip", backref="destination", lazy=True, cascade="all, delete")
    images = db.relationship("DestinationImage", backref="destination", cascade="all, delete-orphan")


# class DestinationImage(db.Model):
#     __tablename__ = "destination_images"

#     id = db.Column(db.Integer, primary_key=True)
#     image_url = db.Column(db.String(255), nullable=False)
#     destination_id = db.Column(db.Integer, db.ForeignKey("destination.id"), nullable=False)

class DestinationImage(db.Model):
    __tablename__ = "destination_images"

    id = db.Column(db.Integer, primary_key=True)
    image_url = db.Column(db.String(500), nullable=False)
    cloudinary_public_id = db.Column(db.String(255), nullable=True)

    destination_id = db.Column(
        db.Integer,
        db.ForeignKey("destination.id"),
        nullable=False
    )
# ================= TRIP =================
class Trip(db.Model):
    __tablename__ = "trip"

    id = db.Column(db.Integer, primary_key=True)
    destination_id = db.Column(db.Integer, db.ForeignKey("destination.id"), nullable=False)

    title = db.Column(db.String(150), nullable=False)  # 👈 NEW
    description = db.Column(db.Text, nullable=True)    # 👈 NEW

    trip_type = db.Column(db.String(50), nullable=False)
    duration = db.Column(db.Integer, nullable=False)
    activities = db.Column(db.Text, nullable=False)
    price = db.Column(db.Float, nullable=False)

    bookings = db.relationship("Booking", backref="trip", lazy=True)
    itinerary = db.relationship("Itinerary", backref="trip", uselist=False, cascade="all, delete")

    images = db.relationship("TripImage", backref="trip", cascade="all, delete-orphan")


# class TripImage(db.Model):
#     __tablename__ = "trip_images"

#     id = db.Column(db.Integer, primary_key=True)
#     image_url = db.Column(db.String(255), nullable=False)
#     trip_id = db.Column(db.Integer, db.ForeignKey("trip.id"), nullable=False)
class TripImage(db.Model):
    __tablename__ = "trip_images"

    id = db.Column(db.Integer, primary_key=True)
    image_url = db.Column(db.String(500), nullable=False)
    cloudinary_public_id = db.Column(db.String(255), nullable=True)

    trip_id = db.Column(
        db.Integer,
        db.ForeignKey("trip.id"),
        nullable=False
    )

# ================= BOOKING =================
class Booking(db.Model):
    __tablename__ = "booking"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    trip_id = db.Column(db.Integer, db.ForeignKey("trip.id"), nullable=False)
    trip_type = db.Column(db.String(50), default="solo")
    budget = db.Column(db.Float, nullable=False)
    status = db.Column(db.String(20), default="PENDING")
    booking_date = db.Column(db.DateTime, default=datetime.utcnow)

    payment = db.relationship("Payment", backref="booking", uselist=False, cascade="all, delete")


# ================= PAYMENT =================
class Payment(db.Model):
    __tablename__ = "payments"

    id = db.Column(db.Integer, primary_key=True)
    booking_id = db.Column(db.Integer, db.ForeignKey("booking.id"), nullable=False, unique=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    method = db.Column(db.String(20), nullable=False)  # CARD | UPI | CASH
    status = db.Column(db.String(20), default="SUCCESS")
    payment_date = db.Column(db.DateTime, default=db.func.now())


# ================= ITINERARY =================
class Itinerary(db.Model):
    __tablename__ = "itineraries"

    id = db.Column(db.Integer, primary_key=True)
    trip_id = db.Column(db.Integer, db.ForeignKey("trip.id"), unique=True, nullable=False)
    created_at = db.Column(db.DateTime, default=db.func.now())
    updated_at = db.Column(db.DateTime, default=db.func.now(), onupdate=db.func.now())

    days = db.relationship(
        "ItineraryDay",
        backref="itinerary",
        cascade="all, delete-orphan",
        order_by="ItineraryDay.day_number"
    )


class ItineraryDay(db.Model):
    __tablename__ = "itinerary_days"

    id = db.Column(db.Integer, primary_key=True)
    itinerary_id = db.Column(db.Integer, db.ForeignKey("itineraries.id"), nullable=False)
    day_number = db.Column(db.Integer, nullable=False)
    title = db.Column(db.String(100))
    description = db.Column(db.Text)

    items = db.relationship(
        "ItineraryItem",
        backref="day",
        cascade="all, delete-orphan",
        order_by="ItineraryItem.order_index"
    )

    __table_args__ = (
        db.UniqueConstraint("itinerary_id", "day_number", name="unique_day_per_itinerary"),
    )


class ItineraryItem(db.Model):
    __tablename__ = "itinerary_items"

    id = db.Column(db.Integer, primary_key=True)
    itinerary_day_id = db.Column(db.Integer, db.ForeignKey("itinerary_days.id"), nullable=False)
    destination_id = db.Column(db.Integer, db.ForeignKey("destination.id"), nullable=True)

    activity_name = db.Column(db.String(150), nullable=False)
    start_time = db.Column(db.Time, nullable=True)
    end_time = db.Column(db.Time, nullable=True)
    order_index = db.Column(db.Integer, nullable=False)

    destination = db.relationship("Destination")

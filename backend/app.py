
from config import create_app, db
from flask_migrate import Migrate

from routes.auth import auth_bp
from routes.destinations import dest_bp
from routes.bookings import booking_bp
from routes.payments import payment_bp
from routes.trips import trip_bp
from routes.itinerary import itinerary_bp
from routes.user_routes import user_bp

import os
from flask import send_from_directory

app = create_app()

# Initialize database migrations
migrate = Migrate(app, db)

# Register blueprints
app.register_blueprint(auth_bp, url_prefix="/api")
app.register_blueprint(dest_bp, url_prefix="/api")
app.register_blueprint(trip_bp, url_prefix="/api")
app.register_blueprint(booking_bp, url_prefix="/api")
app.register_blueprint(payment_bp, url_prefix="/api")
app.register_blueprint(itinerary_bp, url_prefix="/api")
app.register_blueprint(user_bp, url_prefix="/api/user")


# Serve existing local uploaded files
@app.route("/uploads/<path:filename>")
def uploaded_files(filename):
    upload_dir = os.path.join(app.root_path, "uploads")
    return send_from_directory(upload_dir, filename)


@app.route("/api/test", methods=["GET"])
def test():
    return {"message": "Backend working with image uploads!"}


if __name__ == "__main__":
    app.run(
        debug=True,
        host="0.0.0.0",
        port=5000,
        threaded=True
    )

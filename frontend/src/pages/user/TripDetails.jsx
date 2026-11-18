import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../utils/axios";

export default function TripDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [trip, setTrip] = useState(null);
  const [tripType, setTripType] = useState("solo");
  const [budget, setBudget] = useState("");
  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    const fetchTrip = async () => {
      try {
        const res = await api.get(`/trips/${id}`);
        if (res.data) {
          // Convert relative image paths to full URLs
          const tripWithFullImages = {
            ...res.data,
            images: Array.isArray(res.data.images)
              ? res.data.images.map((img) =>
                  img.startsWith("http")
                    ? img
                    : `http://localhost:5000/uploads/${img}`
                )
              : [],
          };
          setTrip(tripWithFullImages);
        }
      } catch (err) {
        console.error("Error fetching trip:", err);
      }
    };

    fetchTrip();
  }, [id]);

  if (!trip) return <p className="p-6">Loading...</p>;

  const handleBooking = async () => {
    try {
      await api.post("/bookings", {
        trip_id: trip.trip_id,
        trip_type: tripType,
        budget: budget || trip.price,
      });

      navigate("/app/my-bookings");
    } catch (err) {
      console.error("Error booking trip:", err);
      alert("Booking failed. Try again.");
    }
  };

  // Carousel controls
  const nextImage = () =>
    setCurrentImage(
      (prev) => (prev + 1) % (trip.images?.length || 1)
    );
  const prevImage = () =>
    setCurrentImage(
      (prev) =>
        (prev - 1 + (trip.images?.length || 1)) % (trip.images?.length || 1)
    );

  return (
    <div className="p-6 max-w-3xl mx-auto bg-white rounded shadow">
      <h1 className="text-3xl font-bold mb-2">{trip.title}</h1>
      <p className="mb-4">{trip.description}</p>

      {/* ================= IMAGE CAROUSEL ================= */}
      <div className="relative flex justify-center items-center mb-6 bg-gray-100 rounded-lg overflow-hidden">
        {trip.images?.length > 0 ? (
          <>
            <img
              src={trip.images[currentImage]}
              alt={`Trip ${currentImage}`}
              className="w-full max-w-2xl h-67 object-contain bg-white"
            />
            {trip.images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 text-white px-3 py-1 rounded-full text-xl font-bold"
                >
                  ‹
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 text-white px-3 py-1 rounded-full text-xl font-bold"
                >
                  ›
                </button>
              </>
            )}
          </>
        ) : (
          <div className="w-full h-56 flex items-center justify-center text-gray-400 text-sm">
            No Images
          </div>
        )}
      </div>

      {/* ================= TRIP INFO ================= */}
      <p className="mb-1">Duration: {trip.duration} days</p>
      <p className="mb-4 font-bold text-lg">₹{trip.price}</p>

      <select
        value={tripType}
        onChange={(e) => setTripType(e.target.value)}
        className="w-full p-2 border rounded mb-4"
      >
        <option value="solo">Solo</option>
        <option value="duo">Duo</option>
        <option value="group">Group</option>
      </select>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={handleBooking}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Book Trip
        </button>

        <button
          onClick={() => navigate(`/app/trips/${id}/itinerary`)}
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          View Itinerary
        </button>
      </div>
    </div>
  );
}



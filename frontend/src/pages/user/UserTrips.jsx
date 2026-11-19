
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../utils/axios";
import "./UserResponsive.css";

export default function UserTrips() {
  const [trips, setTrips] = useState([]);
  const [allTrips, setAllTrips] = useState([]); // original trips for filtering
  const [filters, setFilters] = useState({
    search: "",
    minPrice: "",
    maxPrice: "",
  });

  const navigate = useNavigate();

  /* ================= FETCH TRIPS ================= */
  const fetchTrips = async () => {
    try {
      const res = await api.get("/trips");

      if (Array.isArray(res.data)) {
        const tripsWithImages = res.data.map((trip) => ({
          ...trip,
          images: Array.isArray(trip.images)
            ? trip.images.map((img) => {
                if (!img) return "";

                // Preserve Cloudinary and other absolute URLs
                if (img.startsWith("http")) return img;

                // Convert relative paths to Render backend URLs
                return `https://trip-planner-49ku.onrender.com/uploads/${img.replace(/^\/+/, "")}`;
              })
            : [],
          imageIndex: 0, // for carousel
        }));

        const reversedTrips = tripsWithImages.slice().reverse();
        setTrips(reversedTrips);
        setAllTrips(reversedTrips);
      }
    } catch (err) {
      console.error("Error fetching trips:", err);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, []);

  /* ================= FILTERS ================= */
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const applyFilters = () => {
    let filtered = [...allTrips];

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          (t.title && t.title.toLowerCase().includes(searchLower)) ||
          (t.destination_name && t.destination_name.toLowerCase().includes(searchLower))
      );
    }

    if (filters.minPrice) {
      filtered = filtered.filter((t) => t.price >= parseFloat(filters.minPrice));
    }

    if (filters.maxPrice) {
      filtered = filtered.filter((t) => t.price <= parseFloat(filters.maxPrice));
    }

    setTrips(filtered);
  };

  useEffect(() => {
    applyFilters();
  }, [filters, allTrips]);

  const resetFilters = () =>
    setFilters({ search: "", minPrice: "", maxPrice: "" });

  /* ================= CAROUSEL HANDLERS ================= */
  const nextImage = (tripId) => {
    setTrips((prev) =>
      prev.map((t) =>
        t.trip_id === tripId
          ? { ...t, imageIndex: (t.imageIndex + 1) % t.images.length }
          : t
      )
    );
  };

  const prevImage = (tripId) => {
    setTrips((prev) =>
      prev.map((t) =>
        t.trip_id === tripId
          ? { ...t, imageIndex: (t.imageIndex - 1 + t.images.length) % t.images.length }
          : t
      )
    );
  };

  return (
    <div className="user-trips-page p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Available Trips</h1>

      {/* ================= SEARCH & FILTER ================= */}
      <div className="trips-filters flex flex-wrap gap-2 mb-6 items-end">
        <input
          type="text"
          name="search"
          value={filters.search}
          onChange={handleFilterChange}
          placeholder="Search by trip or destination"
          className="border px-2 py-1 rounded flex-1 min-w-150px"
        />

        <input
          type="number"
          name="minPrice"
          value={filters.minPrice}
          onChange={handleFilterChange}
          placeholder="Min Price"
          className="border px-2 py-1 rounded w-24"
        />

        <input
          type="number"
          name="maxPrice"
          value={filters.maxPrice}
          onChange={handleFilterChange}
          placeholder="Max Price"
          className="border px-2 py-1 rounded w-24"
        />

        <button
          onClick={resetFilters}
          className="bg-gray-600 text-white px-3 py-1 rounded"
        >
          Reset
        </button>
      </div>

      {/* ================= TRIPS ================= */}
      {trips.length === 0 && (
        <p className="text-gray-500">No trips found with current filters</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {trips.map((trip) => (
          <div
            key={trip.trip_id}
            className="border rounded-lg shadow overflow-hidden flex flex-col h-full"
          >
            {/* IMAGE CAROUSEL */}
            <div className="relative h-40 bg-gray-100">
              {trip.images && trip.images.length > 0 ? (
                <>
                  <img
                    src={trip.images[trip.imageIndex]}
                    alt={`${trip.title} - ${trip.destination_name}`}
                    className="w-full h-40 object-cover"
                  />
                  {trip.images.length > 1 && (
                    <>
                      <button
                        onClick={() => prevImage(trip.trip_id)}
                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 text-white px-2 py-1 rounded"
                      >
                        ‹
                      </button>
                      <button
                        onClick={() => nextImage(trip.trip_id)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 text-white px-2 py-1 rounded"
                      >
                        ›
                      </button>
                    </>
                  )}
                </>
              ) : (
                <div className="w-full h-40 flex items-center justify-center text-gray-400 text-sm">
                  No Image
                </div>
              )}
            </div>

            {/* TRIP INFO */}
            <div className="p-4 flex flex-col flex-1">
              <h2 className="font-semibold text-lg truncate">
                {trip.title
                  ? `${trip.title} - ${trip.destination_name ?? "Unknown"}`
                  : trip.destination_name ?? "Untitled"}
              </h2>

              {trip.destination_name && (
                <p className="text-sm text-gray-600">
                  Destination: {trip.destination_name}
                </p>
              )}

              <p>Duration: {trip.duration ?? "-"} days</p>
              <p className="font-bold mt-1">₹{trip.price ?? "-"}</p>

              <button
                onClick={() => navigate(`/app/trips/${trip.trip_id}`)}
                className="mt-3 bg-blue-600 text-white px-3 py-1 rounded"
              >
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

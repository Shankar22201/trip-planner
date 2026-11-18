



import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../../utils/axios";
import AdminLayout from "../../components/AdminLayout";

export default function Trips() {
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const destinationId = params.get("destination");

  const [trips, setTrips] = useState([]);
  const [form, setForm] = useState({
    title: "",
    trip_type: "",
    duration: "",
    price: "",
    description: "",
    images: [],
  });
  const [loading, setLoading] = useState(false);

  /* ================= FETCH ================= */
  const fetchTrips = async () => {
    if (!destinationId) return;
    try {
      const res = await api.get(`/admin/trips?destination=${destinationId}`);
      if (Array.isArray(res.data)) {
        const tripsWithFullImages = res.data.map((trip) => ({
          ...trip,
          images: Array.isArray(trip.images)
            ? trip.images.map(
                (img) =>
                  `${img.startsWith("http") ? img : `http://localhost:5000/uploads/${img}`}`
              )
            : [],
        }));
        setTrips(tripsWithFullImages);
      }
    } catch (err) {
      console.error("Error fetching trips:", err);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, [destinationId]);

  /* ================= FORM ================= */
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setForm((p) => ({
      ...p,
      [name]: name === "images" ? Array.from(files) : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (k === "images") v.forEach((i) => data.append("images", i));
        else data.append(k, v);
      });
      data.append("destination_id", destinationId);

      const res = await api.post("/admin/trips", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data.trip_id) {
        fetchTrips(); // refresh trips list
      }

      setForm({
        title: "",
        trip_type: "",
        duration: "",
        price: "",
        description: "",
        images: [],
      });
    } catch (err) {
      console.error("Error adding trip:", err);
      alert("Error adding trip. Check console for details.");
    } finally {
      setLoading(false);
    }
  };



  const deleteTrip = async (id) => {
  if (!window.confirm("Delete this trip?")) return;
  try {
    const res = await api.delete(`/admin/trips/${id}`);
    if (res.data.trip_id) {
      // Remove the deleted trip from state
      setTrips((prev) => prev.filter((t) => t.trip_id !== res.data.trip_id));
    }
  } catch (err) {
    console.error("Error deleting trip:", err.response?.data || err);
    alert("Error deleting trip. Check console.");
  }
};


  const editTrip = (tripId) => {
    navigate(`/admin/trips/${tripId}/edit?destination=${destinationId}`);
  };

  return (
    <AdminLayout title="Trips">
      {/* ================= ADD TRIP ================= */}
      <form
        onSubmit={handleSubmit}
        className="mb-6 flex flex-col gap-2 max-w-sm text-xs"
      >
        <input
          name="title"
          value={form.title}
          placeholder="Title"
          onChange={handleChange}
          required
          className="border px-2 py-1 rounded"
        />

        <select
          name="trip_type"
          value={form.trip_type}
          onChange={handleChange}
          required
          className="border px-2 py-1 rounded"
        >
          <option value="">Trip type</option>
          <option value="solo">Solo</option>
          <option value="group">Group</option>
          <option value="family">Family</option>
          <option value="couple">Couple</option>
        </select>

        <div className="flex gap-2">
          <input
            type="number"
            name="duration"
            value={form.duration}
            placeholder="Days"
            onChange={handleChange}
            className="border px-2 py-1 rounded w-1/2"
            required
          />
          <input
            type="number"
            name="price"
            value={form.price}
            placeholder="₹ Price"
            onChange={handleChange}
            className="border px-2 py-1 rounded w-1/2"
            required
          />
        </div>

        <textarea
          name="description"
          rows={2}
          value={form.description}
          placeholder="Description"
          onChange={handleChange}
          className="border px-2 py-1 rounded resize-none"
        />

        <input
          type="file"
          multiple
          name="images"
          onChange={handleChange}
          className="border px-2 py-1 rounded"
        />

        <button
          type="submit"
          disabled={loading}
          className={`py-1 rounded text-white ${
            loading ? "bg-gray-400" : "bg-green-600"
          }`}
        >
          {loading ? "Adding..." : "Add Trip"}
        </button>
      </form>

      {/* ================= TRIPS ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {trips.map((trip) => (
          <TripCard
            key={trip.trip_id}
            trip={trip}
            onDelete={() => deleteTrip(trip.trip_id)}
            onEdit={() => editTrip(trip.trip_id)}
            onItinerary={() =>
              navigate(`/admin/trips/${trip.trip_id}/itinerary`)
            }
          />
        ))}
      </div>
    </AdminLayout>
  );
}

/* ================= CARD ================= */
function TripCard({ trip, onDelete, onEdit, onItinerary }) {
  const images = Array.isArray(trip.images) ? trip.images : [];
  const [index, setIndex] = useState(0);

  const next = () =>
    setIndex((i) => (images.length ? (i + 1) % images.length : 0));
  const prev = () =>
    setIndex((i) => (images.length ? (i - 1 + images.length) % images.length : 0));

  return (
    <div className="border rounded-lg shadow-sm bg-white overflow-hidden flex flex-col">
      {/* IMAGE */}
      <div className="relative h-56 px-3 pt-3 bg-gray-100">
        {images.length > 0 ? (
          <>
            <img
              src={images[index]}
              alt={trip.title}
              className="w-full h-full object-cover rounded-md"
            />
            {images.length > 1 && (
              <>
                <button
                  onClick={prev}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/40 text-white px-2 rounded"
                >
                  ‹
                </button>
                <button
                  onClick={next}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/40 text-white px-2 rounded"
                >
                  ›
                </button>
              </>
            )}
          </>
        ) : (
          <div className="h-full flex items-center justify-center text-gray-400 text-xs">
            No Image
          </div>
        )}
      </div>

      {/* BODY */}
      <div className="p-3 text-xs flex flex-col gap-1 flex-1">
        <div className="flex justify-between">
          <h3 className="font-medium truncate">{trip.title}</h3>
          <span className="text-[10px] bg-blue-100 text-blue-700 px-1 rounded capitalize">
            {trip.trip_type}
          </span>
        </div>

        <p className="text-gray-600 line-clamp-2">{trip.description}</p>

        <div className="flex justify-between mt-1">
          <span>{trip.duration} days</span>
          <span className="font-semibold">₹{trip.price}</span>
        </div>

        {/* ACTIONS */}
        <div className="flex gap-2 mt-auto">
          <button
            onClick={onItinerary}
            className="flex-1 bg-blue-600 text-white py-1 rounded text-[11px]"
          >
            Itinerary
          </button>
          <button
            onClick={onEdit}
            className="bg-yellow-500 text-white px-2 rounded text-[11px]"
          >
            Edit
          </button>
          <button
            onClick={onDelete}
            className="bg-red-600 text-white px-2 rounded text-[11px]"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}




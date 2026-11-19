
import { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import api from "../../utils/axios";
import AdminLayout from "../../components/AdminLayout";

export default function TripEdit() {
  const navigate = useNavigate();
  const { tripId } = useParams();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const destinationId = params.get("destination");

  const [form, setForm] = useState({
    title: "",
    trip_type: "",
    duration: "",
    price: "",
    description: "",
    images: [],
  });
  const [existingImages, setExistingImages] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchTrip = async () => {
      try {
        const res = await api.get(`/trips/${tripId}`);
        const trip = res.data;
        setForm({
          title: trip.title,
          trip_type: trip.trip_type,
          duration: trip.duration,
          price: trip.price,
          description: trip.description,
          images: [],
        });
        setExistingImages(trip.images || []);
      } catch (err) {
        console.error("Error fetching trip:", err);
        alert("Trip not found");
        navigate(-1);
      }
    };
    fetchTrip();
  }, [tripId]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setForm((p) => ({
      ...p,
      [name]: name === "images" ? Array.from(files) : value,
    }));
  };

  const removeImage = (img) => {
    setExistingImages((prev) => prev.filter((i) => i !== img));
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

      // Pass existing images that user wants to keep
      existingImages.forEach((img) => data.append("existingImages", img));

      await api.put(`/admin/trips/${tripId}`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("Trip updated successfully");
      navigate(`/admin/trips?destination=${destinationId}`);
    } catch (err) {
      console.error("Error updating trip:", err);
      alert("Error updating trip");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout title="Edit Trip">
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

        <div>
          <label className="text-[11px]">Existing Images:</label>
          <div className="flex gap-2 flex-wrap">
            {existingImages.map((img, idx) => (
              <div key={idx} className="relative">
                <img
                  src={
                    img.startsWith("http")
                      ? img
                      : `https://trip-planner-49ku.onrender.com/uploads/${img}`
                  }
                  alt={`img-${idx}`}
                  className="w-16 h-16 object-cover rounded"
                />
                <button
                  type="button"
                  onClick={() => removeImage(img)}
                  className="absolute top-0 right-0 bg-red-600 text-white rounded-full w-5 h-5 text-[10px]"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>

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
          className={`py-1 rounded text-white ${loading ? "bg-gray-400" : "bg-yellow-500"
            }`}
        >
          {loading ? "Updating..." : "Update Trip"}
        </button>
      </form>
    </AdminLayout>
  );
}


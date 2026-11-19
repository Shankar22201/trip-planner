
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../utils/axios";

export default function AdminItinerary() {
  const { tripId } = useParams();

  const [itineraryId, setItineraryId] = useState(null);
  const [days, setDays] = useState([]);
  const [dayNumber, setDayNumber] = useState("");
  const [loading, setLoading] = useState(true);

  // ================= FETCH ITINERARY =================
  const fetchItinerary = async () => {
    setLoading(true);

    try {
      const res = await api.get(`/trips/${tripId}/itinerary`);

      setItineraryId(res.data.itinerary_id ?? null);
      setDays(
        Array.isArray(res.data.itinerary) ? res.data.itinerary : []
      );
    } catch (error) {
      console.error("Failed to fetch itinerary:", error);
      setItineraryId(null);
      setDays([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItinerary();
  }, [tripId]);

  // ================= CREATE ITINERARY =================
  const createItinerary = async () => {
    try {
      await api.post(`/admin/trips/${tripId}/itinerary`);
      await fetchItinerary();
    } catch (error) {
      console.error("Failed to create itinerary:", error);
      alert(error.response?.data?.message || "Failed to create itinerary");
    }
  };

  // ================= ADD DAY =================
  const addDay = async () => {
    if (!itineraryId) {
      alert("Please create itinerary first");
      return;
    }

    try {
      await api.post(`/admin/itineraries/${itineraryId}/days`, {
        day_number: Number(dayNumber),
      });

      setDayNumber("");
      await fetchItinerary();
    } catch (error) {
      console.error("Failed to add day:", error);
      alert(error.response?.data?.message || "Failed to add day");
    }
  };

  if (loading) return <div className="p-6">Loading itinerary...</div>;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Manage Itinerary</h1>

      {/* CREATE ITINERARY */}
      {!itineraryId && (
        <button
          onClick={createItinerary}
          className="bg-blue-600 text-white px-4 py-2 rounded mb-6"
        >
          Create Itinerary
        </button>
      )}

      {/* ADD DAY */}
      {itineraryId && (
        <div className="flex gap-2 mb-6">
          <input
            type="number"
            placeholder="Day number"
            value={dayNumber}
            onChange={(e) => setDayNumber(e.target.value)}
            className="border px-3 py-2 rounded w-32"
          />
          <button
            onClick={addDay}
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            Add Day
          </button>
        </div>
      )}

      {/* DAYS LIST */}
      <div className="space-y-6">
        {days.map((day) => (
          <ItineraryDay
            key={day.day_id}
            day={day}
            refresh={fetchItinerary}
          />
        ))}
      </div>
    </div>
  );
}

// ================= DAY COMPONENT =================
function ItineraryDay({ day, refresh }) {
  const [activity, setActivity] = useState("");
  const [order, setOrder] = useState("");

  // ---------- ADD ACTIVITY ----------
  const addActivity = async () => {
    try {
      await api.post(
        `/admin/itinerary-days/${day.day_id}/items`,
        {
          activity_name: activity,
          order_index: Number(order),
        }
      );

      setActivity("");
      setOrder("");
      await refresh();
    } catch (error) {
      console.error("Failed to add activity:", error);
      alert(error.response?.data?.message || "Failed to add activity");
    }
  };

  // ---------- DELETE DAY ----------
  const deleteDay = async () => {
    const ok = window.confirm(
      `Delete Day ${day.day}? This will remove all activities.`
    );

    if (!ok) return;

    try {
      await api.delete(`/admin/itinerary-days/${day.day_id}`);
      await refresh();
    } catch (error) {
      console.error("Failed to delete day:", error);
      alert(error.response?.data?.message || "Failed to delete day");
    }
  };

  // ---------- DELETE ACTIVITY ----------
  const deleteActivity = async (itemId) => {
    const ok = window.confirm("Delete this activity?");

    if (!ok) return;

    try {
      await api.delete(`/admin/itinerary-items/${itemId}`);
      await refresh();
    } catch (error) {
      console.error("Failed to delete activity:", error);
      alert(error.response?.data?.message || "Failed to delete activity");
    }
  };

  return (
    <div className="border rounded p-4">
      {/* DAY HEADER */}
      <div className="flex justify-between items-center mb-3">
        <h2 className="font-semibold text-lg">Day {day.day}</h2>

        <button
          onClick={deleteDay}
          className="bg-red-600 text-white px-3 py-1 rounded text-sm"
        >
          Delete Day
        </button>
      </div>

      {/* ACTIVITIES */}
      <ul className="mb-4 space-y-2">
        {(day.items || []).map((item) => (
          <li
            key={item.item_id}
            className="flex justify-between items-center border px-3 py-2 rounded"
          >
            <span>{item.activity}</span>

            <button
              onClick={() => deleteActivity(item.item_id)}
              className="text-red-600 text-sm"
            >
              Delete
            </button>
          </li>
        ))}
      </ul>

      {/* ADD ACTIVITY */}
      <div className="flex gap-2">
        <input
          placeholder="Activity"
          value={activity}
          onChange={(e) => setActivity(e.target.value)}
          className="border px-3 py-2 rounded"
        />
        <input
          type="number"
          placeholder="Order"
          value={order}
          onChange={(e) => setOrder(e.target.value)}
          className="border px-3 py-2 rounded w-24"
        />
        <button
          onClick={addActivity}
          className="bg-purple-600 text-white px-4 py-2 rounded"
        >
          Add
        </button>
      </div>
    </div>
  );
}

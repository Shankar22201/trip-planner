import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export default function AdminItinerary() {
  const { tripId } = useParams();
  const token = localStorage.getItem("token");

  const [itineraryId, setItineraryId] = useState(null);
  const [days, setDays] = useState([]);
  const [dayNumber, setDayNumber] = useState("");
  const [loading, setLoading] = useState(true);

  // ================= FETCH ITINERARY =================
  const fetchItinerary = async () => {
    setLoading(true);

    const res = await fetch(
      `http://localhost:5000/api/trips/${tripId}/itinerary`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (res.ok) {
      const data = await res.json();
      setItineraryId(data.itinerary_id ?? null);
      setDays(Array.isArray(data.itinerary) ? data.itinerary : []);
    } else {
      setItineraryId(null);
      setDays([]);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchItinerary();
  }, [tripId]);

  // ================= CREATE ITINERARY =================
  const createItinerary = async () => {
    await fetch(
      `http://localhost:5000/api/admin/trips/${tripId}/itinerary`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    fetchItinerary();
  };

  // ================= ADD DAY =================
  const addDay = async () => {
    if (!itineraryId) {
      alert("Please create itinerary first");
      return;
    }

    await fetch(
      `http://localhost:5000/api/admin/itineraries/${itineraryId}/days`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ day_number: Number(dayNumber) }),
      }
    );

    setDayNumber("");
    fetchItinerary();
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
            token={token}
            refresh={fetchItinerary}
          />
        ))}
      </div>
    </div>
  );
}

// ================= DAY COMPONENT =================
function ItineraryDay({ day, token, refresh }) {
  const [activity, setActivity] = useState("");
  const [order, setOrder] = useState("");

  // ---------- ADD ACTIVITY ----------
  const addActivity = async () => {
    await fetch(
      `http://localhost:5000/api/admin/itinerary-days/${day.day_id}/items`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          activity_name: activity,
          order_index: Number(order),
        }),
      }
    );

    setActivity("");
    setOrder("");
    refresh();
  };

  // ---------- DELETE DAY ----------
  const deleteDay = async () => {
    const ok = window.confirm(
      `Delete Day ${day.day}? This will remove all activities.`
    );
    if (!ok) return;

    await fetch(
      `http://localhost:5000/api/admin/itinerary-days/${day.day_id}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    refresh();
  };

  // ---------- DELETE ACTIVITY ----------
  const deleteActivity = async (itemId) => {
    const ok = window.confirm("Delete this activity?");
    if (!ok) return;

    await fetch(
      `http://localhost:5000/api/admin/itinerary-items/${itemId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    refresh();
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
        {day.items.map((item) => (
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




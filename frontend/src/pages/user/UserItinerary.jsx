
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../utils/axios";
import "./UserResponsive.css";

export default function UserItinerary() {
  const { id } = useParams();
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get(`/trips/${id}/itinerary`)
      .then((res) => setData(res.data))
      .catch(() => setData(null));
  }, [id]);

  if (!data) return <p className="p-6">No itinerary found</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">{data.destination}</h1>

      {data.itinerary.map((day) => (
        <div key={day.day} className="border p-4 mb-4">
          <h2 className="font-semibold">Day {day.day}</h2>
          <ul className="list-disc ml-5">
            {day.items.map((item, i) => (
              <li key={i}>{item.activity}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

// import { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import api from "../../utils/axios";
// import AdminLayout from "../../components/AdminLayout";

// export default function Destinations() {
//   const [destinations, setDestinations] = useState([]);
//   const [name, setName] = useState("");
//   const [description, setDescription] = useState("");
//   const [error, setError] = useState("");
//   const navigate = useNavigate();

//   const fetchDestinations = async () => {
//     const res = await api.get("/destinations");
//     setDestinations(res.data);
//   };

//   const addDestination = async (e) => {
//     e.preventDefault();
//     setError("");
//     try {
//       await api.post("/destinations", { name, description });
//       setName("");
//       setDescription("");
//       fetchDestinations();
//     } catch (err) {
//       setError(err.response?.data?.message || "Failed to add destination");
//     }
//   };

//   useEffect(() => {
//     fetchDestinations();
//   }, []);

//   return (
//     <AdminLayout title="Destinations">
//       {/* Add Destination Form */}
//       <form onSubmit={addDestination} className="mb-6 flex flex-wrap gap-2">
//         {error && <p className="text-red-500 w-full">{error}</p>}
//         <input
//           placeholder="Destination Name"
//           value={name}
//           onChange={(e) => setName(e.target.value)}
//           className="border p-2 rounded"
//           required
//         />
//         <input
//           placeholder="Description (optional)"
//           value={description}
//           onChange={(e) => setDescription(e.target.value)}
//           className="border p-2 rounded"
//         />
//         <button className="bg-blue-600 text-white px-4 py-2 rounded">
//           Add
//         </button>
//       </form>

//       {/* Destination Cards */}
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//         {destinations.map((d) => (
//           <div
//             key={d.id}
//             className="border rounded p-4 flex flex-col justify-between"
//           >
//             <h2 className="font-bold text-lg mb-2">{d.name}</h2>
//             <p className="text-gray-600 mb-4">{d.description}</p>

//             <div className="flex gap-2">
//               {/* View Trips */}
//               <button
//                 onClick={() => navigate(`/admin/trips?destination=${d.id}`)}
//                 className="bg-blue-600 text-white px-3 py-1 rounded"
//               >
//                 View Trips
//               </button>

//               {/* Add Trip → point to the same trips page */}
//               <button
//                 onClick={() => navigate(`/admin/trips?destination=${d.id}`)}
//                 className="bg-green-600 text-white px-3 py-1 rounded"
//               >
//                 + Add Trip
//               </button>
//             </div>
//           </div>
//         ))}
//       </div>
//     </AdminLayout>
//   );
// }






// import { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import api from "../../utils/axios";
// import AdminLayout from "../../components/AdminLayout";

// export default function Destinations() {
//   const [destinations, setDestinations] = useState([]);
//   const [name, setName] = useState("");
//   const [description, setDescription] = useState("");
//   const [error, setError] = useState("");
//   const navigate = useNavigate();

//   const fetchDestinations = async () => {
//     const res = await api.get("/destinations");
//     setDestinations(res.data);
//   };

//   const addDestination = async (e) => {
//     e.preventDefault();
//     setError("");
//     try {
//       await api.post("/destinations", { name, description });
//       setName("");
//       setDescription("");
//       fetchDestinations();
//     } catch (err) {
//       setError(err.response?.data?.message || "Failed to add destination");
//     }
//   };

//   const deleteDestination = async (id) => {
//     if (!window.confirm("Are you sure you want to delete this destination?")) return;
//     try {
//       await api.delete(`/destinations/${id}`);
//       fetchDestinations();
//     } catch (err) {
//       alert(err.response?.data?.message || "Failed to delete destination");
//     }
//   };

//   useEffect(() => {
//     fetchDestinations();
//   }, []);

//   return (
//     <AdminLayout title="Destinations">
//       {/* Add Destination Form */}
//       <form onSubmit={addDestination} className="mb-6 flex flex-wrap gap-2">
//         {error && <p className="text-red-500 w-full">{error}</p>}
//         <input
//           placeholder="Destination Name"
//           value={name}
//           onChange={(e) => setName(e.target.value)}
//           className="border p-2 rounded"
//           required
//         />
//         <input
//           placeholder="Description (optional)"
//           value={description}
//           onChange={(e) => setDescription(e.target.value)}
//           className="border p-2 rounded"
//         />
//         <button className="bg-blue-600 text-white px-4 py-2 rounded">
//           Add
//         </button>
//       </form>

//       {/* Destination Cards */}
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//         {destinations.map((d) => (
//           <div
//             key={d.id}
//             className="border rounded p-4 flex flex-col justify-between"
//           >
//             <h2 className="font-bold text-lg mb-2">{d.name}</h2>
//             <p className="text-gray-600 mb-4">{d.description}</p>

//             <div className="flex gap-2 flex-wrap">
//               {/* View Trips */}
//               <button
//                 onClick={() => navigate(`/admin/trips?destination=${d.id}`)}
//                 className="bg-blue-600 text-white px-3 py-1 rounded"
//               >
//                 View Trips
//               </button>

//               {/* Add Trip → point to the same trips page */}
//               <button
//                 onClick={() => navigate(`/admin/trips?destination=${d.id}`)}
//                 className="bg-green-600 text-white px-3 py-1 rounded"
//               >
//                 + Add Trip
//               </button>

//               {/* Delete Destination */}
//               <button
//                 onClick={() => deleteDestination(d.id)}
//                 className="bg-red-600 text-white px-3 py-1 rounded"
//               >
//                 Delete
//               </button>
//             </div>
//           </div>
//         ))}
//       </div>
//     </AdminLayout>
//   );
// }










import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../utils/axios";
import AdminLayout from "../../components/AdminLayout";

export default function Destinations() {
  const [destinations, setDestinations] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const fetchDestinations = async () => {
    const res = await api.get("/destinations");
    setDestinations(res.data);
  };

  const addDestination = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await api.post("/destinations", { name, description });
      setName("");
      setDescription("");
      fetchDestinations();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add destination");
    }
  };

  const deleteDestination = async (id) => {
    if (!window.confirm("Are you sure you want to delete this destination?")) return;
    try {
      await api.delete(`/destinations/${id}`);
      fetchDestinations();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete destination");
    }
  };

  useEffect(() => {
    fetchDestinations();
  }, []);

  return (
    <AdminLayout title="Destinations">
      {/* Add Destination Form */}
      <form onSubmit={addDestination} className="mb-6 flex flex-wrap gap-2">
        {error && <p className="text-red-500 w-full">{error}</p>}
        <input
          placeholder="Destination Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border p-2 rounded flex-1 min-w-180px"
          required
        />
        <input
          placeholder="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="border p-2 rounded flex-1 min-w-180px"
        />
        <button className="bg-blue-600 text-white px-4 py-2 rounded">
          Add
        </button>
      </form>

      {/* Destination Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
        {destinations.map((d) => (
          <div
            key={d.id}
            className="border rounded-lg p-4 flex flex-col justify-between shadow-sm bg-white"
          >
            <div>
              <h2 className="font-bold text-lg mb-2">{d.name}</h2>
              <p className="text-gray-600 mb-4 line-clamp-3">{d.description}</p>
            </div>

            <div className="mt-4 flex flex-wrap gap-2 justify-start">
              {/* View Trips */}
              <button
                onClick={() => navigate(`/admin/trips?destination=${d.id}`)}
                className="bg-blue-600 text-white px-3 py-1 rounded flex-1 sm:flex-auto"
              >
                View Trips
              </button>

              {/* Add Trip → point to the same trips page */}
              <button
                onClick={() => navigate(`/admin/trips?destination=${d.id}`)}
                className="bg-green-600 text-white px-3 py-1 rounded flex-1 sm:flex-auto"
              >
                + Add Trip
              </button>

              {/* Delete Destination */}
              <button
                onClick={() => deleteDestination(d.id)}
                className="bg-red-600 text-white px-3 py-1 rounded flex-1 sm:flex-auto"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </AdminLayout>
  );
}

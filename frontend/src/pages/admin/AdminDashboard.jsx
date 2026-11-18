



import AdminLayout from "../../components/AdminLayout";
import welcomeFeature from "../../assets/Time to travel.jfif"; // Image to show instead of paragraph

export default function AdminDashboard() {
  return (
    <AdminLayout title="Dashboard">
      {/* Image with optional caption text */}
      <div className="flex flex-col items-center justify-center">

        
      <h2 className="text-xl font-semibold text-gray-800 p-5" >
          Welcome to Trip-Planner
        </h2>
        <img
          src={welcomeFeature}
          alt="Admin Feature"
          className="w-full max-w-md h-100 object-cover rounded-xl mb-4"
        />
        
      </div>
    </AdminLayout>
  );
}



import { Link } from "react-router-dom";

export default function Dashboard() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">User Dashboard</h1>
      <Link to="/app/trips">View Trips</Link>
    </div>
  );
}

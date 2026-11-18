import { useEffect, useState } from "react";
import api from "../../utils/axios";
import AdminLayout from "../../components/AdminLayout";
import jsPDF from "jspdf";

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = async () => {
    try {
      const res = await api.get("/admin/bookings");
      setBookings(res.data);
    } catch (err) {
      console.error(err);
      alert("Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const updateStatus = async (id, action) => {
    try {
      await api.put(`/admin/bookings/${action}/${id}`);
      fetchBookings();
    } catch (err) {
      console.error(err);
      alert("Failed to update status");
    }
  };

  /* =====================
     DATE FORMATTER
  ====================== */
  const formatDate = (date) =>
    date ? new Date(date).toLocaleDateString() : "-";

  /* =====================
     PDF DOWNLOAD
  ====================== */
  const downloadSinglePDF = (b) => {
    const doc = new jsPDF();

    doc.setFontSize(14);
    doc.text("Booking Details", 20, 20);

    doc.setFontSize(11);
    let y = 35;

    const rows = [
      ["Booking ID", b.booking_id],
      ["User", b.user],
      ["Trip", b.trip_title],
      ["Booking Date", formatDate(b.booking_date)],
      ["Status", b.status],
      ["Payment", b.payment_status ?? "N/A"],
      ["Budget", b.budget],
    ];

    rows.forEach(([label, value]) => {
      doc.text(`${label}: ${value}`, 20, y);
      y += 8;
    });

    doc.save(`booking_${b.booking_id}.pdf`);
  };

  const downloadAllPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text("All Bookings Report", 20, 20);

    doc.setFontSize(10);
    let y = 35;

    bookings.forEach((b, index) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }

      doc.text(
        `${index + 1}. ${b.user} | ${b.trip_title} | ${formatDate(
          b.booking_date
        )} | ${b.status}`,
        20,
        y
      );
      y += 7;
    });

    doc.save("all_bookings.pdf");
  };

  if (loading) return <p className="p-6">Loading bookings...</p>;

  return (
    <AdminLayout title="Bookings">
      <div className="flex justify-end mb-3">
        <button
          onClick={downloadAllPDF}
          className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded"
        >
          Download All (PDF)
        </button>
      </div>

      <div className="overflow-x-auto bg-white rounded shadow">
        <table className="w-full border text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 border">User</th>
              <th className="p-2 border">Trip</th>
              <th className="p-2 border">Date</th>
              <th className="p-2 border">Status</th>
              <th className="p-2 border">Payment</th>
              <th className="p-2 border">Actions</th>
            </tr>
          </thead>

          <tbody>
            {bookings.map((b) => (
              <tr key={b.booking_id} className="text-center">
                <td className="border p-2">{b.user}</td>
                <td className="border p-2">{b.trip_title}</td>
                <td className="border p-2">
                  {formatDate(b.booking_date)}
                </td>

                <td className="border p-2">
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-semibold ${
                      b.status === "CONFIRMED"
                        ? "bg-green-100 text-green-700"
                        : b.status === "REJECTED"
                        ? "bg-red-100 text-red-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {b.status}
                  </span>
                </td>

                <td className="border p-2">{b.payment_status ?? "N/A"}</td>

                <td className="border p-2 space-x-1">
                  <button
                    disabled={["CONFIRMED", "REJECTED", "CANCELLED"].includes(b.status)}
                    onClick={() => updateStatus(b.booking_id, "approve")}
                    className="px-2 py-1 text-xs bg-green-600 text-white rounded disabled:opacity-40"
                  >
                    ✓
                  </button>

                  <button
                    disabled={["CONFIRMED", "REJECTED", "CANCELLED"].includes(b.status)}
                    onClick={() => updateStatus(b.booking_id, "reject")}
                    className="px-2 py-1 text-xs bg-red-600 text-white rounded disabled:opacity-40"
                  >
                    ✕
                  </button>

                  <button
                    onClick={() => downloadSinglePDF(b)}
                    className="px-2 py-1 text-xs bg-blue-600 text-white rounded"
                    title="Download PDF"
                  >
                    ⬇
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}

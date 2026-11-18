import { useEffect, useState } from "react";
import api from "../../utils/axios";
import AdminLayout from "../../components/AdminLayout";
import jsPDF from "jspdf";

export default function AdminPayments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPayments = async () => {
    try {
      const res = await api.get("/admin/payments");
      setPayments(res.data);
    } catch (err) {
      console.error(err);
      alert("Failed to load payments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  /* =====================
     DATE FORMATTER
  ====================== */
  const formatDate = (date) =>
    date ? new Date(date).toLocaleDateString() : "-";

  /* =====================
     PDF DOWNLOAD
  ====================== */
  const downloadSinglePDF = (p) => {
    const doc = new jsPDF();

    doc.setFontSize(14);
    doc.text("Payment Details", 20, 20);

    doc.setFontSize(11);
    let y = 35;

    const rows = [
      ["Payment ID", p.payment_id],
      ["User", p.user],
      ["Booking ID", p.booking_id],
      ["Amount", `₹${p.amount}`],
      ["Method", p.method],
      ["Payment Status", p.status],
      ["Booking Status", p.booking_status],
      ["Payment Date", formatDate(p.payment_date)],
    ];

    rows.forEach(([label, value]) => {
      doc.text(`${label}: ${value}`, 20, y);
      y += 8;
    });

    doc.save(`payment_${p.payment_id}.pdf`);
  };

  const downloadAllPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text("All Payments Report", 20, 20);

    doc.setFontSize(10);
    let y = 35;

    payments.forEach((p, index) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }

      doc.text(
        `${index + 1}. ${p.user} | ₹${p.amount} | ${p.method} | ${p.status} | ${formatDate(
          p.payment_date
        )}`,
        20,
        y
      );
      y += 7;
    });

    doc.save("all_payments.pdf");
  };

  if (loading) return <p className="p-6">Loading payments...</p>;

  return (
    <AdminLayout title="Payments">
      {/* Top download */}
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
              <th className="p-2 border">Booking ID</th>
              <th className="p-2 border">Amount</th>
              <th className="p-2 border">Method</th>
              <th className="p-2 border">Payment Date</th>
              <th className="p-2 border">Status</th>
              <th className="p-2 border">Booking Status</th>
              <th className="p-2 border">Action</th>
            </tr>
          </thead>

          <tbody>
            {payments.map((p) => (
              <tr key={p.payment_id} className="text-center">
                <td className="border p-2">{p.user}</td>
                <td className="border p-2">{p.booking_id}</td>
                <td className="border p-2">₹{p.amount}</td>
                <td className="border p-2">{p.method}</td>
                <td className="border p-2">
                  {formatDate(p.payment_date)}
                </td>

                <td className="border p-2">
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-semibold ${
                      p.status === "SUCCESS"
                        ? "bg-green-100 text-green-700"
                        : p.status === "PENDING"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {p.status}
                  </span>
                </td>

                <td className="border p-2">
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-semibold ${
                      p.booking_status === "CONFIRMED"
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {p.booking_status}
                  </span>
                </td>

                <td className="border p-2">
                  <button
                    onClick={() => downloadSinglePDF(p)}
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

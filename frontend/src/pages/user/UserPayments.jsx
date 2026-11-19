import { useEffect, useState } from "react";
import api from "../../utils/axios";
import jsPDF from "jspdf";
import "./UserResponsive.css";

export default function UserPayments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMyPayments = async () => {
    try {
      const res = await api.get("/payments/my");
      setPayments(res.data);
    } catch (err) {
      console.error(err);
      alert("Failed to load payments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyPayments();
  }, []);

  /* =====================
     DATE FORMATTER
  ====================== */
  const formatDate = (date) =>
    date ? new Date(date).toLocaleDateString() : "-";

  /* =====================
     PDF DOWNLOAD
  ====================== */
  const downloadPDF = (p) => {
    const doc = new jsPDF();

    doc.setFontSize(14);
    doc.text("Payment Receipt", 20, 20);

    doc.setFontSize(11);
    let y = 35;

    const rows = [
      ["Payment ID", p.payment_id],
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

    doc.text("Thank you for your payment!", 20, y + 10);

    doc.save(`payment_receipt_${p.payment_id}.pdf`);
  };

  if (loading) return <p className="p-6">Loading payments...</p>;

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-4">My Payments</h1>

      {payments.length === 0 ? (
        <p>No payments found.</p>
      ) : (
        <div className="overflow-x-auto bg-white rounded shadow">
          <table className="w-full border text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 border">Booking ID</th>
                <th className="p-2 border">Amount</th>
                <th className="p-2 border">Method</th>
                <th className="p-2 border">Payment Date</th>
                <th className="p-2 border">Status</th>
                <th className="p-2 border">Action</th>
              </tr>
            </thead>

            <tbody>
              {payments.map((p) => (
                <tr key={p.payment_id} className="text-center">
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
                    <button
                      onClick={() => downloadPDF(p)}
                      className="px-2 py-1 text-xs bg-blue-600 text-white rounded"
                      title="Download Receipt"
                    >
                      ⬇
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

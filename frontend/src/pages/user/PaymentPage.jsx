import { useParams, useNavigate } from "react-router-dom";
import api from "../../utils/axios";
import { useEffect, useState } from "react";

export default function PaymentPage() {
  const { bookingId } = useParams();
  const navigate = useNavigate();

  const [method, setMethod] = useState("CARD");
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  //  Inputs
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [upiId, setUpiId] = useState("");

  const [errors, setErrors] = useState({});

  //  Fetch booking
  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const res = await api.get(`/bookings/${bookingId}`);
        setBooking(res.data);
      } catch {
        alert("Failed to load booking");
      } finally {
        setLoading(false);
      }
    };
    fetchBooking();
  }, [bookingId]);

  //  FORMAT CARD NUMBER: XXXX XXXX XXXX XXXX
  const formatCardNumber = (value) => {
    return value
      .replace(/\D/g, "")
      .substring(0, 16)
      .replace(/(.{4})/g, "$1 ")
      .trim();
  };

  //  FORMAT EXPIRY: MM/YY
  const formatExpiry = (value) => {
    const digits = value.replace(/\D/g, "").substring(0, 4);
    if (digits.length <= 2) return digits;
    return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  };

  //  VALIDATION
  const validate = () => {
    const newErrors = {};

    if (method === "CARD") {
      const rawCard = cardNumber.replace(/\s/g, "");

      if (!/^\d{16}$/.test(rawCard)) {
        newErrors.cardNumber = "Card number must be 16 digits";
      }

      if (!/^\d{2}\/\d{2}$/.test(expiry)) {
        newErrors.expiry = "Expiry must be MM/YY";
      } else {
        const [mm, yy] = expiry.split("/").map(Number);
        const now = new Date();
        const expDate = new Date(2000 + yy, mm);

        if (mm < 1 || mm > 12) {
          newErrors.expiry = "Invalid month";
        } else if (expDate <= now) {
          newErrors.expiry = "Card expired";
        }
      }

      if (!/^\d{3}$/.test(cvv)) {
        newErrors.cvv = "CVV must be 3 digits";
      }
    }

    if (method === "UPI") {
      if (!/^[\w.\-]{2,}@[a-zA-Z]{2,}$/.test(upiId)) {
        newErrors.upiId = "Invalid UPI ID";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  //  Pay
  const handlePayment = async () => {
    if (!validate()) return;

    try {
      await api.post("/payments", {
        booking_id: Number(bookingId),
        method,
      });

      alert(
        method === "CASH"
          ? "Cash selected. Awaiting admin confirmation."
          : "Payment successful!"
      );

      navigate("/app/my-bookings");
    } catch (err) {
      alert(err.response?.data?.message || "Payment failed");
    }
  };

  if (loading) return <p className="p-6">Loading...</p>;
  if (!booking) return <p className="p-6">Booking not found</p>;

  const canPay =
    method === "CASH" ||
    (method === "CARD" &&
      cardNumber &&
      expiry &&
      cvv &&
      Object.keys(errors).length === 0) ||
    (method === "UPI" && upiId && Object.keys(errors).length === 0);

  return (
    <div className="p-6 max-w-lg mx-auto bg-white rounded shadow space-y-6">
      <h1 className="text-2xl font-bold text-center">Payment</h1>

      {/*  Booking Info */}
      <div className="border rounded p-4">
        <p><b>Trip:</b> {booking.trip?.title}</p>
        <p><b>Amount:</b> ₹{booking.budget}</p>
        <p><b>Status:</b> {booking.status}</p>
      </div>

      {/*  Method */}
      <select
        value={method}
        onChange={(e) => {
          setMethod(e.target.value);
          setErrors({});
        }}
        className="w-full p-2 border rounded"
      >
        <option value="CARD">Card</option>
        <option value="UPI">UPI</option>
        <option value="CASH">Cash</option>
      </select>

      {/*  CARD */}
      {method === "CARD" && (
        <div className="space-y-2">
          <input
            placeholder="Card Number"
            value={cardNumber}
            onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
            className="w-full p-2 border rounded"
          />
          {errors.cardNumber && <p className="text-red-500 text-sm">{errors.cardNumber}</p>}

          <div className="flex gap-2">
            <input
              placeholder="MM/YY"
              value={expiry}
              onChange={(e) => setExpiry(formatExpiry(e.target.value))}
              className="w-1/2 p-2 border rounded"
            />
            <input
              placeholder="CVV"
              type="password"
              maxLength="3"
              value={cvv}
              onChange={(e) => setCvv(e.target.value.replace(/\D/g, ""))}
              className="w-1/2 p-2 border rounded"
            />
          </div>
          {(errors.expiry || errors.cvv) && (
            <p className="text-red-500 text-sm">
              {errors.expiry || errors.cvv}
            </p>
          )}
        </div>
      )}

      {/*  UPI */}
      {method === "UPI" && (
        <div>
          <input
            placeholder="UPI ID (name@bank)"
            value={upiId}
            onChange={(e) => setUpiId(e.target.value)}
            className="w-full p-2 border rounded"
          />
          {errors.upiId && <p className="text-red-500 text-sm">{errors.upiId}</p>}
        </div>
      )}

      {/*  PAY */}
      <button
        disabled={!canPay}
        onClick={handlePayment}
        className={`w-full py-2 rounded text-white ${
          canPay
            ? "bg-blue-600 hover:bg-blue-700"
            : "bg-gray-400 cursor-not-allowed"
        }`}
      >
        Pay Now
      </button>
    </div>
  );
}

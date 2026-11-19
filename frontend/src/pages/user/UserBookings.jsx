
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { HiChevronLeft, HiChevronRight } from "react-icons/hi";
import jsPDF from "jspdf";
import "./UserResponsive.css";
import api from "../../utils/axios";

export default function UserBookings() {
  const [bookings, setBookings] = useState([]);
  const navigate = useNavigate();

  // Fetch user bookings
  useEffect(() => {
    api
      .get("/bookings/my")
      .then((res) => {
        const bookingsWithFullImages = res.data.map((b) => ({
          ...b,
          images: Array.isArray(b.images)
            ? b.images.map((img) => {
                if (!img) return "";

                // Preserve Cloudinary and other absolute URLs
                if (img.startsWith("http")) return img;

                // Convert legacy relative paths to Render backend URLs
                return `https://trip-planner-49ku.onrender.com/uploads/${img.replace(/^\/+/, "")}`;
              })
            : [],
        }));

        setBookings(bookingsWithFullImages);
      })
      .catch((err) => console.error(err));
  }, []);

  const statusColor = (status) => {
    if (status === "CONFIRMED") return "text-green-600";
    if (status === "CANCELLED") return "text-red-600";
    return "text-yellow-600";
  };

  const cancelBooking = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this booking?"))
      return;

    try {
      await api.put(`/bookings/cancel/${id}`);

      setBookings((prev) =>
        prev.map((b) =>
          b.booking_id === id
            ? {
                ...b,
                status: "CANCELLED",
                payment_status: "NOT_PAID",
              }
            : b
        )
      );
    } catch (err) {
      console.error(err);
      alert("Failed to cancel booking");
    }
  };

  // Download booking as PDF without ₹ symbol
  const downloadBookingPDF = async (booking) => {
    const doc = new jsPDF("p", "mm", "a4");
    let yOffset = 15;

    for (const imgUrl of booking.images) {
      try {
        const img = new Image();
        img.src = imgUrl;

        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
        });

        const imgWidth = 120;
        const aspectRatio = img.width / img.height;
        const imgHeight = imgWidth / aspectRatio;

        if (yOffset + imgHeight > 280) break;

        doc.addImage(img, "JPEG", 40, yOffset, imgWidth, imgHeight);
        yOffset += imgHeight + 5;
      } catch (err) {
        console.warn("Failed to load image for PDF:", imgUrl);
      }
    }

    doc.setFontSize(16);
    doc.text(`Booking ID: ${booking.booking_id}`, 15, yOffset + 10);

    doc.setFontSize(12);
    doc.text(`Trip: ${booking.trip_title}`, 15, yOffset + 20);
    doc.text(`Destination: ${booking.destination_name}`, 15, yOffset + 30);
    doc.text(`Duration: ${booking.duration} days`, 15, yOffset + 40);
    doc.text(`Budget: ${booking.budget}`, 15, yOffset + 50);
    doc.text(`Status: ${booking.status}`, 15, yOffset + 60);

    doc.text(
      `Payment: ${
        booking.payment_status === "SUCCESS"
          ? "Paid"
          : booking.payment_status === "PENDING"
            ? "Pending"
            : booking.payment_method === "CASH"
              ? "Pay at Admin"
              : "Not Paid"
      }`,
      15,
      yOffset + 70
    );

    doc.save(`booking_${booking.booking_id}.pdf`);
  };

  return (
    <div className="user-bookings-page max-w-6xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">
        My Bookings
      </h1>

      {bookings.length === 0 && (
        <p className="text-gray-500 text-sm">
          No bookings found
        </p>
      )}

      <div className="space-y-4">
        {bookings.map((b) => (
          <BookingCard
            key={b.booking_id}
            booking={b}
            navigate={navigate}
            statusColor={statusColor}
            cancelBooking={cancelBooking}
            downloadBookingPDF={downloadBookingPDF}
          />
        ))}
      </div>
    </div>
  );
}

/* ================= CARD COMPONENT ================= */

function BookingCard({
  booking,
  navigate,
  statusColor,
  cancelBooking,
  downloadBookingPDF,
}) {
  const images = Array.isArray(booking.images) ? booking.images : [];
  const [index, setIndex] = useState(0);

  const next = () =>
    setIndex((i) => (images.length ? (i + 1) % images.length : 0));

  const prev = () =>
    setIndex((i) =>
      images.length ? (i - 1 + images.length) % images.length : 0
    );

  const isPending = ["PENDING", "PAYMENT_PENDING"].includes(
    booking.status
  );

  const isOnlinePending =
    booking.payment_method !== "CASH" &&
    booking.payment_status !== "SUCCESS";

  return (
    <div className="booking-card flex flex-col custom:flex-row border rounded-lg shadow-sm bg-white overflow-hidden min-h-24rem custom:min-h-[16rem] relative">

      {/* DOWNLOAD BUTTON */}
      <button
        onClick={() => downloadBookingPDF(booking)}
        className="absolute right-4 top-4 custom:top-6 bg-blue-600 hover:bg-blue-700 text-white py-1.5 px-4 rounded text-sm z-10"
      >
        Download PDF
      </button>

      {/* IMAGE */}
      <div className="booking-card-image relative custom:w-48 w-full h-64 custom:h-auto bg-gray-100 p-2 shrink-0 flex items-center justify-center">
        {images.length > 0 ? (
          <>
            <img
              src={images[index]}
              alt={booking.trip_title}
              className="w-full h-full object-contain rounded-md"
            />

            {images.length > 1 && (
              <>
                <button
                  onClick={prev}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 text-white px-2 py-1 rounded-full text-xl"
                >
                  <HiChevronLeft />
                </button>

                <button
                  onClick={next}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 text-white px-2 py-1 rounded-full text-xl"
                >
                  <HiChevronRight />
                </button>
              </>
            )}
          </>
        ) : (
          <div className="h-full w-full flex items-center justify-center text-gray-400 text-sm">
            No Image
          </div>
        )}
      </div>

      {/* DETAILS */}
      <div className="booking-card-details flex-1 p-3 flex flex-col justify-between">
        <div className="flex-1">
          <h2 className="font-semibold text-lg truncate">
            {booking.trip_title}
          </h2>

          <p className="text-sm text-gray-600 mt-1">
            Destination: <b>{booking.destination_name}</b>
          </p>

          <p className="text-sm mt-1">
            Duration: <b>{booking.duration} days</b>
          </p>

          {booking.activities && (
            <p className="text-sm text-gray-500 mt-2 line-clamp-3 overflow-hidden">
              {booking.activities}
            </p>
          )}
        </div>

        {/* PAYMENT & ACTIONS */}
        <div className="mt-3 flex flex-col custom:flex-row custom:items-center custom:justify-between gap-2">
          <div className="text-sm">
            <p>
              Budget: <b>{booking.budget}</b>
            </p>

            <p>
              Status:{" "}
              <span
                className={`font-semibold ${statusColor(booking.status)}`}
              >
                {booking.status}
              </span>
            </p>

            <p>
              Payment:{" "}
              <b>
                {booking.payment_status === "SUCCESS"
                  ? "Paid"
                  : booking.payment_status === "PENDING"
                    ? "Pending"
                    : booking.payment_method === "CASH"
                      ? "Pay at Admin"
                      : "Not Paid"}
              </b>
            </p>
          </div>

          {/* ACTION BUTTONS */}
          <div className="booking-card-actions flex gap-2 mt-2 custom:mt-0 flex-wrap">
            {isOnlinePending && isPending && (
              <button
                onClick={() =>
                  navigate(`/app/payment/${booking.booking_id}`)
                }
                className="bg-green-600 hover:bg-green-700 text-white py-1.5 px-4 rounded text-sm"
              >
                Pay Now
              </button>
            )}

            {isPending && (
              <button
                onClick={() => cancelBooking(booking.booking_id)}
                className="bg-red-600 hover:bg-red-700 text-white py-1.5 px-4 rounded text-sm"
              >
                Cancel Booking
              </button>
            )}

            {booking.status === "CONFIRMED" &&
              booking.payment_status === "SUCCESS" && (
                <span className="text-green-700 font-semibold text-sm flex items-center">
                  ✔ Confirmed
                </span>
              )}
          </div>
        </div>
      </div>
    </div>
  );
}

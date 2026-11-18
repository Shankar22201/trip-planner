import { useEffect, useState } from "react";
import api from "../../utils/axios";
import { useAuth } from "../../context/AuthContext";

export default function Profile() {
  const { user, setUser } = useAuth();

  const [form, setForm] = useState({
    name: "",
    email: "",
    mobile: "",
    image: null,
  });

  const [preview, setPreview] = useState("");
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || "",
        email: user.email || "",
        mobile: user.mobile || "",
        image: null,
      });

      setPreview(
        user.image ? `http://localhost:5000/${user.image}` : ""
      );
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    // MOBILE FIX (numbers only + max 10)
    if (name === "mobile") {
      const digitsOnly = value.replace(/\D/g, "");
      if (digitsOnly.length > 10) return;
      setForm({ ...form, mobile: digitsOnly });
      return;
    }

    if (name === "image" && files?.[0]) {
      setForm({ ...form, image: files[0] });
      setPreview(URL.createObjectURL(files[0]));
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    setError("");

    // 🚨 FINAL SAFETY CHECK
    if (form.mobile.length !== 10) {
      setError("Mobile number must be exactly 10 digits");
      return;
    }

    try {
      const data = new FormData();
      data.append("name", form.name);
      data.append("email", form.email);
      data.append("mobile", form.mobile);
      if (form.image) data.append("image", form.image);

      const res = await api.put("/user/profile", data);

      //  update user in auth state
      setUser(res.data.user);

      setMsg("Profile updated successfully");
    } catch (err) {
      setError(err.response?.data?.message || "Update failed");
    }
  };

  return (
    <div className="max-w-xl mx-auto bg-white p-6 rounded shadow">
      <h2 className="text-2xl font-bold mb-4">My Profile</h2>

      {msg && <p className="text-green-600 mb-2">{msg}</p>}
      {error && <p className="text-red-500 mb-2">{error}</p>}

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div className="flex justify-center mb-4">
          {preview ? (
            <img
              src={preview}
              alt="Profile"
              className="w-28 h-28 rounded-full object-cover border"
            />
          ) : (
            <div className="w-28 h-28 rounded-full bg-gray-200 flex items-center justify-center">
              No Image
            </div>
          )}
        </div>

        <input
          type="file"
          name="image"
          onChange={handleChange}
          accept="image/*"
          className="border p-2 rounded"
        />

        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          className="border p-2 rounded"
          placeholder="Name"
          required
        />

        <input
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          className="border p-2 rounded"
          placeholder="Email"
          required
        />

        <input
          name="mobile"
          value={form.mobile}
          onChange={handleChange}
          className="border p-2 rounded"
          placeholder="Mobile (10 digits)"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={10}
          required
        />

        <button className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
          Save Changes
        </button>
      </form>
    </div>
  );
}

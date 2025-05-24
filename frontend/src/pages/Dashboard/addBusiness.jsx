import { useState } from "react";

const AddBusinessPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    phonenumbers: "",
    website: "",
    category: "",
    niche: "",
    email: "",
    social_links: "",
  });

  const [responseMessage, setResponseMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");
    if (!token) {
      alert("No token found in localStorage.");
      return;
    }

    const payload = {
      ...formData,
    };
    console.log("📦 Payload being sent to backend:", payload);

    setLoading(true);
    setResponseMessage("");

    try {
      const res = await fetch(
        "http://localhost:5000/api/business/dashboard/add",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await res.json();

      if (res.ok) {
        setResponseMessage(`✅ Business added with ID: ${data.businessId}`);
        setFormData({
          name: "",
          address: "",
          phonenumbers: "",
          website: "",
          category: "",
          niche: "",
          email: "",
          social_links: "",
        });
      } else {
        setResponseMessage(`❌ Error: ${data.error}`);
      }
    } catch (error) {
      console.error("Error adding business:", error);
      setResponseMessage("❌ Error while sending request.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Add New Business</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {Object.keys(formData).map((field) => (
          <div key={field}>
            <label className="block mb-1 font-medium capitalize">
              {field.replace(/_/g, " ")}
            </label>
            <input
              type="text"
              name={field}
              value={formData[field]}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2"
              placeholder={`Enter ${field.replace(/_/g, " ")}`}
            />
          </div>
        ))}

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {loading ? "Submitting..." : "Add Business"}
        </button>
      </form>

      {responseMessage && (
        <div className="mt-4 text-lg font-semibold">{responseMessage}</div>
      )}
    </div>
  );
};

export default AddBusinessPage;

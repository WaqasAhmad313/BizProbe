import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Button from "@/components/ui/button";

const EmailTemplatePreviewPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const { businessId, templateId, businessMail, userMail } =
    location.state || {};

  const [templateData, setTemplateData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  console.log("Received location.state:", location.state);

  const handleSendEmail = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/maildata/send-mail", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          businessId,
          businessMail,
          templateId,
          userMail,
          emailHTML: templateData.emailHTML,
          subject: templateData.subject,
        }),
      });

      const result = await res.json();
      console.log("Send Email Response:", result);

      if (res.ok && result.success) {
        alert("Email sent successfully.");
        navigate("/dashboard/outreach");
      } else {
        alert(result.message || "Failed to send email.");
      }
    } catch (error) {
      console.error("Error sending email:", error);
      alert("An error occurred while sending the email.");
    }
  };

  useEffect(() => {
    const fetchTemplateData = async () => {
      console.log("Fetch triggered with:", { businessId, templateId });

      if (!businessId || !templateId) {
        console.error("Missing businessId or templateId.");
        setError("Missing required parameters.");
        setLoading(false);
        return;
      }

      try {
        const apiUrl = `http://localhost:5000/api/maildata/template/${templateId}/business/${businessId}?generateEmail=true`;
        console.log("Fetching from URL:", apiUrl);

        const res = await fetch(apiUrl, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        console.log("Response status:", res.status);
        const result = await res.json();
        console.log("Response body:", result);

        if (res.ok && result.success) {
          console.log("Template data received successfully.");
          setTemplateData(result.data);
        } else {
          console.error("API error:", result.message || result.error);
          setError(result.message || result.error || "Unknown error occurred.");
        }
      } catch (err) {
        console.error("Fetch error:", err);
        setError("Failed to fetch template preview. Please try again later.");
      } finally {
        setLoading(false);
        console.log("Fetch operation completed.");
      }
    };

    fetchTemplateData();
  }, [businessId, templateId, token]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Email Preview</h1>

      {loading && <p>Loading preview...</p>}
      {error && <p className="text-red-500">Error: {error}</p>}

      {!loading && !error && templateData && (
        <div className="space-y-6">
          {/*}  <h2 className="text-xl font-medium">Email Preview:</h2> {*/}
          <div className="flex items-center gap-2 mb-4">
            <h2 className="font-semibold text-lg text-gray-800">Subject:</h2>
            <p className="text-gray-700">{templateData.subject}</p>
          </div>
          <div className="border p-4 rounded bg-white">
            {templateData.emailHTML ? (
              <div
                dangerouslySetInnerHTML={{ __html: templateData.emailHTML }}
              />
            ) : (
              <p>No content available.</p>
            )}
          </div>

          <div className="flex gap-2 mt-6">
            <Button
              variant="secondary"
              size="small"
              onClick={() => navigate(-1)}
            >
              Back
            </Button>

            <Button variant="primary" size="small" onClick={handleSendEmail}>
              Proceed to Send
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmailTemplatePreviewPage;

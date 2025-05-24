import { useState, useEffect } from "react";
import DashboardHeader from "@/components/DashboardHeader";
import EmptyState from "@/components/EmptyState";

const FollowUp = () => {
  const [followUps, setFollowUps] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  const fetchFollowUps = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/business/followup", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await res.json();
      console.log("Results in follow_up page:", result);
      if (Array.isArray(result)) {
        setFollowUps(result);
      } else {
        console.error("Unexpected data format from follow-up API", result);
      }
    } catch (error) {
      console.error("Error fetching follow-ups:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFollowUps();
  }, []);

  const pendingFollowUps = followUps.filter(
    (f) => f.follow_up_status !== "Done"
  );

  return (
    <div className="p-6">
      <DashboardHeader title="Follow Up" />

      {loading ? (
        <p>Loading follow-ups...</p>
      ) : pendingFollowUps.length === 0 ? (
        <EmptyState
          message="No follow-ups pending."
          actionText="Review Contacts"
          onActionClick={() => console.log("Go to contact review")}
        />
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto border rounded-md shadow-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-2 text-left"></th>
                <th className="px-4 py-2 text-left">Business Name</th>
                <th className="px-4 py-2 text-left">Template Used</th>
                <th className="px-4 py-2 text-left">Status Interval</th>
              </tr>
            </thead>
            <tbody>
              {pendingFollowUps.map((item, index) => (
                <tr key={item.follow_up_id} className="border-t">
                  <td className="px-4 py-2">{index + 1}</td>
                  <td className="px-4 py-2 truncate" title={item.business_name}>
                    {item.business_name}
                  </td>

                  <td className="px-4 py-2 truncate" title={item.template_name}>
                    {item.template_name}
                  </td>
                  <td className="px-4 py-2">{item.follow_up_status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default FollowUp;

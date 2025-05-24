import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import Button from "@/components/ui/button";

const UserProfilePage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);

  const jwtToken = localStorage.getItem("token");

  const fetchStats = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/gmail/gmail", {
        method: "GET",
        headers: { Authorization: `Bearer ${jwtToken}` },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch stats");
      }

      const data = await response.json();
      console.log("Data parsed from JSON:", data);
      setStats(data);
    } catch (error) {
      console.error("Error while fetching stats:", error);
    }
  };

  const handleAddAccountClick = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        "http://localhost:5000/api/gmail/auth/google",
        {
          method: "GET",
          headers: { Authorization: `Bearer ${jwtToken}` },
        }
      );
      if (!response.ok) throw new Error("Failed to start OAuth");
      const { url } = await response.json();
      console.log("🔗 OAuth URL:", url);
      window.location.href = url;
    } catch (error) {
      console.error("OAuth error:", error);
      alert("Error starting OAuth flow");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="p-8 space-y-8">
      {stats && (
        <>
          {/* Row 1 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* User Stats */}
            <Card className="shadow-xl rounded-2xl border border-gray-200">
              <CardContent className="space-y-5 pt-6">
                <h2 className="text-2xl font-bold text-black border-b pb-3">
                  User Overview
                </h2>
                <div className="space-y-2 text-gray-800">
                  <div className="flex justify-between">
                    <span className="font-semibold">Name:</span>
                    <span className="font-semibold">{stats.userInfo.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold">Email:</span>
                    <span className="font-semibold">
                      {stats.userInfo.email}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold">Gmail Accounts:</span>
                    <span className="font-semibold">
                      {stats.userInfo.total_gmail_accounts}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold">Outreach Done:</span>
                    <span className="font-semibold">
                      {stats.userInfo.total_outreach_done}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold">Templates Created:</span>
                    <span className="font-semibold">
                      {stats.userInfo.total_templates_created || 0}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Business Stats */}
            <Card className="shadow-xl rounded-2xl border border-gray-200">
              <CardContent className="space-y-5 pt-6">
                <h2 className="text-2xl font-bold text-black border-b pb-3">
                  Business Stats
                </h2>
                <div className="space-y-3 text-gray-800">
                  <div className="flex justify-between">
                    <span className="font-bold text-black">
                      Businesses Searched:
                    </span>
                    <span className="font-semibold">
                      {stats.businessStats.total_businesses_searched}
                    </span>
                  </div>

                  <div className="mt-4 space-y-2">
                    <p className="text-lg font-bold text-black">Niche:</p>
                    <div className="space-y-1">
                      {stats.businessStats.businesses_per_niche.map(
                        (item, idx) => (
                          <div key={idx} className="flex justify-between">
                            <span className="font-semibold">{item.niche}</span>
                            <span className="font-semibold">
                              {item.business_count}
                            </span>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Row 2 */}
          <Card className="shadow-lg rounded-2xl">
            <CardContent className="space-y-4 pt-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-black">
                  Gmail Outreach Stats
                </h2>
                <Button onClick={handleAddAccountClick} disabled={loading}>
                  {loading ? "Redirecting..." : "+ Add Gmail Account"}
                </Button>
              </div>

              {stats.gmailOutreach.length > 0 ? (
                <div className="mt-4">
                  {/* Column Labels */}
                  <div className="flex justify-between border-b pb-2 font-bold text-black">
                    <span>Email Address</span>
                    <span>Outreach Sent</span>
                  </div>
                  {/* Data Rows */}
                  {stats.gmailOutreach.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between border-b py-2 text-gray-800"
                    >
                      <span className="font-semibold">{item.gmail_email}</span>
                      <span className="font-semibold">
                        {item.outreach_count}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 mt-4">
                  No Gmail accounts linked yet.
                </p>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default UserProfilePage;

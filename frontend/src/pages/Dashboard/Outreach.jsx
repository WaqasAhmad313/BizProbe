import { useEffect, useState } from "react";
import DashboardHeader from "@/components/DashboardHeader";
import EmptyState from "@/components/EmptyState";
import Button from "@/components/ui/button";
import Modal from "@/components/Modal";
import { useNavigate } from "react-router-dom";

const Outreach = () => {
  const [outreachData, setOutreachData] = useState([]);
  const [activeTab, setActiveTab] = useState("Pending");
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState(null);

  const [templates, setTemplates] = useState([]);
  const [businessMails, setBusinessMails] = useState([]);
  const [userMails, setUserMails] = useState([]);

  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [selectedUserMail, setSelectedUserMail] = useState("");
  const [selectedMail, setSelectedMail] = useState("");
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  // Fetch outreach data
  const fetchOutreachData = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/business/outreach", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await res.json();
      if (result.success) {
        setOutreachData(result.data);
      } else {
        console.error("Failed to fetch outreach data:", result.error);
      }
    } catch (error) {
      console.error("Fetch outreach error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOutreachData();
  }, []);

  const filteredData = outreachData.filter(
    (biz) => biz.outreach_status === activeTab
  );

  // Open outreach modal and fetch relevant data
  const openModal = async (biz) => {
    console.log("Opening modal for business:", biz);
    setModalContent(biz);
    setIsModalOpen(true);

    try {
      const res = await fetch(
        `http://localhost:5000/api/maildata/outreach-data?businessId=${biz.businessid}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Fetch response status:", res.status);

      const result = await res.json();
      console.log("Fetched outreach data result:", result);

      // Check if the response contains the necessary data
      if (result?.templates && result?.businessEmail && result?.userEmail) {
        console.log("Templates received:", result.templates);
        console.log("Business mails received:", result.businessEmail);
        console.log("User mails received:", result.userEmail);

        setTemplates(result.templates);
        setBusinessMails(result.businessEmail);
        setUserMails(result.userEmail);

        // Default selection for the template
        if (result.templates.length) {
          setSelectedTemplate(result.templates[0].template_id);
          console.log(
            "Selected first template ID:",
            result.templates[0].template_id
          );
        }

        // Default selection for the user email
        if (result.userEmail.length) {
          setSelectedUserMail(result.userEmail[0].email);
          console.log("Selected user email:", result.userEmail[0].email);
        }

        // Default selection for the business email
        if (result.businessEmail.length) {
          setSelectedMail(result.businessEmail[0]);
          console.log("Selected business email:", result.businessEmail[0]);
        }
      } else {
        console.error("Error: Incomplete data returned from server:", result);
      }
    } catch (error) {
      console.error("Fetch outreach modal error:", error);
    }
  };

  return (
    <div className="p-6">
      <DashboardHeader title="Outreach" />

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        {["Pending", "Done"].map((tab) => (
          <Button
            key={tab}
            variant="primary"
            size="small"
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </Button>
        ))}
      </div>

      {/* Content */}
      <div className="overflow-x-auto">
        {loading ? (
          <div>Loading outreach data...</div>
        ) : filteredData.length === 0 ? (
          <EmptyState
            message={`No ${activeTab.toLowerCase()} outreach records.`}
            actionText="Start Outreach"
            onActionClick={() => console.log("Open outreach modal")}
          />
        ) : (
          <div className="overflow-x-auto border rounded-xl">
            <table className="min-w-full text-sm text-left">
              <thead className="bg-gray-100 text-xs uppercase text-gray-600">
                <tr>
                  <th className="px-6 py-3"></th>
                  <th className="px-6 py-3">Business Name</th>
                  {activeTab === "Pending" && (
                    <th className="px-6 py-3">Address</th>
                  )}
                  <th className="px-6 py-3">Niche</th>
                  <th className="px-6 py-3">Website</th>
                  <th className="px-6 py-3">Status</th>
                  {activeTab === "Pending" && (
                    <th className="px-6 py-3">Send Mail</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {filteredData.map((biz, index) => (
                  <tr
                    key={biz.businessid}
                    className="border-t hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-3 text-gray-700">{index + 1}</td>
                    <td className="px-6 py-3 font-medium text-gray-900">
                      {biz.name}
                    </td>
                    {activeTab === "Pending" && (
                      <td className="px-6 py-3 text-gray-700">{biz.address}</td>
                    )}
                    <td className="px-6 py-3 text-gray-700">{biz.niche}</td>
                    <td className="px-6 py-3">
                      <a
                        href={biz.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline break-all"
                      >
                        {biz.website}
                      </a>
                    </td>
                    <td className="px-6 py-3 font-semibold text-gray-800">
                      {biz.outreach_status}
                    </td>
                    {activeTab === "Pending" && (
                      <td className="px-6 py-3">
                        <Button
                          variant="primary"
                          size="small"
                          onClick={() => openModal(biz)}
                        >
                          Send Mail
                        </Button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {modalContent && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Send Outreach Mail"
          size="medium"
        >
          {modalContent && (
            <div className="space-y-4">
              <p className="text-gray-700">
                Sending mail to <strong>{modalContent.name}</strong>
              </p>

              {/* Template Dropdown */}
              <div>
                <label className="block mb-1 font-medium text-sm text-gray-700">
                  Select Template
                </label>
                <select
                  value={selectedTemplate}
                  onChange={(e) => setSelectedTemplate(e.target.value)}
                  className="w-full border rounded-lg p-2"
                >
                  {templates.map((template) => (
                    <option
                      key={template.template_id}
                      value={template.template_id}
                    >
                      {template.template_name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Mail Address Dropdown */}
              <div>
                <label className="block mb-1 font-medium text-sm text-gray-700">
                  Select Business Email
                </label>
                <select
                  value={selectedMail}
                  onChange={(e) => setSelectedMail(e.target.value)}
                  className="w-full border rounded-lg p-2"
                >
                  {businessMails.length > 0 ? (
                    businessMails.map((mail) => (
                      <option key={mail} value={mail}>
                        {mail}
                      </option>
                    ))
                  ) : (
                    <option>No business email available</option>
                  )}
                </select>
              </div>

              {/* User Email Dropdown */}
              <div>
                <label className="block mb-1 font-medium text-sm text-gray-700">
                  Select User Email
                </label>
                <select
                  value={selectedUserMail}
                  onChange={(e) => setSelectedUserMail(e.target.value)}
                  className="w-full border rounded-lg p-2"
                >
                  {userMails.length > 0 ? (
                    userMails.map((userMail) => (
                      <option key={userMail.email} value={userMail.email}>
                        {userMail.email}
                      </option>
                    ))
                  ) : (
                    <option>No user email available</option>
                  )}
                </select>
              </div>

              {/* Modal Actions */}
              <div className="flex justify-end gap-2">
                <Button
                  variant="primary"
                  size="small"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="small"
                  onClick={() => {
                    navigate("/dashboard/send-mail", {
                      state: {
                        businessId: modalContent.businessid,
                        templateId: selectedTemplate,
                        businessMail: selectedMail,
                        userMail: selectedUserMail,
                      },
                    });
                  }}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </Modal>
      )}
    </div>
  );
};

export default Outreach;

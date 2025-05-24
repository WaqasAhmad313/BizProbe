import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "@/components/ui/button";
import { FiTrash, FiPlus } from "react-icons/fi"; // Import trash icon for delete
import DashboardHeader from "@/components/DashboardHeader";
import EmptyState from "@/components/EmptyState";

const TemplateListPage = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  // Fetch templates on page load
  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/dashtemp/templates", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      console.log("Data from backend for template page:", data);
      if (data.success) {
        setTemplates(data.data);
      } else {
        console.error("Failed to fetch templates:", data.message);
      }
    } catch (error) {
      console.error("Error fetching templates:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  // Handle delete of a template
  const handleDelete = async (templateId) => {
    if (window.confirm("Are you sure you want to delete this template?")) {
      try {
        const res = await fetch(
          `http://localhost:5000/api/dashtemp/templates/${templateId}`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await res.json();

        if (data.success) {
          // Remove the deleted template from the state
          setTemplates(
            templates.filter((template) => template.template_id !== templateId)
          );
          alert("Template deleted successfully");
        } else {
          alert("Failed to delete template: " + data.message);
        }
      } catch (error) {
        console.error("Error deleting template:", error);
        alert("An error occurred while deleting the template.");
      }
    }
  };

  const handleRedirect = (templateId) => {
    navigate(`/dashboard/templates/${templateId}`);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <DashboardHeader
        title="My Templates"
        actions={
          <Button
            size="medium"
            variant="primary"
            icon={FiPlus}
            onClick={() => navigate("/dashboard/TemplateEdit")}
          >
            Add Template
          </Button>
        }
      />

      {loading ? (
        <p className="text-gray-600">Loading templates...</p>
      ) : templates.length === 0 ? (
        <EmptyState
          message="No templates found."
          actionText="Create Template"
          onActionClick={() => navigate("/dashboard/TemplateEdit")}
        />
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full table-auto border-collapse">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700"></th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                  Template Name
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                  Created At
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {templates.map((template, index) => (
                <tr
                  key={template.template_id}
                  className="border-b last:border-none"
                >
                  <td className="px-6 py-4 text-sm text-gray-800">
                    {index + 1}
                  </td>
                  <td
                    className="px-6 py-4 text-sm text-blue-600 hover:underline cursor-pointer"
                    onClick={() => handleRedirect(template.template_id)}
                  >
                    {template.template_name}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {new Date(template.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <Button
                      size="small"
                      variant="outline"
                      icon={FiTrash}
                      onClick={() => handleDelete(template.template_id)}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TemplateListPage;

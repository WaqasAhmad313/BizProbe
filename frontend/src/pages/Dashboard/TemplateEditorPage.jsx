import { useState } from "react";
import PlaceholderSelector from "@/components/tempedit/PlaceholderSelector";
import ButtonEditor from "@/components/tempedit/ButtonEditor";
import StyleControls from "@/components/tempedit/StyleControls";
import { useNavigate } from "react-router-dom";

export default function TemplateBuilderPage() {
  const [template, setTemplate] = useState({
    templateName: "",
    purpose: "",
    customPurpose: "",
    audience: "",
    content: {
      selectedPlaceholders: [],
      style: {
        textColor: "#333333",
        backgroundColor: "#ffffff",
        linkColor: "#3B82F6",
        borderColor: "#dddddd",
        borderWidth: "1px",
        borderRadius: "8px",
      },
      signature: {
        name: "",
        title: "",
        company: "",
        email: "",
        phone: "",
        whatsapp: "",
        socialMedia: [],
      },
      buttons: [],
    },
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [newSocialPlatform, setNewSocialPlatform] = useState({
    name: "",
    url: "",
  });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      // Split data into two parts as requested
      const templateData = {
        templateName: template.templateName,
        content: {
          purpose:
            template.purpose === "custom"
              ? template.customPurpose
              : template.purpose,
          audience: template.audience,
          selectedPlaceholders: template.content.selectedPlaceholders,
          style: template.content.style,
          signature: template.content.signature,
          buttons: template.content.buttons,
        },
      };

      const response = await fetch(
        "http://localhost:5000/api/dashtemp/templates",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(templateData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to save template");
      }

      const result = await response.json();
      console.log("Template saved:", result);
      alert("Template saved successfully!");
      navigate("/templates");
    } catch (error) {
      console.error("Save failed:", error);
      setError(error.message || "An error occurred while saving the template");
    } finally {
      setIsLoading(false);
    }
  };

  const addSocialMedia = () => {
    if (newSocialPlatform.name && newSocialPlatform.url) {
      setTemplate({
        ...template,
        content: {
          ...template.content,
          signature: {
            ...template.content.signature,
            socialMedia: [
              ...template.content.signature.socialMedia,
              {
                platform: newSocialPlatform.name,
                url: newSocialPlatform.url,
              },
            ],
          },
        },
      });
      setNewSocialPlatform({ name: "", url: "" });
    }
  };

  const removeSocialMedia = (index) => {
    const updatedSocials = [...template.content.signature.socialMedia];
    updatedSocials.splice(index, 1);
    setTemplate({
      ...template,
      content: {
        ...template.content,
        signature: {
          ...template.content.signature,
          socialMedia: updatedSocials,
        },
      },
    });
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">
        Email Template Builder
      </h1>

      {error && (
        <div className="mb-4 p-4 bg-red-100 border-l-4 border-red-500 text-red-700 rounded">
          <p>{error}</p>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-lg shadow-md"
      >
        {/* Template Name */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Template Name*
          </label>
          <input
            type="text"
            value={template.templateName}
            onChange={(e) =>
              setTemplate({ ...template, templateName: e.target.value })
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            required
            disabled={isLoading}
          />
        </div>

        {/* Purpose */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Purpose*
          </label>
          <div className="space-y-2">
            <select
              value={template.purpose}
              onChange={(e) =>
                setTemplate({ ...template, purpose: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              required
              disabled={isLoading}
            >
              <option value="">Select purpose</option>
              <option value="cold-outreach">Cold Outreach</option>
              <option value="follow-up">Follow-up</option>
              <option value="partnership">Partnership</option>
              <option value="customer-support">Customer Support</option>
              <option value="custom">Custom Purpose</option>
            </select>

            {template.purpose === "custom" && (
              <input
                type="text"
                value={template.customPurpose}
                onChange={(e) =>
                  setTemplate({ ...template, customPurpose: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                placeholder="Enter custom purpose"
                required
                disabled={isLoading}
              />
            )}
          </div>
        </div>

        {/* Audience */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Target Audience*
          </label>
          <input
            type="text"
            value={template.audience}
            onChange={(e) =>
              setTemplate({ ...template, audience: e.target.value })
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            required
            disabled={isLoading}
            placeholder="E.g., SaaS CEOs, E-commerce managers"
          />
        </div>

        {/* Style Controls */}
        <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
          <h3 className="text-lg font-medium text-gray-800 mb-4">
            Branding & Layout
          </h3>
          <StyleControls
            style={template.content.style}
            onChange={(style) =>
              setTemplate({
                ...template,
                content: { ...template.content, style },
              })
            }
            disabled={isLoading}
          />
        </div>

        {/* Placeholders */}
        <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
          <h3 className="text-lg font-medium text-gray-800 mb-4">
            Dynamic Placeholders
          </h3>
          <PlaceholderSelector
            selected={template.content.selectedPlaceholders}
            onChange={(selected) =>
              setTemplate({
                ...template,
                content: {
                  ...template.content,
                  selectedPlaceholders: selected,
                },
              })
            }
            disabled={isLoading}
          />
        </div>

        {/* CTA Buttons */}
        <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
          <h3 className="text-lg font-medium text-gray-800 mb-4">
            Call-to-Action Buttons
          </h3>
          <ButtonEditor
            buttons={template.content.buttons}
            onChange={(buttons) =>
              setTemplate({
                ...template,
                content: { ...template.content, buttons },
              })
            }
            disabled={isLoading}
          />
        </div>

        {/* Signature */}
        <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Signature</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={template.content.signature.name}
                onChange={(e) =>
                  setTemplate({
                    ...template,
                    content: {
                      ...template.content,
                      signature: {
                        ...template.content.signature,
                        name: e.target.value,
                      },
                    },
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title
              </label>
              <input
                type="text"
                value={template.content.signature.title}
                onChange={(e) =>
                  setTemplate({
                    ...template,
                    content: {
                      ...template.content,
                      signature: {
                        ...template.content.signature,
                        title: e.target.value,
                      },
                    },
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Company
              </label>
              <input
                type="text"
                value={template.content.signature.company}
                onChange={(e) =>
                  setTemplate({
                    ...template,
                    content: {
                      ...template.content,
                      signature: {
                        ...template.content.signature,
                        company: e.target.value,
                      },
                    },
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={template.content.signature.email}
                onChange={(e) =>
                  setTemplate({
                    ...template,
                    content: {
                      ...template.content,
                      signature: {
                        ...template.content.signature,
                        email: e.target.value,
                      },
                    },
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone
              </label>
              <input
                type="tel"
                value={template.content.signature.phone}
                onChange={(e) =>
                  setTemplate({
                    ...template,
                    content: {
                      ...template.content,
                      signature: {
                        ...template.content.signature,
                        phone: e.target.value,
                      },
                    },
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                WhatsApp
              </label>
              <input
                type="tel"
                value={template.content.signature.whatsapp}
                onChange={(e) =>
                  setTemplate({
                    ...template,
                    content: {
                      ...template.content,
                      signature: {
                        ...template.content.signature,
                        whatsapp: e.target.value,
                      },
                    },
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              />
            </div>
          </div>

          {/* Custom Social Media */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Social Media Links
            </label>
            <div className="space-y-3">
              {template.content.signature.socialMedia.map((social, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <span className="w-24 font-medium text-gray-700 capitalize">
                    {social.platform}:
                  </span>
                  <input
                    type="url"
                    value={social.url}
                    onChange={(e) => {
                      const updated = [
                        ...template.content.signature.socialMedia,
                      ];
                      updated[index].url = e.target.value;
                      setTemplate({
                        ...template,
                        content: {
                          ...template.content,
                          signature: {
                            ...template.content.signature,
                            socialMedia: updated,
                          },
                        },
                      });
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  />
                  <button
                    type="button"
                    onClick={() => removeSocialMedia(index)}
                    className="p-2 text-red-500 hover:text-red-700"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </div>
              ))}

              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="text"
                  value={newSocialPlatform.name}
                  onChange={(e) =>
                    setNewSocialPlatform({
                      ...newSocialPlatform,
                      name: e.target.value,
                    })
                  }
                  placeholder="Platform name"
                  className="w-1/3 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                />
                <input
                  type="url"
                  value={newSocialPlatform.url}
                  onChange={(e) =>
                    setNewSocialPlatform({
                      ...newSocialPlatform,
                      url: e.target.value,
                    })
                  }
                  placeholder="https://example.com/username"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                />
                <button
                  type="button"
                  onClick={addSocialMedia}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4 mt-8 pt-6 border-t">
          <button
            type="button"
            className="px-6 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition"
            onClick={() => navigate("/templates")}
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400 transition flex items-center justify-center"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Saving...
              </>
            ) : (
              "Save Template"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

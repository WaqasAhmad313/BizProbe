import { useState } from "react";
import PropTypes from "prop-types";

const TemplateForm = ({ onSaveTemplate }) => {
  // State to manage inputs and placeholders
  const [templateName, setTemplateName] = useState("");
  const [subjectLine, setSubjectLine] = useState("");
  const [purpose, setPurpose] = useState("");
  const [mailBody, setMailBody] = useState("");
  const [selectedPlaceholders, setSelectedPlaceholders] = useState([]);
  const [media, setMedia] = useState([]);

  // Handle adding a placeholder
  const handleAddPlaceholder = (placeholder) => {
    if (!selectedPlaceholders.includes(placeholder)) {
      setSelectedPlaceholders([...selectedPlaceholders, placeholder]);
    }
  };

  // Handle media upload
  const handleMediaUpload = (newMedia) => {
    setMedia([...media, newMedia]);
  };

  // Handle saving the template
  const handleSaveTemplate = () => {
    const templateData = {
      templateName,
      subjectLine,
      purpose,
      mailBody,
      selectedPlaceholders,
      media,
    };
    onSaveTemplate(templateData);
  };

  return (
    <div className="template-form">
      <div className="inputs">
        {/* Template Name */}
        <div>
          <label>Template Name</label>
          <input
            type="text"
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
            placeholder="Enter template name"
          />
        </div>

        {/* Subject Line */}
        <div>
          <label>Subject Line</label>
          <input
            type="text"
            value={subjectLine}
            onChange={(e) => setSubjectLine(e.target.value)}
            placeholder="Enter subject line"
          />
        </div>

        {/* Purpose of Outreach */}
        <div>
          <label>Purpose of Outreach</label>
          <textarea
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
            placeholder="Describe the purpose of the outreach"
          />
        </div>

        {/* Mail Body */}
        <div>
          <label>Mail Body</label>
          <textarea
            value={mailBody}
            onChange={(e) => setMailBody(e.target.value)}
            placeholder="Enter the email body"
          />
        </div>

        {/* Placeholder Selection (Multi-select) */}
        <div>
          <label>Select Placeholders</label>
          <select
            multiple
            value={selectedPlaceholders}
            onChange={(e) => {
              const selectedOptions = Array.from(
                e.target.selectedOptions,
                (option) => option.value
              );
              setSelectedPlaceholders(selectedOptions);
            }}
          >
            {/* Example placeholders */}
            {["{{first_name}}", "{{last_name}}", "{{company_name}}"].map(
              (placeholder) => (
                <option key={placeholder} value={placeholder}>
                  {placeholder}
                </option>
              )
            )}
          </select>
        </div>

        {/* Add Placeholder Button */}
        <div>
          <button onClick={() => handleAddPlaceholder("{{email}}")}>
            Add Email Placeholder
          </button>
        </div>

        {/* Media Upload */}
        <div>
          <label>Upload Media</label>
          <input
            type="file"
            onChange={(e) => handleMediaUpload(e.target.files[0])}
          />
        </div>
      </div>

      {/* Save Template Button */}
      <div className="actions">
        <button onClick={handleSaveTemplate}>Save Template</button>
      </div>
    </div>
  );
};

// Prop validation for onSaveTemplate function
TemplateForm.propTypes = {
  onSaveTemplate: PropTypes.func.isRequired,
};

export default TemplateForm;

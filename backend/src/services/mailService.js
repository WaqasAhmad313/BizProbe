const {
  getBusinessEmail,
  getUserEmail,
  getUserTemplates,
  getTemplateById,
  getPlaceholderDescriptions,
  getBusinessDataByPlaceholders,
  getUserTokens,
  insertOutreachLog,
  insertFollowUp,
} = require("../models/mailModel");
const { generateEmailHTMLFromTemplate } = require("../utils/groqUtilis");
const { sendMail } = require("../utils/gmailHelpers");

async function fetchOutreachDataService(userId, businessId) {
  if (!userId || !businessId)
    throw new Error("User ID and Business ID are required");

  try {
    const businessEmail = await getBusinessEmail(businessId);
    const userEmail = await getUserEmail(userId);
    const templates = await getUserTemplates(userId);

    return {
      businessEmail,
      userEmail,
      templates,
    };
  } catch (error) {
    console.error("Error fetching outreach data:", error);
    throw error;
  }
}

const generateTemplateDataForBusinessService = async (
  templateId,
  businessId,
  generateEmail = false
) => {
  try {
    const templateContent = await getTemplateById(templateId);

    if (!templateContent) {
      console.error(`Template with ID ${templateId} not found.`);
      throw new Error(`Template with ID ${templateId} not found.`);
    }

    const placeholders = templateContent.selectedPlaceholders || [];
    const descriptions = await getPlaceholderDescriptions(placeholders);
    const businessData = await getBusinessDataByPlaceholders(
      businessId,
      placeholders
    );

    // If generateEmail not requested, return data for preview
    if (!generateEmail) {
      return { templateContent, placeholders, descriptions, businessData };
    }

    if (!businessData.Name) {
      console.error("Missing business name in business data:", businessData);
      throw new Error("Business name is required to generate email.");
    }

    // Construct AI prompt content string using object directly
    const promptContent = `
    Using the following configuration:
    - Purpose: ${templateContent.purpose || "No purpose provided"}
    - Audience: ${templateContent.audience || "No audience provided"}
    - Style:
      - Background Color: ${templateContent.style?.backgroundColor || "#ffffff"}
      - Content Background Color: ${
        templateContent.style?.contentBgColor || "#ffffff"
      }
      - Text Color: ${templateContent.style?.textColor || "#000000"}
      - Link Color: ${templateContent.style?.linkColor || "#0000ff"}
      - Border: ${templateContent.style?.borderWidth || "1px"} solid ${
      templateContent.style?.borderColor || "#000000"
    }
      - Border Radius: ${templateContent.style?.borderRadius || "0px"}
    
    Buttons:
    ${
      (templateContent.buttons || [])
        .map(
          (btn, idx) =>
            `- [${btn?.text || "Button " + (idx + 1)}](${
              btn?.url || "#"
            }) (Background: ${btn?.bgColor || "#000000"}, Text: ${
              btn?.color || "#ffffff"
            }, Border Radius: ${btn?.borderRadius || "4px"})`
        )
        .join("\n") || "- None"
    }
    
    Signature:
    - ${templateContent.signature?.name || "Name"}, ${
      templateContent.signature?.title || "Title"
    } at ${templateContent.signature?.company || "Company"}
    - Email: ${templateContent.signature?.email || "No email provided"}
    - Social: ${
      (templateContent.signature?.socialMedia || [])
        .map((s) => `${s?.platform || "Platform"}: ${s?.url || "#"}`)
        .join(", ") || "None"
    }
    
    Business Details:
    ${
      Object.entries(businessData || {})
        .map(([key, value]) => `- ${key}: ${value || "N/A"}`)
        .join("\n") || "- No business data provided"
    }
    
    **Instructions:**
    - Write a friendly, engaging email body for the audience.
    - Mention their competitors naturally if appropriate.
    - Provide a clear call to action using the buttons.
    - Layout content cleanly using inline CSS — avoid overlapping elements.
    - Style buttons with proper spacing (margin) between them, ensuring they are clearly separated and aligned horizontally or stacked with consistent spacing.
    - The signature section must look visually distinct and professional, placed at the bottom of the email with a clear top border and margin.
    - In the signature, use a clean, minimal layout with **four rows**:
      1. Full Name — bold, slightly larger font.
      2. Title and Company Name — normal weight, muted color.
      3. Email address — clickable mailto link.
      4. Social media platforms as clickable text links, side by side, separated by vertical bars (\`|\`), using inline CSS for font size, color, and spacing.
    - Apply proper visual hierarchy in the signature using font size, weight, color, alignment, and spacing.
    - Use only inline CSS (no external styles, no <style> tags).
    - Format the final output as valid raw HTML email content.
    - Return only raw HTML and CSS. No additional text or explanations.
    - Also, generate a unique, engaging email subject line for this message incorporating the business name '${
      businessData?.Name || "Business Name"
    }' naturally.
    - Return both the subject and email body as a JSON object in this exact format:
    {
      "subject": "Your email subject here",
      "emailHTML": "<html>...</html>"
    }
    Ensure any double quotes inside the emailHTML value are properly escaped with a backslash (\"). Do not include any markdown formatting or additional text.
    `.trim();

    if (!promptContent || promptContent.length < 50) {
      throw new Error("Generated prompt content is invalid or empty.");
    }

    if (typeof promptContent !== "string" || promptContent.trim() === "") {
      throw new Error("Generated prompt content is invalid or empty.");
    }

    // Call AI API to generate the email HTML content
    const aiResponse = await generateEmailHTMLFromTemplate(promptContent);

    // Clean up AI response if it contains markdown-style code block formatting
    try {
      let cleanedResponse = aiResponse
        .replace(/```json\n?/g, "")
        .replace(/```/g, "")
        .trim();

      console.log("Cleaned AI Response:", cleanedResponse);

      // Optional fix: auto-escape any unescaped double quotes in emailHTML
      cleanedResponse = cleanedResponse.replace(
        /"emailHTML":\s?"([\s\S]*?)"(,|\})/g,
        (match, htmlContent, closingChar) => {
          const safeHTML = htmlContent
            .replace(/\\/g, "\\\\")
            .replace(/"/g, '\\"');
          return `"emailHTML": "${safeHTML}"${closingChar}`;
        }
      );

      const parsed = JSON.parse(cleanedResponse);

      if (!parsed.subject || !parsed.emailHTML) {
        throw new Error("Missing required keys in AI response.");
      }

      return {
        subject: parsed.subject,
        emailHTML: parsed.emailHTML,
      };
    } catch (error) {
      console.error("Failed to parse AI JSON response:", error);
      throw new Error(
        "AI response was not valid JSON. Please check AI template generation."
      );
    }
  } catch (error) {
    console.error("Error generating template data:", error);
    throw error;
  }
};

async function sendOutreachEmailService({
  userId,
  businessId,
  businessMail,
  templateId,
  userMail,
  subject,
  emailHTML,
}) {
  try {
    const { access_token, refresh_token } = await getUserTokens(userMail);

    await sendMail({
      toMail: businessMail,
      userMail,
      subject,
      htmlContent: emailHTML,
      accessToken: access_token,
      refreshToken: refresh_token,
    });

    const outreachLog = await insertOutreachLog({
      userId,
      businessId,
      templateId,
      userMail,
    });

    await insertFollowUp({
      userId,
      businessId,
      outreachId: outreachLog.outreach_id,
    });

    return {
      success: true,
      message: "Email sent, outreach and follow-up logged.",
    };
  } catch (error) {
    console.error("Error in sendOutreachEmailService:", error);
    throw new Error("Failed to send email and log outreach/follow-up.");
  }
}

module.exports = {
  fetchOutreachDataService,
  generateTemplateDataForBusinessService,
  sendOutreachEmailService,
};

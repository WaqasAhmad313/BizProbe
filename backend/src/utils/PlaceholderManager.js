// 📦 Central list of placeholders and their actual meaning for AI reference

export const placeholderDefinitions = [
  { key: "Name", description: "Name of the target business." },
  { key: "Address", description: "Physical address of the business." },
  { key: "Phonenumber", description: "Official phone number of the business." },
  { key: "Website", description: "Website URL of the business." },
  { key: "Rating", description: "Current Google rating of the business." },
  {
    key: "Reviews_count",
    description: "Number of reviews the business has on Google.",
  },
  {
    key: "Niche",
    description:
      "Business category or niche (e.g. plumber, hair salon, restaurant).",
  },
  { key: "Logo", description: "URL of the business's logo image." },
  {
    key: "Social_media_links",
    description:
      "Links to business's social media profiles (Facebook, Instagram, etc).",
  },
  {
    key: "Team_names",
    description: "Names of the team members or staff working at the business.",
  },
  {
    key: "Directories",
    description:
      "Online directories where the business is listed (Yelp, YellowPages, etc).",
  },
  {
    key: "Competitors1_name",
    description: "Name of the first nearby competitor business.",
  },
  {
    key: "Competitors2_name",
    description: "Name of the second nearby competitor business.",
  },
  {
    key: "Competitors3_name",
    description: "Name of the third nearby competitor business.",
  },
  {
    key: "Competitors1_Distance",
    description: "Distance between the target business and competitor 1.",
  },
  {
    key: "Competitors2_Distance",
    description: "Distance between the target business and competitor 2.",
  },
  {
    key: "Competitors3_Distance",
    description: "Distance between the target business and competitor 3.",
  },
  { key: "Competitors1_Website", description: "Website URL of competitor 1." },
  { key: "Competitors2_Website", description: "Website URL of competitor 2." },
  { key: "Competitors3_Website", description: "Website URL of competitor 3." },
  { key: "Competitors1_Rating", description: "Google rating of competitor 1." },
  { key: "Competitors2_Rating", description: "Google rating of competitor 2." },
  { key: "Competitors3_Rating", description: "Google rating of competitor 3." },
];

/**
 * Get the description of a placeholder by its key
 * @param {string} key - The placeholder key to look up
 * @returns {string|null} - The description if found, or null if not found
 */
export function getPlaceholderDescription(key) {
  const placeholder = placeholderDefinitions.find((item) => item.key === key);
  return placeholder ? placeholder.description : null;
}

/**
 * 📄 Get a list of all available placeholder keys
 * @returns {string[]} - Array of placeholder keys
 */
export function getAllPlaceholderKeys() {
  return placeholderDefinitions.map((item) => item.key);
}

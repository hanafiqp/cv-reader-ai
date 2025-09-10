// API endpoint untuk mendapatkan available tags untuk filtering
import tagManager from '../../utils/tagManager.js';

// Setup CORS
const setCorsHeaders = (res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
};

export default async function handler(req, res) {
  setCorsHeaders(res);

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    // Return predefined tag values for filtering UI
    const availableTags = {
      categories: tagManager.TAG_CATEGORIES,
      predefinedTags: {
        experienceLevels: tagManager.PREDEFINED_TAGS.EXPERIENCE_LEVELS,
        experienceYears: tagManager.PREDEFINED_TAGS.EXPERIENCE_YEARS,
        educationLevels: tagManager.PREDEFINED_TAGS.EDUCATION_LEVELS,
        workTypes: tagManager.PREDEFINED_TAGS.WORK_TYPES,
        workLocations: tagManager.PREDEFINED_TAGS.WORK_LOCATIONS,
        salaryRanges: tagManager.PREDEFINED_TAGS.SALARY_RANGES_IDR,
        industries: tagManager.PREDEFINED_TAGS.INDUSTRIES,
        countries: tagManager.PREDEFINED_TAGS.COUNTRIES,
        indonesianCities: tagManager.PREDEFINED_TAGS.INDONESIAN_CITIES
      }
    };

    res.status(200).json({
      success: true,
      data: availableTags,
      message: "Available tags retrieved successfully"
    });

  } catch (error) {
    console.error("Error retrieving available tags:", error);
    res.status(500).json({ 
      success: false,
      error: "Failed to retrieve available tags",
      details: error.message 
    });
  }
}

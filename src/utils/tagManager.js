/**
 * CV Tag Management System
 * Handles tag generation, normalization, and filtering
 */

// ========== TAG CATEGORIES ==========
export const TAG_CATEGORIES = {
  LOCATION: 'location',
  EXPERIENCE: 'experience', 
  SKILLS: 'skills',
  EDUCATION: 'education',
  WORK_PREFERENCE: 'work_preference',
  SALARY: 'salary',
  LANGUAGE: 'language',
  CERTIFICATION: 'certification',
  DEMOGRAPHIC: 'demographic',
  INDUSTRY: 'industry',
  SPECIAL: 'special'
};

// ========== PREDEFINED TAG VALUES ==========
export const PREDEFINED_TAGS = {
  EXPERIENCE_LEVELS: [
    'Fresh Graduate',
    'Entry Level', 
    'Junior',
    'Mid-Level',
    'Senior',
    'Lead',
    'Manager',
    'Director',
    'VP',
    'C-Level'
  ],
  
  EXPERIENCE_YEARS: [
    '0-1 years',
    '1-2 years', 
    '2-3 years',
    '3-5 years',
    '5-7 years',
    '7-10 years',
    '10+ years'
  ],

  EDUCATION_LEVELS: [
    'High School',
    'Diploma',
    'Associate Degree',
    'Bachelor',
    'Master',
    'PhD',
    'Professional Degree'
  ],

  WORK_TYPES: [
    'Full-time',
    'Part-time', 
    'Contract',
    'Freelance',
    'Internship',
    'Temporary'
  ],

  WORK_LOCATIONS: [
    'Remote',
    'On-site',
    'Hybrid',
    'Flexible'
  ],

  SALARY_RANGES_IDR: [
    '< 5M IDR',
    '5-10M IDR',
    '10-15M IDR', 
    '15-20M IDR',
    '20-25M IDR',
    '25M+ IDR'
  ],

  INDUSTRIES: [
    'Technology',
    'Finance',
    'Banking',
    'Healthcare',
    'Education',
    'Manufacturing', 
    'Retail',
    'Consulting',
    'Government',
    'Non-Profit',
    'Media',
    'Real Estate',
    'Agriculture',
    'Energy',
    'Transportation'
  ],

  COUNTRIES: [
    'Indonesia',
    'Singapore', 
    'Malaysia',
    'Thailand',
    'Philippines',
    'Vietnam',
    'United States',
    'United Kingdom',
    'Australia',
    'Canada',
    'Germany',
    'Netherlands'
  ],

  INDONESIAN_CITIES: [
    'Jakarta',
    'Surabaya',
    'Bandung',
    'Medan',
    'Semarang',
    'Makassar',
    'Palembang',
    'Tangerang',
    'Depok',
    'Bekasi',
    'Bogor',
    'Yogyakarta'
  ]
};

// ========== TAG NORMALIZATION ==========
/**
 * Normalizes and categorizes tags from CV data
 * @param {Object} cvData - Extracted CV data
 * @returns {Array} Normalized tags array
 */
export function normalizeTags(cvData) {
  const normalizedTags = new Set();

  // Location tags
  if (cvData.currentLocation) {
    normalizedTags.add(`Location: ${cvData.currentLocation}`);
  }
  if (cvData.currentCountry) {
    normalizedTags.add(`Country: ${cvData.currentCountry}`);
  }

  // Experience tags
  if (cvData.totalExperienceYears) {
    const expRange = getExperienceRange(cvData.totalExperienceYears);
    normalizedTags.add(`Experience: ${expRange}`);
  }
  if (cvData.experienceLevel) {
    normalizedTags.add(`Level: ${cvData.experienceLevel}`);
  }

  // Skill tags
  if (cvData.hardSkills) {
    cvData.hardSkills.split(',').forEach(skill => {
      const normalizedSkill = skill.trim();
      if (normalizedSkill) {
        normalizedTags.add(`Skill: ${normalizedSkill}`);
      }
    });
  }

  // Education tags
  if (cvData.highestEducation) {
    normalizedTags.add(`Education: ${cvData.highestEducation}`);
  }
  if (cvData.degree) {
    normalizedTags.add(`Degree: ${cvData.degree}`);
  }

  // Industry tags
  if (cvData.industryExperience) {
    cvData.industryExperience.split(',').forEach(industry => {
      const normalizedIndustry = industry.trim();
      if (normalizedIndustry) {
        normalizedTags.add(`Industry: ${normalizedIndustry}`);
      }
    });
  }

  // Work preference tags
  if (cvData.remoteWorkPreference) {
    normalizedTags.add(`Work Type: ${cvData.remoteWorkPreference}`);
  }

  // Add existing tags if any
  if (cvData.tags && Array.isArray(cvData.tags)) {
    cvData.tags.forEach(tag => {
      if (tag && tag.trim()) {
        normalizedTags.add(tag.trim());
      }
    });
  }

  return Array.from(normalizedTags).sort();
}

// ========== HELPER FUNCTIONS ==========
/**
 * Converts years of experience to predefined range
 * @param {number} years - Years of experience
 * @returns {string} Experience range
 */
function getExperienceRange(years) {
  if (years < 1) return '0-1 years';
  if (years < 2) return '1-2 years';
  if (years < 3) return '2-3 years';
  if (years < 5) return '3-5 years';
  if (years < 7) return '5-7 years';
  if (years < 10) return '7-10 years';
  return '10+ years';
}

/**
 * Extracts tags by category
 * @param {Array} tags - Array of tags
 * @param {string} category - Category to filter by
 * @returns {Array} Filtered tags
 */
export function getTagsByCategory(tags, category) {
  if (!Array.isArray(tags)) return [];
  
  const categoryPrefix = category.toLowerCase() + ':';
  return tags.filter(tag => 
    tag.toLowerCase().startsWith(categoryPrefix)
  ).map(tag => 
    tag.substring(categoryPrefix.length).trim()
  );
}

/**
 * Creates search filters from tags
 * @param {Array} tags - Array of tags
 * @returns {Object} Search filters object
 */
export function createSearchFilters(tags) {
  return {
    locations: getTagsByCategory(tags, 'location'),
    countries: getTagsByCategory(tags, 'country'),
    skills: getTagsByCategory(tags, 'skill'),
    industries: getTagsByCategory(tags, 'industry'),
    educationLevels: getTagsByCategory(tags, 'education'),
    experienceLevels: getTagsByCategory(tags, 'level'),
    workTypes: getTagsByCategory(tags, 'work type'),
    salaryRanges: getTagsByCategory(tags, 'salary'),
    languages: getTagsByCategory(tags, 'language')
  };
}

/**
 * Validates CV data completeness for better tagging
 * @param {Object} cvData - CV data object
 * @returns {Object} Validation result with suggestions
 */
export function validateCVDataForTagging(cvData) {
  const missing = [];
  const suggestions = [];

  if (!cvData.currentLocation) {
    missing.push('currentLocation');
    suggestions.push('Location information helps with geographical filtering');
  }

  if (!cvData.totalExperienceYears) {
    missing.push('totalExperienceYears');
    suggestions.push('Experience duration helps categorize seniority level');
  }

  if (!cvData.hardSkills || cvData.hardSkills.trim().length === 0) {
    missing.push('hardSkills');
    suggestions.push('Technical skills are crucial for skill-based filtering');
  }

  if (!cvData.industryExperience) {
    missing.push('industryExperience');
    suggestions.push('Industry information helps match relevant opportunities');
  }

  return {
    isComplete: missing.length === 0,
    missing,
    suggestions,
    completenessScore: Math.round(((Object.keys(cvData).length - missing.length) / Object.keys(cvData).length) * 100)
  };
}

/**
 * Generates smart tag suggestions based on CV content
 * @param {Object} cvData - CV data object
 * @returns {Array} Suggested additional tags
 */
export function generateSmartTagSuggestions(cvData) {
  const suggestions = [];

  // Suggest location region tags
  if (cvData.currentCountry === 'Indonesia' && cvData.currentLocation) {
    suggestions.push('Region: Southeast Asia');
    suggestions.push('Market: ASEAN');
  }

  // Suggest technology stack tags
  if (cvData.hardSkills) {
    const skills = cvData.hardSkills.toLowerCase();
    if (skills.includes('react') && skills.includes('node')) {
      suggestions.push('Stack: Full Stack JavaScript');
    }
    if (skills.includes('aws') || skills.includes('azure') || skills.includes('gcp')) {
      suggestions.push('Specialty: Cloud Computing');
    }
  }

  // Suggest career progression tags
  if (cvData.workExperience && cvData.workExperience.length > 2) {
    const positions = cvData.workExperience.map(exp => exp.position?.toLowerCase() || '');
    if (positions.some(pos => pos.includes('senior') || pos.includes('lead'))) {
      suggestions.push('Career: Progressive Growth');
    }
  }

  // Suggest mobility tags
  if (cvData.willingToRelocate) {
    suggestions.push('Mobility: Flexible Location');
  }

  if (cvData.remoteWorkPreference === 'Remote') {
    suggestions.push('Remote: Remote Ready');
  }

  return suggestions;
}

// ========== EXPORT DEFAULT ==========
const tagManager = {
  TAG_CATEGORIES,
  PREDEFINED_TAGS,
  normalizeTags,
  getTagsByCategory,
  createSearchFilters,
  validateCVDataForTagging,
  generateSmartTagSuggestions
};

export default tagManager;

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

  // Location tags (with natural prefix)
  if (cvData.currentLocation) {
    normalizedTags.add(`location ${cvData.currentLocation.toLowerCase()}`);
  }
  if (cvData.currentCountry) {
    normalizedTags.add(`country ${cvData.currentCountry.toLowerCase()}`);
  }

  // Experience tags
  if (cvData.totalExperienceYears) {
    const expRange = getExperienceRange(cvData.totalExperienceYears);
    normalizedTags.add(`experience ${expRange.toLowerCase()}`);
  }
  if (cvData.experienceLevel) {
    normalizedTags.add(`level ${cvData.experienceLevel.toLowerCase()}`);
  }

  // Skill tags (individual skills with skill prefix)
  if (cvData.hardSkills) {
    cvData.hardSkills.split(',').forEach(skill => {
      const normalizedSkill = skill.trim().toLowerCase();
      if (normalizedSkill) {
        normalizedTags.add(`skill ${normalizedSkill}`);
      }
    });
  }

  // Soft skills
  if (cvData.softSkills) {
    cvData.softSkills.split(',').forEach(skill => {
      const normalizedSkill = skill.trim().toLowerCase();
      if (normalizedSkill) {
        normalizedTags.add(`softskill ${normalizedSkill}`);
      }
    });
  }

  // Education tags
  if (cvData.highestEducation) {
    normalizedTags.add(`education ${cvData.highestEducation.toLowerCase()}`);
  }
  if (cvData.degree) {
    normalizedTags.add(`degree ${cvData.degree.toLowerCase()}`);
  }

  // Industry tags
  if (cvData.industryExperience) {
    cvData.industryExperience.split(',').forEach(industry => {
      const normalizedIndustry = industry.trim().toLowerCase();
      if (normalizedIndustry) {
        normalizedTags.add(`industry ${normalizedIndustry}`);
      }
    });
  }

  // Work preference tags
  if (cvData.remoteWorkPreference) {
    normalizedTags.add(`worktype ${cvData.remoteWorkPreference.toLowerCase()}`);
  }

  // Language tags
  if (cvData.languages) {
    cvData.languages.split(',').forEach(lang => {
      const normalizedLang = lang.trim().toLowerCase();
      if (normalizedLang) {
        normalizedTags.add(`language ${normalizedLang}`);
      }
    });
  }

  // Certification tags
  if (cvData.certifications) {
    cvData.certifications.split(',').forEach(cert => {
      const normalizedCert = cert.trim().toLowerCase();
      if (normalizedCert) {
        normalizedTags.add(`certification ${normalizedCert}`);
      }
    });
  }

  // Salary range tag
  if (cvData.expectedSalary) {
    normalizedTags.add(`salary ${cvData.expectedSalary.toLowerCase()}`);
  }

  // Availability tag
  if (cvData.availabilityToStart) {
    normalizedTags.add(`availability ${cvData.availabilityToStart.toLowerCase()}`);
  }

  // Gender tag (if available)
  if (cvData.gender) {
    normalizedTags.add(`gender ${cvData.gender.toLowerCase()}`);
  }

  // Nationality tag
  if (cvData.nationality) {
    normalizedTags.add(`nationality ${cvData.nationality.toLowerCase()}`);
  }

  // Management experience
  if (cvData.managementExperience) {
    normalizedTags.add(`management experience`);
  }

  // Add existing tags if any (ensure they follow the new format)
  if (cvData.tags && Array.isArray(cvData.tags)) {
    cvData.tags.forEach(tag => {
      if (tag && tag.trim()) {
        // Convert existing tags to lowercase and add if not already categorized
        const cleanTag = tag.trim().toLowerCase();
        if (cleanTag && !cleanTag.includes(' ')) {
          // If it's a single word, try to categorize it
          normalizedTags.add(`general ${cleanTag}`);
        } else {
          // If it's already formatted or multi-word, add as is
          normalizedTags.add(cleanTag);
        }
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
 * Extracts tags by category from tag array with natural prefix format
 * @param {Array} tags - Array of tags with prefixes like "location jakarta"
 * @param {string} category - Category to filter by (location, skill, etc.)
 * @returns {Array} Tags for the specified category
 */
export function getTagsByCategory(tags, category) {
  if (!Array.isArray(tags)) return [];
  
  const categoryPrefix = category.toLowerCase() + ' ';
  return tags
    .filter(tag => tag.toLowerCase().startsWith(categoryPrefix))
    .map(tag => tag.substring(categoryPrefix.length).trim())
    .filter(tag => tag.length > 0);
}

/**
 * Alternative function to get tags by category directly from CV data
 * @param {Object} cvData - CV data object
 * @param {string} category - Category to extract
 * @returns {Array} Tags for the specified category
 */
export function getTagsByCategoryFromData(cvData, category) {
  const tags = [];
  
  switch (category.toLowerCase()) {
    case 'location':
      if (cvData.currentLocation) tags.push(cvData.currentLocation.toLowerCase());
      break;
      
    case 'country':
      if (cvData.currentCountry) tags.push(cvData.currentCountry.toLowerCase());
      break;
      
    case 'skill':
      if (cvData.hardSkills) {
        cvData.hardSkills.split(',').forEach(skill => {
          const normalizedSkill = skill.trim().toLowerCase();
          if (normalizedSkill) tags.push(normalizedSkill);
        });
      }
      break;
      
    case 'softskill':
      if (cvData.softSkills) {
        cvData.softSkills.split(',').forEach(skill => {
          const normalizedSkill = skill.trim().toLowerCase();
          if (normalizedSkill) tags.push(normalizedSkill);
        });
      }
      break;
      
    case 'experience':
      if (cvData.totalExperienceYears) {
        tags.push(getExperienceRange(cvData.totalExperienceYears).toLowerCase());
      }
      break;
      
    case 'level':
      if (cvData.experienceLevel) tags.push(cvData.experienceLevel.toLowerCase());
      break;
      
    case 'education':
      if (cvData.highestEducation) tags.push(cvData.highestEducation.toLowerCase());
      break;
      
    case 'degree':
      if (cvData.degree) tags.push(cvData.degree.toLowerCase());
      break;
      
    case 'industry':
      if (cvData.industryExperience) {
        cvData.industryExperience.split(',').forEach(industry => {
          const normalizedIndustry = industry.trim().toLowerCase();
          if (normalizedIndustry) tags.push(normalizedIndustry);
        });
      }
      break;
      
    case 'worktype':
      if (cvData.remoteWorkPreference) tags.push(cvData.remoteWorkPreference.toLowerCase());
      break;
      
    case 'salary':
      if (cvData.expectedSalary) tags.push(cvData.expectedSalary.toLowerCase());
      if (cvData.currentSalary) tags.push(cvData.currentSalary.toLowerCase());
      break;
      
    case 'language':
      if (cvData.languages) {
        cvData.languages.split(',').forEach(lang => {
          const normalizedLang = lang.trim().toLowerCase();
          if (normalizedLang) tags.push(normalizedLang);
        });
      }
      break;
      
    case 'certification':
      if (cvData.certifications) {
        cvData.certifications.split(',').forEach(cert => {
          const normalizedCert = cert.trim().toLowerCase();
          if (normalizedCert) tags.push(normalizedCert);
        });
      }
      break;
  }
  
  return tags;
}

/**
 * Creates search filters from tags array with natural prefix format
 * @param {Array} tags - Array of tags with prefixes like "location jakarta"
 * @returns {Object} Search filters object
 */
export function createSearchFilters(tags) {
  return {
    locations: getTagsByCategory(tags, 'location'),
    countries: getTagsByCategory(tags, 'country'),
    skills: getTagsByCategory(tags, 'skill'),
    softSkills: getTagsByCategory(tags, 'softskill'),
    industries: getTagsByCategory(tags, 'industry'),
    educationLevels: getTagsByCategory(tags, 'education'),
    degrees: getTagsByCategory(tags, 'degree'),
    experienceLevels: getTagsByCategory(tags, 'level'),
    experienceRanges: getTagsByCategory(tags, 'experience'),
    workTypes: getTagsByCategory(tags, 'worktype'),
    salaryRanges: getTagsByCategory(tags, 'salary'),
    languages: getTagsByCategory(tags, 'language'),
    certifications: getTagsByCategory(tags, 'certification'),
    genders: getTagsByCategory(tags, 'gender'),
    nationalities: getTagsByCategory(tags, 'nationality'),
    availabilities: getTagsByCategory(tags, 'availability'),
    general: getTagsByCategory(tags, 'general')
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
 * @returns {Array} Suggested additional tags with natural prefix format
 */
export function generateSmartTagSuggestions(cvData) {
  const suggestions = [];

  // Suggest location region tags
  if (cvData.currentCountry?.toLowerCase() === 'indonesia' && cvData.currentLocation) {
    suggestions.push('region southeast asia');
    suggestions.push('market asean');
  }

  // Suggest technology stack tags
  if (cvData.hardSkills) {
    const skills = cvData.hardSkills.toLowerCase();
    if (skills.includes('react') && skills.includes('node')) {
      suggestions.push('stack fullstack javascript');
      suggestions.push('specialization full stack developer');
    }
    if (skills.includes('aws') || skills.includes('azure') || skills.includes('gcp')) {
      suggestions.push('specialization cloud computing');
    }
    if (skills.includes('docker') && skills.includes('kubernetes')) {
      suggestions.push('specialization devops');
    }
    if (skills.includes('react') || skills.includes('vue') || skills.includes('angular')) {
      suggestions.push('role frontend developer');
    }
    if (skills.includes('node') || skills.includes('express') || skills.includes('django')) {
      suggestions.push('role backend developer');
    }
  }

  // Suggest career progression tags
  if (cvData.workExperience && cvData.workExperience.length > 2) {
    const positions = cvData.workExperience.map(exp => exp.position?.toLowerCase() || '');
    if (positions.some(pos => pos.includes('senior') || pos.includes('lead'))) {
      suggestions.push('career progressive growth');
    }
  }

  // Suggest mobility tags
  if (cvData.willingToRelocate) {
    suggestions.push('mobility flexible location');
  }

  if (cvData.remoteWorkPreference?.toLowerCase() === 'remote') {
    suggestions.push('preference remote ready');
  }

  // Suggest experience level tags based on years
  if (cvData.totalExperienceYears >= 8) {
    suggestions.push('level expert');
  }

  // Suggest management tags
  if (cvData.managementExperience) {
    suggestions.push('experience management');
    suggestions.push('skill leadership');
  }

  // Suggest startup tags based on company names
  if (cvData.workExperience) {
    const hasStartupExp = cvData.workExperience.some(exp => 
      exp.companySize?.toLowerCase().includes('startup') ||
      exp.company?.toLowerCase().includes('startup')
    );
    if (hasStartupExp) {
      suggestions.push('experience startup');
    }
  }

  // Suggest education prestige tags
  if (cvData.education) {
    const prestigiousInstitutions = ['ui', 'itb', 'ugm', 'its', 'unpad', 'undip'];
    const hasPrestigiousEdu = cvData.education.some(edu =>
      prestigiousInstitutions.some(inst => 
        edu.institution?.toLowerCase().includes(inst)
      )
    );
    if (hasPrestigiousEdu) {
      suggestions.push('education top university');
    }
  }

  // Suggest age range tags
  if (cvData.age) {
    if (cvData.age <= 25) {
      suggestions.push('age young professional');
    } else if (cvData.age <= 35) {
      suggestions.push('age mid career');
    } else {
      suggestions.push('age senior professional');
    }
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

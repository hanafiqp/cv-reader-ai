/**
 * Example usage of CV Tag System
 * Demonstrasi cara menggunakan sistem tagging untuk filtering CV
 */

// Import tag manager
import tagManager from '../utils/tagManager.js';

// ========== CONTOH DATA CV YANG SUDAH DI-EXTRACT ==========
const sampleCVData = {
  firstName: "Budi",
  lastName: "Santoso", 
  currentLocation: "Jakarta",
  currentCountry: "Indonesia",
  totalExperienceYears: 5,
  experienceLevel: "Senior",
  hardSkills: "JavaScript, React, Node.js, AWS, Docker",
  industryExperience: "Technology, Fintech",
  remoteWorkPreference: "Hybrid",
  expectedSalary: "15-20M IDR",
  highestEducation: "Bachelor",
  degree: "Computer Science",
  languages: "Indonesian Native, English Fluent",
  willingToRelocate: true,
  tags: [
    "Jakarta",
    "5+ years experience", 
    "JavaScript Expert",
    "AWS Certified",
    "Full Stack Developer"
  ]
};

// ========== CONTOH PENGGUNAAN TAG MANAGER ==========

console.log("=== CV TAG SYSTEM DEMO ===\n");

// 1. Normalize tags dari CV data
console.log("1. NORMALIZED TAGS:");
const normalizedTags = tagManager.normalizeTags(sampleCVData);
console.log(normalizedTags);
// Expected output: ["Jakarta", "Indonesia", "5-7 years", "Senior", "JavaScript", "React", "Node.js", "AWS", "Docker"]
console.log();

// 2. Generate smart tag suggestions
console.log("2. SMART TAG SUGGESTIONS:");
const smartTags = tagManager.generateSmartTagSuggestions(sampleCVData);
console.log(smartTags);
console.log();

// 3. Validate CV data untuk tagging
console.log("3. CV DATA VALIDATION:");
const validation = tagManager.validateCVDataForTagging(sampleCVData);
console.log(`Completeness Score: ${validation.completenessScore}%`);
console.log(`Is Complete: ${validation.isComplete}`);
if (validation.missing.length > 0) {
  console.log("Missing Fields:", validation.missing);
  console.log("Suggestions:", validation.suggestions);
}
console.log();

// 4. Create search filters
const allTags = [...sampleCVData.tags, ...normalizedTags, ...smartTags];
const uniqueTags = [...new Set(allTags)];
console.log("4. ALL UNIQUE TAGS:");
console.log(uniqueTags);
// Expected output: ["Jakarta", "5+ years experience", "JavaScript", "React", "AWS Certified", "Full Stack Developer", "Indonesia", "5-7 years", "Senior", "Node.js", "AWS", "Docker", "Southeast Asia", "Full Stack JavaScript", "Cloud Computing"]
console.log();

console.log("5. SEARCH FILTERS:");
const searchFilters = tagManager.createSearchFilters(sampleCVData);
console.log(searchFilters);
console.log();

// ========== CONTOH FILTERING CV ==========

// Simulasi database CV (dalam aplikasi nyata ini dari database)
const cvDatabase = [
  {
    id: 1,
    name: "Budi Santoso",
    tags: ["Jakarta", "5-7 years", "Senior", "JavaScript", "React", "Technology", "Full Stack"]
  },
  {
    id: 2,
    name: "Sari Dewi", 
    tags: ["Bandung", "3-5 years", "Mid-Level", "Python", "Django", "Healthcare", "Backend"]
  },
  {
    id: 3,
    name: "Ahmad Yusuf",
    tags: ["Surabaya", "1-2 years", "Junior", "JavaScript", "Vue", "E-commerce", "Frontend"]
  }
];

// Function untuk filter CV berdasarkan tags
function filterCVsByTags(database, filterTags) {
  return database.filter(cv => {
    return filterTags.some(filterTag => 
      cv.tags.some(cvTag => 
        cvTag.toLowerCase().includes(filterTag.toLowerCase())
      )
    );
  });
}

// Contoh filtering
console.log("6. FILTERING EXAMPLES:");

console.log("Filter by Location (Jakarta):");
const jakartaResults = filterCVsByTags(cvDatabase, ["Jakarta"]);
console.log(jakartaResults.map(cv => cv.name));

console.log("\\nFilter by Experience (5+ years):");
const seniorResults = filterCVsByTags(cvDatabase, ["5-7 years", "Senior"]);
console.log(seniorResults.map(cv => cv.name));

console.log("\\nFilter by Skill (JavaScript):");
const jsResults = filterCVsByTags(cvDatabase, ["JavaScript"]);
console.log(jsResults.map(cv => cv.name));

console.log("\\nFilter by Industry (Technology):");
const techResults = filterCVsByTags(cvDatabase, ["Technology"]);
console.log(techResults.map(cv => cv.name));

// ========== CONTOH ADVANCED SEARCH ==========
console.log("\\n7. ADVANCED SEARCH EXAMPLE:");

function advancedCVSearch(database, criteria) {
  return database.filter(cv => {
    let matches = 0;
    let totalCriteria = 0;

    // Check location criteria
    if (criteria.locations && criteria.locations.length > 0) {
      totalCriteria++;
      if (criteria.locations.some(loc => 
          cv.tags.some(tag => tag.toLowerCase().includes(loc.toLowerCase()))
        )) {
        matches++;
      }
    }

    // Check experience criteria
    if (criteria.experienceYears && criteria.experienceYears.length > 0) {
      totalCriteria++;
      if (criteria.experienceYears.some(exp => 
          cv.tags.some(tag => tag.includes(exp))
        )) {
        matches++;
      }
    }

    // Check skill criteria
    if (criteria.skills && criteria.skills.length > 0) {
      totalCriteria++;
      if (criteria.skills.some(skill => 
          cv.tags.some(tag => tag.toLowerCase().includes(skill.toLowerCase()))
        )) {
        matches++;
      }
    }

    // Return true if meets minimum match percentage
    const matchPercentage = totalCriteria > 0 ? (matches / totalCriteria) * 100 : 0;
    return matchPercentage >= (criteria.minMatchPercentage || 50);
  });
}

const searchCriteria = {
  locations: ["Jakarta", "Bandung"],
  experienceYears: ["3-5 years", "5-7 years"], 
  skills: ["JavaScript", "Python"],
  minMatchPercentage: 60
};

const advancedResults = advancedCVSearch(cvDatabase, searchCriteria);
console.log("Advanced Search Results (60% match):");
console.log(advancedResults.map(cv => ({ name: cv.name, tags: cv.tags })));

// ========== EXPORT UNTUK TESTING ==========
export {
  sampleCVData,
  filterCVsByTags,
  advancedCVSearch
};

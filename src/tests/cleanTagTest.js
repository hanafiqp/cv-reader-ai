/**
 * Test Natural Prefix Tag System
 * Test untuk memastikan tags menggunakan prefix natural seperti "location jakarta", "skill react"
 */

import tagManager from '../utils/tagManager.js';

// Sample CV data for testing
const testCVData = {
  firstName: "John",
  lastName: "Doe",
  currentLocation: "Jakarta",
  currentCountry: "Indonesia", 
  totalExperienceYears: 5,
  experienceLevel: "Senior",
  hardSkills: "JavaScript, React, Node.js, AWS, Docker",
  softSkills: "Leadership, Communication, Problem Solving",
  industryExperience: "Technology, Fintech",
  remoteWorkPreference: "Hybrid",
  expectedSalary: "15-20M IDR",
  highestEducation: "Bachelor",
  degree: "Computer Science",
  languages: "Indonesian Native, English Fluent",
  certifications: "AWS Solutions Architect, Scrum Master",
  gender: "Male",
  nationality: "Indonesian",
  willingToRelocate: true,
  managementExperience: true,
  tags: [
    "Full Stack Developer",
    "Team Lead",
    "5+ years experience"
  ]
};

console.log("=== NATURAL PREFIX TAG SYSTEM TEST ===\n");

// Test 1: Normalized Tags (should have natural prefixes)
console.log("1. NORMALIZED TAGS (With Natural Prefixes):");
const normalizedTags = tagManager.normalizeTags(testCVData);
console.log(normalizedTags);

// Check if tags have proper natural prefixes
const hasNaturalPrefix = normalizedTags.some(tag => 
  tag.startsWith('location ') || 
  tag.startsWith('skill ') || 
  tag.startsWith('country ') ||
  tag.startsWith('experience ')
);

console.log(`Contains natural prefixes: ${hasNaturalPrefix ? 'YES ✅' : 'NO ❌'}`);
console.log();

// Test 2: Smart Tag Suggestions (should have natural prefixes)
console.log("2. SMART TAG SUGGESTIONS (Natural Prefixes):");
const smartTags = tagManager.generateSmartTagSuggestions(testCVData);
console.log(smartTags);

const smartTagsHaveNaturalPrefix = smartTags.some(tag => 
  tag.includes(' ') && 
  (tag.startsWith('region ') || 
   tag.startsWith('stack ') || 
   tag.startsWith('specialization ') ||
   tag.startsWith('role '))
);
console.log(`Smart tags have natural prefixes: ${smartTagsHaveNaturalPrefix ? 'YES ✅' : 'NO ❌'}`);
console.log();

// Test 3: Search Filters by Category
const allTags = [
  ...(testCVData.tags || []),
  ...normalizedTags,
  ...smartTags
];
const uniqueTags = [...new Set(allTags)].filter(tag => tag && tag.trim()).sort();

console.log("3. ALL COMBINED TAGS:");
console.log(uniqueTags);
console.log();

console.log("4. SEARCH FILTERS BY CATEGORY:");
const searchFilters = tagManager.createSearchFilters(uniqueTags);
console.log("Locations:", searchFilters.locations);
console.log("Countries:", searchFilters.countries);
console.log("Skills:", searchFilters.skills);
console.log("Soft Skills:", searchFilters.softSkills);
console.log("Industries:", searchFilters.industries);
console.log("Work Types:", searchFilters.workTypes);
console.log("Languages:", searchFilters.languages);
console.log("Certifications:", searchFilters.certifications);
console.log("Genders:", searchFilters.genders);
console.log("Nationalities:", searchFilters.nationalities);
console.log();

// Test 4: Filtering Examples dengan Natural Prefix Tags
console.log("5. FILTERING EXAMPLES:");

// Mock CV database with natural prefix tags
const mockCVs = [
  {
    id: 1,
    name: "Alice", 
    tags: ["location jakarta", "level senior", "skill react", "experience 5-7 years", "role frontend developer"]
  },
  {
    id: 2,
    name: "Bob",
    tags: ["location bandung", "level mid-level", "skill node.js", "experience 3-5 years", "role backend developer"] 
  },
  {
    id: 3,
    name: "Charlie",
    tags: ["location jakarta", "level senior", "skill javascript", "skill react", "experience 5-7 years", "role full stack developer"]
  }
];

// Advanced filter function with natural prefixes
function naturalPrefixFilter(cvs, filterCriteria) {
  return cvs.filter(cv => {
    let matchCount = 0;
    let totalCriteria = 0;

    // Filter by location
    if (filterCriteria.location) {
      totalCriteria++;
      if (cv.tags.some(tag => tag === `location ${filterCriteria.location.toLowerCase()}`)) {
        matchCount++;
      }
    }

    // Filter by skill
    if (filterCriteria.skill) {
      totalCriteria++;
      if (cv.tags.some(tag => tag === `skill ${filterCriteria.skill.toLowerCase()}`)) {
        matchCount++;
      }
    }

    // Filter by level
    if (filterCriteria.level) {
      totalCriteria++;
      if (cv.tags.some(tag => tag === `level ${filterCriteria.level.toLowerCase()}`)) {
        matchCount++;
      }
    }

    // Filter by experience range
    if (filterCriteria.experience) {
      totalCriteria++;
      if (cv.tags.some(tag => tag === `experience ${filterCriteria.experience.toLowerCase()}`)) {
        matchCount++;
      }
    }

    // Return true if matches at least the minimum percentage
    const matchPercentage = totalCriteria > 0 ? (matchCount / totalCriteria) * 100 : 0;
    return matchPercentage >= (filterCriteria.minMatch || 50);
  });
}

// Test filtering dengan natural prefix
console.log("Filter by location 'Jakarta':");
const jakartaResults = naturalPrefixFilter(mockCVs, { location: "Jakarta" });
console.log(jakartaResults.map(cv => cv.name));

console.log("\\nFilter by skill 'React':");
const reactResults = naturalPrefixFilter(mockCVs, { skill: "React" });
console.log(reactResults.map(cv => cv.name));

console.log("\\nFilter by level 'Senior':");
const seniorResults = naturalPrefixFilter(mockCVs, { level: "Senior" });
console.log(seniorResults.map(cv => cv.name));

console.log("\\nAdvanced Multi-criteria Filter:");
const advancedResults = naturalPrefixFilter(mockCVs, {
  location: "Jakarta",
  skill: "React",
  level: "Senior",
  minMatch: 66 // at least 2 out of 3 criteria must match
});
console.log(advancedResults.map(cv => ({ name: cv.name, tags: cv.tags })));

console.log("\\n=== NATURAL PREFIX TAG SYSTEM TEST COMPLETED ===");

export { testCVData, uniqueTags };

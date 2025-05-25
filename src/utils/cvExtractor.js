/**
 * Advanced CV Data Extraction System
 * Mimics AI-like extraction without external APIs
 */

// Multi-language section headers
const SECTIONS = {
  // Education section identifiers
  EDUCATION: [
    // English
    'education', 'academic background', 'qualification', 'educational background',
    'academic qualification', 'studies', 'academic history',
    // Bahasa Indonesia
    'pendidikan', 'riwayat pendidikan', 'latar belakang pendidikan',
    'kualifikasi pendidikan', 'sejarah pendidikan', 'jenjang pendidikan'
  ],
  
  // Work experience section identifiers
  EXPERIENCE: [
    // English
    'experience', 'work experience', 'employment history', 'professional experience',
    'career history', 'work history', 'professional background',
    // Bahasa Indonesia
    'pengalaman', 'pengalaman kerja', 'riwayat pekerjaan', 'pengalaman profesional',
    'riwayat karir', 'sejarah pekerjaan', 'karir'
  ],
  
  // Skills section identifiers
  SKILLS: [
    // English
    'skills', 'key skills', 'technical skills', 'competencies', 'core competencies',
    'expertise', 'proficiencies', 'abilities',
    // Bahasa Indonesia
    'keahlian', 'keterampilan', 'kemampuan', 'kompetensi', 'keahlian teknis',
    'kecakapan', 'ketrampilan', 'kapabilitas', 'kompetensi inti'
  ]
};

// Detect the most likely language
function detectLanguage(text) {
  // Simple language detection based on common words
  const indonesianWords = ['dan', 'yang', 'dengan', 'untuk', 'dari', 'pada', 'adalah', 'ini', 'oleh', 'saya'];
  const englishWords = ['and', 'the', 'that', 'with', 'for', 'from', 'this', 'by', 'was', 'have'];
  
  const words = text.toLowerCase().split(/\s+/);
  
  let indonesianCount = 0;
  let englishCount = 0;
  
  words.forEach(word => {
    if (indonesianWords.includes(word)) indonesianCount++;
    if (englishWords.includes(word)) englishCount++;
  });
  
  return indonesianCount > englishCount ? 'id' : 'en';
}

// Extract email addresses
function extractEmails(text) {
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  return text.match(emailRegex) || [];
}

// Extract phone numbers (handles international formats)
function extractPhoneNumbers(text) {
  // Multiple patterns to catch different phone formats
  const phonePatterns = [
    /(\+?\d{1,3})?[\s.-]?\(?\d{2,4}\)?[\s.-]?\d{3,4}[\s.-]?\d{3,4}/g,  // International
    /\b\d{4}[\s.-]?\d{4}[\s.-]?\d{4}\b/g,  // Indonesian format
    /\b\d{3}[\s.-]?\d{3,4}[\s.-]?\d{4}\b/g,  // US-like format
    /\(\d{2,4}\)[\s.-]?\d{3,4}[\s.-]?\d{3,4}/g  // (123) 456-7890 format
  ];
  
  let matches = [];
  for (const pattern of phonePatterns) {
    const found = text.match(pattern);
    if (found) matches = [...matches, ...found];
  }
  
  // Remove duplicates and filter out likely dates
  return [...new Set(matches)].filter(phone => {
    // Filter out things that look like dates (e.g. 2022-2023)
    return !phone.match(/\b(19|20)\d{2}\b/);
  });
}

// Identify name from the CV
function extractName(text, mainLanguage) {
  // Strategy: Names typically appear at the top of the CV
  // Get first few non-empty lines
  const lines = text.split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .slice(0, 5);  // Consider first 5 lines
  
  for (const line of lines) {
    // Skip lines that look like contact info
    if (line.includes('@') || line.match(/\d{3,}/)) continue;
    
    // Skip lines that are too long (likely not a name)
    if (line.length > 40) continue;
    
    // Skip lines that look like headers/titles
    if (line.toUpperCase() === line && line.length > 15) continue;
    
    // Skip lines with header-like keywords
    const headerWords = ['resume', 'cv', 'curriculum', 'vitae', 'profile', 'biodata'];
    if (headerWords.some(word => line.toLowerCase().includes(word))) continue;
    
    // What remains is likely a name
    return line;
  }
  
  return null;
}

// Extract education history
function extractEducation(text, mainLanguage) {
  // Get education section text
  const educationSection = extractSection(text, SECTIONS.EDUCATION);
  if (!educationSection) return null;
  
  // Parse education entries
  const entries = [];
  
  // Split by likely entry delimiters (years are good separators in education sections)
  const possibleEntries = educationSection.split(/\n(?=\d{4}|19\d{2}|20\d{2})/g);
  
  possibleEntries.forEach(entry => {
    // Skip entries that are too short
    if (entry.length < 10) return;
    
    const yearMatch = entry.match(/(19|20)\d{2}(\s*-\s*(19|20)\d{2}|\s*-\s*present|\s*-\s*now|\s*-\s*sekarang)?/i);
    const years = yearMatch ? yearMatch[0] : null;
    
    // Look for degree/qualification
    const degreeTerms = {
      en: ['bachelor', 'master', 'phd', 'diploma', 'certificate', 'degree'],
      id: ['sarjana', 'magister', 'doktor', 'diploma', 'sertifikat', 'gelar', 's1', 's2', 's3']
    };
    
    let degree = null;
    const terms = [...degreeTerms.en, ...degreeTerms.id];
    for (const term of terms) {
      const regex = new RegExp(`\\b${term}\\w*\\b`, 'i');
      const match = entry.match(regex);
      if (match) {
        degree = match[0];
        break;
      }
    }
    
    // Look for institution (usually contains "university", "school", etc.)
    const institutionTerms = {
      en: ['university', 'college', 'institute', 'school', 'academy'],
      id: ['universitas', 'perguruan tinggi', 'institut', 'sekolah', 'akademi']
    };
    
    let institution = null;
    const iTerms = [...institutionTerms.en, ...institutionTerms.id];
    for (const term of iTerms) {
      const regex = new RegExp(`\\b\\w*\\s${term}\\s+\\w[\\w\\s]{2,30}`, 'i');
      const match = entry.match(regex);
      if (match) {
        institution = match[0].trim();
        break;
      }
    }
    
    if (!institution) {
      // Alternative approach: look for capitalized words that might be institution names
      const capitalizedPattern = /([A-Z][a-z]{1,20}\s){1,4}(University|College|Institute|School|Universitas|Institut|Sekolah)/g;
      const capitalMatch = entry.match(capitalizedPattern);
      if (capitalMatch) {
        institution = capitalMatch[0].trim();
      }
    }
    
    // Only add if we have some meaningful data
    if (years || degree || institution) {
      entries.push({
        year: years,
        degree: degree,
        institution: institution,
        raw: entry.trim()
      });
    }
  });
  
  return entries.length > 0 ? entries : educationSection;
}

// Extract work experience
function extractWorkExperience(text, mainLanguage) {
  // Get work experience section text
  const experienceSection = extractSection(text, SECTIONS.EXPERIENCE);
  if (!experienceSection) return null;
  
  // Parse work entries (similar approach to education)
  const entries = [];
  
  // Split by likely entry delimiters (dates/years are good separators)
  const possibleEntries = experienceSection.split(/\n(?=\d{4}|19\d{2}|20\d{2}|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)/gi);
  
  possibleEntries.forEach(entry => {
    // Skip entries that are too short
    if (entry.length < 15) return;
    
    const dateMatch = entry.match(/(19|20)\d{2}(\s*-\s*(19|20)\d{2}|\s*-\s*present|\s*-\s*now|\s*-\s*sekarang|\s*-\s*current)?/i);
    const dates = dateMatch ? dateMatch[0] : null;
    
    // Look for company/organization names (often capitalized)
    const companyPattern = /([A-Z][a-zA-Z]*\s){1,3}(inc|ltd|llc|pt|cv|corp|corporation|company|perusahaan)?/i;
    const companyMatch = entry.match(companyPattern);
    const company = companyMatch ? companyMatch[0].trim() : null;
    
    // Look for job title (often at the beginning of entry or after the date)
    let jobTitle = null;
    const titlePattern = /(developer|engineer|manager|director|analyst|consultant|designer|specialist|staff|coordinator|lead|head|officer)/i;
    const titleMatch = entry.match(titlePattern);
    if (titleMatch) {
      // Get the surrounding context for the job title
      const titleIdx = entry.indexOf(titleMatch[0]);
      const startIdx = Math.max(0, titleIdx - 20);
      const endIdx = Math.min(entry.length, titleIdx + 30);
      jobTitle = entry.substring(startIdx, endIdx).trim();
    }
    
    // Only add if we have some meaningful data
    if (dates || company || jobTitle) {
      entries.push({
        dates: dates,
        company: company,
        jobTitle: jobTitle,
        raw: entry.trim()
      });
    }
  });
  
  return entries.length > 0 ? entries : experienceSection;
}

// Extract skills
function extractSkills(text, mainLanguage) {
  // Get skills section text
  const skillsSection = extractSection(text, SECTIONS.SKILLS);
  if (!skillsSection) return null;
  
  // Common skill keywords
  const techSkills = [
    // Programming languages
    'java', 'python', 'javascript', 'typescript', 'c\\+\\+', 'c#', 'ruby', 'php', 'swift', 'kotlin',
    // Frameworks and libraries
    'react', 'angular', 'vue', 'django', 'flask', 'spring', 'node', 'express', 'laravel',
    // Databases
    'sql', 'mysql', 'postgresql', 'mongodb', 'oracle', 'redis', 'firebase',
    // Tools and platforms
    'git', 'docker', 'kubernetes', 'aws', 'azure', 'gcp', 'jenkins', 'travis', 'jira'
  ];
  
  // Soft skills
  const softSkills = [
    // English
    'communication', 'leadership', 'teamwork', 'problem.solving', 'time.management',
    'critical.thinking', 'adaptability', 'creativity',
    // Bahasa Indonesia
    'komunikasi', 'kepemimpinan', 'kerja.sama', 'pemecahan.masalah', 'manajemen.waktu',
    'berpikir.kritis', 'adaptasi', 'kreativitas'
  ];
  
  const allSkills = [...techSkills, ...softSkills];
  
  // Extract skills
  let foundSkills = [];
  
  // Method 1: Look for comma/bullet separated lists
  const listItems = skillsSection.split(/[,•\n\-]+/);
  listItems.forEach(item => {
    const cleanItem = item.trim().toLowerCase();
    if (cleanItem.length >= 3 && cleanItem.length <= 30) {
      foundSkills.push(cleanItem);
    }
  });
  
  // Method 2: Look for known skill keywords
  allSkills.forEach(skill => {
    const regex = new RegExp(`\\b${skill}\\b`, 'i');
    if (skillsSection.match(regex)) {
      // Don't add duplicates
      if (!foundSkills.some(s => s.toLowerCase().includes(skill.toLowerCase()))) {
        foundSkills.push(skill.replace(/\\/g, ''));
      }
    }
  });
  
  return foundSkills.length > 0 ? foundSkills : skillsSection;
}

// Helper function to extract a section from the CV text
function extractSection(text, sectionKeywords) {
  // Normalize text: convert to lowercase, remove extra spaces
  const normalizedText = text.replace(/\s+/g, ' ');
  
  // Try each section keyword
  for (const keyword of sectionKeywords) {
    // Create regex pattern that's case-insensitive and handles different formats
    // (e.g., "EDUCATION", "Education:", "PENDIDIKAN", etc.)
    const regex = new RegExp(`(^|\\n)\\s*${keyword}s?[:\\s]*\\n?`, 'i');
    const match = text.match(regex);
    
    if (match) {
      const startIndex = match.index + match[0].length;
      
      // Find the next section header
      let endIndex = text.length;
      for (const sectionType of Object.values(SECTIONS)) {
        for (const nextKeyword of sectionType) {
          // Don't match the current keyword again
          if (nextKeyword === keyword) continue;
          
          const nextRegex = new RegExp(`(^|\\n)\\s*${nextKeyword}s?[:\\s]*\\n?`, 'i');
          const nextMatch = text.slice(startIndex).match(nextRegex);
          
          if (nextMatch) {
            const potentialEndIndex = startIndex + nextMatch.index;
            if (potentialEndIndex < endIndex) {
              endIndex = potentialEndIndex;
            }
          }
        }
      }
      
      // Extract the section text
      return text.slice(startIndex, endIndex).trim();
    }
  }
  
  return null;
}

// Extract salary expectations or requirements
function extractSalary(text) {
  const salaryPatterns = [
    // English patterns
    /salary[^\n.]*?((\$|USD|IDR|Rp\.?)\s*\d{1,3}(,\d{3})*(\.\d+)?)/i,
    /expected salary[^\n.]*?((\$|USD|IDR|Rp\.?)\s*\d{1,3}(,\d{3})*(\.\d+)?)/i,
    /salary expectation[^\n.]*?((\$|USD|IDR|Rp\.?)\s*\d{1,3}(,\d{3})*(\.\d+)?)/i,
    
    // Bahasa Indonesia patterns
    /gaji[^\n.]*?((\$|USD|IDR|Rp\.?)\s*\d{1,3}(,\d{3})*(\.\d+)?)/i,
    /ekspektasi gaji[^\n.]*?((\$|USD|IDR|Rp\.?)\s*\d{1,3}(,\d{3})*(\.\d+)?)/i,
  ];
  
  for (const pattern of salaryPatterns) {
    const match = text.match(pattern);
    if (match) {
      return match[0];
    }
  }
  
  return null;
}

// Extract location/address
function extractLocation(text) {
  // Look for address-like patterns
  const addressPattern = /(?:Address|Alamat|Location|Lokasi)[^\n]*?[\n:](.*?)(?:\n\n|\n[A-Z])/is;
  const addressMatch = text.match(addressPattern);
  if (addressMatch) return addressMatch[1].trim();
  
  // Look for city names
  const cities = [
    // Indonesian cities
    'Jakarta', 'Surabaya', 'Bandung', 'Medan', 'Semarang', 'Makassar', 'Yogyakarta', 'Depok', 
    'Tangerang', 'Bekasi', 'Batam', 'Bogor', 'Palembang', 'Balikpapan', 'Malang',
    // International cities
    'Singapore', 'Kuala Lumpur', 'Bangkok', 'Tokyo', 'Sydney', 'New York', 'London', 'San Francisco'
  ];
  
  for (const city of cities) {
    if (text.includes(city)) {
      // Find the containing line
      const lines = text.split('\n');
      for (const line of lines) {
        if (line.includes(city)) {
          return line.trim();
        }
      }
      return city;
    }
  }
  
  return null;
}

/**
 * Main extraction function that processes a CV
 */
export function extractCVData(text) {
  // Pre-process the text: clean up whitespace, etc.
  const cleanedText = text
    .replace(/\r\n/g, '\n')               // Normalize line breaks
    .replace(/\n{3,}/g, '\n\n')           // Normalize multiple newlines
    .replace(/(\w)[-_](\w)/g, '$1 $2')    // Fix words broken by OCR
    .replace(/(\w)\.(\w)/g, '$1. $2');    // Fix missing spaces after periods
  
  // Detect the primary language
  const mainLanguage = detectLanguage(cleanedText);
  
  // Extract data using multiple methods
  const emails = extractEmails(cleanedText);
  const phones = extractPhoneNumbers(cleanedText);
  const name = extractName(cleanedText, mainLanguage);
  const education = extractEducation(cleanedText, mainLanguage);
  const experience = extractWorkExperience(cleanedText, mainLanguage);
  const skills = extractSkills(cleanedText, mainLanguage);
  const salary = extractSalary(cleanedText);
  const location = extractLocation(cleanedText);
  
  return {
    name,
    email: emails.length > 0 ? emails[0] : null,
    allEmails: emails.length > 0 ? emails : null,
    phone: phones.length > 0 ? phones[0] : null,
    allPhones: phones.length > 0 ? phones : null,
    location,
    education,
    experience,
    skills,
    salary,
    detectedLanguage: mainLanguage
  };
}
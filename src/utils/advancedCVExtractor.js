/**
 * Advanced CV Data Extraction System
 * Handles multiple formats, languages, and provides robust extraction
 */

// ========== LANGUAGE DETECTION ==========
const LANGUAGE_MARKERS = {
  EN: ['experience', 'education', 'skills', 'work', 'profile', 'summary', 'achievements', 'professional', 'contact', 'references'],
  ID: ['pengalaman', 'pendidikan', 'keahlian', 'kerja', 'profil', 'ringkasan', 'prestasi', 'profesional', 'kontak', 'referensi']
};

// ========== SECTION HEADERS ==========
const SECTION_HEADERS = {
  CONTACT: {
    EN: ['contact', 'personal information', 'contact details', 'personal details', 'contact information'],
    ID: ['kontak', 'informasi pribadi', 'detail kontak', 'data pribadi', 'informasi kontak']
  },
  PROFILE: {
    EN: ['profile', 'summary', 'professional summary', 'career objective', 'about me', 'personal profile'],
    ID: ['profil', 'ringkasan', 'ringkasan profesional', 'tujuan karir', 'tentang saya', 'profil pribadi']
  },
  EXPERIENCE: {
    EN: ['experience', 'work experience', 'employment history', 'professional experience', 'career history', 'work history'],
    ID: ['pengalaman', 'pengalaman kerja', 'riwayat pekerjaan', 'pengalaman profesional', 'riwayat karir', 'sejarah pekerjaan']
  },
  EDUCATION: {
    EN: ['education', 'education level', 'academic background', 'qualifications', 'academic qualifications', 'educational background'],
    ID: ['pendidikan', 'tingkat pendidikan', 'latar belakang akademis', 'kualifikasi', 'kualifikasi akademis', 'latar belakang pendidikan']
  },
  SKILLS: {
    EN: ['skills', 'key skills', 'technical skills', 'competencies', 'core competencies', 'professional skills', 'hard skills', 'soft skills'],
    ID: ['keahlian', 'keterampilan', 'kemampuan', 'kompetensi', 'keahlian teknis', 'keahlian profesional', 'keahlian keras', 'keahlian lunak']
  },
  ACHIEVEMENTS: {
    EN: ['achievements', 'awards', 'honors', 'certifications', 'accomplishments'],
    ID: ['prestasi', 'penghargaan', 'kehormatan', 'sertifikasi', 'pencapaian']
  },
  LANGUAGES: {
    EN: ['languages', 'language proficiency', 'language skills'],
    ID: ['bahasa', 'kemampuan bahasa', 'keahlian bahasa']
  },
  INTERESTS: {
    EN: ['interests', 'hobbies', 'activities', 'personal interests'],
    ID: ['minat', 'hobi', 'kegiatan', 'minat pribadi']
  },
  ORGANIZATIONS: {
    EN: ['organizations', 'organizational experience', 'professional memberships', 'affiliations', 'volunteer'],
    ID: ['organisasi', 'pengalaman organisasi', 'keanggotaan profesional', 'afiliasi', 'sukarelawan']
  }
};

// ========== UTILITY FUNCTIONS ==========

/**
 * Determines the primary language of the document
 */
function detectLanguage(text) {
  let enScore = 0;
  let idScore = 0;
  
  const lowerText = text.toLowerCase();
  
  // Count occurrences of language markers
  LANGUAGE_MARKERS.EN.forEach(marker => {
    const regex = new RegExp(`\\b${marker}\\b`, 'gi');
    const matches = lowerText.match(regex);
    if (matches) enScore += matches.length;
  });
  
  LANGUAGE_MARKERS.ID.forEach(marker => {
    const regex = new RegExp(`\\b${marker}\\b`, 'gi');
    const matches = lowerText.match(regex);
    if (matches) idScore += matches.length;
  });
  
  // Check for common Indonesian words that are strong indicators
  const idSpecificWords = ['dan', 'yang', 'dengan', 'untuk', 'dari', 'pada', 'adalah', 'ini', 'oleh', 'saya', 'kami', 'kita'];
  idSpecificWords.forEach(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    const matches = lowerText.match(regex);
    if (matches) idScore += matches.length * 0.5; // Give half weight to common words
  });
  
  return enScore > idScore ? 'EN' : 'ID';
}

/**
 * Pre-processes text for better extraction
 */
function preprocessText(text) {
  return text
    .replace(/\r\n/g, '\n')               // Normalize line breaks
    .replace(/\n{3,}/g, '\n\n')           // Normalize multiple newlines
    .replace(/(\w)[-_](\w)/g, '$1 $2')    // Fix words broken by OCR
    .replace(/(\w)\.(\w)/g, '$1. $2');    // Fix missing spaces after periods
}

/**
 * Identifies section boundaries in the text
 */
function identifySections(text, language = 'EN') {
  const sections = {};
  const lines = text.split('\n');
  
  // First pass: identify all section headers and their line numbers
  const sectionPositions = [];
  
  lines.forEach((line, lineIndex) => {
    const cleanLine = line.trim().toLowerCase().replace(/[:_-]+$/, ''); // Remove trailing characters
    
    // Check if line matches any section header
    for (const [sectionKey, langHeaders] of Object.entries(SECTION_HEADERS)) {
      const headers = [...langHeaders.EN, ...langHeaders.ID]; // Check both languages
      
      // For exact matches (e.g., "Education" or "Work Experience")
      if (headers.some(header => cleanLine === header.toLowerCase() || 
                                (cleanLine.includes(header.toLowerCase()) && cleanLine.length < header.length + 10))) {
        sectionPositions.push({
          section: sectionKey,
          line: lineIndex,
          exactMatch: true
        });
        break;
      }
      
      // For lines with headers (e.g., "EDUCATION LEVEL" or "Skills & Qualifications")
      if (headers.some(header => {
        // Support variations like "Education Level", "EDUCATION:", etc.
        const pattern = new RegExp(`\\b${header.toLowerCase()}\\b`, 'i');
        return pattern.test(cleanLine) && cleanLine.length < 50; // Avoid matching in long paragraphs
      })) {
        sectionPositions.push({
          section: sectionKey,
          line: lineIndex,
          exactMatch: false
        });
        break;
      }
    }
  });
  
  // Sort by line number
  sectionPositions.sort((a, b) => a.line - b.line);
  
  // Extract section content
  for (let i = 0; i < sectionPositions.length; i++) {
    const currentSection = sectionPositions[i];
    const nextSection = sectionPositions[i + 1];
    
    const startLine = currentSection.line + 1; // Start from next line
    const endLine = nextSection ? nextSection.line : lines.length;
    
    const sectionContent = lines.slice(startLine, endLine).join('\n').trim();
    sections[currentSection.section] = sectionContent;
  }
  
  // Special case: if no sections found, try to guess main sections
  if (Object.keys(sections).length === 0) {
    console.log("No explicit sections found, trying alternative extraction...");
    
    // Try to identify content based on patterns
    const experienceMatch = text.match(/(?:19|20)\d{2}\s*-\s*(?:19|20)\d{2}|(?:19|20)\d{2}\s*-\s*Present|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{4}/i);
    if (experienceMatch) {
      const experienceContext = extractContextAroundMatch(text, experienceMatch[0], 2000);
      sections.EXPERIENCE = experienceContext;
    }
    
    const educationMatch = text.match(/(?:Bachelor|Master|PhD|Diploma|S1|S2|S3|High School|University|College|Institute)/i);
    if (educationMatch) {
      const educationContext = extractContextAroundMatch(text, educationMatch[0], 1500);
      sections.EDUCATION = educationContext;
    }
    
    const skillsMatch = text.match(/(?:skills|proficient|proficiency|experienced in|expert in|keahlian|keterampilan)/i);
    if (skillsMatch) {
      const skillsContext = extractContextAroundMatch(text, skillsMatch[0], 1000);
      sections.SKILLS = skillsContext;
    }
  }
  
  return sections;
}

/**
 * Extracts context around a matched pattern
 */
function extractContextAroundMatch(text, match, contextSize = 500) {
  const matchIndex = text.indexOf(match);
  if (matchIndex === -1) return '';
  
  const startIndex = Math.max(0, matchIndex - contextSize / 2);
  const endIndex = Math.min(text.length, matchIndex + match.length + contextSize / 2);
  
  return text.substring(startIndex, endIndex);
}

// ========== CONTENT EXTRACTORS ==========

/**
 * Extracts all contact information
 */
function extractContactInfo(text) {
  const result = {
    name: null,
    email: null,
    phone: null,
    location: null,
    websites: [],
    linkedin: null
  };
  
  // Name extraction - first non-empty line is often the name
  const lines = text.split('\n').filter(line => line.trim());
  
  // Check if first line looks like a name (no email, no URLs, not too long)
  if (lines[0] && 
      !lines[0].includes('@') && 
      !lines[0].includes('http') &&
      !lines[0].match(/^\d/) &&
      lines[0].length < 60) {
    result.name = lines[0].trim();
  }
  
  // Email extraction
  const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  if (emailMatch) result.email = emailMatch[0];
  
  // Phone extraction - multiple formats
  const phonePatterns = [
    /(\+?\d{1,3}[-.\s]?)?\(?\d{2,4}\)?[-.\s]?\d{3,4}[-.\s]?\d{3,4}/,  // +62 812 3456 7890
    /(\+?\d{1,3})?[-.\s]?\d{3,4}[-.\s]?\d{3,4}[-.\s]?\d{3,4}/        // +62-812-3456-7890
  ];
  
  for (const pattern of phonePatterns) {
    const phoneMatch = text.match(pattern);
    if (phoneMatch) {
      result.phone = phoneMatch[0].replace(/\s+/g, ' ').trim();
      break;
    }
  }
  
  // Location extraction - look in first 10-15 lines for address-like text
  for (let i = 1; i < Math.min(lines.length, 15); i++) {
    const line = lines[i].trim();
    
    // Skip lines that look like contact info
    if (line.includes('@') || line.match(/https?:\/\//) || line.match(/^\+?\d{1,3}[-\s]?\d/)) continue;
    
    // If line has commas and looks like an address
    if (line.includes(',') && line.length > 10 && line.length < 100) {
      result.location = line;
      break;
    }
    
    // If line contains common location terms
    const locationTerms = ['jalan', 'street', 'avenue', 'city', 'state', 'province', 'country', 'kota', 'provinsi', 'kabupaten'];
    if (locationTerms.some(term => line.toLowerCase().includes(term))) {
      result.location = line;
      break;
    }
    
    // Indonesian cities
    const cities = ['Jakarta', 'Surabaya', 'Bandung', 'Medan', 'Semarang', 'Makassar', 'Yogyakarta', 'Depok', 
                   'Tangerang', 'Bekasi', 'Batam', 'Bogor', 'Palembang', 'Balikpapan', 'Malang'];
    
    if (cities.some(city => line.includes(city))) {
      result.location = line;
      break;
    }
  }
  
  // Website & LinkedIn extraction
  const urlPattern = /https?:\/\/[^\s()<>]+/g;
  const urls = text.match(urlPattern) || [];
  
  urls.forEach(url => {
    if (url.includes('linkedin.com')) {
      result.linkedin = url;
    } else {
      result.websites.push(url);
    }
  });
  
  return result;
}

/**
 * Extracts education information
 */
function extractEducation(educationText) {
  if (!educationText) return null;
  
  const entries = [];
  const lines = educationText.split('\n');
  
  // Pattern 1: "Institution - Location                 Date Range"
  const institutionPattern = /([A-Za-z0-9\s.,&]+)\s*-\s*([A-Za-z0-9\s.,]+)/;
  const datePattern = /((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{4}\s*-\s*(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{4}|(?:19|20)\d{2}\s*-\s*(?:19|20)\d{2}|(?:19|20)\d{2}\s*-\s*(?:Present|Now|Current|Sekarang))/i;
  
  // Look for education entries
  let currentEntry = null;
  let bulletPoints = [];
  let lastInstitutionLine = -1;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    // Check if line contains institution and location
    const institutionMatch = line.match(institutionPattern);
    let dateMatch = line.match(datePattern);
    
    // If no date match in current line, check if it appears at end of line
    if (!dateMatch && i < lines.length - 1) {
      const nextLine = lines[i + 1].trim();
      dateMatch = nextLine.match(datePattern);
      if (dateMatch && nextLine.length < 50) {
        i++; // Skip next line as we've processed it
      } else {
        dateMatch = null; // Reset if it's not a date line
      }
    }
    
    if (institutionMatch) {
      // If we were processing an entry, save it
      if (currentEntry) {
        currentEntry.achievements = bulletPoints.length > 0 ? bulletPoints : null;
        entries.push(currentEntry);
        bulletPoints = [];
      }
      
      // Start a new entry
      currentEntry = {
        institution: institutionMatch[1].trim(),
        location: institutionMatch[2].trim(),
        dates: dateMatch ? dateMatch[1] : null,
        degree: null,
        field: null,
        gpa: null
      };
      
      lastInstitutionLine = i;
    } else if (currentEntry && i === lastInstitutionLine + 1) {
      // Line after institution likely contains degree info
      const degreePattern = /(High School|Bachelor|Master|PhD|S1|S2|S3|Diploma|Sarjana|Magister|Doktor)\s+(in|of|on|untuk)?\s+([^,]+)/i;
      const degreeMatch = line.match(degreePattern);
      
      if (degreeMatch) {
        currentEntry.degree = degreeMatch[1];
        currentEntry.field = degreeMatch[3].trim();
      } else {
        // Try simpler pattern
        const simplePattern = /(High School|Bachelor|Master|PhD|S1|S2|S3|Diploma|Sarjana|Magister|Doktor|[A-Z]{2,5})\s+([^,]+)/i;
        const simpleMatch = line.match(simplePattern);
        
        if (simpleMatch) {
          currentEntry.degree = simpleMatch[1];
          currentEntry.field = simpleMatch[2].trim();
        } else {
          currentEntry.degreeAndField = line; // Store as combined if parsing fails
        }
      }
      
      // Check for GPA/score
      const scorePattern = /(\d+[.,]\d+)\/(\d+[.,]\d+)/;
      const scoreMatch = line.match(scorePattern);
      if (scoreMatch) {
        currentEntry.gpa = scoreMatch[0];
      }
    } else if (currentEntry && (line.startsWith('•') || line.startsWith('-') || line.startsWith('*'))) {
      // This is a bullet point
      bulletPoints.push(line.replace(/^[•\-*]\s*/, '').trim());
    }
  }
  
  // Add the last entry if present
  if (currentEntry) {
    currentEntry.achievements = bulletPoints.length > 0 ? bulletPoints : null;
    entries.push(currentEntry);
  }
  
  // If no structured entries were found, try alternate approach
  if (entries.length === 0) {
    // Look for education keywords and extract surrounding context
    const educationKeywords = ['university', 'college', 'institute', 'school', 'academy', 'universitas', 'sekolah', 'institut'];
    const degreeKeywords = ['bachelor', 'master', 'phd', 'diploma', 's1', 's2', 's3', 'sarjana', 'magister', 'doktor'];
    
    // Find paragraphs containing education information
    const paragraphs = educationText.split('\n\n');
    
    paragraphs.forEach(paragraph => {
      if (educationKeywords.some(keyword => paragraph.toLowerCase().includes(keyword)) ||
          degreeKeywords.some(keyword => paragraph.toLowerCase().includes(keyword))) {
        
        // Look for institution
        let institution = null;
        for (const keyword of educationKeywords) {
          const institutionMatch = paragraph.match(new RegExp(`([A-Z][A-Za-z0-9\\s]+)\\s+${keyword}`, 'i'));
          if (institutionMatch) {
            institution = institutionMatch[1].trim();
            break;
          }
        }
        
        // Look for degree/field
        let degree = null;
        let field = null;
        for (const keyword of degreeKeywords) {
          const degreeMatch = paragraph.match(new RegExp(`${keyword}\\s+(?:of|in|on)?\\s+([A-Za-z\\s]+)`, 'i'));
          if (degreeMatch) {
            degree = keyword;
            field = degreeMatch[1].trim();
            break;
          }
        }
        
        // Look for dates
        const dateMatch = paragraph.match(datePattern);
        const dates = dateMatch ? dateMatch[1] : null;
        
        // Add as an entry if we found something meaningful
        if (institution || degree || dates) {
          entries.push({
            institution,
            degree,
            field,
            dates,
            raw: paragraph
          });
        }
      }
    });
  }
  
  return entries.length > 0 ? entries : educationText;
}

/**
 * Extracts work experience
 */
function extractWorkExperience(experienceText) {
  if (!experienceText) return null;
  
  const entries = [];
  
  // Split into experience blocks (typically separated by company headers)
  // Company headers often follow the pattern: "Company - Location       Date"
  const companyHeaderPattern = /^([A-Za-z0-9\s.,&]+)\s*-\s*([A-Za-z0-9\s.,]+)/m;
  const datePattern = /((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{4}\s*-\s*(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{4}|(?:19|20)\d{2}\s*-\s*(?:19|20)\d{2}|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{4}\s*-\s*(?:Present|Now|Current|Sekarang))/i;
  
  // Split by company headers
  const blocks = experienceText.split(/\n(?=[A-Z][A-Za-z0-9\s.,&]+\s+-\s+)/);
  
  blocks.forEach(block => {
    if (!block.trim()) return;
    
    const lines = block.split('\n');
    const firstLine = lines[0].trim();
    
    // Extract company and location
    const companyMatch = firstLine.match(companyHeaderPattern);
    if (!companyMatch) return;
    
    const company = companyMatch[1].trim();
    const location = companyMatch[2].trim();
    
    // Extract dates (on first line or second line)
    let dates = null;
    let dateMatch = firstLine.match(datePattern);
    
    if (!dateMatch && lines.length > 1) {
      dateMatch = lines[1].match(datePattern);
    }
    
    if (dateMatch) {
      dates = dateMatch[0];
    }
    
    // Extract job title (usually the line after company or after dates)
    let jobTitle = null;
    let jobTitleLine = 1; // Default to second line
    
    // If second line has dates but not job title, job title is on third line
    if (lines.length > 1 && lines[1].match(datePattern) && lines.length > 2) {
      jobTitleLine = 2;
    }
    
    if (lines.length > jobTitleLine) {
      jobTitle = lines[jobTitleLine].trim();
      
      // Clean up job title (sometimes it contains dates or other info)
      if (jobTitle.match(datePattern)) {
        // If title contains dates, it's likely not actually the title
        jobTitle = null;
        
        // Look at next line instead
        if (lines.length > jobTitleLine + 1) {
          jobTitle = lines[jobTitleLine + 1].trim();
        }
      }
    }
    
    // Extract responsibilities (bullet points)
    const responsibilities = [];
    for (let i = jobTitleLine + 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      // Check if line is a bullet point
      if (line.startsWith('•') || line.startsWith('-') || line.startsWith('*') || line.match(/^\d+\./)) {
        responsibilities.push(line.replace(/^[•\-*\d.]\s*/, '').trim());
      }
    }
    
    entries.push({
      company,
      location,
      dates,
      jobTitle,
      responsibilities: responsibilities.length > 0 ? responsibilities : null
    });
  });
  
  // If no structured entries were found, try alternate approach
  if (entries.length === 0) {
    // Try to find date ranges and extract context around them
    const dateMatches = [];
    let match;
    const dateRegex = new RegExp(datePattern, 'gi');
    
    while ((match = dateRegex.exec(experienceText)) !== null) {
      dateMatches.push({
        date: match[0],
        index: match.index
      });
    }
    
    if (dateMatches.length > 0) {
      dateMatches.forEach((dateMatch, idx) => {
        // Extract a block of text around this date
        const startIdx = idx > 0 ? dateMatches[idx-1].index + dateMatches[idx-1].date.length : 0;
        const endIdx = idx < dateMatches.length - 1 ? dateMatches[idx+1].index : experienceText.length;
        
        const block = experienceText.substring(startIdx, endIdx).trim();
        
        // Try to extract company and title
        const lines = block.split('\n').map(l => l.trim()).filter(l => l);
        let company = null;
        let jobTitle = null;
        
        // Company might be in a line with capitalized words
        for (const line of lines) {
          // Company often has capital letters and might include Ltd, Inc, PT, etc.
          if (line.match(/[A-Z][a-z]+(\s+[A-Z][a-z]+){1,3}/) && !company) {
            company = line;
            continue;
          }
          
          // Job title often includes these common terms
          const titleTerms = ['developer', 'engineer', 'manager', 'consultant', 'specialist', 'analyst', 'officer', 'director', 'coordinator'];
          if (titleTerms.some(term => line.toLowerCase().includes(term)) && !jobTitle) {
            jobTitle = line;
          }
        }
        
        entries.push({
          company,
          dates: dateMatch.date,
          jobTitle,
          raw: block
        });
      });
    }
  }
  
  return entries.length > 0 ? entries : experienceText;
}

/**
 * Extracts skills
 */
function extractSkills(skillsText) {
  if (!skillsText) return null;
  
  // Look for specific skills categories
  const hardSkillsPattern = /(?:hard skills|technical skills|programming|languages|tools|technical)(?:\s*:|\s*⚒|\s*)[^\n]*([\s\S]*?)(?=(?:soft skills|personal skills|interest|hobbies|activities|professional skills|\n\n\n|$))/i;
  const softSkillsPattern = /(?:soft skills|personal skills|professional skills)(?:\s*:|\s*)[^\n]*([\s\S]*?)(?=(?:hard skills|technical skills|interest|hobbies|activities|\n\n\n|$))/i;
  const interestsPattern = /(?:interests?|hobbies|activities)(?:\s*:|\s*)[^\n]*([\s\S]*?)(?=(?:hard skills|soft skills|technical skills|\n\n\n|$))/i;
  
  const hardSkillsMatch = skillsText.match(hardSkillsPattern);
  const softSkillsMatch = skillsText.match(softSkillsPattern);
  const interestsMatch = skillsText.match(interestsPattern);
  
  const result = {
    hardSkills: [],
    softSkills: [],
    interests: []
  };
  
  // Process hard skills
  if (hardSkillsMatch && hardSkillsMatch[1]) {
    const skills = extractSkillItems(hardSkillsMatch[1]);
    if (skills.length > 0) {
      result.hardSkills = skills;
    }
  }
  
  // Process soft skills
  if (softSkillsMatch && softSkillsMatch[1]) {
    const skills = extractSkillItems(softSkillsMatch[1]);
    if (skills.length > 0) {
      result.softSkills = skills;
    }
  }
  
  // Process interests
  if (interestsMatch && interestsMatch[1]) {
    const interests = extractSkillItems(interestsMatch[1]);
    if (interests.length > 0) {
      result.interests = interests;
    }
  }
  
  // If no categories were found, try to extract all skills as one list
  if (result.hardSkills.length === 0 && result.softSkills.length === 0) {
    const allSkills = extractSkillItems(skillsText);
    if (allSkills.length > 0) {
      result.hardSkills = allSkills;
    } else {
      // Fallback: just return the text
      return skillsText;
    }
  }
  
  return result;
}

/**
 * Helper function to extract skill items from text
 */
function extractSkillItems(text) {
  const skills = [];
  
  // Strategy 1: Extract bullet points
  const bulletMatches = text.match(/(?:^|\n)\s*[•\-*]\s*([^\n•\-*]+)/g);
  if (bulletMatches) {
    bulletMatches.forEach(match => {
      const skill = match.replace(/[•\-*]\s*/, '').trim();
      if (skill && !skills.includes(skill)) skills.push(skill);
    });
  }
  
  // Strategy 2: Extract comma-separated items
  if (skills.length === 0) {
    const commaItems = text.split(/[,;]/).map(item => item.trim()).filter(Boolean);
    if (commaItems.length > 1) { // Only use if there are multiple items
      commaItems.forEach(item => {
        if (!skills.includes(item)) skills.push(item);
      });
    }
  }
  
  // Strategy 3: Extract line-separated items
  if (skills.length === 0) {
    const lineItems = text.split('\n').map(line => line.trim()).filter(Boolean);
    lineItems.forEach(line => {
      // Skip lines that are too long (probably paragraphs)
      if (line.length < 50 && !skills.includes(line)) {
        skills.push(line);
      }
    });
  }
  
  // Strategy 4: Look for known skill keywords
  if (skills.length === 0) {
    const techKeywords = [
      'java', 'python', 'javascript', 'typescript', 'c\\+\\+', 'c#', 'ruby', 'php', 'swift', 'kotlin',
      'react', 'angular', 'vue', 'django', 'flask', 'spring', 'node', 'express', 'laravel',
      'sql', 'mysql', 'postgresql', 'mongodb', 'oracle', 'redis', 'firebase',
      'git', 'docker', 'kubernetes', 'aws', 'azure', 'gcp', 'jenkins', 'travis', 'jira',
      'html', 'css', 'sass', 'less', 'bootstrap', 'tailwind', 'material-ui', 'jquery'
    ];
    
    techKeywords.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'i');
      if (regex.test(text)) {
        skills.push(keyword.replace(/\\/g, ''));
      }
    });
  }
  
  return skills;
}

/**
 * Extracts organizational experience
 */
function extractOrganizational(orgText) {
  if (!orgText) return null;
  
  // Similar approach to work experience but for organizations
  return extractWorkExperience(orgText);
}

/**
 * Extract summary/profile
 */
function extractSummary(summaryText) {
  if (!summaryText) return null;
  
  // Usually just keep the text, but clean it up
  return summaryText.trim();
}

/**
 * Main extraction function that orchestrates all the others
 */
export function extractCVData(text) {
  // Pre-process the text
  const cleanedText = preprocessText(text);
  
  // Detect the language
  const language = detectLanguage(cleanedText);
  
  // Extract contact information (present in all CVs)
  const contactInfo = extractContactInfo(cleanedText);
  
  // Identify sections
  const sections = identifySections(cleanedText, language);
  
  // Extract data from each section
  const result = {
    ...contactInfo,
    summary: sections.PROFILE ? extractSummary(sections.PROFILE) : null,
    education: sections.EDUCATION ? extractEducation(sections.EDUCATION) : null,
    experience: sections.EXPERIENCE ? extractWorkExperience(sections.EXPERIENCE) : null,
    skills: sections.SKILLS ? extractSkills(sections.SKILLS) : null,
    organizations: sections.ORGANIZATIONS ? extractOrganizational(sections.ORGANIZATIONS) : null,
    achievements: sections.ACHIEVEMENTS || null,
    languages: sections.LANGUAGES || null,
    interests: sections.INTERESTS || null,
    detectedLanguage: language,
    rawExtraction: {
      sections: Object.keys(sections)
    }
  };
  
  // Try additional extraction if initial methods failed
  if (!result.education) {
    // Try to find education info in the whole document
    const educationKeywords = ['university', 'college', 'school', 'institute', 'bachelor', 'master', 'phd'];
    const educationRegex = new RegExp(`(${educationKeywords.join('|')})`, 'i');
    
    if (educationRegex.test(cleanedText)) {
      result.education = extractEducation(cleanedText);
    }
  }
  
  if (!result.experience && !sections.EXPERIENCE) {
    // Look for experience patterns in the whole document
    const experienceKeywords = ['experience', 'work', 'employment', 'company', 'job', 'pengalaman', 'kerja'];
    const experienceRegex = new RegExp(`(${experienceKeywords.join('|')})`, 'i');
    
    if (experienceRegex.test(cleanedText)) {
      result.experience = extractWorkExperience(cleanedText);
    }
  }
  
  if (!result.skills && !sections.SKILLS) {
    // Look for skills patterns in the whole document
    const skillsKeywords = ['skills', 'abilities', 'competencies', 'keahlian', 'keterampilan'];
    const skillsRegex = new RegExp(`(${skillsKeywords.join('|')})`, 'i');
    
    if (skillsRegex.test(cleanedText)) {
      result.skills = extractSkills(cleanedText);
    }
  }
  
  return result;
}
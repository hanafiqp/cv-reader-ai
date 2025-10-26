// Lokasi file: src/pages/api/extract.js

import pdfParse from "pdf-parse";
import { GoogleGenerativeAI } from "@google/generative-ai";
import tagManager from "../../utils/tagManager.js";

// Konfigurasi API Next.js, bodyParser: false penting untuk parsing file manual
export const config = {
  api: {
    bodyParser: false,
  },
};

// Ambil API Key dari environment variables
const GOOGLE_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;

if (!GOOGLE_API_KEY) {
  console.error("FATAL ERROR: NEXT_PUBLIC_GOOGLE_API_KEY is not defined in your environment.");
}

// ===================================================================
// START: FUNGSI BANTU UNTUK CORS (Cross-Origin Resource Sharing)
// ===================================================================
/**
 * Mengatur header HTTP untuk mengizinkan permintaan dari origin lain.
 * Ini penting agar frontend Anda di localhost bisa mengakses API ini di Vercel.
 * @param {import('next').NextApiRequest} req - Objek request dari Next.js
 * @param {import('next').NextApiResponse} res - Objek response dari Next.js
 */
const setCorsHeaders = (res) => {
  // Mengizinkan semua domain ('*'). Untuk produksi, lebih aman menggunakan daftar domain spesifik.
  // Contoh: res.setHeader('Access-Control-Allow-Origin', 'https://your-frontend-domain.com');
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  // Metode HTTP yang diizinkan
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  
  // Header kustom yang diizinkan
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
};
// ===================================================================
// END: FUNGSI BANTU UNTUK CORS
// ===================================================================


export default async function handler(req, res) {
  // === LANGKAH 1: SETUP CORS UNTUK SETIAP REQUEST ===
  // Panggil fungsi bantu untuk menambahkan header CORS ke setiap respons.
  setCorsHeaders(res);

  // Browser akan mengirim permintaan 'preflight' dengan metode OPTIONS
  // sebelum melakukan POST. Kita harus menanganinya dengan benar.
  if (req.method === "OPTIONS") {
    return res.status(204).end(); // Kirim respons sukses 'No Content'
  }
  // === AKHIR DARI SETUP CORS ===

  // Pastikan metode request adalah POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  // Cek kembali apakah API Key tersedia
  if (!GOOGLE_API_KEY) {
    return res.status(500).json({ error: "API key for AI service is not configured." });
  }

  try {
    // 1. Baca dan Parse PDF dari request body
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);
    const pdfData = await pdfParse(buffer);
    const cvText = pdfData.text;

    // 2. Persiapkan permintaan untuk Google Gemini
    const genAI = new GoogleGenerativeAI(GOOGLE_API_KEY);
    // Gunakan model name yang benar - tanpa "-latest" suffix untuk v1beta API
    const modelName = "gemini-2.5-flash"; 
    const generationConfig = {
      temperature: 0.2,
      maxOutputTokens: 8192,
    };

    // Contoh struktur JSON yang diinginkan untuk output dari AI
    const jsonStructureExample = `{
      "firstName": "string or null",
      "lastName": "string or null",
      "fullName": "string (firstName + lastName) or null",
      "experience": "string (overall experience summary)",
      "languages": "comma-separated list of languages with proficiency levels or null",
      "email": "string or null",
      "phoneNumber": "string or null",
      "relevantExperienceNumber": "integer (total years of relevant experience) or null",
      "totalExperienceYears": "integer (total years of work experience) or null",
      "preferedWorkingHours": "string or null",
      "highestEducation": "string (highest degree level) or null",
      "degree": "string (highest degree name) or null",
      "experienceLevel": "string (e.g. 'Entry Level', 'Mid-Level', 'Senior') or null",
      "recentJobTitle": "string or null",
      "recentJobCompany": "string or null",
      "recentJobDutiesAndResponsibilities": "string or null",
      "currentLocation": "string (current city/region) or null",
      "currentCountry": "string (current country) or null",
      "nationality": "string (citizenship/nationality) or null",
      "gender": "string (Male/Female/Other) or null",
      "age": "integer or null",
      "maritalStatus": "string (Single/Married/Divorced/etc) or null",
      "linkedinUrl": "string or null",
      "portfolioUrl": "string or null",
      "githubUrl": "string or null",
      "website": "string or null",
      "expectedSalary": "string (salary range or amount with currency) or null",
      "currentSalary": "string (current salary with currency) or null",
      "salaryRange": "string (min-max salary range) or null",
      "willingToRelocate": "boolean or null",
      "remoteWorkPreference": "string (Remote/Hybrid/On-site/Flexible) or null",
      "availabilityToStart": "string (Immediately/1 month/2 weeks/etc) or null",
      "visaStatus": "string (Citizen/Work Permit/Visa Required/etc) or null",
      "softSkills": "comma-separated list of soft skills or null",
      "hardSkills": "comma-separated list of technical/hard skills or null",
      "certifications": "comma-separated list of certifications or null",
      "industryExperience": "comma-separated list of industries worked in or null",
      "managementExperience": "boolean (has management/leadership experience) or null",
      "teamSize": "string (size of teams managed, e.g., '5-10 people') or null",
      "workExperience": [
        {
          "company": "string",
          "position": "string",
          "startDate": "YYYY-MM or YYYY-MM-DD or null",
          "endDate": "YYYY-MM, YYYY-MM-DD, or Present or null",
          "yearsOfExperience": "number (calculated) or null",
          "responsibilities": "string or null",
          "achievements": ["achievement 1", "achievement 2"],
          "technologies": ["tech1", "tech2"],
          "location": "string or null",
          "country": "string or null",
          "isRemote": "boolean or null",
          "industry": "string (industry/sector) or null",
          "companySize": "string (startup/SME/large/etc) or null",
          "salary": "string (if mentioned) or null",
          "reasonForLeaving": "string or null"
        }
      ],
      "education": [
        {
          "institution": "string",
          "degree": "string",
          "fieldOfStudy": "string or null",
          "startDate": "YYYY-MM or YYYY or null",
          "endDate": "YYYY-MM, YYYY, or Present or null",
          "gpa": "string or null",
          "achievements": ["achievement 1", "achievement 2"],
          "location": "string or null",
          "country": "string or null",
          "educationLevel": "string (High School/Diploma/Bachelor/Master/PhD/etc) or null",
          "graduationStatus": "string (Graduated/In Progress/Dropped Out) or null"
        }
      ],
      "projects": [
        {
          "name": "string",
          "description": "string or null",
          "technologies": ["tech1", "tech2"],
          "role": "string or null",
          "duration": "string or null",
          "url": "string or null"
        }
      ],
      "tags": [
        "location tags (e.g., Jakarta, Indonesia, Asia)",
        "experience tags (e.g., 5+ years, Senior Level, Management)",
        "skill tags (e.g., JavaScript, Python, Leadership)",
        "education tags (e.g., Bachelor, Computer Science, Universitas Indonesia)",
        "industry tags (e.g., Technology, Finance, Healthcare)",
        "work preference tags (e.g., Remote, Full-time, Contract)",
        "salary tags (e.g., 10-15M IDR, Negotiable)",
        "language tags (e.g., English Fluent, Indonesian Native)",
        "certification tags (e.g., AWS Certified, PMP)",
        "availability tags (e.g., Immediate, 1 Month Notice)",
        "demographic tags (e.g., Male, Indonesian, 25-30 years)"
      ]
    }`;

    // Prompt lengkap yang akan dikirim ke AI
    const fullPrompt = `Extract comprehensive professional information from the following CV text and create intelligent tags for filtering purposes.
Focus on detailed extraction of work experience, education, and generate comprehensive tags for advanced filtering.

CV TEXT:
${cvText}

EXTRACTION INSTRUCTIONS:
1. Extract all standard CV fields as listed in the OUTPUT STRUCTURE.
2. For work experience, create a structured array. Each entry should include: company, position, date ranges (startDate, endDate), responsibilities, achievements (if any), technologies used (if any), location, country, industry, company size, salary (if mentioned), and reason for leaving (if mentioned). Calculate yearsOfExperience for each role if possible.
3. For education, create a structured array. Each entry should include: institution, degree, field of study, date ranges (startDate, endDate), GPA (if available), achievements (if any), location, country, education level, and graduation status.
4. Extract projects if mentioned, including name, description, technologies used, role, duration, and URL if available.
5. Extract demographic information carefully: gender, age, nationality, marital status, visa status.
6. Extract salary information: expected salary, current salary, salary range with currency.
7. Extract work preferences: remote work preference, willingness to relocate, availability to start.
8. Calculate total experience years across all positions.

TAGGING INSTRUCTIONS - CREATE COMPREHENSIVE TAGS FOR FILTERING:
Generate tags array with the following categories (only include tags that are relevant to the CV):

LOCATION TAGS:
- Current city/region (e.g., "Jakarta", "Bandung", "Surabaya")
- Current country (e.g., "Indonesia", "Singapore", "Malaysia")
- Willing to relocate locations if mentioned
- Regional tags (e.g., "Southeast Asia", "ASEAN", "Asia Pacific")

EXPERIENCE TAGS:
- Total years (e.g., "1-2 years", "3-5 years", "5-10 years", "10+ years")
- Experience level (e.g., "Fresh Graduate", "Junior", "Mid-Level", "Senior", "Lead", "Manager", "Director")
- Management experience (e.g., "People Manager", "Team Lead", "Project Manager")
- Industry experience (e.g., "Technology", "Finance", "Healthcare", "Manufacturing", "Retail", "Education")

SKILL TAGS:
- Programming languages (e.g., "JavaScript", "Python", "Java", "PHP", "Go")
- Frameworks (e.g., "React", "Vue", "Laravel", "Spring Boot", "Django")
- Databases (e.g., "MySQL", "PostgreSQL", "MongoDB", "Redis")
- Cloud platforms (e.g., "AWS", "Google Cloud", "Azure", "Digital Ocean")
- Tools and technologies (e.g., "Docker", "Kubernetes", "Git", "Jenkins")
- Soft skills (e.g., "Leadership", "Communication", "Problem Solving", "Team Work")

EDUCATION TAGS:
- Degree level (e.g., "High School", "Diploma", "Bachelor", "Master", "PhD")
- Field of study (e.g., "Computer Science", "Information Technology", "Business", "Engineering")
- Institution type (e.g., "University", "Institute", "Polytechnic")
- Institution name if well-known (e.g., "Universitas Indonesia", "ITB", "ITS")
- Graduation status (e.g., "Fresh Graduate", "Recent Graduate")

WORK PREFERENCE TAGS:
- Work type (e.g., "Full-time", "Part-time", "Contract", "Freelance", "Internship")
- Work location (e.g., "Remote", "On-site", "Hybrid", "Flexible")
- Availability (e.g., "Immediate", "1 Month Notice", "2 Weeks Notice", "Available")

SALARY TAGS (if mentioned):
- Salary range (e.g., "5-10M IDR", "10-15M IDR", "15-20M IDR", "20M+ IDR")
- Currency (e.g., "IDR", "USD", "SGD", "MYR")
- Salary expectation (e.g., "Negotiable", "Market Rate", "Competitive")

LANGUAGE TAGS:
- Language proficiency (e.g., "English Fluent", "Indonesian Native", "Mandarin Basic")
- International capability (e.g., "Multilingual", "English Speaking")

CERTIFICATION TAGS:
- Professional certifications (e.g., "AWS Certified", "Google Cloud Certified", "PMP", "Scrum Master")
- Academic achievements (e.g., "Cum Laude", "Magna Cum Laude", "Dean's List")

DEMOGRAPHIC TAGS (if clearly stated):
- Age range (e.g., "20-25 years", "25-30 years", "30-35 years", "35+ years")
- Gender (e.g., "Male", "Female") - only if explicitly mentioned
- Nationality (e.g., "Indonesian", "Singaporean", "Malaysian")
- Visa status (e.g., "Work Permit", "Citizen", "Visa Required")

INDUSTRY TAGS:
- Current/recent industry (e.g., "Fintech", "E-commerce", "Banking", "Startup", "Consulting")
- Industry experience (e.g., "Multi-industry", "Finance Specialist", "Tech Specialist")

SPECIAL TAGS:
- Career status (e.g., "Job Seeker", "Career Changer", "Returning Professional")
- Notable achievements (e.g., "Award Winner", "Published Author", "Speaker")
- Special skills (e.g., "Bilingual", "International Experience", "Startup Experience")

8. If a field is not found in the CV, use 'null' as its value in the JSON. For arrays like achievements, technologies, or tags, use an empty array [] if none are found.
9. The entire output MUST be a single, valid JSON string that can be directly parsed by JSON.parse(). Do NOT include any explanatory text, comments, or markdown formatting (like \`\`\`json) around the JSON string itself.
10. Tags should be specific, searchable, and useful for filtering. Avoid generic tags like "experienced" or "skilled". Be specific like "5+ years JavaScript" or "AWS Solutions Architect".

OUTPUT STRUCTURE (ensure the output string strictly adheres to this JSON format):
${jsonStructureExample}
`;

    const contentsForRequest = [{ parts: [{ text: fullPrompt }] }];

    const generativeModel = genAI.getGenerativeModel({
      model: modelName,
      generationConfig,
    });

    // 3. Lakukan Panggilan API ke Gemini
    const result = await generativeModel.generateContent({ contents: contentsForRequest });
    const geminiApiResponse = result.response;

    // 4. Proses Respons dari Gemini
    if (!geminiApiResponse) {
        console.error("Gemini API call did not yield a response object properly.", result);
        return res.status(500).json({ error: "AI model did not return a response object." });
    }
    
    if (geminiApiResponse.promptFeedback?.blockReason) {
        console.error("Gemini response blocked:", geminiApiResponse.promptFeedback.blockReason, geminiApiResponse.promptFeedback.safetyRatings);
        return res.status(400).json({ error: `AI model blocked the request: ${geminiApiResponse.promptFeedback.blockReason}` });
    }

    if (!geminiApiResponse.candidates || geminiApiResponse.candidates.length === 0) {
        console.error("Gemini response has no candidates:", geminiApiResponse);
        const finishReason = geminiApiResponse.candidates?.[0]?.finishReason;
        const safetyRatings = geminiApiResponse.candidates?.[0]?.safetyRatings;
        return res.status(500).json({ error: "AI model returned no candidates. Reason: " + (finishReason || "Unknown") });
    }
    
    let rawJsonString = geminiApiResponse.text();

    if (!rawJsonString || rawJsonString.trim() === "") {
        console.error("Gemini response text is empty.");
        return res.status(500).json({ error: "AI model returned an empty response." });
    }
    
    // Membersihkan respons dari markdown yang mungkin ditambahkan oleh AI
    rawJsonString = rawJsonString.trim();
    if (rawJsonString.startsWith("```json")) {
      rawJsonString = rawJsonString.substring(7, rawJsonString.lastIndexOf("```")).trim();
    } else if (rawJsonString.startsWith("```") && rawJsonString.endsWith("```")) {
      rawJsonString = rawJsonString.substring(3, rawJsonString.length - 3).trim();
    }
    
    // Coba parse string JSON
    let extractedData;
    try {
      extractedData = JSON.parse(rawJsonString);
    } catch (parseError) {
      console.error("Failed to parse JSON response from Gemini:", parseError.message);
      console.error("Raw Gemini response string:", rawJsonString.substring(0, 1000));
      return res.status(500).json({ 
        error: "AI model returned data in an unexpected format (not valid JSON).",
      });
    }

    // 5. Post-process extracted data dan generate additional tags
    // Normalize dan enhance tags menggunakan tag manager
    const normalizedTags = tagManager.normalizeTags(extractedData);
    const smartTagSuggestions = tagManager.generateSmartTagSuggestions(extractedData);
    const validationResult = tagManager.validateCVDataForTagging(extractedData);

    // Combine original tags dengan normalized tags dan smart suggestions
    const allTags = [
      ...(extractedData.tags || []),
      ...normalizedTags,
      ...smartTagSuggestions
    ];

    // Remove duplicates dan sort
    extractedData.tags = [...new Set(allTags)].filter(tag => tag && tag.trim()).sort();

    // Add metadata tentang tag processing
    extractedData.tagMetadata = {
      totalTags: extractedData.tags.length,
      validationResult,
      searchFilters: tagManager.createSearchFilters(extractedData.tags),
      extractedAt: new Date().toISOString()
    };

    // 6. Kirim data yang sudah di-process kembali ke klien
    res.status(200).json({
      success: true,
      data: extractedData,
      message: "CV extracted and tagged successfully"
    });

  } catch (err) {
    console.error("Overall extraction error:", err);
    let errorMessage = "An error occurred during CV extraction.";
    let statusCode = 500;

    if (err.message?.toLowerCase().includes("api key")) {
        errorMessage = "Invalid or missing API Key for the AI service.";
        statusCode = 401; // Unauthorized
    } else if (err.message?.includes("quota")) {
        errorMessage = "API quota exceeded. Please check your usage limits.";
        statusCode = 429; // Too Many Requests
    } else if (err.message) {
        errorMessage = err.message;
    }
    
    res.status(statusCode).json({ error: errorMessage, details: err.toString() });
  }
}
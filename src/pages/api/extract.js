// Lokasi file: src/pages/api/extract.js

import pdfParse from "pdf-parse";
import { GoogleGenerativeAI } from "@google/generative-ai";
import tagManager from "../../utils/tagManager.js";

// Konfigurasi API Next.js untuk Vercel
export const config = {
  api: {
    bodyParser: false,
    responseLimit: false,
    externalResolver: true,
  },
  maxDuration: 60, // Maximum 60 detik untuk Vercel Pro
  memory: 1024, // 1GB memory
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
    const startTime = Date.now();
    
    // 1. Baca dan Parse PDF dari request body dengan timeout
    const chunks = [];
    const maxSize = 10 * 1024 * 1024; // 10MB max
    let totalSize = 0;
    
    for await (const chunk of req) {
      totalSize += chunk.length;
      if (totalSize > maxSize) {
        return res.status(413).json({ error: "File too large. Maximum 10MB allowed." });
      }
      chunks.push(chunk);
    }
    
    const buffer = Buffer.concat(chunks);
    
    // Parse PDF dengan error handling
    let cvText;
    try {
      const pdfData = await pdfParse(buffer, {
        max: 50, // Maksimal 50 halaman untuk performa
      });
      cvText = pdfData.text;
      
      // Limit text length untuk performa
      if (cvText.length > 20000) {
        cvText = cvText.substring(0, 20000);
      }
    } catch (pdfError) {
      console.error("PDF parsing error:", pdfError);
      return res.status(400).json({ error: "Invalid PDF file or corrupted." });
    }

    console.log(`PDF parsed in ${Date.now() - startTime}ms, text length: ${cvText.length}`);

    // 2. Persiapkan permintaan untuk Google Gemini dengan optimasi
    const genAI = new GoogleGenerativeAI(GOOGLE_API_KEY);
    const modelName = "gemini-2.5-pro"; // Fastest model
    const generationConfig = {
      temperature: 0.3, // Balance antara konsistensi dan kreativitas
      maxOutputTokens: 8192, // Lebih besar untuk tags yang comprehensive
      topP: 0.95,
      topK: 40,
    };

    // Prompt yang comprehensive untuk hasil maksimal
    const comprehensivePrompt = `You are an expert CV/Resume parser. Extract ALL relevant information from this CV text and return ONLY a valid JSON object (no markdown, no explanation).

CV TEXT:
${cvText}

Extract and return this EXACT JSON structure with ALL fields:

{
  "firstName": "First name or null",
  "lastName": "Last name or null",
  "email": "Email address or null",
  "phoneNumber": "Phone number or null",
  "currentLocation": "City name only (e.g., 'Jakarta', 'Bandung') or null",
  "currentCountry": "Country name only (e.g., 'Indonesia', 'Singapore') or null",
  "nationality": "Nationality or null",
  "dateOfBirth": "YYYY-MM-DD or null",
  "gender": "Male|Female|Other or null",
  "maritalStatus": "Single|Married|Divorced or null",
  "summary": "Professional summary/objective in 2-3 sentences that captures the candidate's expertise, experience level, and career goals. Make it compelling and informative.",
  "totalExperienceYears": 0,
  "experienceLevel": "Junior|Mid-Level|Senior|Lead|Expert or null",
  "recentJobTitle": "Most recent position title or null",
  "recentJobCompany": "Most recent company name or null",
  "highestEducation": "High School|Diploma|Bachelor|Master|PhD or null",
  "degree": "Degree name (e.g., 'Bachelor of Computer Science') or null",
  "fieldOfStudy": "Field of study or major or null",
  "institution": "University/institution name or null",
  "hardSkills": "Comma-separated technical skills (programming languages, tools, frameworks, technologies). Be COMPREHENSIVE - list ALL mentioned skills.",
  "softSkills": "Comma-separated soft skills (leadership, communication, teamwork, problem-solving, etc.). List ALL mentioned.",
  "languages": "Comma-separated languages with proficiency levels (e.g., 'English (Fluent), Indonesian (Native), Mandarin (Basic)'). List ALL.",
  "certifications": "Comma-separated certifications with issuing organization if available. List ALL.",
  "expectedSalary": "Salary expectation or range if mentioned, or null",
  "currentSalary": "Current salary if mentioned, or null",
  "remoteWorkPreference": "Remote|Hybrid|On-site or null",
  "willingToRelocate": true or false,
  "noticePeriod": "Notice period (e.g., '1 month', 'Immediate') or null",
  "linkedinUrl": "LinkedIn profile URL or null",
  "githubUrl": "GitHub profile URL or null",
  "portfolioUrl": "Portfolio/website URL or null",
  "workExperience": [
    {
      "company": "Company name",
      "position": "Job title/position",
      "startDate": "YYYY-MM format",
      "endDate": "YYYY-MM or 'Present'",
      "location": "Work location or null",
      "responsibilities": "Detailed description of role and achievements",
      "technologies": ["Tech1", "Tech2", "Tech3"],
      "industryType": "Industry sector (e.g., 'Fintech', 'E-commerce', 'Healthcare') or null"
    }
  ],
  "education": [
    {
      "institution": "University/school name",
      "degree": "Degree type (Bachelor, Master, etc.)",
      "fieldOfStudy": "Major/field of study",
      "startDate": "YYYY",
      "endDate": "YYYY or 'Present'",
      "gpa": "GPA if mentioned, or null",
      "location": "City/country or null",
      "achievements": "Academic achievements, honors, awards or null"
    }
  ],
  "projects": [
    {
      "name": "Project name",
      "description": "Brief project description",
      "role": "Role in project",
      "technologies": ["Tech1", "Tech2"],
      "url": "Project URL if available, or null"
    }
  ],
  "awards": "Comma-separated awards and recognitions, or null",
  "publications": "Comma-separated publications or research papers, or null",
  "volunteerExperience": "Volunteer work or community involvement, or null",
  "hobbies": "Hobbies and interests, or null",
  "references": "Reference information if provided, or null",
  "tags": []
}

CRITICAL INSTRUCTIONS:
1. Return ONLY valid JSON - no markdown code blocks, no explanations
2. Extract ALL skills mentioned - be comprehensive, not selective
3. For "summary": Write a professional 2-3 sentence summary that highlights the candidate's key strengths, experience level, expertise areas, and career focus
4. For missing fields, use null (not empty strings)
5. For empty arrays, use []
6. Calculate totalExperienceYears by summing all work experience durations
7. Generate COMPREHENSIVE tags covering:
   - Location tags: "location [city]", "country [country]"
   - Skill tags: "skill [each technical skill]", "softskill [each soft skill]"
   - Experience tags: "experience [range]" (e.g., "experience 5-7 years"), "level [level]"
   - Education tags: "education [level]", "degree [field]"
   - Industry tags: "industry [each industry]"
   - Work type tags: "worktype [preference]"
   - Language tags: "language [each language]"
   - Certification tags: "certification [each cert]"
8. Generate AT LEAST 80-120 tags to ensure comprehensive searchability
9. Be thorough - extract every skill, technology, tool, framework mentioned
10. For summary field: Be descriptive and professional, summarizing their career profile

Example tags: ["location jakarta", "country indonesia", "skill javascript", "skill react", "skill node.js", "skill aws", "skill docker", "skill kubernetes", "softskill leadership", "softskill communication", "experience 5-7 years", "level senior", "education bachelor", "degree computer science", "industry fintech", "industry e-commerce", "worktype remote", "language english fluent", "language indonesian native", "certification aws certified"]`;

    const contentsForRequest = [{ parts: [{ text: comprehensivePrompt }] }];

    const generativeModel = genAI.getGenerativeModel({
      model: modelName,
      generationConfig,
    });

    // 3. Lakukan Panggilan API ke Gemini dengan timeout
    const aiStartTime = Date.now();
    let result;
    
    try {
      // Set timeout untuk AI request (40 detik max untuk comprehensive extraction)
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('AI request timeout')), 40000)
      );
      
      const aiPromise = generativeModel.generateContent({ contents: contentsForRequest });
      
      result = await Promise.race([aiPromise, timeoutPromise]);
      
      console.log(`AI response received in ${Date.now() - aiStartTime}ms`);
    } catch (aiError) {
      console.error("AI generation error:", aiError);
      console.error("Error details:", {
        message: aiError.message,
        status: aiError.status,
        statusText: aiError.statusText,
      });
      
      if (aiError.message === 'AI request timeout') {
        return res.status(504).json({ error: "AI processing timeout. Please try again with a shorter CV." });
      }
      
      // Check for 404 error from Gemini API
      if (aiError.status === 404 || aiError.message?.includes('404')) {
        return res.status(500).json({ 
          error: "AI model configuration error.",
          details: "The model 'gemini-1.5-flash' is not found. Please verify your API key is valid and has access to Gemini models.",
          hint: "Check NEXT_PUBLIC_GOOGLE_API_KEY in your environment variables."
        });
      }
      
      throw aiError;
    }
    
    const geminiApiResponse = result.response;

    // 4. Proses Respons dari Gemini dengan better error handling
    if (!geminiApiResponse) {
        console.error("Gemini API: No response object");
        return res.status(500).json({ error: "AI model did not return a response." });
    }
    
    if (geminiApiResponse.promptFeedback?.blockReason) {
        console.error("Gemini blocked:", geminiApiResponse.promptFeedback.blockReason);
        return res.status(400).json({ error: "Content filtered by AI safety." });
    }

    if (!geminiApiResponse.candidates || geminiApiResponse.candidates.length === 0) {
        console.error("Gemini: No candidates");
        return res.status(500).json({ error: "AI model returned no results." });
    }
    
    let rawJsonString = geminiApiResponse.text();

    if (!rawJsonString || rawJsonString.trim() === "") {
        console.error("Gemini: Empty response");
        return res.status(500).json({ error: "AI model returned empty response." });
    }
    
    // Aggressive cleaning untuk ensure valid JSON
    rawJsonString = rawJsonString.trim();
    
    // Remove markdown code blocks
    if (rawJsonString.startsWith("```json")) {
      rawJsonString = rawJsonString.substring(7);
    } else if (rawJsonString.startsWith("```")) {
      rawJsonString = rawJsonString.substring(3);
    }
    
    if (rawJsonString.endsWith("```")) {
      rawJsonString = rawJsonString.substring(0, rawJsonString.length - 3);
    }
    
    rawJsonString = rawJsonString.trim();
    
    // Remove any text before first { and after last }
    const firstBrace = rawJsonString.indexOf('{');
    const lastBrace = rawJsonString.lastIndexOf('}');
    
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      rawJsonString = rawJsonString.substring(firstBrace, lastBrace + 1);
    }
    
    // Parse JSON with better error handling
    let extractedData;
    try {
      extractedData = JSON.parse(rawJsonString);
    } catch (parseError) {
      console.error("JSON parse failed:", parseError.message);
      console.error("Cleaned string (first 500 chars):", rawJsonString.substring(0, 500));
      
      // Try to fix common JSON issues
      try {
        // Fix trailing commas
        const fixed = rawJsonString.replace(/,(\s*[}\]])/g, '$1');
        extractedData = JSON.parse(fixed);
        console.log("JSON parsed after fixing trailing commas");
      } catch {
        return res.status(500).json({ 
          error: "AI returned invalid JSON format.",
          hint: "Please try uploading the CV again."
        });
      }
    }

    console.log(`JSON parsed successfully in ${Date.now() - startTime}ms`);

    // 5. Post-process tags dengan optimasi
    try {
      const normalizedTags = tagManager.normalizeTags(extractedData);
      const smartTagSuggestions = tagManager.generateSmartTagSuggestions(extractedData);

      // Combine dan deduplicate tags
      const allTags = [
        ...(extractedData.tags || []),
        ...normalizedTags,
        ...smartTagSuggestions
      ];

      extractedData.tags = [...new Set(allTags)]
        .filter(tag => tag && tag.trim())
        .sort();

      // Add minimal metadata
      extractedData.tagMetadata = {
        totalTags: extractedData.tags.length,
        searchFilters: tagManager.createSearchFilters(extractedData.tags),
        processingTime: Date.now() - startTime
      };
    } catch (tagError) {
      console.error("Tag processing error:", tagError);
      // Continue without tags if processing fails
      extractedData.tags = extractedData.tags || [];
      extractedData.tagMetadata = {
        totalTags: 0,
        error: "Tag processing failed",
        processingTime: Date.now() - startTime
      };
    }

    console.log(`Total processing time: ${Date.now() - startTime}ms`);

    // 6. Return response
    res.status(200).json({
      success: true,
      data: extractedData,
      processingTime: Date.now() - startTime
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
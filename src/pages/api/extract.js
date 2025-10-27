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
      temperature: 0.1, // Lower untuk konsistensi
      maxOutputTokens: 4096, // Reduced untuk performa
      topP: 0.8,
      topK: 10,
    };

    // Prompt yang lebih singkat dan fokus untuk performa lebih cepat
    const optimizedPrompt = `Extract CV information and return ONLY valid JSON. No markdown, no explanation.

CV TEXT:
${cvText}

Return this exact JSON structure:
{
  "firstName": "string or null",
  "lastName": "string or null",
  "email": "string or null",
  "phoneNumber": "string or null",
  "currentLocation": "city or null",
  "currentCountry": "country or null",
  "nationality": "string or null",
  "totalExperienceYears": 0,
  "experienceLevel": "Junior|Mid-Level|Senior|Lead or null",
  "recentJobTitle": "string or null",
  "recentJobCompany": "string or null",
  "highestEducation": "Bachelor|Master|PhD or null",
  "degree": "string or null",
  "hardSkills": "comma-separated skills",
  "softSkills": "comma-separated skills",
  "languages": "comma-separated with levels",
  "certifications": "comma-separated or null",
  "expectedSalary": "string or null",
  "remoteWorkPreference": "Remote|Hybrid|On-site or null",
  "willingToRelocate": false,
  "linkedinUrl": "url or null",
  "githubUrl": "url or null",
  "summary": "brief summary or null",
  "workExperience": [
    {
      "company": "string",
      "position": "string",
      "startDate": "YYYY-MM",
      "endDate": "YYYY-MM or Present",
      "responsibilities": "brief description",
      "technologies": ["tech1", "tech2"]
    }
  ],
  "education": [
    {
      "institution": "string",
      "degree": "string",
      "fieldOfStudy": "string",
      "startDate": "YYYY",
      "endDate": "YYYY",
      "location": "string or null"
    }
  ],
  "tags": []
}

IMPORTANT: 
- For summary field, provide a brief overview of the candidate's experience and skills.
- Return ONLY valid JSON
- Use null for missing fields
- Use empty arrays [] for no data
- Be concise
- Calculate totalExperienceYears from work history
- Generate relevant tags like: location, skills, experience level, education level`;

    const contentsForRequest = [{ parts: [{ text: optimizedPrompt }] }];

    const generativeModel = genAI.getGenerativeModel({
      model: modelName,
      generationConfig,
    });

    // 3. Lakukan Panggilan API ke Gemini dengan timeout
    const aiStartTime = Date.now();
    let result;
    
    try {
      // Set timeout untuk AI request (50 detik max)
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('AI request timeout')), 50000)
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
        response: aiError.response
      });
      
      if (aiError.message === 'AI request timeout') {
        return res.status(504).json({ error: "AI processing timeout. Please try again with a shorter CV." });
      }
      
      // Check for 404 error from Gemini API
      if (aiError.status === 404 || aiError.message?.includes('404')) {
        return res.status(500).json({ 
          error: "AI model configuration error. Please check API key and model name.",
          details: "The Gemini API returned 404. Verify NEXT_PUBLIC_GOOGLE_API_KEY is valid."
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
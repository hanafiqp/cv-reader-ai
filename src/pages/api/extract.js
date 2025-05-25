import pdfParse from "pdf-parse";
import { GoogleGenerativeAI } from "@google/generative-ai"; // Corrected import name
// import { extractCVData } from "../../utils/advancedCVExtractor"; // Not used in this snippet

export const config = {
  api: {
    bodyParser: false, // Correct for manual PDF parsing
  },
};

const GOOGLE_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;

if (!GOOGLE_API_KEY) {
  console.error("FATAL ERROR: NEXT_PUBLIC_GOOGLE_API_KEY is not defined.");
  // Optionally, you might want to prevent the app from starting or handle this more gracefully
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  if (!GOOGLE_API_KEY) {
    return res.status(500).json({ error: "API key for AI service is not configured." });
  }

  try {
    // 1. Read and Parse the PDF
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);
    const pdfData = await pdfParse(buffer);
    const cvText = pdfData.text;

    // 2. Prepare the request for Gemini
    const genAI = new GoogleGenerativeAI(GOOGLE_API_KEY); // Correct SDK initialization

    // Use a standard and latest model name for Gemini 1.5 Flash
    const modelName = "gemini-1.5-flash-latest"; 

    const generationConfig = {
      temperature: 0.2,
      maxOutputTokens: 8192, // Max for Flash 1.5; user had 4096
      // responseMimeType: "application/json" // If you set this, you'd expect parsed JSON directly.
                                              // But your prompt asks for a stringified JSON.
    };

    // Construct the prompt clearly
    const jsonStructureExample = `{
      "firstName": "string or null",
      "lastName": "string or null",
      "experience": "string (overall experience summary)",
      "languages": "comma-separated list of languages with proficiency levels or null",
      "email": "string or null",
      "phoneNumber": "string or null",
      "relevantExperienceNumber": "integer (total years of relevant experience) or null",
      "preferedWorkingHours": "string or null",
      "highestEducation": "string (highest degree level) or null",
      "degree": "string (highest degree name) or null",
      "experienceLevel": "string (e.g. 'Entry Level', 'Mid-Level', 'Senior') or null",
      "recentJobTitle": "string or null",
      "recentJobCompany": "string or null",
      "recentJobDutiesAndResponsibilities": "string or null",
      "location": "string or null",
      "country": "string or null",
      "linkedinUrl": "string or null",
      "softSkills": "comma-separated list of soft skills or null",
      "hardSkills": "comma-separated list of technical/hard skills or null",
      "certifications": "comma-separated list of certifications or null",
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
          "isRemote": "boolean or null"
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
          "location": "string or null"
        }
      ]
    }`;

    const fullPrompt = `Extract comprehensive professional information from the following CV text.
Focus on detailed extraction of work experience and education as structured arrays.

CV TEXT:
${cvText}

EXTRACTION INSTRUCTIONS:
1. Extract all standard CV fields as listed in the OUTPUT STRUCTURE.
2. For work experience, create a structured array. Each entry should include: company, position, date ranges (startDate, endDate), responsibilities, achievements (if any), and technologies used (if any), location, and isRemote status. Calculate yearsOfExperience for each role if possible.
3. For education, create a structured array. Each entry should include: institution, degree, field of study, date ranges (startDate, endDate), GPA (if available), and achievements (if any), location.
4. If a field is not found in the CV, use 'null' as its value in the JSON. For arrays like achievements or technologies, use an empty array [] if none are found.
5. The entire output MUST be a single, valid JSON string that can be directly parsed by JSON.parse(). Do NOT include any explanatory text, comments, or markdown formatting (like \`\`\`json) around the JSON string itself.

OUTPUT STRUCTURE (ensure the output string strictly adheres to this JSON format):
${jsonStructureExample}
`;

    const contentsForRequest = [{ parts: [{ text: fullPrompt }] }];

    const generativeModel = genAI.getGenerativeModel({
      model: modelName,
      generationConfig,
    });

    // 3. Make the API Call
    const result = await generativeModel.generateContent({ contents: contentsForRequest });
    const geminiApiResponse = result.response;

    // 4. Process the Response from Gemini
    if (!geminiApiResponse) {
        console.error("Gemini API call did not yield a response object properly.", result);
        return res.status(500).json({ error: "AI model did not return a response object." });
    }
    
    // Check for blocks or other issues indicated by promptFeedback
    if (geminiApiResponse.promptFeedback?.blockReason) {
        console.error("Gemini response blocked:", geminiApiResponse.promptFeedback.blockReason, geminiApiResponse.promptFeedback.safetyRatings);
        return res.status(400).json({ error: `AI model blocked the request: ${geminiApiResponse.promptFeedback.blockReason}` });
    }

    if (!geminiApiResponse.candidates || geminiApiResponse.candidates.length === 0) {
        console.error("Gemini response has no candidates:", geminiApiResponse);
        // Check finishReason if available
        const finishReason = geminiApiResponse.candidates?.[0]?.finishReason;
        const safetyRatings = geminiApiResponse.candidates?.[0]?.safetyRatings;
        console.error("Finish Reason:", finishReason, "Safety Ratings:", safetyRatings);
        return res.status(500).json({ error: "AI model returned no candidates. Reason: " + (finishReason || "Unknown") });
    }
    
    let rawJsonString = geminiApiResponse.text(); // Safely call .text()

    if (!rawJsonString || rawJsonString.trim() === "") {
        console.error("Gemini response text is empty.");
        return res.status(500).json({ error: "AI model returned an empty response." });
    }
    
    // Optional: Clean up potential markdown backticks if the model accidentally adds them despite instructions
    // This makes parsing more robust.
    rawJsonString = rawJsonString.trim();
    if (rawJsonString.startsWith("```json")) {
      rawJsonString = rawJsonString.substring(7, rawJsonString.lastIndexOf("```")).trim();
    } else if (rawJsonString.startsWith("```") && rawJsonString.endsWith("```")) {
      rawJsonString = rawJsonString.substring(3, rawJsonString.length - 3).trim();
    }
    
    let extractedData;
    try {
      extractedData = JSON.parse(rawJsonString);
    } catch (parseError) {
      console.error("Failed to parse JSON response from Gemini:", parseError.message);
      console.error("Raw Gemini response string (length " + rawJsonString.length + "):"); // Log for debugging
      // Log only a portion if it's too long for console
      console.error(rawJsonString.substring(0, 1000) + (rawJsonString.length > 1000 ? "..." : ""));
      return res.status(500).json({ 
        error: "AI model returned data in an unexpected format (not valid JSON).",
        // rawResponse: rawJsonString // Consider if you want to send this to the client
      });
    }

    // 5. Send the parsed data back to the client
    res.status(200).json({
      data: extractedData, // This is now a JavaScript object
      // rawPdfText: cvText, // You can include this if needed for debugging or other client-side purposes
    });

  } catch (err) {
    console.error("Overall extraction error:", err);
    let errorMessage = "An error occurred during CV extraction.";
    let statusCode = 500;

    if (err.message && err.message.toLowerCase().includes("api key")) {
        errorMessage = "Invalid or missing API Key for the AI service.";
        statusCode = 401; // Unauthorized
    } else if (err.message && err.message.includes("quota")) {
        errorMessage = "API quota exceeded. Please check your usage limits.";
        statusCode = 429; // Too Many Requests
    } else if (err.message) {
        errorMessage = err.message;
    }
    
    res.status(statusCode).json({ error: errorMessage, details: err.toString() });
  }
}
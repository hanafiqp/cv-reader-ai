import formidable from 'formidable';
import { Client } from '@gradio/client';
import fs from 'fs';
import util from 'util';
import pdf from 'pdf-parse';

// Disable Next.js body parsing for this route
export const config = {
  api: {
    bodyParser: false,
  },
};

// Convert callbacks to promises
const readFile = util.promisify(fs.readFile);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Parse the incoming form data
    const form = new formidable.IncomingForm();
    
    // Use promise to handle the form parsing
    const [fields, files] = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        resolve([fields, files]);
      });
    });

    // Get the uploaded PDF file
    const pdfFile = files.pdf;
    
    if (!pdfFile) {
      return res.status(400).json({ message: 'No PDF file uploaded' });
    }

    // Read the file into a buffer
    const fileBuffer = await readFile(pdfFile.filepath);

    // read text of the PDF file
    const textPdf = (await pdf(fileBuffer)).text;

    // Connect to your Gradio PDF summarization app
    // Replace the URL with your actual deployed Gradio app URL
    const client = await Client.connect("reddgr/cv-processing-and-scoring");
    const result = await client.predict("/process_cv", { 		
            job_text: "Software Engineer", 		
            cv_text: textPdf, 		
            req_experience: 3, 		
            req_experience_unit: "months", 		
            positions_cap: 3, 		
    });

    console.log("Result from Gradio:", result);

    // Check if the result is valid
    if (!result || !result.data) {
      throw new Error("Invalid response from summarization model");
    }

    // Return the summary
    return res.status(200).json({ summary: result.data });

  } catch (error) {
    console.error("Error processing PDF:", error);
    return res.status(500).json({ message: 'Failed to summarize PDF', error: error.message });
  }
}
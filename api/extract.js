const pdfParse = require('pdf-parse');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  const file = req.files?.file || req.body.file;
  if (!file) {
    res.status(400).json({ error: 'No file uploaded' });
    return;
  }

  // If you use Multer or similar in dev, on Vercel you'll need to read the raw body.
  const dataBuffer = Buffer.isBuffer(file)
    ? file
    : Buffer.from(file, 'base64');

  try {
    const data = await pdfParse(dataBuffer);
    // Example: return text and number of pages
    res.status(200).json({
      numPages: data.numpages,
      text: data.text.slice(0, 1000), // preview
    });
  } catch (err) {
    res.status(500).json({ error: err.toString() });
  }
}
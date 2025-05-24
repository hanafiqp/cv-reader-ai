if (req.method !== "POST") {
    res.status(405).json({ error: "Method Not Allowed" });
    return;
  }

  // Collect the PDF as a buffer
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }
  const buffer = Buffer.concat(chunks);

  try {
    const data = await pdfParse(buffer);
    res.status(200).json({
      numPages: data.numpages,
      text: data.text.slice(0, 1000), // preview
    });
  } catch (err) {
    res.status(500).json({ error: err.toString() });
  }
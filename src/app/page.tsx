"use client";
import React, { useState, FormEvent } from "react";

export default function HomePage() {
  const [file, setFile] = useState<File | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const uploadFile = async (e: FormEvent) => {
    e.preventDefault();
    setResult(null);
    setLoading(true);
    if (!file) return;

    const res = await fetch("/api/extract", {
      method: "POST",
      headers: {
        "Content-Type": file.type,
      },
      body: file,
    });

    const text = await res.text(); // Read body ONCE
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = { error: "Non-JSON response", details: text };
    }

    setLoading(false);
    setResult(data);
  };

  return (
     <html lang="en">
      <body
      >
        <main style={{ padding: 32 }}>
      <h1>CV Reader AI</h1>
      <form onSubmit={uploadFile}>
        <input
          type="file"
          accept=".pdf"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />
        <button type="submit" disabled={!file || loading}>
          {loading ? "Uploading..." : "Upload CV"}
        </button>
      </form>
      {result && (
        <pre style={{ background: "#f4f4f4", marginTop: 24 }}>
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </main>
      </body>
    </html>
    
  );
}
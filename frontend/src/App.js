import React, { useState } from "react";

function App() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const uploadFile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/extract", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      setLoading(false);
      setResult({ error: "Failed to extract CV. Try again." });
      return;
    }

    const data = await res.json();
    setLoading(false);
    setResult(data);
  };

  return (
    <div style={{ padding: 24, maxWidth: 800, margin: "0 auto" }}>
      <h1>CV Reader AI</h1>
      <form onSubmit={uploadFile}>
        <input
          type="file"
          accept=".pdf"
          onChange={e => setFile(e.target.files[0])}
          style={{ marginBottom: 16 }}
        />
        <br />
        <button type="submit" disabled={!file || loading}>
          {loading ? "Uploading..." : "Upload CV"}
        </button>
      </form>
      {result && (
        <div style={{ marginTop: 32 }}>
          <h2>Extracted Information</h2>
          <pre style={{ background: "#f4f4f4", padding: 16 }}>
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

export default App;
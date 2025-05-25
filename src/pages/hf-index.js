import { useState } from "react";
import { useDropzone } from "react-dropzone";

export default function Home() {
  const [summary, setSummary] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [fileName, setFileName] = useState("");

  const HF_TOKEN = process.env.NEXT_PUBLIC_HF_TOKEN;

  const { getRootProps, getInputProps } = useDropzone({
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1,
    onDrop: async (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (!file) return;
      setFileName(file.name);
      setIsLoading(true);
      setSummary("");
      try {
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("https://hanafiq-cv-extraction-api.hf.space/api/extract-cv", {
          method: "POST",
          headers: {
            'accept': 'application/json',
            'Authorization': `Bearer ${HF_TOKEN}`,
          },
          body: formData,
        });

        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

        const data = await response.json();
        setSummary(JSON.stringify(data, null, 2));
      } catch (error) {
        setSummary("Failed to process the PDF document.");
      } finally {
        setIsLoading(false);
      }
    }
  });

  return (
    <div className="app-container">
      <div className="sidebar">
        <div className="sidebar-icon active"><span>✨</span></div>
        <div className="sidebar-icon"><span>🔍</span></div>
        <div className="sidebar-icon"><span>📁</span></div>
        <div className="sidebar-icon"><span>⚙️</span></div>
        <div className="sidebar-icon user"><span>👤</span></div>
      </div>
      
      <div className="main-content">
        <div className="header">
          <h1>CV Assistant by Hanafiq</h1>
        </div>
        
        <div className="greeting-section">
          <h2>Hi there, <span className="highlight">Hanafiq</span></h2>
          <h3>What would you like to do today?</h3>
          <p className="subtitle">Upload a CV to get started or explore the options below</p>
        </div>
        
        <div className="action-cards">
          <div className="card" {...getRootProps()}>
            <input {...getInputProps()} />
            <div className="card-icon">📤</div>
            <h4>Upload a CV</h4>
            <p>Drag & drop a PDF or click to select</p>
          </div>
          
          <div className="card">
            <div className="card-icon">📊</div>
            <h4>View Analysis</h4>
            <p>Check previous CV analyses</p>
          </div>
          
          <div className="card">
            <div className="card-icon">✏️</div>
            <h4>Edit Templates</h4>
            <p>Customize your CV analyses</p>
          </div>
        </div>
        
        {fileName && (
          <div className="file-info">
            <span className="file-icon">📄</span>
            <span className="file-name">{fileName}</span>
            {isLoading ? (
              <div className="loading-spinner"></div>
            ) : (
              <span className="file-status">Processed</span>
            )}
          </div>
        )}
        
        {isLoading && (
          <div className="processing-indicator">
            <div className="spinner"></div>
            <p>Analyzing your CV...</p>
          </div>
        )}
        
        {summary && (
          <div className="result-container">
            <h3>CV Analysis Result</h3>
            <div className="result-content">
              <pre>{summary}</pre>
            </div>
          </div>
        )}
        
        <div className="input-container">
          <input 
            type="text" 
            placeholder="Ask questions about the CV analysis..." 
            disabled={!summary} 
          />
          <button className="attach-button">📎</button>
          <button className="send-button">➤</button>
        </div>
      </div>
      
      <style jsx>{`
        .app-container {
          display: flex;
          height: 100vh;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        }
        
        .sidebar {
          background: #f5f5f7;
          width: 60px;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 20px 0;
        }
        
        .sidebar-icon {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 15px;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .sidebar-icon:hover, .sidebar-icon.active {
          background: #e4e4e7;
        }
        
        .sidebar-icon.user {
          margin-top: auto;
        }
        
        .main-content {
          flex: 1;
          padding: 30px 40px;
          overflow-y: auto;
          background: white;
        }
        
        .header h1 {
          margin: 0;
          font-size: 22px;
          font-weight: 600;
          color: #333;
        }
        
        .greeting-section {
          margin: 50px 0 30px;
          max-width: 600px;
        }
        
        .greeting-section h2 {
          font-size: 28px;
          margin: 0 0 5px 0;
          color: #222;
        }
        
        .greeting-section h3 {
          font-size: 24px;
          margin: 0 0 12px 0;
          font-weight: 400;
          color: #333;
        }
        
        .highlight {
          color: #8252c7;
        }
        
        .subtitle {
          color: #666;
          margin: 0;
          font-size: 15px;
        }
        
        .action-cards {
          display: flex;
          gap: 20px;
          margin: 30px 0;
          flex-wrap: wrap;
        }
        
        .card {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          padding: 20px;
          width: 180px;
          box-shadow: 0 4px 10px rgba(0,0,0,0.03);
          cursor: pointer;
          transition: all 0.2s;
          text-align: center;
        }
        
        .card:hover {
          transform: translateY(-3px);
          box-shadow: 0 6px 15px rgba(0,0,0,0.07);
          border-color: #c4c8d0;
        }
        
        .card-icon {
          font-size: 28px;
          margin-bottom: 15px;
        }
        
        .card h4 {
          margin: 0 0 10px;
          font-size: 16px;
          color: #333;
        }
        
        .card p {
          margin: 0;
          font-size: 13px;
          color: #666;
        }
        
        .file-info {
          display: flex;
          align-items: center;
          margin: 20px 0;
          padding: 12px;
          background: #f9f9fb;
          border-radius: 8px;
          max-width: 600px;
        }
        
        .file-icon {
          margin-right: 10px;
          font-size: 18px;
        }
        
        .file-name {
          flex: 1;
          font-size: 14px;
          color: #444;
        }
        
        .file-status {
          background: #e6f7e6;
          color: #2e7d32;
          padding: 3px 8px;
          border-radius: 4px;
          font-size: 12px;
        }
        
        .processing-indicator {
          display: flex;
          align-items: center;
          margin: 20px 0;
          max-width: 600px;
        }
        
        .spinner {
          border: 3px solid rgba(0,0,0,0.1);
          border-top: 3px solid #8252c7;
          border-radius: 50%;
          width: 20px;
          height: 20px;
          animation: spin 1s linear infinite;
          margin-right: 12px;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .result-container {
          margin: 30px 0;
          max-width: 800px;
        }
        
        .result-container h3 {
          margin: 0 0 15px;
          font-size: 18px;
          color: #333;
        }
        
        .result-content {
          background: #f8f9fa;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          padding: 20px;
          max-height: 400px;
          overflow-y: auto;
        }
        
        .result-content pre {
          margin: 0;
          white-space: pre-wrap;
          font-size: 14px;
          color: #333;
          font-family: "Monaco", "Menlo", monospace;
        }
        
        .input-container {
          position: relative;
          margin: 40px 0 20px;
          max-width: 800px;
        }
        
        .input-container input {
          border: 1px solid #ddd;
          border-radius: 12px;
          outline: none;
          width: calc(100% - 40px);
          padding: 20px;
          font-size: 15px;
          transition: all .2s;
        }
        
        .input-container input:focus {
          border-color: #8252c7;
          box-shadow: 0 0 0 2px rgba(130, 82, 199, 0.2);
        }
        
        .attach-button, .send-button {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          font-size: 18px;
          color: #555;
          padding: 5px;
        }
        
        .attach-button {
          right: 45px;
        }
        
        .send-button {
          right: 15px;
          color: #8252c7;
        }
      `}</style>
    </div>
  );
}
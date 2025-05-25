import { useState } from "react";
import { useDropzone } from "react-dropzone";

export default function Home() {
  const [summary, setSummary] = useState("");
  const [parsedData, setParsedData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [fileName, setFileName] = useState("");

  const { getRootProps, getInputProps } = useDropzone({
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1,
    onDrop: async (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (!file) return;
      
      setFileName(file.name);
      setIsLoading(true);
      setSummary("");
      setParsedData(null);
      
      try {
        // Create a FormData object to send the file
        const formData = new FormData();
        formData.append("file", file);
        
        // Call your Next.js API route
        const response = await fetch("/api/extract", {
          method: "POST",
          body: formData,
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        // Get the response data
        const result = await response.json();
        console.log("Result from API:", result);
        // Handle the response
        setSummary(result.text || result.summary || JSON.stringify(result));
        
        // If the response includes parsed data
        if (result.data) {
          setParsedData(result.data);
        }
      } catch (error) {
        console.error("Error processing PDF:", error);
        setSummary("Failed to process the PDF document: " + error.message);
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
          <h1>CV Assistant</h1>
        </div>
        
        <div className="greeting-section">
          <h2>Hi there, <span className="highlight">John</span></h2>
          <h3>What would you like to know?</h3>
          <p className="subtitle">Upload a CV to analyze it or ask questions about previous analyses</p>
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
            <p>Analyzing your CV with Google AI...</p>
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
          background-color: #f5f5f7;
        }
        
        .sidebar {
          background: #ffffff;
          width: 60px;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 20px 0;
          border-right: 1px solid #e5e7eb;
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
          background: #f0f0f5;
        }
        
        .sidebar-icon.user {
          margin-top: auto;
        }
        
        .main-content {
          flex: 1;
          padding: 30px 40px;
          overflow-y: auto;
          background: white;
          border-radius: 15px 0 0 15px;
          margin-left: 10px;
          box-shadow: -5px 0 15px rgba(0,0,0,0.02);
        }
        
        .header h1 {
          margin: 0;
          font-size: 24px;
          font-weight: 600;
          color: #333;
          background: linear-gradient(90deg, #8252c7, #5d40a8);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        
        .greeting-section {
          margin: 40px 0 30px;
          max-width: 600px;
        }
        
        .greeting-section h2 {
          font-size: 32px;
          margin: 0 0 5px 0;
          color: #222;
          font-weight: 700;
        }
        
        .greeting-section h3 {
          font-size: 24px;
          margin: 0 0 12px 0;
          font-weight: 500;
          color: #333;
        }
        
        .highlight {
          color: #8252c7;
        }
        
        .subtitle {
          color: #666;
          margin: 0;
          font-size: 16px;
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
          border-radius: 16px;
          padding: 25px;
          width: 180px;
          box-shadow: 0 4px 10px rgba(0,0,0,0.03);
          cursor: pointer;
          transition: all 0.3s;
          text-align: center;
        }
        
        .card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 20px rgba(130, 82, 199, 0.1);
          border-color: #8252c7;
        }
        
        .card-icon {
          font-size: 32px;
          margin-bottom: 15px;
        }
        
        .card h4 {
          margin: 0 0 10px;
          font-size: 18px;
          color: #333;
        }
        
        .card p {
          margin: 0;
          font-size: 14px;
          color: #666;
        }
        
        .file-info {
          display: flex;
          align-items: center;
          margin: 25px 0;
          padding: 15px;
          background: #f9f9fb;
          border-radius: 12px;
          max-width: 600px;
          border-left: 4px solid #8252c7;
        }
        
        .file-icon {
          margin-right: 15px;
          font-size: 20px;
        }
        
        .file-name {
          flex: 1;
          font-size: 16px;
          color: #444;
          font-weight: 500;
        }
        
        .file-status {
          background: #e6f7e6;
          color: #2e7d32;
          padding: 5px 10px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
        }
        
        .loading-spinner {
          border: 3px solid rgba(0,0,0,0.1);
          border-top: 3px solid #8252c7;
          border-radius: 50%;
          width: 24px;
          height: 24px;
          animation: spin 1s linear infinite;
        }
        
        .processing-indicator {
          display: flex;
          align-items: center;
          margin: 30px 0;
          max-width: 600px;
          padding: 20px;
          background: #f0f0f5;
          border-radius: 12px;
        }
        
        .spinner {
          border: 4px solid rgba(130, 82, 199, 0.1);
          border-top: 4px solid #8252c7;
          border-radius: 50%;
          width: 30px;
          height: 30px;
          animation: spin 1s linear infinite;
          margin-right: 15px;
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
          font-size: 20px;
          font-weight: 600;
          color: #333;
        }
        
        .result-content {
          background: #f8f9fa;
          border: 1px solid #e5e7eb;
          border-radius: 16px;
          padding: 25px;
          max-height: 400px;
          overflow-y: auto;
          box-shadow: 0 4px 12px rgba(0,0,0,0.03);
        }
        
        .result-content pre {
          margin: 0;
          white-space: pre-wrap;
          font-size: 15px;
          color: #333;
          font-family: "Monaco", "Menlo", monospace;
          line-height: 1.6;
        }
        
        .input-container {
          position: relative;
          margin: 40px 0 20px;
          max-width: 800px;
        }
        
        .input-container input {
          border: 1px solid #ddd;
          border-radius: 16px;
          outline: none;
          width: 100%;
          padding: 18px 80px 18px 20px;
          font-size: 16px;
          transition: all .3s;
          box-shadow: 0 2px 8px rgba(0,0,0,0.02);
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
          font-size: 20px;
          padding: 10px;
          transition: all 0.2s;
        }
        
        .attach-button {
          right: 50px;
          color: #888;
        }
        
        .attach-button:hover {
          color: #666;
        }
        
        .send-button {
          right: 15px;
          color: #8252c7;
          background: #f0e7ff;
          border-radius: 50%;
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0;
        }
        
        .send-button:hover {
          background: #e1d2ff;
          transform: translateY(-50%) scale(1.05);
        }
      `}</style>
    </div>
  );
}
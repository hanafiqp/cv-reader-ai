import Link from "next/link";

export default function Custom404() {
  return (
    <div className="error-container">
      <div className="error-card">
        <div className="error-icon">404</div>
        <h1>Page Not Found</h1>
        <p>Oops! The page you're looking for doesn't exist.</p>
        <Link href="/" className="home-button">
          Return Home
        </Link>
      </div>
      
      <style jsx>{`
        .error-container {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          background-color: #f5f5f7;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        }
        
        .error-card {
          background: white;
          border-radius: 16px;
          padding: 40px;
          text-align: center;
          box-shadow: 0 4px 20px rgba(0,0,0,0.08);
          max-width: 500px;
          width: 90%;
        }
        
        .error-icon {
          font-size: 80px;
          font-weight: 700;
          margin-bottom: 20px;
          background: linear-gradient(90deg, #8252c7, #5d40a8);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        
        h1 {
          font-size: 28px;
          margin: 0 0 15px;
          color: #333;
        }
        
        p {
          color: #666;
          margin: 0 0 30px;
          font-size: 16px;
          line-height: 1.5;
        }
        
        .home-button {
          display: inline-block;
          background: #8252c7;
          color: white;
          padding: 12px 24px;
          border-radius: 30px;
          text-decoration: none;
          font-weight: 500;
          transition: all 0.3s;
        }
        
        .home-button:hover {
          background: #6b40b5;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(130, 82, 199, 0.3);
        }
      `}</style>
    </div>
  );
}
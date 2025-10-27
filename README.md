# CV Reader AI 🤖📄

AI-powered CV/Resume extraction and parsing API built with Next.js and Google Gemini AI. Extract structured data from PDF CVs with intelligent tagging system for advanced filtering and search.

## ✨ Features

- 📄 **PDF Parsing**: Extract text from PDF resumes
- 🤖 **AI-Powered Extraction**: Use Google Gemini to extract structured data
- 🏷️ **Smart Tagging**: Automatic tag generation with natural prefix format
- 🔍 **Advanced Filtering**: Category-based search filters
- ⚡ **Optimized Performance**: ~15-25 seconds processing time
- 🌐 **CORS Enabled**: Ready for external API calls
- 🚀 **Vercel Ready**: Optimized for serverless deployment

## 📊 Data Extraction

### Extracted Fields:
- Personal Info (name, email, phone, location, nationality)
- Experience (total years, level, recent job)
- Education (degree, field, institution)
- Skills (hard skills, soft skills, languages, certifications)
- Work Preferences (remote, salary, availability)
- Work History (detailed work experience)
- Education History (detailed education background)
- Projects (if mentioned in CV)
- **Smart Tags** (location, skills, experience, education, etc.)

### Tag System (Natural Prefix Format):
```json
{
  "tags": [
    "location jakarta",
    "country indonesia",
    "skill javascript",
    "skill react",
    "experience 5-7 years",
    "level senior",
    "education bachelor",
    "degree computer science",
    "worktype remote",
    "language english fluent"
  ]
}
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- Google AI API Key ([Get it here](https://makersuite.google.com/app/apikey))
- Vercel account (for deployment)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/hanafiqp/cv-reader-ai.git
cd cv-reader-ai
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env.local
```

Edit `.env.local`:
```env
NEXT_PUBLIC_GOOGLE_API_KEY=your_gemini_api_key_here
NODE_ENV=development
```

4. **Run development server**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 📡 API Usage

### Endpoint: `/api/extract`

**Method:** POST  
**Content-Type:** application/pdf (binary)  
**Max File Size:** 10MB  
**Timeout:** 60 seconds

### Example Request (cURL):
```bash
curl -X POST \
  http://localhost:3000/api/extract \
  -H "Content-Type: application/pdf" \
  --data-binary "@path/to/resume.pdf"
```

### Example Request (JavaScript):
```javascript
const formData = new FormData();
formData.append('file', pdfFile);

const response = await fetch('https://your-app.vercel.app/api/extract', {
  method: 'POST',
  body: pdfFile, // Send PDF as binary
  headers: {
    'Content-Type': 'application/pdf'
  }
});

const result = await response.json();
console.log(result.data);
```

### Success Response:
```json
{
  "success": true,
  "processingTime": 18500,
  "data": {
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "currentLocation": "Jakarta",
    "totalExperienceYears": 5,
    "hardSkills": "JavaScript, React, Node.js, AWS",
    "tags": [
      "location jakarta",
      "country indonesia",
      "skill javascript",
      "skill react",
      "experience 5-7 years",
      "level senior"
    ],
    "tagMetadata": {
      "totalTags": 25,
      "searchFilters": {
        "locations": ["jakarta"],
        "skills": ["javascript", "react", "node.js"],
        "experienceRanges": ["5-7 years"]
      }
    }
  }
}
```

### Error Response:
```json
{
  "error": "AI returned invalid JSON format.",
  "hint": "Please try uploading the CV again."
}
```

## 🎯 Performance Optimization

### Processing Time Breakdown:
- PDF Parsing: ~1-2 seconds
- AI Processing: ~10-20 seconds
- Tag Generation: ~1-2 seconds
- **Total: 15-25 seconds** ✅

### Optimization Features:
- ✅ PDF size limit (10MB)
- ✅ Page limit (50 pages)
- ✅ Text truncation (20,000 chars)
- ✅ AI timeout (25s)
- ✅ Aggressive JSON parsing
- ✅ Error recovery mechanisms

See [PERFORMANCE_OPTIMIZATION.md](./PERFORMANCE_OPTIMIZATION.md) for details.

## 🏷️ Tag System

### Tag Categories:
- `location [city]` - Location tags
- `country [country]` - Country tags  
- `skill [skill]` - Technical/hard skills
- `softskill [skill]` - Soft skills
- `experience [range]` - Experience years (e.g., "3-5 years")
- `level [level]` - Experience level (Junior, Mid-Level, Senior)
- `education [level]` - Education level
- `degree [degree]` - Degree/major
- `industry [industry]` - Industry experience
- `worktype [type]` - Work preference (Remote, Hybrid, On-site)
- `language [language]` - Language proficiency
- `certification [cert]` - Certifications

### Filtering Examples:
```javascript
// Filter by location
const jakartaCandidates = cvs.filter(cv => 
  cv.tags.includes("location jakarta")
);

// Filter by skill
const reactDevelopers = cvs.filter(cv => 
  cv.tags.includes("skill react")
);

// Multi-criteria filter
const seniorReactDevsInJakarta = cvs.filter(cv => 
  cv.tags.includes("location jakarta") &&
  cv.tags.includes("skill react") &&
  cv.tags.includes("level senior")
);
```

See [NATURAL_PREFIX_GUIDE.md](./NATURAL_PREFIX_GUIDE.md) for complete tag system documentation.

## 🚀 Deployment

### Deploy to Vercel:

1. **Push to GitHub**
```bash
git add .
git commit -m "Initial commit"
git push
```

2. **Import to Vercel**
- Go to [vercel.com](https://vercel.com)
- Import your GitHub repository
- Add environment variable: `NEXT_PUBLIC_GOOGLE_API_KEY`

3. **Configure**
- Recommended: Vercel Pro plan (60s timeout)
- Free tier: 10s timeout (NOT sufficient for AI processing)

### Environment Variables (Vercel):
```
NEXT_PUBLIC_GOOGLE_API_KEY=your_api_key
NODE_ENV=production
```

## 📂 Project Structure

```
cv-reader-ai/
├── src/
│   ├── pages/
│   │   ├── api/
│   │   │   ├── extract.js      # Main CV extraction API
│   │   │   ├── tags.js         # Get available tags
│   │   │   └── hello.js        # Health check
│   │   ├── index.js            # Homepage
│   │   └── tool/               # CV upload tool
│   ├── utils/
│   │   ├── tagManager.js       # Tag management system
│   │   ├── pdfParser.js        # PDF utilities
│   │   └── cvExtractor.js      # CV extraction helpers
│   └── styles/
├── public/                      # Static assets
├── vercel.json                 # Vercel configuration
├── .env.example                # Environment template
└── package.json
```

## 🛠️ Tech Stack

- **Framework:** Next.js 15
- **AI Model:** Google Gemini 1.5 Flash
- **PDF Parser:** pdf-parse
- **Deployment:** Vercel
- **Runtime:** Node.js 18+

## 📝 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/extract` | POST | Extract CV data from PDF |
| `/api/tags` | GET | Get available tag categories |
| `/api/hello` | GET | Health check |

## 🐛 Troubleshooting

### "AI request timeout"
- CV too long (>5 pages)
- Solution: Reduce CV size or upgrade Vercel plan

### "AI returned invalid JSON"
- AI model inconsistency
- Solution: Retry request (auto-fix included)

### "File too large"
- PDF > 10MB
- Solution: Compress PDF before upload

See [PERFORMANCE_OPTIMIZATION.md](./PERFORMANCE_OPTIMIZATION.md) for more troubleshooting.

## 📄 License

MIT License - see LICENSE file for details

## 🤝 Contributing

Contributions welcome! Please open an issue or PR.

## 📧 Contact

- GitHub: [@hanafiqp](https://github.com/hanafiqp)
- Project: [cv-reader-ai](https://github.com/hanafiqp/cv-reader-ai)

---

**Made with ❤️ using Next.js and Google Gemini AI**

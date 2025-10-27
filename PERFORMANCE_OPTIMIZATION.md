# CV Reader AI - Performance Optimization Guide

## ✅ Optimasi yang Telah Diterapkan

### 1. **Vercel Configuration (`vercel.json`)**
```json
{
  "functions": {
    "maxDuration": 60,      // 60 detik timeout (Free tier: 10s, Pro: 60s)
    "memory": 1024          // 1GB memory untuk proses AI
  }
}
```

### 2. **API Route Optimization**
- ✅ PDF size limit: 10MB maximum
- ✅ PDF page limit: 50 halaman maximum
- ✅ Text truncation: 20,000 karakter untuk performa
- ✅ AI timeout: 25 detik maximum
- ✅ Response timeout handling
- ✅ Better error messages

### 3. **AI Model Optimization**
```javascript
{
  model: "gemini-1.5-flash",  // Fastest Gemini model
  temperature: 0.1,            // Lower = more consistent
  maxOutputTokens: 4096,       // Reduced for speed
  topP: 0.8,
  topK: 10
}
```

### 4. **Prompt Optimization**
- ✅ Shortened prompt (dari ~3000 karakter → ~800 karakter)
- ✅ Clear JSON structure
- ✅ Explicit "no markdown" instruction
- ✅ Focused extraction (hanya data penting)

### 5. **JSON Parsing Enhancement**
- ✅ Aggressive markdown removal
- ✅ Auto-fix trailing commas
- ✅ Extract JSON from mixed text
- ✅ Better error handling

### 6. **Performance Monitoring**
```javascript
{
  pdfParsingTime: "logged",
  aiResponseTime: "logged", 
  totalProcessingTime: "returned in response"
}
```

## 📊 Expected Performance

### **Target Times:**
- PDF Parsing: ~1-2 seconds
- AI Processing: ~10-20 seconds
- Tag Processing: ~1-2 seconds
- **Total: 15-25 seconds** ✅

### **Current vs Target:**
- ❌ Before: 2-3 minutes (120-180s)
- ✅ After: 15-25 seconds

## 🚀 Deployment Instructions

### 1. **Environment Variables (Vercel Dashboard)**
```
NEXT_PUBLIC_GOOGLE_API_KEY=your_gemini_api_key_here
NODE_ENV=production
```

### 2. **Vercel Plan Requirements**

**Free Tier:**
- maxDuration: 10 seconds (NOT ENOUGH for AI processing)
- Recommended: Upgrade to Pro

**Pro Tier:**
- maxDuration: 60 seconds ✅
- 1GB memory ✅
- Required for this application

### 3. **Deploy Command**
```bash
# Push to GitHub (auto-deploy)
git add .
git commit -m "Performance optimization"
git push

# Or manual deploy
vercel --prod
```

## 🔧 Troubleshooting

### Error: "AI request timeout"
**Cause:** CV terlalu panjang atau AI response lambat
**Solution:**
- Reduce PDF to max 5 pages
- Simplify CV content
- Check Google AI API quota

### Error: "AI returned invalid JSON"
**Cause:** AI model returned malformed JSON
**Solution:** 
- Retry request (AI bisa inconsistent)
- API sudah include auto-fix untuk trailing commas
- Check logs di Vercel untuk raw response

### Error: "File too large"
**Cause:** PDF > 10MB
**Solution:** Compress PDF sebelum upload

### Slow Performance (>30s)
**Possible causes:**
1. Cold start (first request after idle)
2. Large PDF (>5 pages)
3. Google AI API throttling
4. Network latency

**Solutions:**
1. Keep function warm dengan periodic ping
2. Limit PDF size
3. Check API quota
4. Use CDN for static assets

## 📈 Monitoring

### Check Logs in Vercel:
```bash
vercel logs --follow
```

### Look for these metrics:
```
PDF parsed in 1234ms, text length: 5678
AI response received in 12345ms
JSON parsed successfully in 15678ms
Total processing time: 20000ms
```

## 🎯 Further Optimization Options

### Option 1: Streaming Response
```javascript
// Return partial data as it's processed
res.write(JSON.stringify({ status: 'processing', step: 'pdf' }));
// ... process
res.write(JSON.stringify({ status: 'processing', step: 'ai' }));
// ... AI call
res.end(JSON.stringify({ success: true, data }));
```

### Option 2: Queue System
```javascript
// For very large CVs
// 1. Accept upload → return job ID
// 2. Process in background
// 3. Poll for results
```

### Option 3: Cache Results
```javascript
// Cache by PDF hash
const hash = crypto.createHash('md5').update(buffer).digest('hex');
// Check cache before processing
```

## 🔐 Security Notes

1. **File Size Validation:** Max 10MB enforced
2. **PDF Validation:** Checks for valid PDF format
3. **Rate Limiting:** Consider adding rate limits
4. **CORS:** Currently allows all origins (*)
   - For production, restrict to your domain:
   ```javascript
   res.setHeader('Access-Control-Allow-Origin', 'https://yourdomain.com');
   ```

## ✅ Pre-Deploy Checklist

- [ ] Set `NEXT_PUBLIC_GOOGLE_API_KEY` in Vercel
- [ ] Verify Vercel plan (Pro recommended)
- [ ] Test with sample CVs locally
- [ ] Check Google AI API quota
- [ ] Monitor first deployment logs
- [ ] Test from external application
- [ ] Verify CORS headers work
- [ ] Check response times in production

## 📞 Support

If performance issues persist:
1. Check Vercel function logs
2. Verify API key is valid
3. Test with small CV first
4. Check Google AI API status
5. Monitor processing time metrics
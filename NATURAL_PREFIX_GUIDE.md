# CV Reader AI - Natural Prefix Tag System

## 🎯 **Update: Natural Prefix Tag System**

Sistem tagging telah diupdate untuk menggunakan **natural prefix format** yang lebih mudah dipahami dan digunakan untuk filtering.

## 📝 **Format Natural Prefix**

### **SEBELUM** (Titik Dua):
```json
{
  "tags": [
    "Skill: JavaScript",
    "Location: Jakarta", 
    "Experience: 5-7 years"
  ]
}
```

### **SESUDAH** (Natural Prefix):
```json
{
  "tags": [
    "skill javascript",
    "location jakarta",
    "experience 5-7 years"
  ]
}
```

## 🏷️ **Kategori Tags dengan Natural Prefixes**

### 1. **Location Tags**
- `location jakarta`
- `location bandung`
- `location surabaya`
- `country indonesia`
- `country singapore`
- `region southeast asia`
- `market asean`

### 2. **Experience Tags**
- `experience 0-1 years`
- `experience 1-2 years`
- `experience 3-5 years`
- `experience 5-7 years`
- `experience 7-10 years`
- `experience 10+ years`
- `level entry level`
- `level junior`
- `level mid-level`
- `level senior`
- `level lead`
- `level manager`

### 3. **Skill Tags**
- `skill javascript`
- `skill react`
- `skill node.js`
- `skill python`
- `skill aws`
- `softskill leadership`
- `softskill communication`
- `softskill problem solving`

### 4. **Education Tags**
- `education high school`
- `education diploma`
- `education bachelor`
- `education master`
- `education phd`
- `degree computer science`
- `degree information technology`
- `education top university`

### 5. **Industry Tags**
- `industry technology`
- `industry fintech`
- `industry banking`
- `industry healthcare`
- `industry manufacturing`
- `industry consulting`

### 6. **Work Preference Tags**
- `worktype remote`
- `worktype on-site`
- `worktype hybrid`
- `worktype flexible`
- `preference remote ready`
- `mobility flexible location`

### 7. **Salary Tags**
- `salary 5-10m idr`
- `salary 10-15m idr`
- `salary 15-20m idr`
- `salary 20m+ idr`
- `salary negotiable`

### 8. **Language Tags**
- `language english fluent`
- `language indonesian native`
- `language mandarin basic`

### 9. **Certification Tags**
- `certification aws certified`
- `certification google cloud certified`
- `certification pmp`
- `certification scrum master`

### 10. **Demographic Tags**
- `gender male`
- `gender female`
- `nationality indonesian`
- `nationality singaporean`
- `age young professional` (≤25)
- `age mid career` (26-35)
- `age senior professional` (35+)

### 11. **Special Tags**
- `specialization full stack developer`
- `specialization cloud computing`
- `specialization devops`
- `stack fullstack javascript`
- `role frontend developer`
- `role backend developer`
- `experience startup`
- `experience management`
- `career progressive growth`

## 💻 **Implementasi Filtering**

### **1. Simple Category Filter**
```javascript
// Filter by location
const jakartaCandidates = cvs.filter(cv => 
  cv.tags.includes("location jakarta")
);

// Filter by skill
const reactDevelopers = cvs.filter(cv => 
  cv.tags.includes("skill react")
);

// Filter by experience level
const seniorLevel = cvs.filter(cv => 
  cv.tags.includes("level senior")
);
```

### **2. Multiple Tags in Same Category**
```javascript
// Filter by multiple locations
const seaCandidates = cvs.filter(cv => 
  cv.tags.some(tag => 
    tag.startsWith("location ") && 
    ["jakarta", "singapore", "kuala lumpur"].some(city => 
      tag.includes(city)
    )
  )
);
```

### **3. Cross-Category Filtering**
```javascript
function advancedFilter(cvs, criteria) {
  return cvs.filter(cv => {
    let matchCount = 0;
    let totalCriteria = 0;

    // Check location
    if (criteria.location) {
      totalCriteria++;
      if (cv.tags.includes(`location ${criteria.location.toLowerCase()}`)) {
        matchCount++;
      }
    }

    // Check skill
    if (criteria.skill) {
      totalCriteria++;
      if (cv.tags.includes(`skill ${criteria.skill.toLowerCase()}`)) {
        matchCount++;
      }
    }

    // Check experience level
    if (criteria.level) {
      totalCriteria++;
      if (cv.tags.includes(`level ${criteria.level.toLowerCase()}`)) {
        matchCount++;
      }
    }

    // Check industry
    if (criteria.industry) {
      totalCriteria++;
      if (cv.tags.includes(`industry ${criteria.industry.toLowerCase()}`)) {
        matchCount++;
      }
    }

    // Return true if minimum match percentage is met
    const matchPercentage = totalCriteria > 0 ? (matchCount / totalCriteria) * 100 : 0;
    return matchPercentage >= (criteria.minMatch || 50);
  });
}

// Usage
const results = advancedFilter(cvDatabase, {
  location: "Jakarta",
  skill: "React",
  level: "Senior",
  industry: "Technology",
  minMatch: 75 // at least 3 out of 4 criteria must match
});
```

### **4. Extract Tags by Category**
```javascript
import tagManager from '../utils/tagManager.js';

// Extract all skills from tags array
const allSkills = tagManager.getTagsByCategory(cvTags, 'skill');
console.log(allSkills); // ["javascript", "react", "node.js"]

// Extract all locations
const allLocations = tagManager.getTagsByCategory(cvTags, 'location');
console.log(allLocations); // ["jakarta", "bandung"]

// Create structured search filters
const searchFilters = tagManager.createSearchFilters(cvTags);
console.log(searchFilters);
/* Output:
{
  locations: ["jakarta"],
  countries: ["indonesia"],
  skills: ["javascript", "react", "node.js"],
  softSkills: ["leadership", "communication"],
  industries: ["technology", "fintech"],
  educationLevels: ["bachelor"],
  degrees: ["computer science"],
  experienceLevels: ["senior"],
  experienceRanges: ["5-7 years"],
  workTypes: ["hybrid"],
  salaryRanges: ["15-20m idr"],
  languages: ["english fluent", "indonesian native"],
  certifications: ["aws certified"],
  genders: ["male"],
  nationalities: ["indonesian"],
  general: ["full stack developer"]
}
*/
```

## 🎯 **Keuntungan Natural Prefix System**

### ✅ **Pros:**
1. **Structured but Readable**: Tetap terstruktur tapi mudah dibaca manusia
2. **Easy Category Filtering**: Mudah filter berdasarkan kategori dengan `startsWith()`
3. **Consistent Format**: Format yang konsisten untuk semua tags
4. **Database Indexable**: Bisa di-index dengan baik di database untuk performa
5. **User Friendly**: Mudah dipahami oleh user dan developer

### ⚖️ **Trade-offs:**
1. **Slightly Longer**: Tags jadi sedikit lebih panjang
2. **Case Sensitivity**: Perlu handle case sensitivity dengan baik
3. **Parsing Required**: Butuh parsing untuk extract value dari prefix

## 🔧 **Best Practices**

### **1. Consistent Formatting**
```javascript
// ✅ Good - consistent lowercase
"location jakarta"
"skill javascript" 
"level senior"

// ❌ Bad - inconsistent case
"Location Jakarta"
"skill JavaScript"
"LEVEL senior"
```

### **2. Database Indexing**
```sql
-- Create indexes for common prefix patterns
CREATE INDEX idx_cv_tags_location ON cv_tags(tag) WHERE tag LIKE 'location %';
CREATE INDEX idx_cv_tags_skill ON cv_tags(tag) WHERE tag LIKE 'skill %';
CREATE INDEX idx_cv_tags_level ON cv_tags(tag) WHERE tag LIKE 'level %';
```

### **3. Search Query Optimization**
```javascript
// ✅ Efficient - specific prefix search
WHERE tags @> ARRAY['location jakarta']

// ✅ Efficient - category-based search  
WHERE EXISTS(SELECT 1 FROM unnest(tags) as tag WHERE tag LIKE 'skill %')

// ❌ Less efficient - generic search
WHERE 'jakarta' = ANY(tags)
```

## 📊 **Example API Response**

```json
{
  "success": true,
  "data": {
    "firstName": "John",
    "lastName": "Doe",
    "currentLocation": "Jakarta",
    "totalExperienceYears": 5,
    "hardSkills": "JavaScript, React, Node.js",
    "tags": [
      "location jakarta",
      "country indonesia", 
      "region southeast asia",
      "experience 5-7 years",
      "level senior",
      "skill javascript",
      "skill react", 
      "skill node.js",
      "industry technology",
      "worktype hybrid",
      "specialization full stack developer",
      "stack fullstack javascript",
      "general full stack developer",
      "general team lead"
    ],
    "tagMetadata": {
      "totalTags": 14,
      "searchFilters": {
        "locations": ["jakarta"],
        "countries": ["indonesia"],
        "skills": ["javascript", "react", "node.js"],
        "industries": ["technology"],
        "workTypes": ["hybrid"],
        "experienceRanges": ["5-7 years"],
        "experienceLevels": ["senior"]
      }
    }
  }
}
```

Sistem natural prefix ini memberikan balance yang baik antara struktur yang jelas dan kemudahan penggunaan! 🚀

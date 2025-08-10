# Data Organization Structure

This document explains the new grade-level and subject-based organization of questions and learning content for YAYA's Learning Platform.

## 📁 Directory Structure

```
data/questions/
├── comprehensive-questions.json          # Legacy comprehensive file (fallback)
├── grade-1/                             # Grade 1 content (YAYA's current level)
│   ├── math/
│   │   └── math-questions.json          # Math questions and sets for Grade 1
│   ├── english/
│   │   └── english-questions.json       # English questions and sets for Grade 1
│   └── science/
│       └── science-questions.json       # Science questions and sets for Grade 1
├── grade-2/                             # Grade 2 content (future)
│   ├── math/
│   │   └── math-questions.json          # Template for Grade 2 math
│   ├── english/
│   │   └── english-questions.json       # Template for Grade 2 english
│   └── science/
│       └── science-questions.json       # Template for Grade 2 science
└── grade-3/                             # Grade 3 content (future)
    ├── math/
    ├── english/
    └── science/
```

## 🎯 Benefits of This Structure

### 1. **Scalability**
- Easy to add new grade levels as YAYA progresses
- Organized content by educational progression
- Clear separation of difficulty levels

### 2. **Maintainability**
- Each subject in its own file for easier management
- Grade-specific content is isolated and focused
- Templates ready for future grades

### 3. **Personalization**
- Current grade level is configurable in `personalization.ts`
- Content automatically loads based on YAYA's current grade
- Easy progression tracking

### 4. **Performance**
- Only loads relevant content for current grade level
- Smaller file sizes per subject
- Faster loading times

## 📊 Data Structure

### Individual Subject Files
Each subject file contains:
```json
{
  "questions": [
    {
      "id": "1m-001",
      "subject": "math",
      "topic": "Grade 1",
      "skill": "Basic Math",
      "prompt": "What is 2 + 3?",
      // ... rest of question data
    }
  ],
  "sets": [
    {
      "id": "grade-1-math",
      "title": "1st Grade Math",
      "subject": "math",
      "description": "Basic math concepts",
      "questionIds": ["1m-001", "1m-002", ...],
      // ... rest of set data
    }
  ]
}
```

### Grade Metadata
Grade metadata is computed dynamically from the actual data files using `getGradeMetadata()`. This ensures data consistency and eliminates the need for separate overview files.

## 🔧 Technical Implementation

### Current Grade Configuration
The current grade for YAYA is set in `/src/lib/personalization.ts`:
```typescript
content: {
  currentGrade: 1, // YAYA is currently in Grade 1
  // ...
}
```

### Data Loading
The system automatically loads the appropriate grade level:
1. Checks YAYA's current grade from personalization settings
2. Loads data from `grade-{currentGrade}/` directory
3. Falls back to comprehensive data if grade-specific data isn't found

### API Functions
- `getStaticAppData()` - Loads current grade data
- `getGradeData(grade)` - Loads specific grade data  
- `getAvailableGrades()` - Lists all available grades
- `getGradeMetadata(grade)` - Computes grade metadata from actual data

## 📚 Content Management

### Adding New Content

#### For Current Grade (Grade 1):
1. Edit the relevant subject file:
   - `data/questions/grade-1/math/math-questions.json`
   - `data/questions/grade-1/english/english-questions.json`
   - `data/questions/grade-1/science/science-questions.json`

#### For Future Grades:
1. Template files are already created for Grades 2 and 3
2. Replace template content with actual questions and sets
3. Update metadata to reflect the new content

### Migrating YAYA to Next Grade
When YAYA is ready for Grade 2:
1. Update `currentGrade: 2` in `/src/lib/personalization.ts`
2. Ensure Grade 2 content is populated
3. The system will automatically load Grade 2 content

## 🚀 Future Enhancements

### Planned Features:
- **Progress Tracking**: Track completion across grades
- **Adaptive Progression**: Automatically suggest grade advancement
- **Mixed Difficulty**: Combine questions from multiple grades
- **Parent Dashboard**: Grade-level progress reports for Papap Koyan
- **Backup & Sync**: Cloud sync of progress across grade levels

### Easy Expansion:
- Add new subjects (Art, Music, etc.) by creating new subject directories
- Create specialized tracks (Advanced Math, Reading Comprehension, etc.)
- Implement seasonal or themed content organization

## 🔄 Migration Process

The migration from comprehensive data to grade-based structure was completed using:
- `scripts/split-data-by-grade-subject.js` - Automated data splitting
- Preserved all original questions and sets
- Created template structure for future grades
- Maintained backward compatibility with fallback system

---
**This structure grows with YAYA! 🌱**

As YAYA advances through her educational journey, this organization will make it easy to:
- Track her progress across subjects and grade levels
- Provide age-appropriate content automatically
- Prepare advanced content in advance
- Celebrate achievements at each grade level

*Created with ❤️ by Papap Koyan for YAYA's educational journey*

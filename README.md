# YaYa Practice - Year 1 Learning App

A modern, kid-friendly web application for Year 1 practice in Math, English, and Science, aligned with the Cambridge Primary Curriculum.

![YaYa Practice](https://img.shields.io/badge/Grade-Year%201-blue) ![Cambridge](https://img.shields.io/badge/Curriculum-Cambridge%20Primary-green) ![Next.js](https://img.shields.io/badge/Built%20with-Next.js%2015-black)

## Features

### 🎯 Core Learning Features
- **Multiple Question Types**: MCQ (single/multi), short answer, true/false, fill-in-the-blank, matching, ordering
- **Subject Areas**: Math, English, and Science with Cambridge Primary alignment
- **Interactive Quiz Engine**: Real-time scoring, hints, explanations, and immediate feedback
- **Progress Tracking**: Local storage of attempts, scores, and completion status
- **Adaptive Practice**: Randomization and difficulty-based question selection

### 🎨 Kid-Friendly Design
- **Large Touch Targets**: Optimized for tablets and young learners
- **High Contrast Support**: Light, dark, and high-contrast themes
- **Dyslexia Support**: Optional dyslexia-friendly fonts
- **Audio Features**: Text-to-speech for questions (Web Speech API)
- **Visual Feedback**: Stars, badges, and celebration animations

### 📚 Content Management
- **JSON Question Upload**: Validate and import questions via dashboard
- **Schema Validation**: Zod-powered validation with helpful error messages
- **Template Download**: Example JSON structure for content creators
- **Version Control**: Keep track of uploaded content sets

### ♿ Accessibility
- **WCAG Compliant**: Proper ARIA labels, focus management, keyboard navigation
- **Screen Reader Support**: Semantic HTML and accessibility attributes
- **Skip Links**: Quick navigation for keyboard users
- **Reduced Motion**: Respects user preferences for animations

## Tech Stack

- **Framework**: Next.js 15 with TypeScript (App Router)
- **Styling**: Tailwind CSS with custom design tokens
- **Components**: shadcn/ui (Radix primitives)
- **Icons**: Lucide React
- **Themes**: next-themes with custom theme variants
- **Notifications**: sonner for toast messages
- **Validation**: Zod for runtime schema validation
- **Testing**: Jest + React Testing Library

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- Modern web browser with ES2020 support

### Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Start development server**
   ```bash
   npm run dev
   ```

3. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### First Run
The app will automatically load seed data from `public/examples/year1-seed.json` containing sample questions for all subjects.

## Content Format

### Question Schema

Questions are defined in JSON format with strict schema validation:

```json
{
  "id": "unique_question_id",
  "subject": "math" | "english" | "science",
  "topic": "Addition within 10",
  "skill": "Adding single digits",
  "prompt": "What is 3 + 4?",
  "type": "mcq_single",
  "choices": [
    { "id": "a", "text": "6" },
    { "id": "b", "text": "7" }
  ],
  "answer": "b",
  "explanation": "3 + 4 = 7. Count on your fingers!",
  "hint": "Try counting on your fingers!",
  "difficulty": "easy",
  "tags": ["addition", "number bonds"],
  "cambridgeRef": "Stage 1 Maths N1.2"
}
```

### Set Schema

Practice sets group related questions:

```json
{
  "id": "unique_set_id", 
  "title": "Addition Practice",
  "subject": "math",
  "description": "Practice basic addition within 10",
  "questionIds": ["q1", "q2", "q3"],
  "recommendedOrder": "fixed" | "random",
  "timeLimitSeconds": 300
}
```

### Supported Question Types

1. **MCQ Single** (`mcq_single`): Choose one correct answer
2. **MCQ Multiple** (`mcq_multi`): Choose multiple correct answers
3. **Short Answer** (`short_answer`): Type a text response
4. **True/False** (`true_false`): Binary choice questions
5. **Fill in the Blank** (`fill_blank`): Complete the sentence
6. **Matching** (`match`): Connect related items
7. **Ordering** (`order`): Arrange items in sequence

## Available Scripts

```bash
# Development server
npm run dev

# Production build
npm run build

# Start production server
npm start

# Run tests
npm test

# Lint code
npm run lint
```

## Project Structure

```
yaya-practice/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── practice/[subject]/ # Subject selection pages
│   │   ├── play/[setId]/      # Quiz player
│   │   ├── dashboard/         # Upload & management
│   │   └── layout.tsx         # Root layout
│   ├── components/            # Reusable UI components
│   │   ├── ui/               # Base UI components
│   │   └── theme-provider.tsx # Theme context
│   ├── lib/                   # Utility functions
│   │   ├── utils.ts          # General utilities
│   │   ├── scoring.ts        # Question scoring logic
│   │   └── persistence.ts    # Local storage management
│   └── types/                 # TypeScript definitions
├── public/
│   └── examples/
│       └── year1-seed.json    # Sample questions & sets
└── __tests__/                 # Test files
```

## Key Features

### Quiz Engine
- Real-time scoring with immediate feedback
- Hint system with optional scoring penalties
- Partial credit for multi-select questions
- Progress tracking and star ratings
- Text-to-speech support for accessibility

### Content Management
- JSON file upload with validation
- Template download for easy content creation
- Conflict resolution for duplicate IDs
- Upload history tracking

### Accessibility
- WCAG 2.1 AA compliant
- Keyboard navigation support
- High contrast theme option
- Reduced motion support
- Dyslexia-friendly font option

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## License

MIT License - Built with ❤️ for young learners everywhere.

// Personalization configuration for YAYA (Altheara Iswanda)
// Daughter of Papap Koyan

export const PERSONALIZATION = {
  // User identity
  user: {
    name: "YAYA",
    fullName: "Altheara Iswanda",
    nickname: "YAYA", 
    parentName: "Papap Koyan",
    relationship: "daughter"
  },

  // Personalized messages and content
  messages: {
    welcome: {
      title: "Welcome Back, YAYA! 🌟",
      subtitle: "Ready for another fun learning adventure?",
      encouragement: "You're doing amazing, YAYA! Let's learn something new today! 🎉"
    },
    
    motivational: [
      "Great job, YAYA! You're getting smarter every day! 📚",
      "Wow YAYA, that was fantastic! Keep it up! ⭐",
      "Amazing work, YAYA! Papap Koyan would be so proud! 💖", 
      "You're brilliant, YAYA! Let's keep learning together! 🚀",
      "Excellent thinking, YAYA! You're becoming such a smart student! 🌟"
    ],

    achievements: {
      excellent: "Outstanding work, YAYA! You're a superstar! 🌟✨",
      good: "Well done, YAYA! You're learning so well! 👏",
      improving: "Keep going, YAYA! You're getting better and better! 💪",
      encouragement: "That's okay, YAYA! Every mistake helps you learn! 💝"
    },

    subjectIntros: {
      math: "Let's explore the magical world of numbers, YAYA! 🔢✨",
      english: "Time for some word adventures, YAYA! Ready to read and write? 📖💫", 
      science: "Let's discover amazing things about our world, YAYA! 🔬🌍"
    }
  },

  // Personalized themes and colors
  themes: {
    primary: {
      // Soft pink and purple theme for YAYA
      colors: {
        primary: "#ec4899", // Pink-500
        primaryForeground: "#ffffff",
        accent: "#fdf2f8", // Pink-50
        accentForeground: "#be185d", // Pink-700
        card: "#fefcff", // Very light pink
        cardBorder: "#f9a8d4" // Pink-300
      }
    },
    
    subjects: {
      math: {
        primary: "#8b5cf6", // Purple-500 (YAYA's favorite color)
        light: "#f3e8ff", // Purple-50
        accent: "#a78bfa" // Purple-400
      },
      english: {
        primary: "#06b6d4", // Cyan-500 (bright and cheerful)
        light: "#cffafe", // Cyan-50
        accent: "#67e8f9" // Cyan-300
      },
      science: {
        primary: "#10b981", // Emerald-500 (nature and discovery)
        light: "#d1fae5", // Emerald-50  
        accent: "#6ee7b7" // Emerald-300
      }
    }
  },

  // Learning preferences and settings
  preferences: {
    // Difficulty adjustment for individual learning pace
    adaptiveDifficulty: true,
    
    // Extra encouragement and celebration
    extraCelebrations: true,
    
    // Audio preferences
    enableTTS: true,
    preferredVoice: "female", // If available
    
    // Visual preferences
    largerText: true,
    extraAnimations: true,
    showProgress: true,
    
    // Parent involvement features
    parentReports: {
      enabled: true,
      parentName: "Papap Koyan",
      showDetailedProgress: true
    }
  },

  // Custom content adjustments
  content: {
    // YAYA's current grade level
    currentGrade: 1, // YAYA is currently in Grade 1
    
    // Adjust question complexity for YAYA's level
    difficultyModifier: 0, // 0 = standard, -1 = easier, +1 = harder
    
    // Extra context in questions relating to family
    personalizeExamples: true,
    
    // Show extra hints and explanations
    detailedExplanations: true
  },

  // Special features for YAYA
  features: {
    // Daily learning streaks
    streakTracking: true,
    
    // Special badges and achievements
    personalizedBadges: [
      "YAYA's Math Star ⭐",
      "YAYA's Reading Champion 📚", 
      "YAYA's Science Explorer 🔬",
      "Papap's Pride 💖"
    ],
    
    // Progress sharing with family
    familySharing: {
      enabled: true,
      shareWith: ["Papap Koyan"],
      notifications: true
    }
  }
}

// Helper function to get personalized message
type MessageType = keyof typeof PERSONALIZATION.messages;
type MessageValue = string | string[] | Record<string, string>;

export function getPersonalizedMessage(type: MessageType, context?: string): string {
  const messages = PERSONALIZATION.messages[type] as MessageValue;
  
  if (Array.isArray(messages)) {
    // Return random message from array
    return messages[Math.floor(Math.random() * messages.length)];
  }
  
  if (typeof messages === 'object' && messages !== null && context) {
    const messageObj = messages as Record<string, string>;
    return messageObj[context] || messageObj.default || "Great job, YAYA!";
  }
  
  return typeof messages === 'string' ? messages : "Great job, YAYA!";
}

// Helper function to check if feature is enabled
export function isFeatureEnabled(feature: string): boolean {
  const keys = feature.split('.')
  let current: unknown = PERSONALIZATION.features
  
  for (const key of keys) {
    if (current && typeof current === 'object' && key in (current as object)) {
      current = (current as Record<string, unknown>)[key]
    } else {
      return false
    }
  }
  
  return Boolean(current)
}

// Helper function to get user's preferred name
export function getUserName(): string {
  return PERSONALIZATION.user.name
}

// Helper function to get personalized theme colors
export function getPersonalizedColors(subject?: string) {
  if (subject && PERSONALIZATION.themes.subjects[subject as keyof typeof PERSONALIZATION.themes.subjects]) {
    return PERSONALIZATION.themes.subjects[subject as keyof typeof PERSONALIZATION.themes.subjects]
  }
  
  return PERSONALIZATION.themes.primary.colors
}

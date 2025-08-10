import { Question, Answer } from '@/types'

export interface ScoreResult {
  isCorrect: boolean
  score: number
  partialCredit?: number
  feedback: string
}

export function scoreQuestion(question: Question, userAnswer: Answer): ScoreResult {
  const { type, answer: correctAnswer } = question

  switch (type) {
    case 'mcq_single':
      return scoreMCQSingle(correctAnswer as string, userAnswer as string)
    
    case 'mcq_multi':
      return scoreMCQMulti(correctAnswer as string[], userAnswer as string[])
    
    case 'short_answer':
      return scoreShortAnswer(correctAnswer as string | string[], userAnswer as string)
    
    case 'true_false':
      return scoreTrueFalse(correctAnswer as boolean, userAnswer as boolean)
    
    case 'fill_blank':
      return scoreFillBlank(correctAnswer as string | string[], userAnswer as string)
    
    case 'match':
      return scoreMatch(
        correctAnswer as Array<{ leftId: string; rightId: string }>, 
        userAnswer as Array<{ leftId: string; rightId: string }>
      )
    
    case 'order':
      return scoreOrder(correctAnswer as string[], userAnswer as string[])
    
    default:
      return {
        isCorrect: false,
        score: 0,
        feedback: 'Unknown question type'
      }
  }
}

function scoreMCQSingle(correctAnswer: string, userAnswer: string): ScoreResult {
  const isCorrect = correctAnswer === userAnswer
  return {
    isCorrect,
    score: isCorrect ? 1 : 0,
    feedback: isCorrect ? 'Correct!' : 'Not quite right. Try again!'
  }
}

function scoreMCQMulti(correctAnswer: string[], userAnswer: string[]): ScoreResult {
  if (!userAnswer || !Array.isArray(userAnswer)) {
    return {
      isCorrect: false,
      score: 0,
      feedback: 'Please select at least one answer.'
    }
  }

  const correctSet = new Set(correctAnswer)
  const userSet = new Set(userAnswer)
  
  const correctSelections = userAnswer.filter(ans => correctSet.has(ans)).length
  const incorrectSelections = userAnswer.filter(ans => !correctSet.has(ans)).length
  const missedSelections = correctAnswer.filter(ans => !userSet.has(ans)).length
  
  const isCorrect = correctSelections === correctAnswer.length && incorrectSelections === 0
  const partialCredit = Math.max(0, (correctSelections - incorrectSelections) / correctAnswer.length)
  
  return {
    isCorrect,
    score: isCorrect ? 1 : partialCredit,
    partialCredit: isCorrect ? undefined : partialCredit,
    feedback: isCorrect 
      ? 'Perfect! You got all the right answers!'
      : partialCredit > 0
        ? `Good try! You got ${correctSelections} out of ${correctAnswer.length} correct.`
        : 'Not quite right. Try again!'
  }
}

function scoreShortAnswer(correctAnswer: string | string[], userAnswer: string): ScoreResult {
  if (!userAnswer || typeof userAnswer !== 'string') {
    return {
      isCorrect: false,
      score: 0,
      feedback: 'Please provide an answer.'
    }
  }

  const userAnswerNormalized = userAnswer.toLowerCase().trim()
  
  const correctAnswers = Array.isArray(correctAnswer) 
    ? correctAnswer.map(ans => ans.toLowerCase().trim())
    : [correctAnswer.toLowerCase().trim()]
  
  const isCorrect = correctAnswers.includes(userAnswerNormalized)
  
  return {
    isCorrect,
    score: isCorrect ? 1 : 0,
    feedback: isCorrect ? 'Excellent!' : 'Not quite right. Check your spelling and try again!'
  }
}

function scoreTrueFalse(correctAnswer: boolean, userAnswer: boolean): ScoreResult {
  if (userAnswer === null || userAnswer === undefined) {
    return {
      isCorrect: false,
      score: 0,
      feedback: 'Please select True or False.'
    }
  }

  const isCorrect = correctAnswer === userAnswer
  return {
    isCorrect,
    score: isCorrect ? 1 : 0,
    feedback: isCorrect ? 'Correct!' : 'Not quite right. Try again!'
  }
}

function scoreFillBlank(correctAnswer: string | string[], userAnswer: string): ScoreResult {
  return scoreShortAnswer(correctAnswer, userAnswer)
}

function scoreMatch(
  correctAnswer: Array<{ leftId: string; rightId: string }>, 
  userAnswer: Array<{ leftId: string; rightId: string }>
): ScoreResult {
  if (!userAnswer || !Array.isArray(userAnswer)) {
    return {
      isCorrect: false,
      score: 0,
      feedback: 'Please match all items.'
    }
  }

  const correctPairs = new Set(correctAnswer.map(pair => `${pair.leftId}-${pair.rightId}`))
  const userPairs = new Set(userAnswer.map(pair => `${pair.leftId}-${pair.rightId}`))
  
  const correctMatches = userAnswer.filter(pair => 
    correctPairs.has(`${pair.leftId}-${pair.rightId}`)
  ).length
  
  const isCorrect = correctMatches === correctAnswer.length && userAnswer.length === correctAnswer.length
  const partialCredit = correctMatches / correctAnswer.length
  
  return {
    isCorrect,
    score: isCorrect ? 1 : partialCredit,
    partialCredit: isCorrect ? undefined : partialCredit,
    feedback: isCorrect 
      ? 'Perfect matching!'
      : partialCredit > 0
        ? `Good try! You got ${correctMatches} out of ${correctAnswer.length} matches correct.`
        : 'Try again! Look carefully at each item.'
  }
}

function scoreOrder(correctAnswer: string[], userAnswer: string[]): ScoreResult {
  if (!userAnswer || !Array.isArray(userAnswer)) {
    return {
      isCorrect: false,
      score: 0,
      feedback: 'Please arrange all items in order.'
    }
  }

  if (userAnswer.length !== correctAnswer.length) {
    return {
      isCorrect: false,
      score: 0,
      feedback: 'Please include all items in your answer.'
    }
  }

  const isCorrect = correctAnswer.every((item, index) => userAnswer[index] === item)
  
  if (isCorrect) {
    return {
      isCorrect: true,
      score: 1,
      feedback: 'Perfect order!'
    }
  }

  // Calculate partial credit based on longest common subsequence
  const lcs = longestCommonSubsequence(correctAnswer, userAnswer)
  const partialCredit = lcs / correctAnswer.length
  
  return {
    isCorrect: false,
    score: partialCredit,
    partialCredit,
    feedback: partialCredit > 0.5 
      ? 'Close! You got some of the order right.'
      : 'Not quite right. Think about the correct sequence.'
  }
}

function longestCommonSubsequence(arr1: string[], arr2: string[]): number {
  const m = arr1.length
  const n = arr2.length
  const dp: number[][] = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0))
  
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (arr1[i - 1] === arr2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1])
      }
    }
  }
  
  return dp[m][n]
}

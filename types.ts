export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  image?: {
    mimeType: string;
    data: string; // base64 encoded string
  }
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

export type Quiz = QuizQuestion[];

export interface Flashcard {
    front: string;
    back: string;
    srsData?: {
        interval: number; // in days
        easeFactor: number;
        dueDate: string; // ISO string
    };
}

export interface StudyDay {
    day: number;
    topic: string;
    task: string;
    completed: boolean;
}

export type StudyPlan = StudyDay[];

export interface DashboardStats {
    streak: number;
    lastActivityDate: string | null;
    quizzesCompleted: number;
    avgScore: number;
    flashcardsReviewed: number;
    tasksCompleted: number;
}
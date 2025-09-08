import type { DashboardStats } from '../types';

const STATS_KEY = 'ai-study-buddy-stats';

const getDefaultStats = (): DashboardStats => ({
    streak: 0,
    lastActivityDate: null,
    quizzesCompleted: 0,
    avgScore: 0,
    flashcardsReviewed: 0,
    tasksCompleted: 0,
});

export const getStats = (): DashboardStats => {
    const savedStats = localStorage.getItem(STATS_KEY);
    return savedStats ? JSON.parse(savedStats) : getDefaultStats();
};

const saveStats = (stats: DashboardStats) => {
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
};

const updateStreak = (stats: DashboardStats): DashboardStats => {
    const today = new Date().toISOString().split('T')[0];
    const lastActivity = stats.lastActivityDate;

    if (lastActivity === today) {
        // Already active today, do nothing to the streak
        return stats;
    }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    
    if (lastActivity === yesterdayStr) {
        // Continued the streak
        stats.streak += 1;
    } else {
        // Streak is broken
        stats.streak = 1;
    }
    
    stats.lastActivityDate = today;
    return stats;
};

export const logQuizCompletion = (score: number, totalQuestions: number) => {
    let stats = getStats();
    
    const newTotalPoints = (stats.avgScore * stats.quizzesCompleted) + (score / totalQuestions * 100);
    stats.quizzesCompleted += 1;
    stats.avgScore = newTotalPoints / stats.quizzesCompleted;
    
    stats = updateStreak(stats);
    saveStats(stats);
};

export const logFlashcardReview = () => {
    let stats = getStats();
    stats.flashcardsReviewed += 1;
    stats = updateStreak(stats);
    saveStats(stats);
};

export const logTaskCompletion = (isCompleted: boolean) => {
    let stats = getStats();
    stats.tasksCompleted += isCompleted ? 1 : -1;
    if (stats.tasksCompleted < 0) stats.tasksCompleted = 0;

    if (isCompleted) {
        stats = updateStreak(stats);
    }
    saveStats(stats);
};
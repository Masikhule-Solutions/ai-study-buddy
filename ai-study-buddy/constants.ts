export enum ActiveTab {
    Dashboard = 'dashboard',
    Chat = 'chat',
    Image = 'image',
    ImageGeneration = 'imageGeneration',
    Quiz = 'quiz',
    Flashcards = 'flashcards',
    StudyPlanner = 'studyPlanner',
}

export const pageTitles: Record<ActiveTab, string> = {
    [ActiveTab.Dashboard]: 'Learning Dashboard',
    [ActiveTab.Chat]: 'AI Chat',
    [ActiveTab.Image]: 'Analyze Notes',
    [ActiveTab.ImageGeneration]: 'Image Generator',
    [ActiveTab.Quiz]: 'Quiz Me',
    [ActiveTab.Flashcards]: 'Flashcard Deck',
    [ActiveTab.StudyPlanner]: 'My Study Plan',
};
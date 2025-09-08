
import React, { useState, useMemo } from 'react';
import Sidebar from './components/layout/Sidebar';
import PageHeader from './components/layout/PageHeader';
import ChatInterface from './components/ChatInterface';
import ImageAnalyzer from './components/ImageAnalyzer';
import QuizGenerator from './components/QuizGenerator';
import ImageGenerator from './components/ImageGenerator';
import FlashcardGenerator from './components/FlashcardGenerator';
import StudyPlanner from './components/StudyPlanner';
import Dashboard from './components/Dashboard';
import LandingPage from './components/LandingPage';
import { ActiveTab, pageTitles } from './constants';
import { isApiKeySet } from './services/geminiService';
import { BrainIcon } from './components/icons';

const ApiKeyError: React.FC = () => (
  <div className="flex items-center justify-center h-screen bg-gray-100 p-4">
    <div className="text-center bg-white p-8 rounded-lg shadow-lg max-w-lg">
      <BrainIcon className="h-16 w-16 mx-auto text-violet-500 mb-4" />
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Configuration Needed</h1>
      <p className="text-gray-600">
        Welcome to the AI Study Buddy! This deployed instance is for demonstration purposes only and is missing its Google Gemini API key.
      </p>
      <p className="text-gray-600 mt-2">
        To use the full functionality of the application, please clone the project and follow the setup instructions in the <strong>README.md</strong> file to run it on your local machine with your own API key.
      </p>
    </div>
  </div>
);

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>(ActiveTab.Chat);
  const [appLaunched, setAppLaunched] = useState(false);

  const pageTitle = useMemo(() => pageTitles[activeTab], [activeTab]);

  const renderContent = () => {
    switch (activeTab) {
      case ActiveTab.Dashboard:
        return <Dashboard />;
      case ActiveTab.Image:
        return <ImageAnalyzer />;
      case ActiveTab.ImageGeneration:
        return <ImageGenerator />;
      case ActiveTab.Quiz:
        return <QuizGenerator />;
      case ActiveTab.Flashcards:
        return <FlashcardGenerator />;
      case ActiveTab.StudyPlanner:
        return <StudyPlanner />;
      case ActiveTab.Chat:
      default:
        return <ChatInterface />;
    }
  };
  
  if (!isApiKeySet) {
    return <ApiKeyError />;
  }

  if (!appLaunched) {
    return <LandingPage onLaunch={() => setAppLaunched(true)} />;
  }

  return (
    <div className="flex h-screen bg-[#F8F7FA] text-gray-800 font-sans">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <PageHeader title={pageTitle} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="max-w-5xl mx-auto">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
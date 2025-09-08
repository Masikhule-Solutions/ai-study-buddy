
import React from 'react';
import { useOnScreen } from '../hooks/useOnScreen';
import { 
    BrainIcon, BookOpenIcon, AcademicCapIcon, CheckBadgeIcon, 
    PhotoIcon, CalendarDaysIcon, FireIcon, SparklesIcon, ChevronRightIcon 
} from './icons';

interface LandingPageProps {
  onLaunch: () => void;
}

const features = [
    { icon: <BookOpenIcon className="h-8 w-8 text-violet-300" />, title: 'Multimodal AI Chat', description: 'Chat with your AI tutor using text, images, and documents for context-aware, personalized help.' },
    { icon: <AcademicCapIcon className="h-8 w-8 text-violet-300" />, title: 'SRS Flashcards', description: 'Master any subject with intelligent flashcards that adapt to your memory using Spaced Repetition.' },
    { icon: <CheckBadgeIcon className="h-8 w-8 text-violet-300" />, title: 'Dynamic Quizzes', description: 'Test your knowledge on any topic with AI-generated quizzes that provide instant feedback.' },
    { icon: <CalendarDaysIcon className="h-8 w-8 text-violet-300" />, title: 'Smart Study Planner', description: 'Get a personalized, day-by-day study plan to achieve your learning goals, exportable to your calendar.' },
    { icon: <PhotoIcon className="h-8 w-8 text-violet-300" />, title: 'Image Analysis', description: 'Turn photos of your notes or textbooks into structured summaries and key concepts.' },
    { icon: <FireIcon className="h-8 w-8 text-violet-300" />, title: 'Gamified Dashboard', description: 'Track your progress, maintain study streaks, and earn badges to stay motivated on your learning journey.' },
];

const AnimatedComponent = ({ children }: { children: React.ReactNode }) => {
    const [ref, isVisible] = useOnScreen({ threshold: 0.1 });
    return (
        <div ref={ref} className={`transition-all duration-700 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            {children}
        </div>
    );
};

const LandingPage: React.FC<LandingPageProps> = ({ onLaunch }) => {
  return (
    <div className="bg-gray-900 text-white min-h-screen font-sans">
      <style>{`
        .animated-gradient {
          background: linear-gradient(-45deg, #23074d, #cc5333, #2c3e50, #4b79a1);
          background-size: 400% 400%;
          animation: gradient 15s ease infinite;
        }
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>

      {/* Hero Section */}
      <section className="relative flex flex-col items-center justify-center min-h-screen p-8 text-center animated-gradient">
        <div className="absolute inset-0 bg-black/30"></div>
        <div className="relative z-10">
            <AnimatedComponent>
                <BrainIcon className="h-24 w-24 mx-auto text-white" />
            </AnimatedComponent>
            <AnimatedComponent>
                <h1 className="text-5xl md:text-7xl font-bold mt-6 tracking-tight">
                    AI Study Buddy
                </h1>
            </AnimatedComponent>
             <AnimatedComponent>
                <p className="mt-4 text-2xl md:text-4xl font-light text-gray-200">
                    Stop Memorizing. <span className="font-semibold text-white">Start Understanding.</span>
                </p>
            </AnimatedComponent>
            <AnimatedComponent>
                <p className="max-w-2xl mx-auto mt-6 text-lg text-gray-300">
                    Your all-in-one learning partner. Go beyond simple answers with a suite of intelligent tools designed to help you learn faster, study smarter, and retain knowledge longer.
                </p>
            </AnimatedComponent>
            <AnimatedComponent>
                 <button 
                    onClick={onLaunch}
                    className="mt-12 px-8 py-4 bg-white text-gray-900 font-bold text-lg rounded-full shadow-2xl hover:bg-gray-200 transform hover:scale-105 transition-all duration-300 group"
                >
                    Launch Study Buddy
                    <ChevronRightIcon className="inline-block h-6 w-6 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
                </button>
            </AnimatedComponent>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-gray-900">
        <div className="max-w-6xl mx-auto px-8">
            <AnimatedComponent>
                <div className="text-center mb-16">
                    <SparklesIcon className="h-10 w-10 mx-auto text-violet-400" />
                    <h2 className="text-4xl font-bold mt-4">A Smarter Way to Study</h2>
                    <p className="mt-2 text-lg text-gray-400">Everything you need to succeed, all in one place.</p>
                </div>
            </AnimatedComponent>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {features.map((feature, index) => (
                    <AnimatedComponent key={index}>
                        <div className="bg-gray-800/50 backdrop-blur-md p-8 rounded-2xl border border-gray-700 h-full transform hover:-translate-y-2 transition-transform duration-300">
                            <div className="mb-4">{feature.icon}</div>
                            <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                            <p className="text-gray-400">{feature.description}</p>
                        </div>
                    </AnimatedComponent>
                ))}
            </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-24 bg-gray-800">
        <div className="max-w-4xl mx-auto px-8 text-center">
            <AnimatedComponent>
                <BrainIcon className="h-16 w-16 mx-auto text-violet-400" />
            </AnimatedComponent>
            <AnimatedComponent>
                <h2 className="text-4xl font-bold mt-6">Ready to Revolutionize Your Studying?</h2>
            </AnimatedComponent>
            <AnimatedComponent>
                <p className="mt-4 text-lg text-gray-300">
                    Unlock your full potential and achieve academic excellence. Your personal AI tutor is just a click away.
                </p>
            </AnimatedComponent>
            <AnimatedComponent>
                 <button 
                    onClick={onLaunch}
                    className="mt-10 px-8 py-4 bg-violet-600 text-white font-bold text-lg rounded-full shadow-2xl hover:bg-violet-700 transform hover:scale-105 transition-all duration-300 group"
                >
                    Get Started Now
                    <ChevronRightIcon className="inline-block h-6 w-6 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
                </button>
            </AnimatedComponent>
        </div>
      </section>

      <footer className="py-8 text-center text-gray-500 text-sm">
        <p>&copy; {new Date().getFullYear()} AI Study Buddy. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default LandingPage;

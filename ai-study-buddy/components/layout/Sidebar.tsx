import React from 'react';
import { ActiveTab } from '../../constants';
import { BrainIcon, AcademicCapIcon, CalendarDaysIcon, CheckBadgeIcon, ClipboardDocumentListIcon, PhotoIcon, BookOpenIcon } from '../icons';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
}

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ icon, label, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
            isActive 
                ? 'bg-violet-600/10 text-violet-700' 
                : 'text-gray-600 hover:bg-violet-600/5 hover:text-violet-700'
        }`}
    >
        {icon}
        <span>{label}</span>
    </button>
);

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  return (
    <aside className="w-64 bg-white/60 backdrop-blur-xl border-r border-gray-200/80 p-4 flex-shrink-0 flex flex-col">
        <div className="flex items-center space-x-2 p-2 mb-6">
            <BrainIcon className="h-8 w-8 text-violet-600"/>
            <h1 className="text-xl font-bold text-gray-800">AI Study Buddy</h1>
        </div>

        <nav className="flex-1 space-y-2">
            <NavItem
                isActive={activeTab === ActiveTab.Chat}
                onClick={() => setActiveTab(ActiveTab.Chat)}
                icon={<BookOpenIcon className="h-5 w-5"/>}
                label="AI Chat"
            />
            <NavItem
                isActive={activeTab === ActiveTab.StudyPlanner}
                onClick={() => setActiveTab(ActiveTab.StudyPlanner)}
                icon={<CalendarDaysIcon className="h-5 w-5"/>}
                label="Study Plan"
            />
            <NavItem
                isActive={activeTab === ActiveTab.Flashcards}
                onClick={() => setActiveTab(ActiveTab.Flashcards)}
                icon={<AcademicCapIcon className="h-5 w-5"/>}
                label="Flashcards"
            />
            <NavItem
                isActive={activeTab === ActiveTab.Quiz}
                onClick={() => setActiveTab(ActiveTab.Quiz)}
                icon={<CheckBadgeIcon className="h-5 w-5"/>}
                label="Quiz Me"
            />
             <NavItem
                isActive={activeTab === ActiveTab.Image}
                onClick={() => setActiveTab(ActiveTab.Image)}
                icon={<PhotoIcon className="h-5 w-5"/>}
                label="Analyze Notes"
            />
             <NavItem
                isActive={activeTab === ActiveTab.ImageGeneration}
                onClick={() => setActiveTab(ActiveTab.ImageGeneration)}
                icon={<BrainIcon className="h-5 w-5"/>}
                label="Image Generator"
            />
        </nav>
        
        <div className="mt-auto">
             <NavItem
                isActive={activeTab === ActiveTab.Dashboard}
                onClick={() => setActiveTab(ActiveTab.Dashboard)}
                icon={<ClipboardDocumentListIcon className="h-5 w-5"/>}
                label="Dashboard"
            />
        </div>
    </aside>
  );
};

export default Sidebar;

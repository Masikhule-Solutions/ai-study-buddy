import React, { useState, useMemo } from 'react';
import { getStats } from '../utils/tracking';
import type { DashboardStats } from '../types';
import { FireIcon, TrophyIcon, AcademicCapIcon, ClipboardDocumentListIcon, CheckBadgeIcon, BrainIcon } from './icons';

interface StatCardProps {
    icon: React.ReactNode;
    label: string;
    value: string | number;
    color: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon, label, value, color }) => (
    <div className={`bg-white/70 backdrop-blur-xl p-6 rounded-2xl shadow-lg flex items-center space-x-4 border-t-4 ${color}`}>
        <div className="flex-shrink-0">{icon}</div>
        <div>
            <p className="text-sm text-gray-500 font-medium">{label}</p>
            <p className="text-2xl font-bold text-gray-800">{value}</p>
        </div>
    </div>
);

interface BadgeProps {
    icon: React.ReactNode;
    label: string;
    unlocked: boolean;
}

const Badge: React.FC<BadgeProps> = ({ icon, label, unlocked }) => (
    <div className={`text-center transition-opacity ${unlocked ? 'opacity-100' : 'opacity-30'}`}>
        <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center ${unlocked ? 'bg-amber-100' : 'bg-gray-200'}`}>
            {icon}
        </div>
        <p className={`mt-2 text-xs font-semibold ${unlocked ? 'text-amber-700' : 'text-gray-500'}`}>{label}</p>
    </div>
);


const Dashboard: React.FC = () => {
    const [stats] = useState<DashboardStats>(getStats());

    const badges = useMemo(() => [
        {
            id: 'first-quiz',
            label: 'Quiz Taker',
            unlocked: stats.quizzesCompleted > 0,
            icon: <TrophyIcon className="h-10 w-10 text-amber-500"/>
        },
        {
            id: 'ten-flashcards',
            label: 'Quick Learner',
            unlocked: stats.flashcardsReviewed >= 10,
            icon: <AcademicCapIcon className="h-10 w-10 text-amber-500"/>
        },
        {
            id: 'five-day-streak',
            label: '5-Day Streak',
            unlocked: stats.streak >= 5,
            icon: <FireIcon className="h-10 w-10 text-amber-500"/>
        },
        {
            id: 'master-planner',
            label: 'Master Planner',
            unlocked: stats.tasksCompleted >= 10,
            icon: <ClipboardDocumentListIcon className="h-10 w-10 text-amber-500"/>
        }
    ], [stats]);

    return (
        <div className="space-y-8">
            <div className="bg-gradient-to-r from-violet-600 to-purple-600 text-white p-8 rounded-2xl shadow-2xl flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold">Welcome back!</h2>
                    <p className="opacity-80 mt-1">Ready to dive back into your studies? Let's make today productive.</p>
                </div>
                <BrainIcon className="h-20 w-20 opacity-20 hidden md:block" />
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                    icon={<FireIcon className="h-8 w-8 text-orange-500" />}
                    label="Study Streak"
                    value={`${stats.streak} Days`}
                    color="border-orange-500"
                />
                <StatCard 
                    icon={<TrophyIcon className="h-8 w-8 text-yellow-500" />}
                    label="Quizzes Completed"
                    value={stats.quizzesCompleted}
                    color="border-yellow-500"
                />
                 <StatCard 
                    icon={<AcademicCapIcon className="h-8 w-8 text-blue-500" />}
                    label="Flashcards Reviewed"
                    value={stats.flashcardsReviewed}
                    color="border-blue-500"
                />
                <StatCard 
                    icon={<CheckBadgeIcon className="h-8 w-8 text-green-500" />}
                    label="Tasks Completed"
                    value={stats.tasksCompleted}
                    color="border-green-500"
                />
            </div>

            {/* Badges Section */}
            <div className="bg-white/50 backdrop-blur-xl border border-gray-200/80 p-6 rounded-2xl shadow-lg">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Achievements</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {badges.map(badge => (
                        <Badge key={badge.id} icon={badge.icon} label={badge.label} unlocked={badge.unlocked} />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
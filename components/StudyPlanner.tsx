import React, { useState, useEffect } from 'react';
import type { StudyPlan } from '../types';
import { generateStudyPlan } from '../services/geminiService';
import { logTaskCompletion } from '../utils/tracking';
import { downloadAsIcs } from '../utils/export';
import Loader from './Loader';
import { ArrowDownTrayIcon } from './icons';

const StudyPlanner: React.FC = () => {
    const [topic, setTopic] = useState('');
    const [goal, setGoal] = useState('');
    const [duration, setDuration] = useState<number>(7);
    const [plan, setPlan] = useState<StudyPlan | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const [displayTopic, setDisplayTopic] = useState('');
    const [displayGoal, setDisplayGoal] = useState('');
    
    useEffect(() => {
        const savedData = localStorage.getItem('ai-study-buddy-plan');
        if (savedData) {
            const { plan: savedPlan, topic: savedTopic, goal: savedGoal } = JSON.parse(savedData);
            setPlan(savedPlan);
            setDisplayTopic(savedTopic || '');
            setDisplayGoal(savedGoal || '');
        }
    }, []);

    useEffect(() => {
        if (plan) {
            const dataToSave = { plan, topic: displayTopic, goal: displayGoal };
            localStorage.setItem('ai-study-buddy-plan', JSON.stringify(dataToSave));
        }
    }, [plan, displayTopic, displayGoal]);

    const handleGeneratePlan = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!topic || !goal || duration < 1) {
            setError('Please fill in all fields and set a duration of at least 1 day.');
            return;
        }
        setIsLoading(true);
        setError('');
        setPlan(null);

        const generatedPlan = await generateStudyPlan(topic, goal, duration);
        if (generatedPlan) {
            setPlan(generatedPlan);
            setDisplayTopic(topic);
            setDisplayGoal(goal);
        } else {
            setError('Failed to generate a study plan. Please try a different topic or goal.');
        }
        setIsLoading(false);
    };

    const toggleTaskCompletion = (dayIndex: number) => {
        if (!plan) return;
        const newPlan = [...plan];
        const isNowCompleted = !newPlan[dayIndex].completed;
        newPlan[dayIndex].completed = isNowCompleted;
        setPlan(newPlan);
        logTaskCompletion(isNowCompleted);
    };
    
    const resetPlanner = () => {
        setPlan(null);
        setTopic('');
        setGoal('');
        setDuration(7);
        setDisplayTopic('');
        setDisplayGoal('');
        localStorage.removeItem('ai-study-buddy-plan');
    };

    const handleExport = () => {
        if (plan && displayTopic) {
            downloadAsIcs(plan, displayTopic);
        }
    };
    
    if (plan) {
        const completedTasks = plan.filter(day => day.completed).length;
        const progress = plan.length > 0 ? (completedTasks / plan.length) * 100 : 0;

        return (
            <div className="bg-white/50 backdrop-blur-xl border border-gray-200/80 rounded-2xl shadow-lg p-6 md:p-8">
                <div className="flex justify-between items-start mb-4">
                    <h2 className="text-2xl font-bold text-gray-800">Your Study Plan</h2>
                    <button
                        onClick={handleExport}
                        className="flex items-center gap-2 text-sm text-gray-500 hover:text-violet-600 hover:bg-violet-50 p-2 rounded-lg transition-colors"
                    >
                        <ArrowDownTrayIcon className="h-4 w-4" />
                        <span>Export to Calendar</span>
                    </button>
                </div>
                <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-sm text-gray-600"><span className="font-semibold text-gray-700">Topic:</span> {displayTopic}</p>
                    <p className="text-sm text-gray-600 mt-1"><span className="font-semibold text-gray-700">Goal:</span> {displayGoal}</p>
                    <div className="mt-4">
                        <div className="flex justify-between mb-1">
                            <span className="text-sm font-medium text-violet-700">Progress</span>
                            <span className="text-sm font-medium text-violet-700">{Math.round(progress)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div className="bg-violet-600 h-2.5 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    {plan.map((day, index) => (
                        <div key={index} className={`p-4 rounded-lg border transition-all ${day.completed ? 'bg-green-50 border-green-200' : 'bg-white'}`}>
                            <label className="flex items-start cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={day.completed}
                                    onChange={() => toggleTaskCompletion(index)}
                                    className="mt-1 h-5 w-5 rounded border-gray-300 text-violet-600 focus:ring-violet-500"
                                />
                                <div className="ml-4">
                                    <h3 className={`font-bold text-gray-700 ${day.completed ? 'line-through text-gray-500' : ''}`}>Day {day.day}: {day.topic}</h3>
                                    <p className={`text-sm text-gray-600 mt-1 ${day.completed ? 'line-through text-gray-500' : ''}`}>{day.task}</p>
                                </div>
                            </label>
                        </div>
                    ))}
                </div>
                <button
                    onClick={resetPlanner}
                    className="w-full mt-8 py-3 px-4 bg-gray-700 text-white font-semibold rounded-lg shadow-md hover:bg-gray-800 transition-all duration-200 transform active:scale-95"
                >
                    Create a New Plan
                </button>
            </div>
        );
    }

    return (
        <div className="bg-white/50 backdrop-blur-xl border border-gray-200/80 rounded-2xl shadow-lg p-6 md:p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Create Your Study Plan</h2>
            <p className="text-gray-600 mb-6">Tell the AI your goals, and it will generate a structured plan to help you succeed.</p>
            {isLoading ? (
                <Loader text="Generating your personalized plan..." />
            ) : (
                <form onSubmit={handleGeneratePlan} className="space-y-4">
                    <div>
                        <label htmlFor="topic" className="block text-sm font-medium text-gray-700 mb-1">Study Topic</label>
                        <input
                            id="topic"
                            type="text"
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            placeholder="e.g., Introduction to Quantum Physics"
                            className="w-full px-4 py-3 text-sm bg-gray-100 rounded-lg focus:ring-2 focus:ring-violet-500 focus:outline-none transition"
                        />
                    </div>
                    <div>
                        <label htmlFor="goal" className="block text-sm font-medium text-gray-700 mb-1">Primary Goal</label>
                        <input
                            id="goal"
                            type="text"
                            value={goal}
                            onChange={(e) => setGoal(e.target.value)}
                            placeholder="e.g., Prepare for the final exam"
                            className="w-full px-4 py-3 text-sm bg-gray-100 rounded-lg focus:ring-2 focus:ring-violet-500 focus:outline-none transition"
                        />
                    </div>
                     <div>
                        <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-1">Study Duration (in days)</label>
                        <input
                            id="duration"
                            type="number"
                            value={duration}
                            onChange={(e) => setDuration(parseInt(e.target.value, 10) || 1)}
                            min="1"
                            max="90"
                            className="w-full px-4 py-3 text-sm bg-gray-100 rounded-lg focus:ring-2 focus:ring-violet-500 focus:outline-none transition"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-3 px-4 bg-violet-600 text-white font-semibold rounded-lg shadow-md hover:bg-violet-700 disabled:bg-gray-400 transition-all duration-200 transform active:scale-95"
                    >
                        Generate Plan
                    </button>
                    {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                </form>
            )}
        </div>
    );
};

export default StudyPlanner;
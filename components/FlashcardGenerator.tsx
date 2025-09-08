
import React, { useState, useEffect, useMemo } from 'react';
import type { Flashcard } from '../types';
import { generateFlashcards } from '../services/geminiService';
import { logFlashcardReview } from '../utils/tracking';
import { downloadAsJson } from '../utils/export';
import Loader from './Loader';
import { ArrowDownTrayIcon, XCircleIcon } from './icons';

const DECK_KEY = 'ai-study-buddy-deck';

// Simplified SM-2 algorithm for spaced repetition
const calculateSrs = (card: Flashcard, quality: number): Flashcard => {
    let { interval = 0, easeFactor = 2.5 } = card.srsData || {};

    if (quality < 3) { // Hard
        interval = 1;
    } else { // Good or Easy
        if (interval === 0) {
            interval = 1;
        } else if (interval === 1) {
            interval = 6;
        } else {
            interval = Math.round(interval * easeFactor);
        }
    }
    
    easeFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
    if (easeFactor < 1.3) easeFactor = 1.3;

    const newDueDate = new Date();
    newDueDate.setDate(newDueDate.getDate() + interval);

    return {
        ...card,
        srsData: {
            interval,
            easeFactor,
            dueDate: newDueDate.toISOString()
        }
    };
};


const FlashcardGenerator: React.FC = () => {
    const [deck, setDeck] = useState<Flashcard[]>([]);
    const [sessionCards, setSessionCards] = useState<Flashcard[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string>('');
    const [topic, setTopic] = useState('');
    const [frontInput, setFrontInput] = useState('');
    const [backInput, setBackInput] = useState('');
    
    useEffect(() => {
        const savedDeck = localStorage.getItem(DECK_KEY);
        if (savedDeck) {
            setDeck(JSON.parse(savedDeck));
        }
    }, []);
    
    const dueCards = useMemo(() => {
        const today = new Date().toISOString().split('T')[0];
        return deck.filter(card => !card.srsData || card.srsData.dueDate.split('T')[0] <= today);
    }, [deck]);

    const handleGenerate = async () => {
        if (!topic) { setError('Please enter a topic.'); return; }
        setIsLoading(true);
        setError('');
        
        const newCards = await generateFlashcards(topic);
        if (newCards) {
            const updatedDeck = [...deck, ...newCards];
            setDeck(updatedDeck);
            localStorage.setItem(DECK_KEY, JSON.stringify(updatedDeck));
            setTopic('');
        } else {
            setError('Failed to generate flashcards. Please try again.');
        }
        setIsLoading(false);
    };

    const startReviewSession = () => {
        if (dueCards.length > 0) {
            // Shuffle due cards for variety
            setSessionCards([...dueCards].sort(() => Math.random() - 0.5));
            setCurrentIndex(0);
            setIsFlipped(false);
        }
    };

    const handleSrsReview = (quality: number) => {
        const cardToUpdate = sessionCards[currentIndex];
        const updatedCard = calculateSrs(cardToUpdate, quality);

        const newDeck = deck.map(card => card.front === updatedCard.front ? updatedCard : card);
        setDeck(newDeck);
        localStorage.setItem(DECK_KEY, JSON.stringify(newDeck));

        logFlashcardReview();
        
        if (currentIndex < sessionCards.length - 1) {
            setIsFlipped(false);
            setTimeout(() => setCurrentIndex(currentIndex + 1), 200); // Allow flip back animation
        } else {
            setSessionCards([]);
        }
    };

    const handleManualAdd = (e: React.FormEvent) => {
        e.preventDefault();
        if (frontInput.trim() && backInput.trim()) {
            const newCard: Flashcard = { front: frontInput, back: backInput };
            const newDeck = [...deck, newCard];
            setDeck(newDeck);
            localStorage.setItem(DECK_KEY, JSON.stringify(newDeck));
            setFrontInput('');
            setBackInput('');
        }
    };
    
    const resetDeck = () => {
        if (window.confirm("Are you sure you want to delete your entire deck? This action cannot be undone.")) {
            setDeck([]);
            setSessionCards([]);
            localStorage.removeItem(DECK_KEY);
        }
    };

    const handleExport = () => {
        downloadAsJson({ deck }, 'flashcard-deck');
    };

    if (sessionCards.length > 0) {
        const currentCard = sessionCards[currentIndex];
        return (
             <div className="bg-white/50 backdrop-blur-xl border border-gray-200/80 rounded-2xl shadow-lg p-6 md:p-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-2 text-center">Review Session</h2>
                <p className="text-center text-sm text-gray-500 mb-6">Click the card to reveal the answer.</p>

                <div className="perspective w-full h-64 mb-6" onClick={() => setIsFlipped(!isFlipped)}>
                    <div className={`relative w-full h-full transition-transform duration-500 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
                        <div className="absolute w-full h-full backface-hidden flex items-center justify-center p-6 text-center bg-white border-2 border-violet-300 rounded-lg shadow-xl">
                            <p className="text-xl font-semibold text-gray-800">{currentCard.front}</p>
                        </div>
                        <div className="absolute w-full h-full backface-hidden flex items-center justify-center p-6 text-center bg-gradient-to-br from-violet-500 to-purple-600 text-white rounded-lg shadow-xl rotate-y-180">
                            <p className="text-lg">{currentCard.back}</p>
                        </div>
                    </div>
                </div>

                {isFlipped && (
                    <div className="grid grid-cols-3 gap-4 my-4 animate-fade-in">
                        <button onClick={() => handleSrsReview(1)} className="py-3 px-4 bg-red-100 text-red-700 font-semibold rounded-lg shadow-sm hover:bg-red-200 transition-transform active:scale-95">Hard</button>
                        <button onClick={() => handleSrsReview(3)} className="py-3 px-4 bg-yellow-100 text-yellow-700 font-semibold rounded-lg shadow-sm hover:bg-yellow-200 transition-transform active:scale-95">Good</button>
                        <button onClick={() => handleSrsReview(5)} className="py-3 px-4 bg-green-100 text-green-700 font-semibold rounded-lg shadow-sm hover:bg-green-200 transition-transform active:scale-95">Easy</button>
                    </div>
                )}
                
                <div className="text-center font-semibold text-gray-600">{currentIndex + 1} / {sessionCards.length}</div>
                
                <button onClick={() => setSessionCards([])} className="w-full mt-8 py-3 px-4 bg-gray-700 text-white font-semibold rounded-lg shadow-md hover:bg-gray-800">End Session</button>
                <style>{`.perspective{perspective:1000px}.transform-style-3d{transform-style:preserve-3d}.rotate-y-180{transform:rotateY(180deg)}.backface-hidden{backface-visibility:hidden}.animate-fade-in{animation:fadeIn 0.5s ease-in-out}@keyframes fadeIn{0%{opacity:0}100%{opacity:1}}`}</style>
            </div>
        )
    }

    return (
        <div className="space-y-8">
            <div className="bg-white/50 backdrop-blur-xl border border-gray-200/80 rounded-2xl shadow-lg p-6 md:p-8">
                 <h2 className="text-2xl font-bold text-gray-800 mb-4">Your Deck</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-violet-50 rounded-lg text-center border border-violet-200">
                        <p className="text-sm text-violet-700 font-semibold">Total Cards</p>
                        <p className="text-3xl font-bold text-violet-900">{deck.length}</p>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg text-center border border-green-200">
                        <p className="text-sm text-green-700 font-semibold">Cards Due</p>
                        <p className="text-3xl font-bold text-green-900">{dueCards.length}</p>
                    </div>
                </div>
                <button
                    onClick={startReviewSession}
                    disabled={dueCards.length === 0}
                    className="w-full mt-4 py-3 px-4 bg-violet-600 text-white font-semibold rounded-lg shadow-md hover:bg-violet-700 disabled:bg-gray-400 transition-all transform active:scale-95"
                >
                    Review Due Cards ({dueCards.length})
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white/50 backdrop-blur-xl border border-gray-200/80 rounded-2xl shadow-lg p-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-4">Generate with AI</h3>
                    <input type="text" value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="Enter a topic" className="w-full px-4 py-2 text-sm bg-gray-100 border rounded-lg focus:ring-2 focus:ring-violet-500" />
                    <button onClick={handleGenerate} disabled={isLoading} className="w-full mt-2 py-2 px-4 bg-gray-700 text-white font-semibold rounded-lg shadow-sm hover:bg-gray-800 disabled:bg-gray-400">
                        {isLoading ? 'Generating...' : 'Add AI Cards'}
                    </button>
                    {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                </div>
                <div className="bg-white/50 backdrop-blur-xl border border-gray-200/80 rounded-2xl shadow-lg p-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-4">Add Manually</h3>
                    <form onSubmit={handleManualAdd} className="space-y-2">
                        <textarea value={frontInput} onChange={(e) => setFrontInput(e.target.value)} placeholder="Front of card" rows={1} className="w-full px-3 py-2 text-sm bg-gray-100 border rounded-lg focus:ring-2 focus:ring-violet-500 resize-none" />
                        <textarea value={backInput} onChange={(e) => setBackInput(e.target.value)} placeholder="Back of card" rows={1} className="w-full px-3 py-2 text-sm bg-gray-100 border rounded-lg focus:ring-2 focus:ring-violet-500 resize-none" />
                        <button type="submit" className="w-full py-2 px-4 bg-gray-700 text-white font-semibold rounded-lg shadow-sm hover:bg-gray-800">Add Manual Card</button>
                    </form>
                </div>
            </div>

             <div className="flex justify-center space-x-4">
                <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2 bg-white text-gray-600 text-sm font-medium rounded-full hover:bg-gray-100 border shadow-sm">
                    <ArrowDownTrayIcon className="h-4 w-4" />
                    <span>Export Deck</span>
                </button>
                <button onClick={resetDeck} className="flex items-center gap-2 px-4 py-2 bg-white text-red-700 text-sm font-medium rounded-full hover:bg-red-50 border shadow-sm">
                    <XCircleIcon className="h-4 w-4" />
                    <span>Delete Deck</span>
                </button>
            </div>
        </div>
    );
};

export default FlashcardGenerator;

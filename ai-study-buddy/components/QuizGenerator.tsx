import React, { useState } from 'react';
import type { Quiz, QuizQuestion } from '../types';
import { generateQuiz } from '../services/geminiService';
import { logQuizCompletion } from '../utils/tracking';
import { downloadAsJson } from '../utils/export';
import Loader from './Loader';
import { CheckIcon, XMarkIcon, ArrowDownTrayIcon } from './icons';

const QuizGenerator: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [userAnswers, setUserAnswers] = useState<number[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const handleGenerateQuiz = async () => {
    if (!topic) {
      setError('Please enter a topic.');
      return;
    }
    setIsLoading(true);
    setError('');
    setQuiz(null);
    setSubmitted(false);
    setUserAnswers([]);

    const generatedQuiz = await generateQuiz(topic);
    if (generatedQuiz) {
      setQuiz(generatedQuiz);
      setUserAnswers(new Array(generatedQuiz.length).fill(-1));
    } else {
      setError('Failed to generate quiz. The topic might be too broad or unsupported. Please try again with a more specific topic.');
    }
    setIsLoading(false);
  };

  const handleAnswerChange = (questionIndex: number, optionIndex: number) => {
    if (submitted) return;
    const newAnswers = [...userAnswers];
    newAnswers[questionIndex] = optionIndex;
    setUserAnswers(newAnswers);
  };

  const handleSubmit = () => {
    setSubmitted(true);
    const score = calculateScore();
    if (quiz) {
      logQuizCompletion(score, quiz.length);
    }
  };
  
  const calculateScore = () => {
      if (!quiz) return 0;
      return quiz.reduce((score, question, index) => {
          return score + (userAnswers[index] === question.correctAnswerIndex ? 1 : 0);
      }, 0);
  };

  const getOptionClasses = (question: QuizQuestion, qIndex: number, oIndex: number) => {
      if (!submitted) return 'hover:bg-violet-50 hover:border-violet-300';
      const isCorrect = question.correctAnswerIndex === oIndex;
      const isSelected = userAnswers[qIndex] === oIndex;
      if (isCorrect) return 'bg-green-100 border-green-400';
      if (isSelected && !isCorrect) return 'bg-red-100 border-red-400';
      return 'bg-gray-50';
  };

  const resetQuiz = () => {
    setTopic('');
    setQuiz(null);
    setUserAnswers([]);
    setSubmitted(false);
    setError('');
  };

  const handleExport = () => {
    if (quiz) {
        downloadAsJson({ topic, quiz }, `quiz-${topic.replace(/\s+/g, '_')}`);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white/50 backdrop-blur-xl border border-gray-200/80 rounded-2xl shadow-lg p-6 md:p-8 flex justify-center items-center h-64">
        <Loader text="Generating your quiz..." />
      </div>
    );
  }

  if (quiz) {
    const score = calculateScore();
    const scorePercentage = (score / quiz.length) * 100;

    return (
      <div className="bg-white/50 backdrop-blur-xl border border-gray-200/80 rounded-2xl shadow-lg p-6 md:p-8">
        <div className="flex justify-between items-start mb-4">
            <h2 className="text-2xl font-bold text-gray-800">Quiz on: <span className="text-violet-600">{topic}</span></h2>
            {submitted && (
                 <button 
                    onClick={handleExport}
                    className="flex items-center gap-2 text-sm text-gray-500 hover:text-violet-600 hover:bg-violet-50 p-2 rounded-lg transition-colors"
                 >
                    <ArrowDownTrayIcon className="h-4 w-4" />
                    <span>Export Quiz</span>
                </button>
            )}
        </div>
        {submitted && (
            <div className="mb-6 p-4 rounded-lg bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-lg">
                <p className="font-bold text-xl">Your Score: {score} / {quiz.length} ({scorePercentage.toFixed(0)}%)</p>
            </div>
        )}
        <div className="space-y-6">
          {quiz.map((q, qIndex) => (
            <div key={qIndex} className="p-4 border-b border-gray-200">
              <p className="font-semibold mb-3 text-gray-700">{qIndex + 1}. {q.question}</p>
              <div className="space-y-2">
                {q.options.map((option, oIndex) => (
                  <label key={oIndex} className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${getOptionClasses(q, qIndex, oIndex)}`}>
                    <input
                      type="radio"
                      name={`question-${qIndex}`}
                      checked={userAnswers[qIndex] === oIndex}
                      onChange={() => handleAnswerChange(qIndex, oIndex)}
                      disabled={submitted}
                      className="h-4 w-4 text-violet-600 focus:ring-violet-500 border-gray-300"
                    />
                    <span className="ml-3 text-sm text-gray-700">{option}</span>
                    {submitted && q.correctAnswerIndex === oIndex && <CheckIcon className="h-5 w-5 ml-auto text-green-600" />}
                    {submitted && userAnswers[qIndex] === oIndex && q.correctAnswerIndex !== oIndex && <XMarkIcon className="h-5 w-5 ml-auto text-red-600" />}
                  </label>
                ))}
              </div>
              {submitted && <p className="mt-3 text-xs text-gray-600 p-2 bg-gray-100 rounded"><strong>Explanation:</strong> {q.explanation}</p>}
            </div>
          ))}
        </div>
        {!submitted ? (
             <button
                onClick={handleSubmit}
                className="w-full mt-8 py-3 px-4 bg-violet-600 text-white font-semibold rounded-lg shadow-md hover:bg-violet-700 transition-all duration-200 transform active:scale-95"
            >
                Submit Answers
            </button>
        ) : (
             <button
                onClick={resetQuiz}
                className="w-full mt-8 py-3 px-4 bg-gray-700 text-white font-semibold rounded-lg shadow-md hover:bg-gray-800 transition-all duration-200 transform active:scale-95"
            >
                Take Another Quiz
            </button>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white/50 backdrop-blur-xl border border-gray-200/80 rounded-2xl shadow-lg p-6 md:p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Generate a Quiz</h2>
      <p className="text-gray-600 mb-6">Enter a topic, and the AI will create a quiz to test your knowledge.</p>
      <div className="flex flex-col space-y-4">
        <input
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="e.g., Photosynthesis, The American Revolution, Python Loops"
          className="w-full px-4 py-3 text-sm bg-gray-100 rounded-lg focus:ring-2 focus:ring-violet-500 focus:outline-none transition"
        />
        <button
          onClick={handleGenerateQuiz}
          disabled={isLoading}
          className="w-full py-3 px-4 bg-violet-600 text-white font-semibold rounded-lg shadow-md hover:bg-violet-700 disabled:bg-gray-400 transition-all duration-200 transform active:scale-95"
        >
          Generate Quiz
        </button>
        {error && <p className="text-red-500 text-sm">{error}</p>}
      </div>
    </div>
  );
};

export default QuizGenerator;

import React, { useState } from 'react';
import { generateImage } from '../services/geminiService';
import Loader from './Loader';

const ImageGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt to generate an image.');
      return;
    }

    setIsLoading(true);
    setError('');
    setGeneratedImage(null);

    const result = await generateImage(prompt);

    if (result) {
      setGeneratedImage(result);
    } else {
      setError('Sorry, I could not generate the image. Please try a different prompt.');
    }
    setIsLoading(false);
  };

  return (
    <div className="bg-white/50 backdrop-blur-xl border border-gray-200/80 rounded-2xl shadow-lg p-6 md:p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Image Generator</h2>
      <p className="text-gray-600 mb-6">Describe an image you'd like to create for your study materials.</p>
      
      <div className="space-y-4">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g., A diagram of the human heart with clear labels"
          rows={3}
          className="w-full px-4 py-3 text-sm bg-gray-100 rounded-lg focus:ring-2 focus:ring-violet-500 focus:outline-none transition resize-none"
          disabled={isLoading}
        />
        <button
          onClick={handleGenerate}
          disabled={isLoading || !prompt.trim()}
          className="w-full py-3 px-4 bg-violet-600 text-white font-semibold rounded-lg shadow-md hover:bg-violet-700 disabled:bg-gray-400 transition-all duration-200 transform active:scale-95"
        >
          {isLoading ? 'Generating...' : 'Generate Image'}
        </button>
        {error && <p className="text-red-500 text-sm mt-2 text-center">{error}</p>}
      </div>

      <div className="mt-8 min-h-[256px] flex items-center justify-center bg-gray-100 rounded-lg">
        {isLoading && <Loader text="Creating your image..." />}
        {generatedImage && (
          <div className="p-4">
            <div className="border rounded-lg overflow-hidden shadow-sm flex justify-center bg-white p-2">
              <img src={generatedImage} alt={prompt} className="max-w-full max-h-[400px] object-contain rounded-md" />
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center italic">Prompt: "{prompt}"</p>
          </div>
        )}
        {!isLoading && !generatedImage && (
            <p className="text-gray-400">Your generated image will appear here</p>
        )}
      </div>
    </div>
  );
};

export default ImageGenerator;

import React, { useState } from 'react';
import { analyzeImage } from '../services/geminiService';
import Loader from './Loader';
import { PhotoIcon } from './icons';

const ImageAnalyzer: React.FC = () => {
  const [image, setImage] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [summary, setSummary] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setSummary('');
      setError('');
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleAnalyze = async () => {
    if (!file) {
      setError('Please select an image file first.');
      return;
    }

    setIsLoading(true);
    setError('');
    setSummary('');

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
        const base64String = (reader.result as string).split(',')[1];
        const result = await analyzeImage(base64String, file.type);
        setSummary(result);
        setIsLoading(false);
    };
    reader.onerror = (error) => {
        console.error('File reading error:', error);
        setError('Failed to read the file.');
        setIsLoading(false);
    };
  };

  return (
    <div className="bg-white/50 backdrop-blur-xl border border-gray-200/80 rounded-2xl shadow-lg p-6 md:p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Analyze Your Notes</h2>
      <p className="text-gray-600 mb-6">Upload an image of your notes or textbook, and the AI will summarize the key points.</p>

      <div className="space-y-6">
        <label htmlFor="image-upload" className="block p-8 border-2 border-dashed border-gray-300 rounded-lg text-center cursor-pointer hover:border-violet-400 hover:bg-violet-50 transition-colors">
          <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
          <span className="mt-2 block text-sm font-semibold text-violet-600">
            {file ? `Selected: ${file.name}` : 'Upload an image'}
          </span>
          <span className="mt-1 block text-xs text-gray-500">PNG, JPG, GIF up to 10MB</span>
          <input id="image-upload" name="image-upload" type="file" className="sr-only" accept="image/*" onChange={handleFileChange} />
        </label>

        {image && (
          <div className="mt-4 border rounded-lg overflow-hidden shadow-sm">
            <img src={image} alt="Preview" className="max-w-full max-h-80 mx-auto" />
          </div>
        )}

        <button
          onClick={handleAnalyze}
          disabled={!file || isLoading}
          className="w-full py-3 px-4 bg-violet-600 text-white font-semibold rounded-lg shadow-md hover:bg-violet-700 disabled:bg-gray-400 transition-all duration-200 transform active:scale-95"
        >
          {isLoading ? 'Analyzing...' : 'Analyze Notes'}
        </button>

        {error && <p className="text-red-500 text-sm mt-2 text-center">{error}</p>}
      </div>

      <div className="mt-8">
        {isLoading && <Loader text="Extracting key concepts..." />}
        {summary && (
          <div>
            <h3 className="text-xl font-bold text-gray-800 mb-4">Summary</h3>
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 prose prose-sm prose-slate max-w-none">
                {summary.split('\n').map((line, index) => <p key={index}>{line}</p>)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageAnalyzer;
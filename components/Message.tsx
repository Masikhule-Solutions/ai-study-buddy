import React from 'react';
import type { ChatMessage } from '../types';
import { BrainIcon, SpeakerWaveIcon, SpeakerXMarkIcon } from './icons';

interface MessageProps {
  message: ChatMessage;
  isSpeaking: boolean;
  onToggleSpeech: () => void;
}

const Message: React.FC<MessageProps> = ({ message, isSpeaking, onToggleSpeech }) => {
  const isModel = message.role === 'model';

  return (
    <div className={`flex items-start gap-3 my-4 ${isModel ? '' : 'flex-row-reverse'}`}>
      {isModel && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white shadow-md">
          <BrainIcon className="w-5 h-5" />
        </div>
      )}
      <div 
        className={`max-w-xl p-4 rounded-xl shadow-md prose prose-sm prose-slate ${
          isModel 
            ? 'bg-white text-gray-800 rounded-tl-none' 
            : 'bg-violet-600 text-white prose-invert rounded-tr-none'
        }`}
      >
        <p className="m-0">{message.text}</p>
      </div>
      {isModel && message.text && (
        <button
          onClick={onToggleSpeech}
          className="flex-shrink-0 self-center p-2 text-gray-400 hover:text-violet-600 hover:bg-gray-100 rounded-full transition-colors"
          aria-label={isSpeaking ? "Stop speaking" : "Read message aloud"}
        >
          {isSpeaking ? (
            <SpeakerXMarkIcon className="h-5 w-5" />
          ) : (
            <SpeakerWaveIcon className="h-5 w-5" />
          )}
        </button>
      )}
    </div>
  );
};

export default Message;

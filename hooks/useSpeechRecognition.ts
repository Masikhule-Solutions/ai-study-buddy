import { useState, useEffect, useRef } from 'react';

// FIX: Define the SpeechRecognition interface to provide types for the Web Speech API
// which may not be available in all TypeScript environments by default.
interface SpeechRecognition {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: (event: any) => void;
  onerror: (event: any) => void;
  onend: () => void;
  start: () => void;
  stop: () => void;
}

interface SpeechRecognitionHook {
  transcript: string;
  isListening: boolean;
  error: string | null;
  startListening: () => void;
  stopListening: () => void;
  browserSupportsSpeechRecognition: boolean;
}

const getSpeechRecognition = () => {
    if (typeof window !== 'undefined') {
        // FIX: Cast window to `any` to access non-standard browser APIs `SpeechRecognition`
        // and `webkitSpeechRecognition` which may not be in the default TS DOM typings.
        return (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    }
    return undefined;
};

export const useSpeechRecognition = (): SpeechRecognitionHook => {
  const [transcript, setTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // FIX: The `SpeechRecognition` type was being shadowed by a constant of the same name.
  // Renaming the constant below resolves this issue.
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  
  // FIX: Renamed variable to `SpeechRecognitionAPI` to avoid name collision with the global `SpeechRecognition` type.
  const SpeechRecognitionAPI = getSpeechRecognition();
  const browserSupportsSpeechRecognition = !!SpeechRecognitionAPI;

  useEffect(() => {
    if (!browserSupportsSpeechRecognition) {
      setError("Speech recognition is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      const currentTranscript = event.results[0][0].transcript;
      setTranscript(currentTranscript);
    };

    recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setError(`Speech recognition error: ${event.error}`);
        setIsListening(false);
    };
    
    recognition.onend = () => {
        setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.stop();
    };
  }, [browserSupportsSpeechRecognition, SpeechRecognitionAPI]);

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      setTranscript('');
      setError(null);
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  return { transcript, isListening, error, startListening, stopListening, browserSupportsSpeechRecognition };
};

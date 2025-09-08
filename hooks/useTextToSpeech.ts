import { useState, useCallback, useEffect, useRef } from 'react';

interface UseTextToSpeechReturn {
  speak: (text: string) => void;
  cancel: () => void;
  isSpeaking: boolean;
}

export const useTextToSpeech = (onEndCallback?: () => void): UseTextToSpeechReturn => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const cancel = useCallback(() => {
    if (window.speechSynthesis && window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, []);

  const speak = useCallback((text: string) => {
    if (!window.speechSynthesis) {
      console.error("Browser does not support speech synthesis.");
      return;
    }
    
    cancel(); // Cancel any ongoing speech before starting a new one

    const utterance = new SpeechSynthesisUtterance(text);
    utteranceRef.current = utterance;

    utterance.onstart = () => {
      setIsSpeaking(true);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      utteranceRef.current = null;
      if (onEndCallback) {
        onEndCallback();
      }
    };

    utterance.onerror = (event) => {
      console.error("SpeechSynthesisUtterance.onerror", event);
      setIsSpeaking(false);
      utteranceRef.current = null;
      if (onEndCallback) {
        onEndCallback();
      }
    };
    
    window.speechSynthesis.speak(utterance);
  }, [cancel, onEndCallback]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cancel();
    };
  }, [cancel]);

  return { speak, cancel, isSpeaking };
};

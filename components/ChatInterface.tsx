import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { ChatMessage } from '../types';
import { getChatResponseStream } from '../services/geminiService';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { useTextToSpeech } from '../hooks/useTextToSpeech';
import { SendIcon, MicIcon, StopIcon, DocumentTextIcon, XCircleIcon, PaperClipIcon } from './icons';
import Loader from './Loader';
import Message from './Message';

// Declare pdfjsLib as a global constant to satisfy TypeScript
declare const pdfjsLib: any;

const initialMessage: ChatMessage = { role: 'model', text: 'Hello! I am your AI Study Buddy. Ask me anything about your course material, or upload your notes to start a focused session.' };

const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [studyContext, setStudyContext] = useState<string | null>(null);
  const [contextLoading, setContextLoading] = useState(false);
  const [image, setImage] = useState<{file: File, preview: string} | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [speakingMessageIndex, setSpeakingMessageIndex] = useState<number | null>(null);

  const { transcript, isListening, startListening, stopListening, browserSupportsSpeechRecognition } = useSpeechRecognition();
  
  const { speak, cancel } = useTextToSpeech(() => {
    setSpeakingMessageIndex(null); // Reset when speech naturally ends
  });
  
  // Initialize pdf.js worker
  useEffect(() => {
    if (typeof pdfjsLib !== 'undefined') {
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.5.136/pdf.worker.min.mjs';
    }
  }, []);

  useEffect(() => {
    const savedChat = localStorage.getItem('ai-study-buddy-chat');
    if (savedChat) {
      setMessages(JSON.parse(savedChat));
    } else {
      setMessages([initialMessage]);
    }
  }, []);
  
  useEffect(() => {
    localStorage.setItem('ai-study-buddy-chat', JSON.stringify(messages));
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleToggleSpeech = (index: number, text: string) => {
    if (speakingMessageIndex === index) {
      cancel();
      setSpeakingMessageIndex(null);
    } else {
      setSpeakingMessageIndex(index);
      speak(text);
    }
  };

  const handleSend = useCallback(async (text: string) => {
    const trimmedInput = text.trim();
    if ((!trimmedInput && !image) || isLoading) return;
    
    cancel(); // Stop any currently playing audio
    setSpeakingMessageIndex(null);

    const userMessage: ChatMessage = { role: 'user', text: trimmedInput };

    const streamResponseAfterImage = async (finalUserMessage: ChatMessage) => {
      setIsLoading(true);
      setInput('');
      setImage(null);

      let historyForApi: ChatMessage[] = [];

      setMessages(prevMessages => {
          historyForApi = [...prevMessages, finalUserMessage];
          return [...historyForApi, { role: 'model', text: '' }];
      });

      try {
          const stream = getChatResponseStream(historyForApi, finalUserMessage, studyContext || undefined);
          let fullResponse = '';
          for await (const chunk of stream) {
              fullResponse += chunk;
              setMessages(prev => {
                  const updated = [...prev];
                  updated[updated.length - 1] = { role: 'model', text: fullResponse };
                  return updated;
              });
          }
      } catch (error) {
          console.error("Streaming chat error:", error);
          setMessages(prev => {
              const updated = [...prev];
              updated[updated.length-1] = { role: 'model', text: 'An error occurred while getting the response.'};
              return updated;
          })
      } finally {
          setIsLoading(false);
      }
    }

    if (image) {
      const reader = new FileReader();
      reader.readAsDataURL(image.file);
      reader.onload = async () => {
        const base64String = (reader.result as string).split(',')[1];
        userMessage.image = {
          mimeType: image.file.type,
          data: base64String
        };
        await streamResponseAfterImage(userMessage);
      };
      reader.onerror = () => {
        console.error("Failed to read image file.");
        setIsLoading(false);
      }
    } else {
      await streamResponseAfterImage(userMessage);
    }
  }, [isLoading, image, studyContext, cancel]);

  useEffect(() => {
    if (transcript && !isListening) {
      handleSend(transcript);
    }
  }, [transcript, isListening, handleSend]);

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSend(input);
    }
  };

  const handleContextFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setContextLoading(true);
    setStudyContext(null);

    if (file.type === "text/plain") {
        const reader = new FileReader();
        reader.onload = (event) => {
            const text = event.target?.result as string;
            setStudyContext(text);
            setContextLoading(false);
        };
        reader.readAsText(file);
    } else if (file.type === "application/pdf") {
        try {
            const reader = new FileReader();
            reader.onload = async (event) => {
                const typedArray = new Uint8Array(event.target?.result as ArrayBuffer);
                const pdf = await pdfjsLib.getDocument(typedArray).promise;
                let fullText = '';
                for (let i = 1; i <= pdf.numPages; i++) {
                    const page = await pdf.getPage(i);
                    const textContent = await page.getTextContent();
                    fullText += textContent.items.map((item: any) => item.str).join(' ');
                }
                setStudyContext(fullText);
                setContextLoading(false);
            };
            reader.readAsArrayBuffer(file);
        } catch (error) {
            console.error("PDF parsing error:", error);
            alert("Failed to parse PDF file.");
            setContextLoading(false);
        }
    } else {
        alert("Please upload a plain text (.txt) or PDF (.pdf) file.");
        setContextLoading(false);
    }
    e.target.value = '';
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
        setImage({ file, preview: URL.createObjectURL(file) });
    }
    e.target.value = '';
  };
  
  return (
    <div className="bg-white/50 backdrop-blur-xl border border-gray-200/80 rounded-2xl shadow-lg flex flex-col h-[calc(100vh-12rem)] max-h-[800px]">
      <div className="flex-1 p-6 overflow-y-auto">
        {messages.map((msg, index) => (
          <Message
            key={index}
            message={msg}
            isSpeaking={speakingMessageIndex === index}
            onToggleSpeech={() => handleToggleSpeech(index, msg.text)}
          />
        ))}
        {isLoading && messages[messages.length-1]?.text === '' && <Loader />}
        <div ref={chatEndRef} />
      </div>

      <div className="p-4 border-t border-gray-200/80 space-y-3 bg-white/70 rounded-b-2xl">
        {contextLoading ? (
             <div className="flex justify-center items-center gap-2 px-4 py-2 bg-gray-100 text-gray-600 text-sm font-medium rounded-full">
                <Loader text="Parsing document..." />
             </div>
        ) : studyContext ? (
            <div className="flex justify-between items-center bg-violet-50 text-violet-700 text-sm px-4 py-2 rounded-lg">
                <div className="flex items-center gap-2">
                    <DocumentTextIcon className="h-5 w-5" />
                    <span className="font-medium">Study notes loaded.</span>
                </div>
                <button onClick={() => setStudyContext(null)} className="p-1 rounded-full hover:bg-violet-200" aria-label="Remove study notes">
                    <XCircleIcon className="h-5 w-5 text-violet-600" />
                </button>
            </div>
        ) : (
            <div className="flex justify-center">
                <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-600 text-sm font-medium rounded-full cursor-pointer hover:bg-gray-200 transition-colors">
                    <DocumentTextIcon className="h-5 w-5" />
                    <span>Focus chat on your study notes (.txt, .pdf)</span>
                </button>
                <input id="file-upload" type="file" className="hidden" ref={fileInputRef} accept=".txt,.pdf" onChange={handleContextFileChange} />
            </div>
        )}

        {image && (
            <div className="flex justify-between items-center bg-green-50 text-green-700 text-sm px-4 py-2 rounded-lg">
                <div className="flex items-center gap-2">
                    <img src={image.preview} alt="upload preview" className="h-8 w-8 rounded object-cover" />
                    <span className="font-medium truncate">{image.file.name}</span>
                </div>
                <button onClick={() => setImage(null)} className="p-1 rounded-full hover:bg-green-200" aria-label="Remove image">
                    <XCircleIcon className="h-5 w-5 text-green-600" />
                </button>
            </div>
        )}
        
        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={isListening ? "Listening..." : "Ask a question or describe an image..."}
            disabled={isLoading || isListening}
            className="w-full pl-12 pr-24 py-3 text-sm bg-gray-100 rounded-full focus:ring-2 focus:ring-violet-500 focus:outline-none transition"
          />
          <div className="absolute inset-y-0 left-2 flex items-center">
            <input type="file" accept="image/*" className="hidden" ref={imageInputRef} onChange={handleImageFileChange} />
            <button
                onClick={() => imageInputRef.current?.click()}
                disabled={isLoading}
                className="p-2 rounded-full text-gray-500 hover:bg-gray-200 transition-colors"
                aria-label="Attach image"
            >
                <PaperClipIcon className="h-5 w-5" />
            </button>
          </div>
          <div className="absolute inset-y-0 right-2 flex items-center">
            {browserSupportsSpeechRecognition && (
                <button
                onClick={isListening ? stopListening : startListening}
                disabled={isLoading}
                className={`p-2 rounded-full transition-colors ${
                    isListening
                    ? 'bg-red-500 text-white animate-pulse'
                    : 'text-gray-500 hover:bg-gray-200'
                }`}
                aria-label={isListening ? "Stop listening" : "Start listening"}
                >
                {isListening ? <StopIcon className="h-5 w-5"/> : <MicIcon className="h-5 w-5" />}
                </button>
            )}
            <button
              onClick={() => handleSend(input)}
              disabled={isLoading || (!input && !image)}
              className="ml-2 p-2 rounded-full bg-violet-600 text-white disabled:bg-gray-300 hover:bg-violet-700 transition-transform active:scale-95 shadow-md disabled:shadow-none"
              aria-label="Send message"
            >
              <SendIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
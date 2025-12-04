import React, { useState, useRef, useEffect } from 'react';
import Layout from './components/Layout';
import MessageBubble from './components/MessageBubble';
import { CameraIcon, UploadIcon, SparklesIcon, CheckBadgeIcon, RefreshIcon } from './components/Icons';
import { getMathHint, getFullAnalysis } from './services/geminiService';
import { Message, MessageRole, MessageType, AppState } from './types';

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  
  // Ref for auto-scrolling
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, appState]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        // Strip data:image/xyz;base64, prefix for processing, but keep for display
        setCurrentImage(base64String);
        
        const newMessage: Message = {
          id: Date.now().toString(),
          role: MessageRole.USER,
          type: MessageType.IMAGE,
          content: base64String
        };
        
        setMessages([newMessage]);
        setAppState(AppState.IDLE); // Reset state to ready for hint
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGetHint = async () => {
    if (!currentImage) return;

    // Add thinking message
    const thinkingId = 'thinking-' + Date.now();
    setMessages(prev => [
      ...prev,
      {
        id: thinkingId,
        role: MessageRole.TEACHER,
        type: MessageType.TEXT,
        content: '',
        isThinking: true
      }
    ]);

    setAppState(AppState.ANALYZING_HINT);
    
    // Extract base64 raw data
    const rawBase64 = currentImage.split(',')[1];
    
    const hintText = await getMathHint(rawBase64);

    // Replace thinking with actual message
    setMessages(prev => prev.map(msg => 
      msg.id === thinkingId 
        ? { ...msg, content: hintText, isThinking: false } 
        : msg
    ));
    
    setAppState(AppState.HINT_GIVEN);
  };

  const handleGetAnalysis = async () => {
    if (!currentImage) return;

    // Add user request message
    const userRequestId = Date.now().toString();
    const userMsg: Message = {
        id: userRequestId,
        role: MessageRole.USER,
        type: MessageType.TEXT,
        content: "Подсказка не помогла. Где ошибка?"
    };

    // Add thinking message
    const thinkingId = 'thinking-full-' + Date.now();
    const teacherThinkingMsg: Message = {
        id: thinkingId,
        role: MessageRole.TEACHER,
        type: MessageType.TEXT,
        content: '',
        isThinking: true
    };

    setMessages(prev => [...prev, userMsg, teacherThinkingMsg]);
    setAppState(AppState.ANALYZING_FULL);

    const rawBase64 = currentImage.split(',')[1];
    const analysisText = await getFullAnalysis(rawBase64);

    // Replace thinking with actual message
    setMessages(prev => prev.map(msg => 
        msg.id === thinkingId 
          ? { ...msg, content: analysisText, isThinking: false } 
          : msg
      ));
      
    setAppState(AppState.FULL_REVIEW_GIVEN);
  };

  const handleReset = () => {
    setMessages([]);
    setCurrentImage(null);
    setAppState(AppState.IDLE);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Layout>
      <div className="flex-1 flex flex-col h-full">
        
        {/* Empty State / Welcome Screen */}
        {messages.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center text-center space-y-8 animate-fade-in">
            <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 max-w-sm w-full">
              <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6">
                 <CameraIcon className="w-10 h-10 text-indigo-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Нужна помощь с математикой?</h2>
              <p className="text-gray-500 mb-8">
                Сфотографируй свое решение. Я дам подсказку, а если запутаешься — разберем ошибки вместе.
              </p>
              
              <label className="cursor-pointer group block w-full">
                <input 
                  type="file" 
                  accept="image/*" 
                  capture="environment"
                  className="hidden" 
                  onChange={handleFileSelect}
                  ref={fileInputRef}
                />
                <div className="w-full bg-indigo-600 text-white font-semibold py-4 px-6 rounded-xl shadow-lg shadow-indigo-200 group-hover:bg-indigo-700 group-hover:shadow-xl transition-all flex items-center justify-center gap-2">
                   <CameraIcon className="w-6 h-6" />
                   <span>Сделать фото решения</span>
                </div>
              </label>
              
              <div className="mt-4">
                 <label className="cursor-pointer text-sm text-gray-500 hover:text-indigo-600 transition-colors flex items-center justify-center gap-1">
                    <UploadIcon className="w-4 h-4" />
                    <span>или загрузить из галереи</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={handleFileSelect}
                    />
                 </label>
              </div>
            </div>
          </div>
        )}

        {/* Chat Interface */}
        {messages.length > 0 && (
          <div className="flex-1 flex flex-col">
            <div className="flex-1 overflow-y-auto mb-4 scrollbar-hide">
               {messages.map((msg) => (
                 <MessageBubble key={msg.id} message={msg} />
               ))}
               <div ref={messagesEndRef} />
            </div>

            {/* Controls Area */}
            <div className="sticky bottom-0 pb-2">
                <div className="bg-white/80 backdrop-blur-md border border-white/50 p-4 rounded-2xl shadow-lg ring-1 ring-gray-900/5">
                  
                  {/* Initial State: Image uploaded, waiting for user action */}
                  {appState === AppState.IDLE && (
                    <button 
                      onClick={handleGetHint}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-lg py-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                    >
                      <SparklesIcon className="w-6 h-6" />
                      Дать подсказку
                    </button>
                  )}

                  {/* Loading States */}
                  {(appState === AppState.ANALYZING_HINT || appState === AppState.ANALYZING_FULL) && (
                    <div className="w-full bg-gray-100 text-gray-500 font-medium py-4 rounded-xl flex items-center justify-center gap-3 cursor-not-allowed">
                      <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                      <span>Анализирую решение...</span>
                    </div>
                  )}

                  {/* Hint Given State */}
                  {appState === AppState.HINT_GIVEN && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                       <button 
                        onClick={handleReset}
                        className="w-full bg-white border-2 border-gray-200 text-gray-600 hover:bg-gray-50 font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
                      >
                         <CameraIcon className="w-5 h-5" />
                         Новое фото
                      </button>
                      <button 
                        onClick={handleGetAnalysis}
                        className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold py-3 rounded-xl shadow-md shadow-amber-200 transition-all flex items-center justify-center gap-2"
                      >
                        <CheckBadgeIcon className="w-5 h-5" />
                        Подсказка не помогла
                      </button>
                    </div>
                  )}

                  {/* Full Analysis Given State */}
                  {appState === AppState.FULL_REVIEW_GIVEN && (
                     <button 
                      onClick={handleReset}
                      className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold text-lg py-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                    >
                      <RefreshIcon className="w-6 h-6" />
                      Решить следующую задачу
                    </button>
                  )}

                </div>
            </div>
          </div>
        )}

      </div>
    </Layout>
  );
}

export default App;

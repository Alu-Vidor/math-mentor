import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Message, MessageRole, MessageType } from '../types';

interface MessageBubbleProps {
  message: Message;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.role === MessageRole.USER;
  const isImage = message.type === MessageType.IMAGE;

  return (
    <div className={`flex w-full mb-6 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex max-w-[85%] md:max-w-[70%] ${isUser ? 'flex-row-reverse' : 'flex-row'} items-end gap-2`}>
        
        {/* Avatar */}
        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${isUser ? 'bg-indigo-600' : 'bg-green-600'}`}>
          {isUser ? (
            <span className="text-white text-xs font-bold">Я</span>
          ) : (
             <span className="text-white text-xs font-bold">У</span>
          )}
        </div>

        {/* Content Bubble */}
        <div 
          className={`
            relative p-4 rounded-2xl shadow-sm text-sm md:text-base leading-relaxed overflow-hidden
            ${isUser 
              ? 'bg-indigo-600 text-white rounded-br-none' 
              : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none'
            }
          `}
        >
          {isImage ? (
            <div className="space-y-2">
              <p className="opacity-90 font-medium">Мое решение:</p>
              <img 
                src={message.content} 
                alt="Uploaded Math Problem" 
                className="max-w-full rounded-lg border border-white/20 max-h-60 object-contain bg-black/10" 
              />
            </div>
          ) : (
            <div className={`prose prose-sm max-w-none ${isUser ? 'prose-invert' : 'prose-indigo'}`}>
              {message.isThinking ? (
                <div className="flex items-center gap-2 text-gray-500">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  <span className="text-xs font-medium ml-1">Учитель думает...</span>
                </div>
              ) : (
                <ReactMarkdown>{message.content}</ReactMarkdown>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;

import React, { useState, useEffect, useRef } from 'react';
import { chatService, aiHealthService } from '../../api/aiService';
import { useAuth } from '../../context/AuthContext';
import { 
  Send, 
  MessageCircle, 
  RefreshCw, 
  Trash2, 
  User, 
  Bot,
  Clock,
  CheckCircle,
  Zap,
  Shield,
  Heart,
  Home,
  Car
} from 'lucide-react';

const STORAGE_KEY = 'insur_ai_conversation';

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('checking');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const { user } = useAuth();

  useEffect(() => {
    checkAIServiceHealth();
    loadConversationHistory();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isConnected && messages.length === 0) {
      setWelcomeMessage();
    }
  }, [isConnected, messages.length]);

  const checkAIServiceHealth = async () => {
    try {
      setConnectionStatus('checking');
      const healthStatus = await aiHealthService.checkHealth();
      
      const isHealthy = healthStatus?.status === 'healthy' || 
                       healthStatus?.ai_service_healthy === true;
      
      setIsConnected(isHealthy);
      setConnectionStatus(isHealthy ? 'connected' : 'error');
    } catch (error) {
      console.error('Health check failed:', error);
      setIsConnected(false);
      setConnectionStatus('error');
    }
  };

  const setWelcomeMessage = () => {
    const welcomeMessage = {
      id: 'welcome',
      text: `👋 Welcome to InsurAI! I'm your personal insurance assistant.

I can help you with:
• 🚗 Auto Insurance - Claims, coverage, quotes
• 🏥 Health Insurance - Benefits, claims, network providers  
• 🏠 Home Insurance - Property protection, claims
• ❤️ Life Insurance - Beneficiaries, coverage options
• 📋 Claims Processing - File, track, document requirements
• 💳 Billing & Payments - Due dates, autopay, methods
• 📞 Customer Support - Contact info, appointments

What can I help you with today?`,
      sender: 'bot',
      timestamp: new Date().toISOString(),
      suggestions: [
        "File an insurance claim",
        "Check my policy coverage", 
        "Get a quote",
        "Make a payment"
      ]
    };
    
    setMessages([welcomeMessage]);
  };

  const loadConversationHistory = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const history = JSON.parse(stored);
        setMessages(history);
      }
    } catch (error) {
      console.warn('Could not load conversation history:', error);
    }
  };

  const saveConversationHistory = (newMessages) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newMessages));
    } catch (error) {
      console.warn('Could not save conversation history:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading || !isConnected) return;

    const userMessage = {
      id: Date.now(),
      text: inputMessage.trim(),
      sender: 'user',
      timestamp: new Date().toISOString()
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    saveConversationHistory(newMessages);
    
    const currentMessage = inputMessage.trim();
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await chatService.sendMessage(currentMessage);
      
      const botMessage = {
        id: Date.now() + 1,
        text: response.response || 'I received your message but had trouble generating a response.',
        sender: 'bot',
        timestamp: new Date().toISOString(),
        confidence: response.confidence,
        intent: response.intent,
        suggestions: response.suggestions || []
      };

      const finalMessages = [...newMessages, botMessage];
      setMessages(finalMessages);
      saveConversationHistory(finalMessages);
      
      setTimeout(() => inputRef.current?.focus(), 100);
      
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = {
        id: Date.now() + 1,
        text: `I apologize, but I'm experiencing technical difficulties: ${error.message}. Please try again or rephrase your question.`,
        sender: 'bot',
        timestamp: new Date().toISOString(),
        isError: true,
        suggestions: [
          "Try asking again",
          "Rephrase your question", 
          "Contact support",
          "Get help with claims"
        ]
      };

      const finalMessages = [...newMessages, errorMessage];
      setMessages(finalMessages);
      saveConversationHistory(finalMessages);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleClearChat = () => {
    setMessages([]);
    localStorage.removeItem(STORAGE_KEY);
    setTimeout(setWelcomeMessage, 100);
  };

  const handleSuggestionClick = (suggestion) => {
    setInputMessage(suggestion);
    inputRef.current?.focus();
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getIntentIcon = (intent) => {
    const iconMap = {
      'auto_insurance': <Car className="w-4 h-4 text-blue-500" />,
      'health_insurance': <Heart className="w-4 h-4 text-red-500" />,
      'home_insurance': <Home className="w-4 h-4 text-green-500" />,
      'life_insurance': <Shield className="w-4 h-4 text-purple-500" />,
      'claim_inquiry': <MessageCircle className="w-4 h-4 text-orange-500" />,
      'policy_question': <CheckCircle className="w-4 h-4 text-teal-500" />,
    };
    return iconMap[intent] || <Zap className="w-4 h-4 text-gray-500" />;
  };

  const renderMessage = (message) => {
    const isBot = message.sender === 'bot';
    
    return (
      <div key={message.id} className={`flex gap-3 mb-6 ${isBot ? '' : 'flex-row-reverse'}`}>
        {/* Avatar */}
        <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
          isBot 
            ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white' 
            : 'bg-gradient-to-r from-green-400 to-blue-500 text-white'
        }`}>
          {isBot ? <Bot className="w-5 h-5" /> : <User className="w-5 h-5" />}
        </div>

        {/* Message Content */}
        <div className={`flex-1 max-w-xs sm:max-w-md lg:max-w-lg ${isBot ? '' : 'flex flex-col items-end'}`}>
          <div className={`px-4 py-3 rounded-2xl shadow-sm ${
            isBot 
              ? 'bg-white border border-gray-200 text-gray-800' 
              : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
          } ${message.isError ? 'border-red-300 bg-red-50 text-red-800' : ''}`}>
            <div className="whitespace-pre-wrap text-sm leading-relaxed">
              {message.text}
            </div>
            
            {/* Suggestions */}
            {message.suggestions && message.suggestions.length > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-100">
                <p className="text-xs text-gray-500 mb-2">Quick suggestions:</p>
                <div className="flex flex-wrap gap-1">
                  {message.suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors duration-200 border border-gray-200 hover:border-gray-300"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {/* Message Meta */}
          <div className={`flex items-center gap-2 mt-1 text-xs text-gray-500 ${isBot ? '' : 'flex-row-reverse'}`}>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatTimestamp(message.timestamp)}
            </span>
            {message.intent && (
              <span className="flex items-center gap-1">
                {getIntentIcon(message.intent)}
                <span className="capitalize">{message.intent.replace('_', ' ')}</span>
              </span>
            )}
            {message.confidence && (
              <span className="text-green-600">
                {Math.round(message.confidence * 100)}% confident
              </span>
            )}
          </div>
        </div>
      </div>
    );
  };

  const ConnectionIndicator = () => (
    <div className={`flex items-center gap-2 text-sm ${
      connectionStatus === 'connected' ? 'text-green-600' : 
      connectionStatus === 'checking' ? 'text-yellow-600' : 'text-red-600'
    }`}>
      <div className={`w-2 h-2 rounded-full ${
        connectionStatus === 'connected' ? 'bg-green-500' : 
        connectionStatus === 'checking' ? 'bg-yellow-500 animate-pulse' : 'bg-red-500'
      }`} />
      <span>
        {connectionStatus === 'connected' ? 'Online' : 
         connectionStatus === 'checking' ? 'Connecting...' : 'Offline'}
      </span>
      {connectionStatus === 'error' && (
        <button 
          onClick={checkAIServiceHealth}
          className="text-blue-600 hover:text-blue-800 ml-1"
        >
          <RefreshCw className="w-3 h-3" />
        </button>
      )}
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-gray-50 to-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-800">InsurAI Assistant</h2>
              <ConnectionIndicator />
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={checkAIServiceHealth}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              title="Refresh connection"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
            <button
              onClick={handleClearChat}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              title="Clear chat"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {!isConnected && messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Bot className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 mb-2">Connecting to InsurAI...</p>
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
          </div>
        )}
        
        {messages.map(renderMessage)}
        
        {isLoading && (
          <div className="flex gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white">
              <Bot className="w-5 h-5" />
            </div>
            <div className="flex-1 max-w-xs">
              <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3 shadow-sm">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-gray-200 px-6 py-4">
        <div className="flex gap-3 items-end">
          <div className="flex-1">
            <textarea
              ref={inputRef}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={isConnected ? "Ask me anything about insurance..." : "Connecting to service..."}
              disabled={isLoading || !isConnected}
              rows={1}
              className="w-full px-4 py-3 border border-gray-300 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-400"
              style={{ minHeight: '48px', maxHeight: '120px' }}
            />
          </div>
          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isLoading || !isConnected}
            className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        
        <div className="mt-2 text-xs text-gray-500 text-center">
          Press Enter to send • Shift+Enter for new line
        </div>
      </div>
    </div>
  );
};

export default Chatbot;
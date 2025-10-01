import React, { useState, useEffect, useRef } from 'react';
import { chatService, aiHealthService } from '../../api/aiService';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
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
  const [aiProvider, setAiProvider] = useState('Standard');
  const [chatMode, setChatMode] = useState('unknown');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const { user } = useAuth();
  const { isDark } = useTheme();

  useEffect(() => {
    checkAIServiceHealth();
    checkChatMode();
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
      
      const isHealthy = healthStatus?.status === 'healthy';
      
      setIsConnected(isHealthy);
      setConnectionStatus(isHealthy ? 'connected' : 'error');
      setAiProvider(healthStatus?.ai_provider || 'Standard');
      
      if (healthStatus.gemini_status) {
        console.log(`🧠 Gemini API Status: ${healthStatus.gemini_status}`);
      }
    } catch (error) {
      console.error('Health check failed:', error);
      setIsConnected(false);
      setConnectionStatus('error');
    }
  };

  const checkChatMode = async () => {
    try {
      const modeData = await aiHealthService.getChatMode();
      setChatMode(modeData.mode || 'unknown');
      
      if (modeData.gemini_working) {
        console.log('🚀 Gemini AI is active and working!');
      } else {
        console.log('🎭 Running in fallback mode');
      }
    } catch (error) {
      console.error('Chat mode check failed:', error);
      setChatMode('error');
    }
  };

  const setWelcomeMessage = () => {
    const welcomeMessage = {
      id: 'welcome',
      text: `👋 Welcome to InsurAI! I'm your advanced AI insurance assistant powered by Google Gemini.

I can help you with:
• 🚗 Auto Insurance - Claims, coverage, quotes, accident reporting
• 🏥 Health Insurance - Benefits, claims, network providers, prescriptions
• 🏠 Home Insurance - Property protection, claims, natural disasters
• ❤️ Life Insurance - Beneficiaries, coverage options, policy types
• 📋 Claims Processing - File, track, upload documents, get updates
• 💳 Billing & Payments - Due dates, autopay, payment methods, history
• 🆘 Emergency Support - 24/7 assistance, immediate help
• 📞 Customer Support - Contact info, appointments, escalations

${chatMode === 'gemini' ? '🧠 AI Mode: Enhanced with Google Gemini for intelligent, context-aware responses!' : '🎭 Demo Mode: Template-based responses'}

What can I help you with today?`,
      sender: 'bot',
      timestamp: new Date().toISOString(),
      suggestions: [
        "File an insurance claim",
        "Check my policy coverage", 
        "Get a quote",
        "Make a payment",
        "Emergency assistance"
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
        suggestions: response.suggestions || [],
        aiProvider: response.aiProvider,
        requiresHuman: response.requiresHuman
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
              ? isDark
                ? 'bg-slate-700 border border-slate-600 text-white'
                : 'bg-white border border-gray-200 text-gray-800' 
              : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
          } ${message.isError ? isDark ? 'border-red-500/50 bg-red-900/30 text-red-300' : 'border-red-300 bg-red-50 text-red-800' : ''}`}>
            <div className="whitespace-pre-wrap text-sm leading-relaxed">
              {message.text}
            </div>
            
            {/* Suggestions */}
            {message.suggestions && message.suggestions.length > 0 && (
              <div className={`mt-3 pt-3 border-t ${
                isDark ? 'border-slate-600' : 'border-gray-100'
              }`}>
                <p className={`text-xs mb-2 ${
                  isDark ? 'text-slate-400' : 'text-gray-500'
                }`}>Quick suggestions:</p>
                <div className="flex flex-wrap gap-1">
                  {message.suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className={`px-2 py-1 text-xs rounded-lg transition-colors duration-200 ${
                        isDark
                          ? 'bg-slate-600 hover:bg-slate-500 text-slate-200 border border-slate-500'
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200 hover:border-gray-300'
                      }`}
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
        {connectionStatus === 'connected' ? 
          `Online • ${aiProvider}${chatMode === 'gemini' ? ' • Gemini AI' : ''}` : 
         connectionStatus === 'checking' ? 'Connecting...' : 'Offline'}
      </span>
      {connectionStatus === 'error' && (
        <button 
          onClick={() => {
            checkAIServiceHealth();
            checkChatMode();
          }}
          className="text-blue-600 hover:text-blue-800 ml-1"
        >
          <RefreshCw className="w-3 h-3" />
        </button>
      )}
    </div>
  );

  return (
    <div className={`flex flex-col h-full transition-colors duration-300 ${
      isDark 
        ? 'bg-gradient-to-br from-slate-900 to-slate-800' 
        : 'bg-gradient-to-br from-gray-50 to-white'
    }`}>
      {/* Header */}
      <div className={`px-6 py-4 shadow-sm transition-colors duration-300 ${
        isDark
          ? 'bg-slate-800 border-b border-slate-700'
          : 'bg-white border-b border-gray-200'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className={`text-xl font-semibold ${
                isDark ? 'text-white' : 'text-gray-800'
              }`}>InsurAI Assistant</h2>
              <ConnectionIndicator />
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={checkAIServiceHealth}
              className={`p-2 rounded-lg transition-colors ${
                isDark 
                  ? 'text-slate-300 hover:text-white hover:bg-slate-700' 
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
              title="Refresh connection"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
            <button
              onClick={handleClearChat}
              className={`p-2 rounded-lg transition-colors ${
                isDark 
                  ? 'text-slate-300 hover:text-white hover:bg-slate-700' 
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
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
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
              isDark ? 'bg-slate-700' : 'bg-gray-100'
            }`}>
              <Bot className={`w-8 h-8 ${isDark ? 'text-slate-400' : 'text-gray-400'}`} />
            </div>
            <p className={`mb-2 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Connecting to InsurAI...</p>
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
      <div className={`px-6 py-4 transition-colors duration-300 ${
        isDark
          ? 'bg-slate-800 border-t border-slate-700'
          : 'bg-white border-t border-gray-200'
      }`}>
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
              className={`w-full px-4 py-3 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                isDark 
                  ? 'bg-slate-700 border border-slate-600 text-white placeholder-slate-400 disabled:bg-slate-800 disabled:text-slate-500' 
                  : 'border border-gray-300 disabled:bg-gray-100 disabled:text-gray-400'
              }`}
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
        
        <div className={`mt-2 text-xs text-center ${
          isDark ? 'text-slate-400' : 'text-gray-500'
        }`}>
          Press Enter to send • Shift+Enter for new line
        </div>
      </div>
    </div>
  );
};

export default Chatbot;
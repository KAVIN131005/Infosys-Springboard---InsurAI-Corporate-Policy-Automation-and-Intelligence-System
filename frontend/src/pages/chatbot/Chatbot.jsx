import React, { useState, useEffect, useRef } from 'react';
import { chatService, aiHealthService } from '../../api/aiService';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Spinner from '../../components/ui/Spinner';

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('checking');
  const messagesEndRef = useRef(null);
  const { user } = useAuth();

  // Check AI service health on component mount
  useEffect(() => {
    checkAIServiceHealth();
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize with welcome message
  useEffect(() => {
    if (isConnected && messages.length === 0) {
      setMessages([
        {
          id: 1,
          text: `Hello ${user?.username || 'there'}! I'm your AI insurance assistant. I can help you with claims, policies, risk assessments, and general insurance questions. How can I assist you today?`,
          sender: 'bot',
          timestamp: new Date().toISOString()
        }
      ]);
    }
  }, [isConnected, user, messages.length]);

  const checkAIServiceHealth = async () => {
    try {
      setConnectionStatus('checking');
      const healthStatus = await aiHealthService.checkHealth();
      
      if (healthStatus.ai_service_healthy) {
        setIsConnected(true);
        setConnectionStatus('connected');
      } else {
        setIsConnected(false);
        setConnectionStatus('error');
        console.error('AI service health check failed:', healthStatus);
      }
    } catch (error) {
      console.error('Failed to check AI service health:', error);
      setIsConnected(false);
      setConnectionStatus('error');
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

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await chatService.sendMessage(inputMessage.trim(), conversationId);
      
      // Update conversation ID if returned
      if (response.conversation_id && !conversationId) {
        setConversationId(response.conversation_id);
      }

      const botMessage = {
        id: Date.now() + 1,
        text: response.response || response.message || 'I received your message, but I\'m having trouble formulating a response.',
        sender: 'bot',
        timestamp: new Date().toISOString(),
        confidence: response.confidence,
        intent: response.intent,
        suggestions: response.suggestions
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      
      const errorMessage = {
        id: Date.now() + 1,
        text: `I'm sorry, I'm having trouble connecting to the AI service. ${error.message || 'Please try again later.'}`,
        sender: 'bot',
        timestamp: new Date().toISOString(),
        isError: true
      };

      setMessages(prev => [...prev, errorMessage]);
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
    setConversationId(null);
    
    // Add welcome message after clearing
    setTimeout(() => {
      setMessages([
        {
          id: 1,
          text: `Chat cleared. How can I help you today?`,
          sender: 'bot',
          timestamp: new Date().toISOString()
        }
      ]);
    }, 100);
  };

  const handleRetryConnection = () => {
    checkAIServiceHealth();
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderMessage = (message) => {
    return (
      <div key={message.id} className={`message ${message.sender}`}>
        <div className="message-content">
          <div className={`message-bubble ${message.isError ? 'error' : ''}`}>
            <p>{message.text}</p>
            {message.suggestions && message.suggestions.length > 0 && (
              <div className="message-suggestions">
                <p className="suggestions-label">Suggested responses:</p>
                {message.suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    className="suggestion-button"
                    onClick={() => setInputMessage(suggestion)}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="message-meta">
            <span className="message-timestamp">{formatTimestamp(message.timestamp)}</span>
            {message.confidence && (
              <span className="message-confidence">
                Confidence: {Math.round(message.confidence * 100)}%
              </span>
            )}
            {message.intent && (
              <span className="message-intent">Intent: {message.intent}</span>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderConnectionStatus = () => {
    const statusConfig = {
      checking: { color: 'orange', text: 'Checking AI service...', icon: '⏳' },
      connected: { color: 'green', text: 'AI service connected', icon: '✅' },
      error: { color: 'red', text: 'AI service unavailable', icon: '❌' }
    };

    const config = statusConfig[connectionStatus];

    return (
      <div className={`connection-status ${connectionStatus}`}>
        <span className="status-icon">{config.icon}</span>
        <span className="status-text">{config.text}</span>
        {connectionStatus === 'error' && (
          <button className="retry-button" onClick={handleRetryConnection}>
            Retry
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="chatbot-container">
      <div className="chatbot-header">
        <h2>AI Insurance Assistant</h2>
        {renderConnectionStatus()}
        <div className="chatbot-actions">
          <Button 
            onClick={handleClearChat} 
            variant="outline" 
            size="small"
          >
            Clear Chat
          </Button>
        </div>
      </div>

      <div className="chatbot-messages">
        {messages.length === 0 && !isConnected && (
          <div className="empty-chat">
            <p>Connecting to AI service...</p>
            <Spinner />
          </div>
        )}
        
        {messages.map(renderMessage)}
        
        {isLoading && (
          <div className="message bot">
            <div className="message-content">
              <div className="message-bubble typing">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      <div className="chatbot-input">
        <div className="input-container">
          <Input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={isConnected ? "Type your insurance question..." : "AI service unavailable"}
            disabled={isLoading || !isConnected}
          />
          <Button 
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isLoading || !isConnected}
            className="send-button"
          >
            {isLoading ? <Spinner size="small" /> : 'Send'}
          </Button>
        </div>
        <div className="input-help">
          <p>You can ask about claims, policies, risk assessments, or general insurance questions.</p>
          <p>Examples: "How do I file a claim?", "What's my policy coverage?", "Assess risk for auto insurance"</p>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;
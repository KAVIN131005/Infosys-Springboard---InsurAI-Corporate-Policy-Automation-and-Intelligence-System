// Enhanced AI Service for Gemini-powered chatbot functionality
import apiClient from './apiClient';

const AI_CANDIDATES = [
  'http://localhost:8003',  // Primary Gemini-powered service
  'http://localhost:8002',  // Fallback service
  'http://localhost:8001',  // Fallback service
  'http://localhost:8000',  // Additional fallback
  'http://localhost:8080',  // Java backend fallback
];

let currentAiBaseUrl = null;
let serviceCapabilities = null;

/**
 * Find and test working AI service base URL
 */
async function resolveAiBaseUrl() {
  if (currentAiBaseUrl) {
    return currentAiBaseUrl;
  }

  for (const baseUrl of AI_CANDIDATES) {
    try {
      const response = await fetch(`${baseUrl}/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(8000), // 8 second timeout
      });
      
      if (response.ok) {
        const healthData = await response.json();
        currentAiBaseUrl = baseUrl;
        serviceCapabilities = healthData;
        
        console.log(`✅ AI Service found at: ${baseUrl}`);
        console.log(`🧠 AI Provider: ${healthData.ai_provider || 'Standard'}`);
        console.log(`🔑 API Status: ${healthData.api_key_status || 'Unknown'}`);
        console.log(`🎯 Gemini API: ${healthData.dependencies?.gemini_api || 'Unknown'}`);
        
        return baseUrl;
      }
    } catch (error) {
      console.log(`❌ AI Service not available at: ${baseUrl}`);
    }
  }
  
  throw new Error('No AI service available');
}

/**
 * Enhanced chat service for sending messages to Gemini-powered AI
 */
export const chatService = {
  async sendMessage(message) {
    try {
      const baseUrl = await resolveAiBaseUrl();
      
      // Use the enhanced chat endpoint with better error handling
      const response = await fetch(`${baseUrl}/api/chat/query?question=${encodeURIComponent(message)}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        signal: AbortSignal.timeout(25000), // 25 second timeout for AI processing
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Chat service error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      
      // Enhanced response structure with better defaults
      return {
        response: data.response || "I'm sorry, I couldn't generate a response. Please try rephrasing your question.",
        intent: data.intent || 'general_inquiry',
        confidence: data.confidence || 0.5,
        suggestions: data.suggestions || this.getDefaultSuggestions(data.intent),
        status: data.status || 'success',
        aiProvider: serviceCapabilities?.ai_provider || 'Standard',
        processingTime: data.processing_time || null,
        requiresHuman: data.requires_human || false
      };
    } catch (error) {
      console.error('Chat service error:', error);
      
      // Enhanced error handling with helpful suggestions
      const errorSuggestions = [
        "Try rephrasing your question",
        "Check your internet connection",
        "Contact support if the issue persists",
        "Try asking about common topics like claims or policies"
      ];
      
      if (error.name === 'AbortError' || error.message.includes('timeout')) {
        throw new Error(`Request timed out. The AI service may be processing a complex request. Please try again with a simpler question.`);
      }
      
      throw new Error(`Failed to send message: ${error.message}`);
    }
  },

  /**
   * Get default suggestions based on intent
   */
  getDefaultSuggestions(intent) {
    const suggestionMap = {
      'claim_inquiry': ["File a new claim", "Check claim status", "Upload documents", "Contact adjuster"],
      'policy_question': ["Coverage details", "Policy documents", "Premium information", "Add coverage"],
      'billing_inquiry': ["Make payment", "Payment history", "Set up autopay", "Billing questions"],
      'emergency': ["Call emergency line", "File urgent claim", "Emergency contacts", "Immediate assistance"],
      'complaint': ["Speak with supervisor", "File formal complaint", "Resolution options", "Escalate issue"],
      'quote_request': ["Get auto quote", "Home insurance quote", "Compare rates", "Save money"],
      'general_inquiry': ["File a claim", "Policy questions", "Make payment", "Get quote"]
    };

    return suggestionMap[intent] || [
      "How can I file a claim?",
      "What's covered in my policy?",
      "Help with billing questions",
      "Get insurance quotes"
    ];
  }
};

/**
 * Enhanced health check service with detailed diagnostics
 */
export const aiHealthService = {
  async checkHealth() {
    try {
      const baseUrl = await resolveAiBaseUrl();
      const response = await fetch(`${baseUrl}/health`, {
        signal: AbortSignal.timeout(10000)
      });
      
      if (response.ok) {
        const data = await response.json();
        return {
          status: 'healthy',
          service: data.service || 'AI Service',
          baseUrl: baseUrl,
          version: data.version || '1.0.0',
          ai_provider: data.ai_provider || 'Standard',
          gemini_status: data.dependencies?.gemini_api || 'unknown',
          api_key_status: data.api_key_status || 'unknown',
          performance: data.performance || {},
          details: data
        };
      } else {
        throw new Error(`Health check failed: ${response.status}`);
      }
    } catch (error) {
      return {
        status: 'unhealthy',
        service: 'AI Service',
        error: error.message,
        suggestion: 'Please check if the AI service is running and try again.'
      };
    }
  },

  async getChatMode() {
    try {
      const baseUrl = await resolveAiBaseUrl();
      const response = await fetch(`${baseUrl}/api/chat/mode`, {
        signal: AbortSignal.timeout(8000)
      });
      
      if (response.ok) {
        const data = await response.json();
        return {
          mode: data.mode || 'fallback',
          gemini_working: data.gemini_working || false,
          service_available: data.service_available || false,
          endpoints: data.endpoints || [],
          total_conversations: data.total_conversations || 0,
          total_messages: data.total_messages || 0
        };
      } else {
        throw new Error(`Chat mode check failed: ${response.status}`);
      }
    } catch (error) {
      return {
        mode: 'error',
        error: error.message,
        gemini_working: false,
        service_available: false
      };
    }
  }
};

/**
 * Enhanced conversation management
 */
export const conversationService = {
  async getConversations(userId = 'anonymous') {
    try {
      const baseUrl = await resolveAiBaseUrl();
      const response = await fetch(`${baseUrl}/api/chat/conversations/${userId}`, {
        signal: AbortSignal.timeout(10000)
      });
      
      if (response.ok) {
        return await response.json();
      } else {
        throw new Error(`Failed to get conversations: ${response.status}`);
      }
    } catch (error) {
      console.error('Failed to get conversations:', error);
      return { conversations: [], total_conversations: 0, error: error.message };
    }
  },

  async clearConversations() {
    try {
      const baseUrl = await resolveAiBaseUrl();
      const response = await fetch(`${baseUrl}/api/chat/conversations`, {
        method: 'DELETE',
        signal: AbortSignal.timeout(8000)
      });
      
      if (response.ok) {
        return await response.json();
      } else {
        throw new Error(`Failed to clear conversations: ${response.status}`);
      }
    } catch (error) {
      console.error('Failed to clear conversations:', error);
      throw error;
    }
  }
};

/**
 * Get current AI service base URL
 */
export function getAiServiceBaseUrl() {
  return currentAiBaseUrl;
}

/**
 * Get current service capabilities
 */
export function getServiceCapabilities() {
  return serviceCapabilities;
}

/**
 * Set AI service base URL override
 */
export function setAiServiceBaseUrl(url) {
  currentAiBaseUrl = url;
  serviceCapabilities = null; // Reset capabilities when URL changes
  console.log(`🔧 AI Service base URL override: ${url}`);
}

/**
 * Reset service discovery (force re-discovery of services)
 */
export function resetServiceDiscovery() {
  currentAiBaseUrl = null;
  serviceCapabilities = null;
  console.log('🔄 AI Service discovery reset');
}

// Default export for compatibility
export default {
  chat: chatService,
  health: aiHealthService,
  conversation: conversationService,
  utils: {
    getBaseUrl: getAiServiceBaseUrl,
    getCapabilities: getServiceCapabilities,
    setBaseUrl: setAiServiceBaseUrl,
    reset: resetServiceDiscovery
  }
};
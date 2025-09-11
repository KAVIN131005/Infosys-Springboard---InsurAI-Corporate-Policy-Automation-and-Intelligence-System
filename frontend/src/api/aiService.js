// AI Service for chatbot functionality
import apiClient from './apiClient';

const AI_CANDIDATES = [
  'http://localhost:8003',  // Python AI service (updated port)
  'http://localhost:8002',  // Python AI service (fallback)
  'http://localhost:8001',  // Python AI service (fallback)
  'http://localhost:8080',  // Java backend fallback
];

let currentAiBaseUrl = null;

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
        timeout: 5000,
      });
      
      if (response.ok) {
        currentAiBaseUrl = baseUrl;
        console.log(`✅ AI Service found at: ${baseUrl}`);
        return baseUrl;
      }
    } catch (error) {
      console.log(`❌ AI Service not available at: ${baseUrl}`);
    }
  }
  
  throw new Error('No AI service available');
}

/**
 * Chat service for sending messages to AI
 */
export const chatService = {
  async sendMessage(message) {
    try {
      const baseUrl = await resolveAiBaseUrl();
      
      // Use the working chat endpoint with query parameter
      const response = await fetch(`${baseUrl}/api/chat/query?question=${encodeURIComponent(message)}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Chat service error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      
      // Ensure response has expected structure
      return {
        response: data.response || "I'm sorry, I couldn't generate a response.",
        intent: data.intent || 'general_inquiry',
        confidence: data.confidence || 0.5,
        suggestions: data.suggestions || [
          "How can I file a claim?",
          "What's covered in my policy?",
          "Help with billing questions"
        ],
        status: data.status || 'success'
      };
    } catch (error) {
      console.error('Chat service error:', error);
      throw new Error(`Failed to send message: ${error.message}`);
    }
  }
};

/**
 * Health check service
 */
export const aiHealthService = {
  async checkHealth() {
    try {
      const baseUrl = await resolveAiBaseUrl();
      const response = await fetch(`${baseUrl}/health`);
      
      if (response.ok) {
        const data = await response.json();
        return {
          status: 'healthy',
          service: 'AI Service',
          baseUrl: baseUrl,
          details: data
        };
      } else {
        throw new Error(`Health check failed: ${response.status}`);
      }
    } catch (error) {
      return {
        status: 'unhealthy',
        service: 'AI Service',
        error: error.message
      };
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
 * Set AI service base URL override
 */
export function setAiServiceBaseUrl(url) {
  currentAiBaseUrl = url;
  console.log(`🔧 AI Service base URL override: ${url}`);
}

// Default export for compatibility
export default {
  chat: chatService,
  health: aiHealthService
};
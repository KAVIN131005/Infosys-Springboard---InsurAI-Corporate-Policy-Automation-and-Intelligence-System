import axios from 'axios';
import { getAuthToken, isTokenExpired, refreshAuthToken } from './authService';

// Create axios instance for AI services
const aiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080',
  timeout: 30000,
});

// Request interceptor to add auth token
aiClient.interceptors.request.use(
  async (config) => {
    let token = getAuthToken();
    
    // Check if token is expired and refresh if needed
    if (token && isTokenExpired(token)) {
      try {
        token = await refreshAuthToken();
      } catch (error) {
        console.error('Token refresh failed:', error);
        // Redirect to login or handle token refresh failure
        window.location.href = '/login';
        return Promise.reject(error);
      }
    }
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
aiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const newToken = await refreshAuthToken();
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return aiClient(originalRequest);
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

// AI Chat Services
export const chatService = {
  async sendMessage(message, conversationId = null) {
    try {
      const response = await aiClient.post('/api/ai/chat', {
        message,
        conversation_id: conversationId
      });
      return response.data;
    } catch (error) {
      console.error('Chat service error:', error);
      throw new Error(error.response?.data?.message || 'Failed to send message');
    }
  },

  async getConversationHistory(conversationId) {
    try {
      const response = await aiClient.get(`/api/ai/chat/history/${conversationId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to get conversation history:', error);
      throw new Error('Failed to retrieve conversation history');
    }
  }
};

// Text Analysis Services
export const textAnalysisService = {
  async analyzeText(text) {
    try {
      if (!text || text.trim().length === 0) {
        throw new Error('Text cannot be empty');
      }
      
      const response = await aiClient.post('/api/ai/analyze-text', { text });
      return response.data;
    } catch (error) {
      console.error('Text analysis error:', error);
      throw new Error(error.response?.data?.message || 'Failed to analyze text');
    }
  },

  async analyzeSentiment(text) {
    try {
      const analysis = await this.analyzeText(text);
      return {
        sentiment: analysis.sentiment,
        confidence: analysis.confidence,
        score: analysis.sentiment_score || 0
      };
    } catch (error) {
      console.error('Sentiment analysis error:', error);
      throw error;
    }
  }
};

// Risk Assessment Services
export const riskAssessmentService = {
  async assessRisk(riskData) {
    try {
      const { age, location, policyType, coverage } = riskData;
      
      const response = await aiClient.post('/api/ai/assess-risk', {
        age: parseInt(age),
        location,
        policy_type: policyType,
        coverage: parseFloat(coverage)
      });
      
      return response.data;
    } catch (error) {
      console.error('Risk assessment error:', error);
      throw new Error(error.response?.data?.message || 'Failed to assess risk');
    }
  },

  async getBatchRiskAssessment(riskDataArray) {
    try {
      const assessments = await Promise.all(
        riskDataArray.map(data => this.assessRisk(data))
      );
      return assessments;
    } catch (error) {
      console.error('Batch risk assessment error:', error);
      throw error;
    }
  }
};

// Claim Analysis Services
export const claimAnalysisService = {
  async analyzeClaim(claimData) {
    try {
      const { description, amount, claimType } = claimData;
      
      const response = await aiClient.post('/api/ai/analyze-claim', {
        description,
        amount: parseFloat(amount),
        claim_type: claimType
      });
      
      return response.data;
    } catch (error) {
      console.error('Claim analysis error:', error);
      throw new Error(error.response?.data?.message || 'Failed to analyze claim');
    }
  },

  async submitClaimWithAI(claimData) {
    try {
      const response = await aiClient.post('/api/claims/submit-with-ai', claimData);
      return response.data;
    } catch (error) {
      console.error('AI claim submission error:', error);
      throw new Error(error.response?.data?.message || 'Failed to submit claim');
    }
  },

  async reanalyzeClaim(claimId) {
    try {
      const response = await aiClient.post(`/api/claims/${claimId}/analyze`);
      return response.data;
    } catch (error) {
      console.error('Claim reanalysis error:', error);
      throw new Error(error.response?.data?.message || 'Failed to reanalyze claim');
    }
  },

  async bulkAnalyzeClaims(claimIds) {
    try {
      const response = await aiClient.post('/api/claims/bulk-analyze', {
        claim_ids: claimIds
      });
      return response.data;
    } catch (error) {
      console.error('Bulk claim analysis error:', error);
      throw new Error(error.response?.data?.message || 'Failed to analyze claims');
    }
  }
};

// Document Processing Services
export const documentProcessingService = {
  async processDocument(documentText, documentType = 'general') {
    try {
      if (!documentText || documentText.trim().length === 0) {
        throw new Error('Document text cannot be empty');
      }
      
      const response = await aiClient.post('/api/ai/process-document', {
        document_text: documentText,
        document_type: documentType
      });
      
      return response.data;
    } catch (error) {
      console.error('Document processing error:', error);
      throw new Error(error.response?.data?.message || 'Failed to process document');
    }
  },

  async extractPolicyData(documentText) {
    try {
      return await this.processDocument(documentText, 'policy');
    } catch (error) {
      console.error('Policy extraction error:', error);
      throw error;
    }
  },

  async extractClaimData(documentText) {
    try {
      return await this.processDocument(documentText, 'claim');
    } catch (error) {
      console.error('Claim extraction error:', error);
      throw error;
    }
  }
};

// AI Service Health and Status
export const aiHealthService = {
  async checkHealth() {
    try {
      const response = await aiClient.get('/api/ai/health');
      return response.data;
    } catch (error) {
      console.error('AI health check error:', error);
      return {
        ai_service_healthy: false,
        overall_status: 'error',
        error: error.message
      };
    }
  },

  async getStatus() {
    try {
      const response = await aiClient.get('/api/ai/status');
      return response.data;
    } catch (error) {
      console.error('AI status error:', error);
      throw new Error('Failed to get AI service status');
    }
  },

  async getCapabilities() {
    try {
      const response = await aiClient.get('/api/ai/capabilities');
      return response.data;
    } catch (error) {
      console.error('AI capabilities error:', error);
      throw new Error('Failed to get AI capabilities');
    }
  }
};

// Utility functions
export const aiUtils = {
  formatRiskScore(score) {
    if (typeof score !== 'number') return 'Unknown';
    
    if (score < 0.3) return 'Low';
    if (score < 0.7) return 'Medium';
    return 'High';
  },

  formatFraudScore(score) {
    if (typeof score !== 'number') return 'Unknown';
    
    if (score < 0.2) return 'Very Low';
    if (score < 0.4) return 'Low';
    if (score < 0.6) return 'Medium';
    if (score < 0.8) return 'High';
    return 'Very High';
  },

  formatSentiment(sentiment) {
    const sentimentMap = {
      positive: 'Positive',
      negative: 'Negative',
      neutral: 'Neutral'
    };
    return sentimentMap[sentiment] || 'Unknown';
  },

  getRecommendationColor(priority) {
    const colorMap = {
      low: 'green',
      medium: 'yellow',
      high: 'red'
    };
    return colorMap[priority] || 'gray';
  }
};

// Legacy support for existing code
export const analyzePolicy = textAnalysisService.analyzeText;
export const assessRisk = riskAssessmentService.assessRisk;

// Default export with all services
export default {
  chat: chatService,
  textAnalysis: textAnalysisService,
  riskAssessment: riskAssessmentService,
  claimAnalysis: claimAnalysisService,
  documentProcessing: documentProcessingService,
  health: aiHealthService,
  utils: aiUtils
};
# InsurAI Gemini-Powered Chatbot - Complete Implementation

🤖 **Dynamic, AI-powered insurance chatbot using Google Gemini API**

## 🚀 Quick Start

### 1. Start the Gemini-Powered Backend

```bash
cd python-services
python start_gemini_chatbot.py
```

The service will start on **http://localhost:8003** with:
- ✅ Google Gemini API integration
- ✅ Enhanced intent detection 
- ✅ Dynamic AI responses
- ✅ Fallback template system
- ✅ Full REST API

### 2. Test the Chatbot API

```bash
# Run comprehensive tests
cd python-services
python test_gemini_chatbot.py
```

### 3. Start the Frontend

```bash
cd frontend
npm run dev
```

Open **http://localhost:3000** and navigate to the Chatbot page.

## 🔑 API Key Configuration

The Gemini API key is **pre-configured** in the startup script:
```
AIzaSyDp1SWZ_aTLRY200_-fqEWdL0Y6MJh_mfo
```

## 🧪 Test Commands

### Quick API Tests
```bash
# Health check
curl "http://localhost:8003/health"

# Chat mode check
curl "http://localhost:8003/api/chat/mode"

# Simple chat test
curl "http://localhost:8003/api/chat/query?question=Hello"

# Insurance claim test
curl "http://localhost:8003/api/chat/query?question=I%20need%20to%20file%20a%20claim"
```

### Example Chat Messages
- "I need to file a car insurance claim"
- "What's covered under my home policy?"
- "I want to make a payment"
- "This is an emergency - I was in an accident"
- "I'm unhappy with your service"
- "Can you help me understand my deductible?"

## 🎯 Features

### AI-Powered Features
- **Dynamic Responses**: Real-time AI generation using Gemini 1.5 Flash
- **Context Awareness**: Maintains conversation context
- **Intent Detection**: Advanced pattern matching for insurance topics
- **Smart Suggestions**: Contextual follow-up suggestions
- **Emergency Handling**: Prioritizes urgent situations

### Insurance Domain Expertise
- **Auto Insurance**: Claims, coverage, quotes, accidents
- **Home Insurance**: Property protection, natural disasters
- **Health Insurance**: Benefits, providers, prescriptions
- **Life Insurance**: Beneficiaries, coverage types
- **Claims Processing**: Filing, tracking, documentation
- **Billing Support**: Payments, autopay, history

### Technical Features
- **Fallback System**: Template responses if AI unavailable
- **Error Handling**: Graceful degradation
- **Performance**: < 2s response times
- **Scalability**: Supports multiple concurrent users
- **Monitoring**: Health checks and analytics

## 📊 API Endpoints

### Chat Endpoints
- `POST /api/chat/query?question=...` - Simple chat query
- `POST /api/chat/chat` - Advanced chat with conversation context
- `GET /api/chat/mode` - Check AI mode and capabilities
- `GET /api/chat/health` - Chat service health

### Utility Endpoints
- `GET /health` - Service health check
- `GET /docs` - Interactive API documentation
- `GET /api/chat/conversations` - List conversations
- `DELETE /api/chat/conversations` - Clear conversations

## 🔧 Configuration

### Environment Variables
```bash
GEMINI_API_KEY=AIzaSyDp1SWZ_aTLRY200_-fqEWdL0Y6MJh_mfo
GEMINI_MODEL=gemini-1.5-flash
HOST=0.0.0.0
PORT=8003
DEBUG=true
```

### Service Discovery
The frontend automatically discovers available AI services:
1. Primary: localhost:8003 (Gemini-powered)
2. Fallback: localhost:8002, 8001, 8000
3. Java backend: localhost:8080

## 🎭 Modes of Operation

### 1. Gemini Mode (Preferred)
- **When**: API key valid and Gemini API accessible
- **Features**: Dynamic AI responses, context awareness, advanced NLP
- **Indicator**: "🧠 Gemini AI" in UI

### 2. Fallback Mode
- **When**: Gemini API unavailable
- **Features**: Enhanced template responses, intent detection
- **Indicator**: "🎭 Demo Mode" in UI

## 📱 Frontend Integration

The React frontend (`Chatbot.jsx`) includes:
- ✅ Real-time connection status
- ✅ AI provider indication (Gemini/Standard)
- ✅ Enhanced message display
- ✅ Suggestion bubbles
- ✅ Error handling with retry
- ✅ Conversation persistence
- ✅ Responsive design

## 🔍 Troubleshooting

### Service Not Starting
1. Check Python dependencies: `pip install fastapi uvicorn httpx pydantic`
2. Verify port 8003 is available
3. Check API key configuration

### AI Not Working
1. Check API key validity
2. Verify internet connection
3. Check Gemini API quota/limits
4. Service will automatically fall back to templates

### Frontend Connection Issues
1. Ensure backend is running on port 8003
2. Check CORS configuration
3. Verify service discovery in browser console

## 🌟 Production Deployment

### Security
- Store API keys in environment variables
- Use HTTPS in production
- Implement rate limiting
- Add authentication/authorization

### Performance
- Enable response caching
- Use connection pooling
- Monitor API quotas
- Scale horizontally as needed

### Monitoring
- Health check endpoints
- Conversation analytics
- Error tracking
- Performance metrics

## 🎉 Success Indicators

✅ **Backend Running**: Service responds at http://localhost:8003/health
✅ **Gemini Working**: Mode shows "gemini" in /api/chat/mode
✅ **Frontend Connected**: Green "Online • Gemini AI" indicator
✅ **Chat Functional**: Receives dynamic responses to questions
✅ **Fallback Working**: Template responses when AI unavailable

---

**Ready to deploy a production-grade AI chatbot for insurance!** 🚀

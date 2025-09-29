# 🚀 InsurAI - Complete Startup Guide

## 🎯 Quick Start (5 Minutes to Running System)

### Prerequisites
- Java 17+ installed
- Node.js 16+ installed  
- Python 3.8+ installed
- MySQL or Docker installed
- Git installed

### 1️⃣ Clone & Setup
```bash
# If not already done
git clone <your-repo>
cd insur
```

### 2️⃣ Start Database
```bash
# Option A: Using Docker (Recommended)
docker-compose up mysql -d

# Option B: Local MySQL
# Create database 'insur' on port 3307
# Username: root, Password: Kavin@2005
```

### 3️⃣ Start Backend (Spring Boot)
```bash
# Terminal 1
./mvnw clean install
./mvnw spring-boot:run

# Alternative for Windows
mvnw.cmd clean install  
mvnw.cmd spring-boot:run

# Should start on http://localhost:8080
```

### 4️⃣ Start Frontend (React)
```bash
# Terminal 2  
cd frontend
npm install
npm run dev

# Should start on http://localhost:3000
```

### 5️⃣ Start AI Services (Python)
```bash
# Terminal 3
cd python-services
pip install -r requirements.txt
python simple_main.py

# Should start on http://localhost:8003
```

---

## 🌐 Access Your Application

### 🎯 Main Application
**URL**: http://localhost:3000

### 👤 Test Users (Auto-created)
```
Admin User:
- Username: admin
- Password: admin123
- Role: ADMIN

Broker User:  
- Username: broker
- Password: broker123
- Role: BROKER

Regular User:
- Username: user  
- Password: user123
- Role: USER
```

### 📋 Quick Test Flow
1. **Visit**: http://localhost:3000
2. **Login** with any test user above
3. **Admin**: Upload policies, approve applications
4. **Broker**: Upload policies, view analytics
5. **User**: Browse policies, apply, submit claims

---

## 🔧 Service URLs & Status

### 🖥️ Core Services
- **Frontend**: http://localhost:3000 (React App)
- **Backend API**: http://localhost:8080 (Spring Boot)
- **AI Services**: http://localhost:8003 (FastAPI)
- **Database**: localhost:3307 (MySQL)

### 📚 Documentation  
- **API Docs**: http://localhost:8003/docs (FastAPI Swagger)
- **API Redoc**: http://localhost:8003/redoc (Alternative docs)
- **Health Check**: http://localhost:8003/health

### 🧪 Test Endpoints
```bash
# Backend Health
curl http://localhost:8080/actuator/health

# AI Services Health  
curl http://localhost:8003/health

# Public Policies
curl http://localhost:8080/api/policies/public

# Login Test
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

---

## 🎯 Complete User Journey Testing

### 🔐 1. Authentication Flow
```
http://localhost:3000/login
→ Login with admin/admin123  
→ Redirects to /admin (Admin Dashboard)
```

### 📋 2. Policy Management (Admin/Broker)
```
Admin Dashboard → Upload Policy
→ Select PDF/DOC file
→ AI extracts policy details
→ Review and publish
→ Policy appears in public listing
```

### 👤 3. User Policy Application  
```
Login as user/user123
→ Browse Policies (/policies)
→ View Policy Details (/policy/view/1)
→ Click "Apply for Policy"
→ AI assesses risk → Auto-approve or Admin review
```

### 📄 4. Claims Processing
```  
User Dashboard → Submit Claim
→ Fill claim details
→ AI fraud analysis
→ Auto-process or Admin review
→ Track status in Claims section
```

### 📊 5. Analytics & Dashboards
```
Admin: Real-time metrics, approvals, revenue
Broker: Own policies, applications, earnings  
User: Active policies, claims, payments
```

---

## 🤖 AI Features Testing

### 🎯 Risk Assessment
```bash
# Test AI risk scoring
curl -X POST http://localhost:8003/api/risk/assess \
  -H "Content-Type: application/json" \
  -d '{"age": 25, "income": 50000, "location": "urban"}'
```

### 🔍 Fraud Detection  
```bash
# Test claims analysis
curl -X POST http://localhost:8003/api/claims/analyze \
  -H "Content-Type: application/json" \
  -d '{"description": "Car accident on highway", "amount": 5000}'
```

### 💬 Chatbot (Requires GEMINI_API_KEY)
```bash
# Set environment variable
export GEMINI_API_KEY=your_gemini_key

# Test chatbot
curl "http://localhost:8003/api/chat/query?question=What insurance do you offer?"
```

---

## 🛡️ Manual Fallback Testing

### 📋 Manual Policy Processing
1. **Upload Policy**: If AI fails, manually enter policy details
2. **Application Review**: Admin can override AI risk assessment  
3. **Claims Review**: Admin can manually process all claims

### 🔄 Fallback Workflow
- AI Service Down → System uses mock data
- Database Issue → Frontend shows cached data
- Backend Down → Graceful error messages

---

## 📊 Development Features

### 🧪 Mock Data System
- All frontend services have mock data fallbacks
- Development works without backend/AI services
- Realistic test data for all entities

### 🔧 Hot Reloading
- **Frontend**: Auto-reload on file changes (Vite)
- **Backend**: Spring DevTools for hot reload
- **AI Services**: FastAPI auto-reload during development

### 🐛 Debug Mode
```bash
# Backend debug mode
./mvnw spring-boot:run -Dspring-boot.run.profiles=debug

# Frontend debug mode (default in dev)
npm run dev

# AI services debug mode
python simple_main.py --reload --debug
```

---

## 📁 Project Structure Reference

```
insur/
├── 📱 frontend/          # React application
│   ├── src/
│   │   ├── pages/        # Route components
│   │   ├── components/   # Reusable UI components
│   │   ├── api/          # API service layer
│   │   ├── hooks/        # Custom React hooks
│   │   └── utils/        # Utility functions
│   └── package.json      # Dependencies
├── 🔧 src/main/java/     # Spring Boot backend
│   ├── controller/       # REST API endpoints
│   ├── service/          # Business logic
│   ├── entity/           # JPA entities
│   ├── repository/       # Data access
│   └── config/           # Configuration
├── 🤖 python-services/   # AI services
│   ├── simple_main.py    # FastAPI application
│   ├── app/              # Application modules
│   └── requirements.txt  # Python dependencies
├── 📄 Documentation Files
│   ├── COMPLETE_ROUTES_DOCUMENTATION.md
│   ├── FINAL_IMPLEMENTATION_STATUS.md
│   └── STARTUP_GUIDE.md (this file)
└── ⚙️ Configuration Files
    ├── pom.xml           # Maven configuration
    ├── compose.yaml      # Docker services
    └── application.properties # Spring Boot config
```

---

## 🚨 Troubleshooting

### ❌ Common Issues & Solutions

#### Backend Won't Start
```bash
# Check Java version
java --version  # Should be 17+

# Check MySQL connection
mysql -h localhost -P 3307 -u root -p

# Clean and rebuild
./mvnw clean install
```

#### Frontend Issues
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Check Node version  
node --version  # Should be 16+
```

#### AI Services Issues
```bash
# Check Python version
python --version  # Should be 3.8+

# Install dependencies
pip install fastapi uvicorn python-multipart httpx

# Test direct access
curl http://localhost:8003/health
```

#### Database Connection Issues
```bash
# Check if MySQL is running
docker ps  # Should show mysql container

# Check port availability
netstat -an | grep 3307

# Reset database
docker-compose down
docker-compose up mysql -d
```

### 🔍 Service Status Check
```bash
# Check all services are running
curl http://localhost:3000          # Frontend (should return HTML)
curl http://localhost:8080/actuator/health  # Backend
curl http://localhost:8003/health   # AI Services  
```

---

## 🎉 Success Indicators

### ✅ System is Working When:
1. **Frontend loads** at http://localhost:3000
2. **Login works** with test credentials
3. **Dashboards show data** (real or mock)
4. **Policy upload works** (with or without AI)  
5. **User can browse and apply** for policies
6. **Claims can be submitted** and tracked
7. **Admin can approve/reject** applications and claims

### 📊 Expected Behavior:
- **Smooth navigation** between all pages
- **Role-based access** working correctly  
- **Real-time updates** in dashboards
- **Error handling** with user-friendly messages
- **Responsive design** on different screen sizes

---

## 🚀 Production Deployment Notes

### Environment Variables
```bash
# Required for production
JWT_SECRET=your-secure-jwt-secret
GEMINI_API_KEY=your-gemini-api-key
DATABASE_URL=your-production-database-url
```

### Build Commands
```bash
# Frontend production build
cd frontend && npm run build

# Backend production JAR
./mvnw clean package -DskipTests

# Docker deployment (future)
docker-compose up --build
```

---

## 📞 Support & Next Steps

### 🔧 Development Mode
- All services run locally with hot reload
- Mock data available for offline development
- Comprehensive error logging and debugging

### 🚀 Production Ready
- Security configured with JWT
- Database optimized with proper indexes
- API rate limiting and CORS configured
- Error handling and user feedback

### 📈 Future Enhancements
- WebSocket for real-time updates
- Email notifications
- Mobile app (React Native)
- Advanced AI models
- Payment gateway integration

**🎯 Your InsurAI platform is now ready for development and production use! 🎯**

**Need help?** Check the logs in each terminal window for detailed error messages and debugging information.
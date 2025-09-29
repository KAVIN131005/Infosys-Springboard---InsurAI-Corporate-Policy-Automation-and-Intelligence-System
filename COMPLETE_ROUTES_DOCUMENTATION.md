# InsurAI Complete Routes Documentation

## 🌐 Application URLs and Ports

### Main Services
- **Frontend (React)**: `http://localhost:3000`
- **Backend (Spring Boot)**: `http://localhost:8080`
- **Python AI Services**: `http://localhost:8003` (configured in simple_main.py)
- **Database (MySQL)**: `localhost:3307` (configured in application.properties)

### Alternative Python Services
- **Flask Chatbot**: `http://localhost:8000` (if using Flask services)
- **FastAPI Alternative**: `http://localhost:8001` (if using alternative configuration)

---

## 🎯 Frontend Routes (React Router)

### Public Routes
```
GET /                           - Landing page (HomePage component)
GET /login                      - Login page
GET /register                   - Registration page
```

### User Routes (Authenticated)
```
GET /dashboard                  - User Dashboard (default for USER role)
GET /user/dashboard             - Explicit user dashboard route
GET /policies                   - Browse all available policies (public view)
GET /policy/view/:id            - View specific policy details
GET /policy/compare             - Compare policies side-by-side
GET /submit-claim               - Submit insurance claim
GET /claim/submit               - Alternative claim submission route
GET /claim-status               - View claim status and history
GET /claim/status               - Alternative claim status route
GET /user/compare               - User-specific policy comparison
GET /user/claims                - User's claim history
GET /user/submit-claim          - User claim submission
GET /user/chatbot               - AI chatbot interface
GET /chatbot                    - General chatbot access
```

### Broker Routes (BROKER role)
```
GET /broker                     - Broker dashboard redirect
GET /broker/dashboard           - Broker-specific dashboard
GET /broker/upload              - Upload new policies
GET /broker/policies            - Manage broker's policies
GET /broker/compare             - Broker policy comparison tools
GET /broker/claims              - Broker claim management
GET /broker/submit-claim        - Submit claims as broker
```

### Admin Routes (ADMIN role)
```
GET /admin                      - Admin Dashboard (default for ADMIN role)
GET /admin/dashboard            - Admin-specific dashboard
GET /admin/policies             - Manage all policies
GET /admin/upload-policy        - Upload policies as admin
GET /admin/compare              - Admin policy comparison
GET /admin/claims               - Manage all claims
GET /admin/submit-claim         - Submit claims as admin
GET /analytics                  - Advanced analytics dashboard (ADMIN/BROKER)
```

### Utility Routes
```
GET /home                       - Redirects to /
GET /*                          - Catch-all redirects to /
```

---

## 🔒 Backend API Routes (Spring Boot)

### Authentication Endpoints (`/api/auth`)
```
POST /api/auth/register         - User registration
POST /api/auth/login            - User login
GET  /api/auth/me               - Get current user info
GET  /api/auth/verify           - Verify JWT token
POST /api/auth/refresh          - Refresh JWT token
POST /api/auth/logout           - User logout
```

### Policy Management (`/api/policies`)
```
# Public Access
GET  /api/policies/public       - Get all active policies (public)

# Authenticated Users
GET  /api/policies              - Get all policies
GET  /api/policies/{id}         - Get policy by ID
GET  /api/policies/type/{type}  - Get policies by type
POST /api/policies/{id}/apply   - Apply for policy (USER)

# Broker/Admin Only
POST /api/policies/upload       - Upload policy document
POST /api/policies              - Create new policy
PUT  /api/policies/{id}         - Update policy
DELETE /api/policies/{id}       - Delete policy
GET  /api/policies/user         - Get user-specific policies
GET  /api/policies/broker       - Get broker's policies
GET  /api/policies/pending      - Get policies pending approval (ADMIN)
GET  /api/policies/status/{status} - Get policies by status
POST /api/policies/{id}/approve - Approve policy (ADMIN)
POST /api/policies/{id}/reject  - Reject policy (ADMIN)
```

### User Policy Applications (`/api/user-policies`)
```
# User Access
POST /api/user-policies/apply          - Apply for policy
GET  /api/user-policies/user           - Get current user's policies
GET  /api/user-policies/user/{userId}  - Get specific user policies

# Admin Access
GET  /api/user-policies/active/{userId}    - Get active policies for user
GET  /api/user-policies/pending-approvals  - Get pending approvals
POST /api/user-policies/{id}/approve       - Approve user policy
POST /api/user-policies/{id}/reject        - Reject user policy
```

### Claims Management (`/api/claims`)
```
# User Access
POST /api/claims/submit                    - Submit new claim
POST /api/claims/submit-file               - Submit claim with file upload
GET  /api/claims                          - Get user's claims
GET  /api/claims/{id}                     - Get claim details
GET  /api/claims/number/{claimNumber}     - Get claim by number

# Admin Access
GET  /api/claims/all                      - Get all claims
GET  /api/claims/pending-review           - Get claims pending manual review
POST /api/claims/{id}/approve             - Approve claim
POST /api/claims/{id}/reject              - Reject claim
PUT  /api/claims/{id}/status              - Update claim status
```

### Dashboard & Analytics (`/api/dashboard`)
```
GET /api/dashboard/admin       - Admin dashboard data
GET /api/dashboard/broker      - Broker dashboard data
GET /api/dashboard/user        - User dashboard data
GET /api/dashboard/analytics   - Advanced analytics (ADMIN/BROKER)
GET /api/dashboard/real-time   - Real-time data based on role
```

---

## 🤖 Python AI Services (FastAPI)

### Base Service (`http://localhost:8003`)
```
GET  /                         - Service health and info
GET  /health                   - Health check endpoint
GET  /docs                     - FastAPI documentation
GET  /redoc                    - Alternative API documentation
```

### AI Processing Endpoints
```
# Risk Assessment
POST /api/risk/assess          - Assess user/policy risk
  Body: { age: number, income: number, other_factors: object }
  Response: { risk_score: float, risk_level: string, recommendations: array }

# Claims Analysis  
POST /api/claims/analyze       - Analyze claim for fraud detection
  Body: { description: string, amount: number, policy_details: object }
  Response: { fraud_score: float, risk_level: string, indicators: array }

# NLP Processing
POST /api/nlp/analyze         - Analyze text content
  Body: { text: string }
  Response: { sentiment: string, word_count: number, entities: array }

# Chatbot Interface
POST /api/chat/query          - Query AI chatbot (Gemini-powered)
  Query Param: ?question=your_question
  Response: { response: string, intent: string, confidence: float, suggestions: array }
```

---

## 🔗 Integration Flow

### Complete User Journey Routes

#### 1. User Registration & Login
```
Frontend: / → /register → /login
Backend:  POST /api/auth/register → POST /api/auth/login
Result:   Redirect to role-based dashboard
```

#### 2. Policy Browsing & Application
```
Frontend: /dashboard → /policies → /policy/view/:id → Apply
Backend:  GET /api/policies/public → GET /api/policies/{id} → POST /api/policies/{id}/apply
AI:       POST /api/risk/assess (for automatic approval)
```

#### 3. Broker Policy Upload
```
Frontend: /broker/upload → Upload form
Backend:  POST /api/policies/upload (with file)
AI:       POST /api/nlp/analyze (for document processing)
```

#### 4. Claim Submission & Processing
```
Frontend: /submit-claim → Claim form
Backend:  POST /api/claims/submit
AI:       POST /api/claims/analyze (for fraud detection)
Admin:    GET /admin/claims → Review → Approve/Reject
```

#### 5. Admin Dashboard Analytics
```
Frontend: /admin → /analytics
Backend:  GET /api/dashboard/admin → GET /api/dashboard/analytics
Real-time: WebSocket connections (future implementation)
```

---

## 🚀 Quick Start Commands

### Start All Services
```bash
# 1. Start MySQL Database
docker-compose up mysql

# 2. Start Backend (Spring Boot)
./mvnw spring-boot:run
# OR
java -jar target/insur-0.0.1-SNAPSHOT.jar

# 3. Start Frontend (React)
cd frontend
npm install
npm run dev

# 4. Start Python AI Services
cd python-services
pip install -r requirements.txt
python simple_main.py
```

### Development URLs
- Frontend: http://localhost:3000
- Backend API: http://localhost:8080
- AI Services: http://localhost:8003
- API Docs: http://localhost:8003/docs

---

## 🛡️ Security & Authentication

### JWT Token Flow
1. Login → Receive JWT token
2. Store token in localStorage/sessionStorage
3. Include token in Authorization header: `Bearer <token>`
4. Backend validates token on protected routes

### Role-Based Access Control
- **USER**: Can browse policies, apply, submit claims, view own data
- **BROKER**: Can upload policies, manage own policies, view analytics
- **ADMIN**: Full access to all functions, approve/reject, system management

### API Security Headers
```javascript
// Required headers for authenticated requests
{
  'Authorization': 'Bearer ' + token,
  'Content-Type': 'application/json',
  'Accept': 'application/json'
}
```

---

## 📊 Real-time Features (WebSocket - Future)

### Planned WebSocket Endpoints
```
/ws/dashboard          - Real-time dashboard updates
/ws/claims             - Live claim status updates  
/ws/notifications      - System notifications
/ws/analytics          - Live analytics data
```

---

## 🧪 Testing Routes

### Frontend Testing URLs
```
http://localhost:3000/                    - Test landing page
http://localhost:3000/login               - Test authentication
http://localhost:3000/dashboard           - Test user dashboard
http://localhost:3000/admin               - Test admin functions
http://localhost:3000/broker/upload       - Test policy upload
```

### Backend API Testing
```bash
# Test health
curl http://localhost:8080/actuator/health

# Test login
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"user","password":"password"}'

# Test public policies
curl http://localhost:8080/api/policies/public

# Test AI services
curl http://localhost:8003/health
```

---

## 📝 Mock Data & Development

All frontend services include mock data fallbacks for development:
- Mock policies, claims, users, analytics
- Simulated API responses for offline development
- Error handling with graceful degradation
- Loading states and user feedback

This ensures the application works seamlessly even when backend services are unavailable during development.

---

## ✅ Implementation Status

✅ **COMPLETED**
- Frontend routing with role-based access
- Backend API endpoints with security
- Python AI services with FastAPI
- Authentication & authorization flow
- Policy upload and management
- User policy applications  
- Claims submission and processing
- Dashboard analytics
- Mock data for development

🚧 **IN PROGRESS**  
- WebSocket for real-time updates
- Advanced AI integrations
- File upload optimizations
- Performance monitoring

📋 **PLANNED**
- Mobile responsive components
- Email notifications
- Payment processing
- Advanced reporting
- Multi-language support
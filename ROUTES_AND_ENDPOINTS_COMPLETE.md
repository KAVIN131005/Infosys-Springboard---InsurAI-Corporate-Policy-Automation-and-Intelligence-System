# 🚀 InsurAI - Complete Routes & Endpoints Documentation

## 🌐 **FRONTEND ROUTES** (React Router)

### **📍 Public Routes**
| Route | Component | Description | Access |
|-------|-----------|-------------|--------|
| `/` | HomePage | Landing page with platform introduction | Public |
| `/login` | Login | User authentication page | Public |
| `/register` | Register | User registration page | Public |

### **👤 User Routes (USER Role)**
| Route | Component | Description | Protected |
|-------|-----------|-------------|-----------|
| `/dashboard` | UserDashboard | User dashboard with overview | ✅ |
| `/user/dashboard` | UserDashboard | Alternative user dashboard route | ✅ |
| `/user/compare` | PolicyComparePage | Policy comparison tool | ✅ |
| `/user/claims` | ClaimStatus | User claims status page | ✅ |
| `/user/submit-claim` | SubmitClaim | Claim submission form | ✅ |
| `/user/chatbot` | Chatbot | AI assistant chat interface | ✅ |

### **👨‍💼 Broker Routes (BROKER Role)**
| Route | Component | Description | Protected |
|-------|-----------|-------------|-----------|
| `/broker` | UserDashboard | Broker main dashboard | ✅ |
| `/broker/dashboard` | UserDashboard | Broker dashboard | ✅ |
| `/broker/upload` | BrokerUploadPolicy | Policy upload interface | ✅ |
| `/broker/policies` | BrokerPolicies | Policy management | ✅ |
| `/broker/compare` | PolicyComparePage | Policy comparison | ✅ |
| `/broker/claims` | ClaimStatus | Broker claims management | ✅ |
| `/broker/submit-claim` | SubmitClaim | Claim submission | ✅ |

### **⚙️ Admin Routes (ADMIN Role)**
| Route | Component | Description | Protected |
|-------|-----------|-------------|-----------|
| `/admin` | AdminDashboard | Admin main dashboard | ✅ |
| `/admin/dashboard` | AdminDashboard | Admin analytics dashboard | ✅ |
| `/admin/policies` | BrokerPolicies | Policy administration | ✅ |
| `/admin/upload-policy` | BrokerUploadPolicy | Policy upload admin | ✅ |
| `/admin/compare` | PolicyComparePage | Admin policy comparison | ✅ |
| `/admin/claims` | ClaimStatus | Claims administration | ✅ |
| `/admin/submit-claim` | SubmitClaim | Admin claim submission | ✅ |
| `/analytics` | AnalyticsDashboard | Advanced analytics (Admin/Broker) | ✅ |

### **🔗 Shared Protected Routes**
| Route | Component | Description | Roles |
|-------|-----------|-------------|-------|
| `/policies` | BrokerPolicies | Policy listing | BROKER, ADMIN |
| `/policy/view/:id` | PolicyView | Individual policy view | ALL |
| `/policy/compare` | PolicyComparePage | Policy comparison | ALL |
| `/submit-claim` | SubmitClaim | Claim submission | ALL |
| `/claim/submit` | SubmitClaim | Alternative claim route | ALL |
| `/claim-status` | ClaimStatus | Claim status tracking | ALL |
| `/claim/status` | ClaimStatus | Alternative status route | ALL |
| `/chatbot` | Chatbot | AI assistant | ALL |

---

## 🔧 **BACKEND API ENDPOINTS** (Spring Boot)

### **🔐 Authentication Endpoints**
```
POST   /auth/login              - User login
POST   /auth/register          - User registration  
POST   /auth/refresh           - Refresh JWT token
POST   /auth/logout            - User logout
GET    /auth/me               - Get current user profile
PUT    /auth/profile          - Update user profile
```

### **👤 User Management**
```
GET    /api/users             - Get all users (Admin only)
GET    /api/users/{id}        - Get user by ID
PUT    /api/users/{id}        - Update user
DELETE /api/users/{id}        - Delete user (Admin only)
GET    /api/users/profile     - Get current user profile
PUT    /api/users/profile     - Update current user profile
```

### **📋 Policy Endpoints**
```
GET    /api/policies                    - Get all policies
GET    /api/policies/{id}              - Get policy by ID
POST   /api/policies                   - Create new policy (Admin/Broker)
PUT    /api/policies/{id}              - Update policy (Admin/Broker)
DELETE /api/policies/{id}              - Delete policy (Admin)
GET    /api/policies/available         - Get available policies for users
GET    /api/policies/pending           - Get pending approval policies
PUT    /api/policies/{id}/approve      - Approve policy (Admin)
PUT    /api/policies/{id}/reject       - Reject policy (Admin)
POST   /api/policies/upload           - Upload policy document
GET    /api/policies/types            - Get policy types
```

### **📋 User Policy Applications**
```
GET    /api/user-policies             - Get current user's policies
POST   /api/user-policies             - Apply for policy
GET    /api/user-policies/{id}        - Get user policy by ID
PUT    /api/user-policies/{id}/cancel - Cancel policy application
GET    /api/user-policies/history     - Get user policy history
```

### **🏥 Claims Management**
```
GET    /api/claims                    - Get all claims
GET    /api/claims/{id}              - Get claim by ID
POST   /api/claims                   - Submit new claim
PUT    /api/claims/{id}              - Update claim
DELETE /api/claims/{id}              - Delete claim (Admin)
PUT    /api/claims/{id}/approve      - Approve claim
PUT    /api/claims/{id}/reject       - Reject claim
GET    /api/claims/user              - Get current user's claims
GET    /api/claims/pending           - Get pending claims (Admin/Broker)
POST   /api/claims/upload-documents  - Upload claim documents
GET    /api/claims/{id}/documents    - Get claim documents
```

### **📊 Dashboard Analytics**
```
GET    /api/dashboard/user           - User dashboard data
GET    /api/dashboard/broker         - Broker dashboard data  
GET    /api/dashboard/admin          - Admin dashboard data
GET    /api/dashboard/analytics      - Advanced analytics
GET    /api/dashboard/real-time      - Real-time dashboard updates
```

### **⚙️ Admin Operations**
```
GET    /api/admin/stats              - System statistics
GET    /api/admin/users              - User management
GET    /api/admin/policies           - Policy management
GET    /api/admin/claims            - Claim management
GET    /api/admin/system-health      - System health status
GET    /api/admin/notifications      - System notifications
POST   /api/admin/broadcast          - Broadcast message
```

### **👨‍💼 Broker Operations**  
```
GET    /api/broker/dashboard         - Broker dashboard
GET    /api/broker/policies          - Broker's policies
POST   /api/broker/policies          - Create policy as broker
GET    /api/broker/clients           - Broker's clients
GET    /api/broker/performance       - Broker performance metrics
```

### **📄 File Upload & Management**
```
POST   /api/upload/policy            - Upload policy document
POST   /api/upload/claim-document    - Upload claim document
GET    /api/files/{filename}         - Download/view file
DELETE /api/files/{filename}         - Delete file (Admin)
```

### **🔒 Public Endpoints**
```
GET    /api/public/health            - Health check
GET    /api/public/policies          - Public policy information
GET    /api/public/contact           - Contact information
POST   /api/public/contact           - Submit contact form
```

---

## 🤖 **AI SERVICE ENDPOINTS** (Python FastAPI - Port 8003)

### **💬 Chatbot Services**
```
POST   /chat                         - Send message to AI chatbot
GET    /chat/history                 - Get chat history  
POST   /chat/clear                   - Clear chat history
GET    /health                       - AI service health check
```

### **📄 Document Processing**
```
POST   /ocr/process                  - OCR document processing
POST   /analyze/document             - Analyze uploaded document
POST   /extract/policy-data          - Extract policy information
POST   /validate/document            - Validate document authenticity
```

### **🔍 AI Analysis Services**
```
POST   /analyze/fraud                - Fraud detection analysis
POST   /assess/risk                  - Risk assessment
POST   /recommend/policy             - Policy recommendations
POST   /predict/claim                - Claim prediction analysis
```

---

## 🔄 **WEBSOCKET ENDPOINTS** (Real-time Updates)

### **WebSocket Connection**
```
WS     /ws?token={jwt_token}         - WebSocket connection with JWT auth
```

### **WebSocket Message Types**
```
SUBSCRIBE                           - Subscribe to updates
UNSUBSCRIBE                        - Unsubscribe from updates  
DASHBOARD_UPDATE                   - Real-time dashboard data
POLICY_UPDATE                      - Policy status changes
CLAIM_UPDATE                       - Claim status changes
USER_UPDATE                        - User activity updates
NOTIFICATION                       - System notifications
HEARTBEAT                          - Connection health check
```

---

## 📱 **NAVIGATION FLOW**

### **🔄 User Journey Flow**
```
Landing Page (/) 
    ↓
Login/Register (/login, /register)
    ↓
Role-based Dashboard:
    ├── USER: /dashboard
    ├── BROKER: /broker/dashboard  
    └── ADMIN: /admin/dashboard
    ↓
Feature Access:
    ├── Policies (/policies, /policy/view/:id)
    ├── Claims (/submit-claim, /claim-status)
    ├── AI Chat (/chatbot)
    └── Analytics (/analytics)
```

### **🎯 Feature Navigation**
```
Dashboard → Quick Actions → Specific Features
    ├── Apply Policy → /policy/view/:id → Application Form
    ├── Submit Claim → /submit-claim → Multi-step Form  
    ├── AI Assistant → /chatbot → Chat Interface
    ├── View Claims → /claim-status → Status Tracking
    └── Analytics → /analytics → Advanced Metrics
```

---

## 🔧 **ERROR HANDLING & FALLBACKS**

### **Route Protection**
- **Unauthenticated**: Redirect to `/login`
- **Wrong Role**: Redirect to appropriate dashboard
- **Invalid Route**: Redirect to `/` (home)

### **API Error Handling**
- **401 Unauthorized**: Auto-refresh token or redirect to login
- **403 Forbidden**: Show access denied message
- **404 Not Found**: Show resource not found
- **500 Server Error**: Show generic error message with retry option

### **WebSocket Fallbacks**
- **Connection Failed**: Auto-retry with exponential backoff
- **Message Error**: Log error and continue operation  
- **Disconnection**: Attempt reconnection up to 5 times

---

## 🚀 **SYSTEM STATUS**

### **✅ Currently Operational Services**
- **Spring Boot Backend**: http://localhost:8080 ✅
- **React Frontend**: http://localhost:3000 ✅  
- **Python AI Services**: http://localhost:8003 ✅
- **MySQL Database**: localhost:3307 ✅
- **WebSocket Service**: ws://localhost:8080/ws ✅

### **🔗 Service Integration**
- ✅ **Frontend ↔ Backend**: REST API integration complete
- ✅ **Frontend ↔ AI**: Chatbot integration active
- ✅ **Backend ↔ Database**: MySQL connections established  
- ✅ **Real-time Updates**: WebSocket implementation active
- ✅ **Authentication**: JWT security implemented
- ✅ **File Uploads**: Document management operational

---

**🎉 All Routes and Endpoints are Fully Operational!**

The InsurAI application provides comprehensive navigation with role-based access control, real-time updates, and seamless integration between all services.
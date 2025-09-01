# InsurAI Corporate Policy Automation and Intelligence System

A comprehensive full-stack insurance management system with AI-powered automation for policy management, claims processing, and risk assessment.

## 🏗️ Architecture Overview

### Backend Services
- **Java Spring Boot** (Port 8080) - Main API server with JWT authentication
- **Python FastAPI** (Port 8000) - AI/ML microservices for risk assessment and claims analysis
- **MySQL Database** (Port 3307) - Persistent data storage

### Frontend
- **React 19** with Vite (Port 3000) - Modern user interface with Tailwind CSS v4

### Database Schema
- **User Management**: Users with role-based access (USER, BROKER, ADMIN)
- **Policy Management**: Policies with coverage, premiums, and risk levels
- **User Policies**: Subscription relationship between users and policies
- **Claims Processing**: Claims with AI analysis and fraud detection
- **Payment Tracking**: Payment history and premium management

## 🚀 Features

### Authentication & Authorization
- JWT-based authentication with role-based access control
- Secure login/register with form validation
- Protected routes based on user roles
- Session management with automatic token refresh

### User Dashboard
- **Overview Tab**: Welcome section, stats grid, recent activity
- **My Policies Tab**: User's active/pending policy subscriptions
- **Claims Tab**: Submit and track insurance claims
- **Available Policies Tab**: Browse and apply for new policies
- **Payments Tab**: Payment history and premium management

### Policy Management
- Policy browsing with detailed information cards
- Risk level assessment (LOW/MEDIUM/HIGH)
- Premium calculation (monthly/yearly options)
- Coverage and deductible information
- Eligibility criteria and benefits listing
- Admin approval workflow for high-risk policies

### Claims Processing
- AI-powered claims analysis and fraud detection
- Document upload and OCR processing
- Automated approval for low-risk claims
- Manual review workflow for complex cases
- Timeline tracking and status updates

### AI Integration
- **Risk Assessment**: ML models for policy risk scoring
- **Fraud Detection**: Automated claim fraud analysis
- **Document Processing**: OCR and text extraction
- **Natural Language Processing**: Chatbot and claim analysis
- **Predictive Analytics**: Risk prediction and pricing

### Admin Features
- User management and role assignment
- Policy approval workflow
- Claims review and settlement
- Analytics dashboard with insights
- System configuration and monitoring

### Broker Features
- Policy upload and management
- Client portfolio overview
- Commission tracking
- Performance analytics

## 🛠️ Technology Stack

### Backend
- **Java 17** with Spring Boot 3.x
- **Spring Security** for authentication
- **Spring Data JPA** for database operations
- **JWT** for stateless authentication
- **MySQL** for data persistence
- **Maven** for dependency management

### Frontend
- **React 19** with Hooks and Context API
- **Vite** for fast development and building
- **Tailwind CSS v4** for styling
- **React Router v6** for navigation
- **React Hook Form** for form handling
- **React Hot Toast** for notifications
- **Lucide React** for icons
- **Axios** for API communication

### AI/ML Services
- **Python 3.9+** with FastAPI
- **spaCy** for natural language processing
- **scikit-learn** for machine learning models
- **pytesseract** for OCR processing
- **sentence-transformers** for embeddings
- **pandas** for data manipulation

### Development Tools
- **PostCSS** for CSS processing
- **ESLint** for code linting
- **VS Code** with recommended extensions

## 📦 Installation & Setup

### Prerequisites
- **Node.js 18+** and npm
- **Java 17+** and Maven
- **Python 3.9+** and pip
- **MySQL 8.0+**

### Database Setup
```sql
CREATE DATABASE insur;
CREATE USER 'insuruser'@'localhost' IDENTIFIED BY 'Kavin@2005';
GRANT ALL PRIVILEGES ON insur.* TO 'insuruser'@'localhost';
FLUSH PRIVILEGES;
```

### Backend Setup
```bash
cd insur
mvn clean install
mvn spring-boot:run
```

### Python AI Services Setup
```bash
cd insur/python-services
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### Frontend Setup
```bash
cd insur/frontend
npm install
npm run dev
```

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/refresh` - Token refresh
- `POST /api/auth/logout` - User logout

### User Management
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users/dashboard-stats` - Dashboard statistics

### Policy Management
- `GET /api/policies/available` - Get available policies
- `GET /api/policies/{id}` - Get policy details
- `POST /api/user-policies/apply` - Apply for policy
- `GET /api/user-policies/my-policies` - Get user policies

### Claims Processing
- `POST /api/claims/submit` - Submit claim
- `GET /api/claims/my-claims` - Get user claims
- `PUT /api/claims/{id}/status` - Update claim status
- `POST /api/claims/{id}/documents` - Upload documents

### Admin Operations
- `GET /api/admin/users` - Get all users
- `PUT /api/admin/users/{id}/role` - Update user role
- `GET /api/admin/policies/pending` - Get pending policies
- `PUT /api/admin/policies/{id}/approve` - Approve policy

### AI Services (Python FastAPI)
- `POST /api/ai/risk/assess` - Risk assessment
- `POST /api/ai/claims/analyze` - Claims analysis
- `POST /api/ai/document/extract` - Document OCR
- `POST /api/ai/nlp/analyze` - NLP processing
- `POST /api/ai/chat/respond` - Chatbot responses

## 🎨 UI Components

### Authentication Pages
- **Login Page**: Username/password with validation, demo credentials
- **Register Page**: Multi-step form with personal, contact, and address info
- **Form Validation**: Real-time validation with error messages

### Dashboard Components
- **StatCard**: Statistics display with icons and colors
- **PolicyCard**: Policy information with actions (view, apply, manage)
- **ClaimCard**: Claim details with status and timeline
- **Modal**: Reusable modal for details and forms

### Navigation
- **Navbar**: User profile, notifications, logout
- **Sidebar**: Role-based navigation menu
- **Breadcrumbs**: Page navigation context

### Form Components
- **Input**: Enhanced input with icons and validation
- **Button**: Multiple variants (primary, secondary, outline)
- **Spinner**: Loading indicators
- **Toast**: Success/error notifications

## 🔒 Security Features

### Authentication
- JWT tokens with configurable expiration
- Password hashing with BCrypt
- Role-based access control (RBAC)
- Protected routes and API endpoints

### Data Security
- SQL injection prevention with JPA
- XSS protection with input sanitization
- CORS configuration for API access
- Environment-based configuration

### AI Security
- Input validation for AI endpoints
- Rate limiting for API calls
- Secure file upload handling
- Error handling without data exposure

## 📊 Business Logic

### Policy Application Workflow
1. User browses available policies
2. System performs eligibility check
3. AI risk assessment calculation
4. Auto-approval for low-risk or admin review for high-risk
5. Policy activation and premium scheduling

### Claims Processing Workflow
1. User submits claim with documents
2. AI fraud detection and risk scoring
3. Document OCR and text extraction
4. Auto-approval for low-risk claims
5. Manual review for high-risk or suspected fraud
6. Settlement and payment processing

### Payment Processing
- Monthly/yearly premium calculations
- Auto-renewal with payment reminders
- Overdue payment tracking
- Integration-ready for payment gateways

## 🔧 Configuration

### Environment Variables
```bash
# Database
DB_HOST=localhost
DB_PORT=3307
DB_NAME=insur
DB_USERNAME=insuruser
DB_PASSWORD=Kavin@2005

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRATION=86400000

# AI Services
AI_SERVICE_URL=http://localhost:8000
OPENAI_API_KEY=your-openai-key

# File Upload
UPLOAD_DIR=uploads
MAX_FILE_SIZE=10MB
```

### Development vs Production
- Development: Uses H2 in-memory database option
- Production: MySQL with connection pooling
- Logging: Configurable levels per environment
- CORS: Restricted in production

## 🧪 Testing

### Unit Testing
```bash
# Backend Tests
mvn test

# Frontend Tests
npm test

# Python Tests
pytest
```

### Integration Testing
- API endpoint testing with Postman/Thunder Client
- Database integration tests
- Frontend component testing with React Testing Library

## 🚀 Deployment

### Docker Support
```bash
# Build and run with Docker Compose
docker-compose up -d
```

### Manual Deployment
1. Build frontend: `npm run build`
2. Package backend: `mvn package`
3. Setup database with schema
4. Configure environment variables
5. Deploy services

### Production Checklist
- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] SSL certificates installed
- [ ] Monitoring and logging setup
- [ ] Backup strategy implemented
- [ ] Security scanning completed

## 📈 Performance

### Frontend Optimization
- Code splitting with React Lazy
- Image optimization and lazy loading
- CSS minification with Tailwind purge
- Service worker for caching

### Backend Optimization
- Database indexing on key fields
- Connection pooling for database
- Caching with Redis (configurable)
- API response compression

### AI Services Optimization
- Model caching for faster inference
- Batch processing for multiple requests
- Async processing for long-running tasks
- Resource monitoring and scaling

## 🤝 Contributing

### Development Workflow
1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

### Code Standards
- Follow ESLint rules for JavaScript/React
- Use Java naming conventions for backend
- PEP 8 for Python code
- Consistent commit message format

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Demo Credentials
- **Admin**: username: `admin`, password: `password123`
- **Broker**: username: `broker`, password: `password123`
- **User**: username: `user`, password: `password123`

### Common Issues
1. **Port conflicts**: Check if ports 3000, 8000, 8080, 3307 are available
2. **Database connection**: Verify MySQL is running and credentials are correct
3. **JWT errors**: Ensure JWT_SECRET is set in environment variables
4. **CORS issues**: Check frontend/backend URL configuration

### Contact
- **Project Repository**: GitHub
- **Documentation**: Project Wiki
- **Issues**: GitHub Issues
- **Discussions**: GitHub Discussions

---

**Built with ❤️ for modern insurance automation**

# Policy Upload Visibility Issue - RESOLVED

## Problem Identified
The uploaded policies were not visible in the broker policies list due to several issues:

### 1. **Frontend Issues Fixed:**
- **PolicyUploader Component**: Was calling `uploadPolicy(file)` with only the file parameter, but the backend API required additional parameters (`name`, `description`)
- **BrokerPolicies Component**: Was displaying mock data instead of fetching real data from the backend
- **API Service**: The `uploadPolicy` function signature was incorrect and not matching backend expectations
- **Field Mapping**: Frontend was expecting different field names than what the backend PolicyDto actually returns

### 2. **Backend API Structure:**
- Upload endpoint: `POST /api/policies/upload` requires `file` (required), `name` (optional), `description` (optional)
- Broker policies endpoint: `GET /api/policies/broker` returns list of policies uploaded by the current broker
- The `username` parameter is automatically extracted from JWT authentication token

## Changes Made

### 1. PolicyUploader Component (`frontend/src/components/policy/PolicyUploader.jsx`)
**Added form fields for policy details:**
```jsx
// New state variables
const [policyName, setPolicyName] = useState('');
const [policyDescription, setPolicyDescription] = useState('');

// Updated upload function
const result = await uploadPolicy(file, policyName.trim(), policyDescription.trim());
```

**Features Added:**
- ✅ Policy name input field (required)
- ✅ Policy description textarea (optional)
- ✅ Character count indicators
- ✅ Form validation (policy name is required)
- ✅ Clean form reset after successful upload

### 2. Policy Service (`frontend/src/api/policyService.js`)
**Fixed API call parameters:**
```javascript
export const uploadPolicy = async (file, name, description) => {
  const formData = new FormData();
  formData.append('file', file);
  if (name) formData.append('name', name);
  if (description) formData.append('description', description);
  // username is handled by backend authentication
}
```

### 3. BrokerPolicies Component (`frontend/src/pages/broker/BrokerPolicies.jsx`)
**Replaced mock data with real API calls:**
```javascript
// Direct API calls with proper error handling
const response = await policyClient.get('/api/policies/broker');
brokerPolicies = response.data || [];
```

**Updated field mapping for PolicyDto structure:**
- `policy.name` instead of `policy.policyNumber`
- `policy.uploadedBy` instead of `policy.clientName`
- `policy.monthlyPremium` instead of `policy.premium`
- `policy.createdAt` instead of `policy.endDate`
- `policy.status` values: 'ACTIVE', 'PENDING', etc.

## How to Test Policy Upload

### 1. **Start All Services**
```bash
# Backend (Port 8080)
mvn spring-boot:run

# Frontend (Port 3001)
cd frontend && npm run dev

# Python AI Services (Port 8003)
cd python-services && python working_gemini_service.py
```

### 2. **Test Upload Process**
1. **Login as Broker/Admin**: Navigate to login page and authenticate
2. **Navigate to Upload**: Go to "Broker Dashboard" → "Upload New Policy" 
3. **Upload a Policy**:
   - Drag and drop a file (PDF, DOC, DOCX, JPG, PNG)
   - Fill in the **Policy Name** (required)
   - Optionally add a **Policy Description**
   - Click "Upload Policy"
4. **Verify Upload**: Should see green success message
5. **View Policies**: Navigate to "View Policies" to see the uploaded policy

### 3. **Expected Behavior After Upload**
- ✅ Success message appears: "Policy uploaded successfully!"
- ✅ Form resets automatically
- ✅ Policy appears in broker policies list with:
  - Policy name you entered
  - Your username as "Uploaded by"
  - Status: "PENDING" (until admin approval)
  - Creation date
  - Monthly premium and coverage (if AI extracted them)

### 4. **Troubleshooting**
If policies still don't appear:

1. **Check Browser Console**: Look for any JavaScript errors
2. **Check Network Tab**: Verify API calls are successful
3. **Backend Logs**: Check for upload/retrieval errors
4. **Database**: Verify policies are being saved to database

## API Endpoints Used

### Upload Policy
```http
POST /api/policies/upload
Content-Type: multipart/form-data
Authorization: Bearer {jwt_token}

Body:
- file: [policy document file]
- name: [policy name] (optional)
- description: [policy description] (optional)
```

### Get Broker Policies
```http
GET /api/policies/broker
Authorization: Bearer {jwt_token}
```

## Database Structure
Policies are stored in the `policies` table with fields matching the PolicyDto:
- `id`, `name`, `description`, `type`, `status`
- `monthly_premium`, `yearly_premium`, `coverage`, `deductible`
- `file_name`, `file_path`, `analysis_result`
- `uploaded_by` (User relationship)
- `broker` (User relationship)
- `created_at`, `updated_at`

## Status Summary
- ✅ **FIXED**: Policy upload form now collects required parameters
- ✅ **FIXED**: API service sends correct parameters to backend
- ✅ **FIXED**: BrokerPolicies displays real data from database
- ✅ **FIXED**: Field mapping matches backend PolicyDto structure
- ✅ **FIXED**: Authentication tokens properly included in requests
- ✅ **TESTED**: Full upload flow working end-to-end

The policy upload functionality is now fully operational! Users can upload policies with names and descriptions, and they will immediately appear in the broker policies list.
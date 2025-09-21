# Karigar

**Link :- https://karigar-mu.vercel.app/**
**Karigar** is a full-stack service marketplace platform that connects customers with skilled workers (plumbers, electricians, carpenters, etc.). Customers can easily post service requests, and workers can accept jobs, share their live location, and manage the entire job lifecycle.

---

## 🚀 Features

### 🔹 Customer Side
- **Signup & Login** with:
  - Email/Password  
  - **Google Login (OAuth)**
- Create service requests (category, description, optional audio notes)
- **OTP Validation for Service Requests**  
  - When a customer creates a request, an OTP is generated and sent.  
  - The customer must **provide the OTP back** to confirm the request.  
  - Only after OTP verification, the request is considered valid.  
- Track worker location on a live map
- Cancel requests with multiple reasons
- Rate & review workers after completion

### 🔹 Worker Side
- **Signup & Login** with:
  - Email/Password  
  - **Google Login (OAuth)**
- View & accept service requests in their category
- Share live location (real-time map tracking)
- Update job status (accepted → in-progress → completed)
- Cancel jobs with proper reasons
- Profile management (view & edit details)

### 🔹 Admin Side (future scope)
- Manage customers & workers
- Monitor service requests
- Handle disputes & reports

---

## 🛠️ Tech Stack
- **Frontend**: React.js, Tailwind CSS, Leaflet (for maps)
- **Backend**: Node.js, Express.js
- **Database**: MongoDB (Mongoose)
- **Authentication**: JWT + **Google OAuth**
- **Other Features**:
  - Audio note upload
  - Live location tracking
  - **OTP-based request validation (customer must submit OTP to confirm request)**

---

---
📩 For any queries, suggestions, or feedback, feel free to reach out at **himanshusingh2087@gmail.com**.


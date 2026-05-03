# ✈️ SkyLedger - Online Airticketing System

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Version](https://img.shields.io/badge/version-1.0.0-green.svg)

SkyLedger is a modern, full-stack Online Airticketing System built with the MERN stack. It offers a seamless and premium experience for users to search, book, and manage flights with transparent pricing and a frictionless checkout process.

> **Core Promise**: _“Book flights smarter with transparent pricing and zero friction.”_

## 🌟 Key Features

- **Flight Search & Booking**: Intuitive flight search with dynamic filtering and real-time availability.
- **Seat Selection**: Interactive, visual seat map for selecting available seats.
- **Secure Authentication**: JWT-based authentication and Google OAuth2 integration.
- **Payment Gateway**: Integrated with Razorpay for secure transactions (with Simulator Mode for demonstrations).
- **E-Tickets & Boarding Passes**: Automated PDF generation for e-tickets with scannable QR codes for ticket verification.
- **User Dashboard**: Manage upcoming, completed, and cancelled bookings.
- **Admin Panel**: Comprehensive dashboard with KPI metrics, charts, and CRUD operations for managing flights and bookings.
- **Email Notifications**: Automated booking confirmations and ticket delivery via Nodemailer.

## 🛠️ Tech Stack

### Frontend (Client)

- **Framework**: React 19 + Vite
- **Styling**: Tailwind CSS (with custom Glassmorphic and Premium design system)
- **State Management**: Zustand, React Query (`@tanstack/react-query`)
- **Routing**: React Router DOM
- **Data Visualization**: Recharts
- **Notifications**: React Hot Toast

### Backend (Server)

- **Environment**: Node.js & Express.js
- **Database**: MongoDB & Mongoose
- **Authentication**: Passport.js (Google OAuth2.0), JSON Web Tokens (JWT)
- **Payments**: Razorpay
- **Utilities**: PDFKit (E-Tickets), QRCode (Ticket Verification), Nodemailer (Emails), bcryptjs

## 🎨 Design Philosophy

SkyLedger follows a "Less clutter, more clarity" ethos.

- **Palette**: Deep Sky Blue (`#1E3A8A`), Pure White, Soft Cloud Backgrounds.
- **Typography**: Inter font family for instant rendering and native feel.
- **UX Elements**: Smooth hover effects, subtle gradients, and clear visual hierarchy to ensure a premium yet accessible experience for modern travelers.

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+)
- MongoDB instance (local or Atlas)
- Razorpay Account (for payment keys)
- Google Cloud Console Project (for OAuth Client ID & Secret)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/SkyLedger.git
   cd SkyLedger
   ```

2. **Setup the Backend**

   ```bash
   cd backend
   npm install
   ```

   Create a `.env` file in the `backend` directory based on your configuration requirements (e.g., `MONGO_URI`, `JWT_SECRET`, `RAZORPAY_KEY_ID`, etc.).

3. **Setup the Frontend**
   ```bash
   cd ../frontend/Skyledger
   npm install
   ```
   Create a `.env` file in the `frontend/Skyledger` directory for environment variables (e.g., `VITE_API_BASE_URL`).

### Running the Application

1. **Start the Backend Server**

   ```bash
   cd backend
   npm run dev
   ```

   _The backend will typically run on `http://localhost:5000`._

2. **Start the Frontend Client**
   ```bash
   cd frontend/Skyledger
   npm run dev
   ```
   _The frontend will be available at `http://localhost:5173`._

## 📂 Project Structure

SkyLedger/
├── backend/ # Node.js + Express backend
│ ├── config/ # Database and external service configs
│ ├── controllers/ # Route logic and business logic
│ ├── middleware/ # Auth, error handling, etc.
│ ├── models/ # Mongoose schemas
│ ├── routes/ # API endpoints
│ ├── services/ # Third-party integrations (PDF, QR, Email)
│ ├── utils/ # Helper utilities
│ └── server.js # Entry point
├── frontend/Skyledger/ # React frontend
│ ├── src/
│ │ ├── components/ # Reusable UI components
│ │ ├── pages/ # Page-level components
│ │ ├── store/ # Zustand state management
│ │ ├── utils/ # Helper functions
│ │ └── App.jsx # Root component
│ └── tailwind.config.js # Tailwind CSS configuration
└── brand.md # Brand guidelines and design tokens

## 📜 License

This project is licensed under the MIT License - see the MIT LICENSE file for details.

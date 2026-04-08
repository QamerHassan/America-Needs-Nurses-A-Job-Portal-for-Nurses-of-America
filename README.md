# 🏥 America Needs Nurses (ANN) Platform
### *Beyond a Job Board. A Career Ecosystem.*

![ANN Banner](frontend/public/hero-bg.png)

<p align="center">
  <img src="https://img.shields.io/badge/NEXT.JS-15.0_APP_ROUTER-000000?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js" />
  <img src="https://img.shields.io/badge/NESTJS-BACKEND_CORE-E0234E?style=for-the-badge&logo=nestjs&logoColor=white" alt="NestJS" />
  <img src="https://img.shields.io/badge/PRISMA-POSTGRESQL-2D3748?style=for-the-badge&logo=prisma&logoColor=white" alt="Prisma" />
  <img src="https://img.shields.io/badge/MONGODB-DATABASE-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />
  <img src="https://img.shields.io/badge/TAILWIND_CSS-MODERN_UI-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind" />
</p>

---

## 🌟 Overview
**America Needs Nurses (ANN)** is a premium, AI-driven job portal specifically designed to revolutionize the recruitment landscape for the nursing profession in the United States. We go beyond static listings and basic resume drops. Our platform acts as an intelligent ecosystem that continuously monitors market demands, providing both nurses and employers with unprecedented analytics, personalized matching algorithms, and direct outreach mechanisms.

## 🚀 Key Features
- **⚡ Faster Hiring Times**: Our AI-driven pre-screening drastically reduces time-to-hire from weeks to days.
- **✅ Verified Credentials**: Automated license verification ensures absolute compliance from day one.
- **💼 Exclusive Contracts**: Access to high-paying travel packages and elite core staff openings unavailable elsewhere.
- **🛠️ Dedicated Support**: 24/7 technical and career support from our U.S.-based nursing advocate team.
- **💳 Secure Payments**: Integrated Stripe lifecycle for seamless subscription and payment management.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: [Next.js 15+](https://nextjs.org/) (App Router)
- **Styling**: Tailwind CSS & Shadcn/UI
- **State Management**: React Context API
- **Maps**: Google Maps API & Leaflet
- **Payments**: Stripe React SDK

### Backend
- **Runtime**: Node.js with [NestJS](https://nestjs.com/)
- **Database**: 
  - PostgreSQL (via Prisma ORM)
  - MongoDB (via Mongoose)
- **Authentication**: Google OAuth 2.0 & Session-based Auth
- **Communication**: Nodemailer (Transactional Emails)
- **Payment Processing**: Stripe Webhooks & API

---

## 📦 Project Structure
```bash
ANN-Platform/
├── frontend/           # Next.js client application
├── backend/            # NestJS API services
├── assets/             # Branding and design assets
└── docs/               # Technical documentation
```

---

## 🛠️ Getting Started

### Prerequisites
- Node.js (v18+)
- PostgreSQL & MongoDB
- Stripe API Keys
- Google Cloud Console Project (for Auth & Maps)

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/QamerHassan/America-Needs-Nurses-A-Job-Portal-for-Nurses-of-America.git
   cd ANN-Platform
   ```

2. **Frontend Setup**:
   ```bash
   cd frontend
   npm install
   cp .env.example .env.local
   npm run dev
   ```

3. **Backend Setup**:
   ```bash
   cd ../backend
   npm install
   cp .env.example .env
   npx prisma generate
   npm run start:dev
   ```

---

## 📝 License
This project is licensed under the **UNLICENSED** (Private) license. All rights reserved.

---

<p align="center">
  <b>Built with ❤️ by <a href="https://github.com/QamerHassan">Qamer Hassan</a></b>
</p>

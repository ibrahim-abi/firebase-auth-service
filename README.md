# Gernal Authentication Service

[![Build Status](https://img.shields.io/github/actions/workflow/status/ibrahim-abi/firebase-auth-service/ci.yml?branch=main)](https://github.com/ibrahim-abi/firebase-auth-service/actions)
[![License](https://img.shields.io/github/license/ibrahim-abi/firebase-auth-service)](https://github.com/ibrahim-abi/firebase-auth-service/blob/main/LICENSE)
[![Issues](https://img.shields.io/github/issues/ibrahim-abi/firebase-auth-service)](https://github.com/ibrahim-abi/firebase-auth-service/issues)
[![Pull Requests](https://img.shields.io/github/issues-pr/ibrahim-abi/firebase-auth-service)](https://github.com/ibrahim-abi/firebase-auth-service/pulls)
[![Stars](https://img.shields.io/github/stars/ibrahim-abi/firebase-auth-service?style=social)](https://github.com/ibrahim-abi/firebase-auth-service/stargazers)
[![Forks](https://img.shields.io/github/forks/ibrahim-abi/firebase-auth-service?style=social)](https://github.com/ibrahim-abi/firebase-auth-service/network/members)

A robust, modular authentication and user management backend built with Node.js, Express, and Firebase. Designed for easy integration with any web or mobile client, supporting both user and admin roles with secure, scalable practices.

## Features
- Firebase Authentication integration (Admin SDK for backend, Client SDK for frontend)
- User and admin role management
- Modular controller/service architecture
- JWT-based route protection (via Firebase ID tokens)
- Password reset and email OTP verification
- Firestore seeding utility
- Centralized logging and error handling
- Interactive API documentation with Swagger UI

## Directory Structure
```
app.js                # Main entry point
routes/               # Route files (auth, plan, etc.)
controllers/          # Controllers for each resource
services/             # Business logic and Firebase interaction
middleware/           # Auth and error handling middleware
firebase/             # Firebase config, admin, seeder, Firestore service
utils/                # Logger, validator, email sender, etc.
logs/                 # Log files
config.js             # App configuration
package.json          # Dependencies and scripts
```

## Setup Instructions
1. **Clone the repository:**
   ```sh
   git clone https://github.com/yourusername/gernal-authentication-service.git
   cd gernal-authentication-service
   ```
2. **Install dependencies:**
   ```sh
   npm install
   ```
3. **Configure Firebase:**
   - Place your Firebase Admin SDK JSON in `firebase/home-service-app-firebase.json` (rename as needed).
   - Update `firebase/firebaseAdmin.js` and `firebase/firebase.js` if your config file name or structure differs.
4. **Environment Variables:**
   - Copy `.env.example` to `.env` and fill in required values (Firebase project info, session secret, etc.).
5. **Run the app:**
   ```sh
   npm run dev
   ```
6. **Seed Firestore (optional):**
   - The app seeds initial data on startup using `firebase/Seeder.js`.

## Firebase Connection Explained
- **Admin SDK:** Used on the backend for privileged actions (user management, token verification, etc.). Never expose admin credentials to the client.
- **Client SDK:** Used on the frontend for user login/signup. The backend expects a valid Firebase ID token in the `Authorization` header for protected routes.
- **Security:** All admin endpoints are protected by role checks and token verification middleware.

## API Documentation
- Interactive docs available at: [http://localhost:3000/api-docs](http://localhost:3000/api-docs)
- All endpoints are documented with request/response schemas and can be tested directly from the browser.

## SEO Keywords
Firebase authentication, Node.js auth service, Express user management, admin role, JWT, Firestore, REST API, Swagger docs, secure authentication backend, modular Node.js API

## Contributing
Pull requests and issues are welcome! Please follow the project structure and documentation conventions described in `PROJECT_PROMPT.md`.

## License
MIT 
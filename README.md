# ChatUp

A two-tier chat app: a Spring Boot + MongoDB REST API on the backend, and an Expo / React Native client on the frontend. Users can sign up, add friends by email, message friends one-on-one, and create group chats — all secured with JWT authentication.

## Features
- 🔒 JWT-based authentication (register / login)
- 👥 Friend requests — send, accept, and list friends by email
- ✉️ One-on-one messaging between friends
- 💬 Group chats — create groups, add members, send group messages
- 🔄 Live-updating chat screens via periodic polling

## Tech Stack
**Backend:** Java, Spring Boot, Spring Security, MongoDB, JWT (jjwt)
**Frontend:** React Native, Expo, Expo Router, TypeScript

## Setup

Clone the repository:
```bash
git clone https://github.com/ayberk-kara/ChatUp.git
cd ChatUp
```

### Backend
```bash
cd backend
./gradlew build
./gradlew bootRun
```
Requires a MongoDB instance running on `localhost:27017` (see `backend/src/main/resources/application.properties`).

### Frontend
```bash
cd frontend
npm install
npx expo start
```
By default the app points at `http://localhost:8080` (or `10.0.2.2:8080` on the Android emulator) — see `frontend/config/index.ts`.

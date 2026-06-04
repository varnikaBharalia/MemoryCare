# Alzheimer's AI Companion — Backend API Documentation

> Built with Node.js + Express + MongoDB + Groq AI + Cloudinary + Socket.io

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Environment Variables](#environment-variables)
- [Getting Started](#getting-started)
- [Database Models](#database-models)
- [API Routes](#api-routes)
  - [Auth Routes](#auth-routes)
  - [Patient Routes](#patient-routes)
  - [Caregiver Routes](#caregiver-routes)
  - [AI Routes](#ai-routes)
  - [Upload Routes](#upload-routes)
- [Socket.io Events](#socketio-events)
- [Error Responses](#error-responses)

---

## Tech Stack

| Technology | Purpose |
|-----------|---------|
| Node.js + Express | Backend server |
| MongoDB + Mongoose | Database |
| Groq API (Llama 3) | AI conversations |
| Cloudinary | Photo storage |
| Socket.io | Real-time alerts |
| node-cron | Reminder scheduler |
| JWT + bcryptjs | Caregiver authentication |

---

## Project Structure

```
backend/
├── config/
│   ├── db.js               # MongoDB connection
│   └── cloudinary.js       # Cloudinary connection
├── models/
│   ├── Patient.js          # Patient schema
│   ├── Caregiver.js        # Caregiver schema
│   ├── Reminder.js         # Reminder schema
│   ├── Photo.js            # Photo schema
│   ├── ConversationLog.js  # Conversation log schema
│   └── DistressEvent.js    # Distress event schema
├── routes/
│   ├── auth.js             # Auth routes
│   ├── patient.js          # Patient routes
│   ├── caregiver.js        # Caregiver routes
│   ├── ai.js               # AI chat routes
│   └── upload.js           # Photo upload routes
├── services/
│   ├── aiService.js        # Groq AI integration
│   ├── distressDetector.js # Distress analysis
│   └── reminderCron.js     # Cron job for reminders
├── middleware/
│   └── auth.js             # JWT verification
├── socket/
│   └── socketManager.js    # Socket.io setup
├── .env                    # Environment variables
└── index.js                # Main server entry
```

---

## Environment Variables

Create a `.env` file in the root of the backend folder:

```
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/alzheimer
JWT_SECRET=your_secret_key_here
CLIENT_URL=http://localhost:3000
GROQ_API_KEY=your_groq_api_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

---

## Getting Started

```bash
# Install dependencies
npm install

# Run in development
npm run dev

# Run in production
npm start
```

Server runs on: `http://localhost:5000`

---

## Database Models

### Patient
```json
{
  "_id": "ObjectId",
  "name": "Ramesh",
  "age": 74,
  "cognitiveStage": "mild | moderate | severe",
  "familyMembers": [
    { "name": "Priya", "relation": "daughter", "photoUrl": "" }
  ],
  "preferences": ["tea", "morning walks"],
  "storedFacts": [
    { "fact": "Patient likes tea", "savedAt": "Date" }
  ],
  "dailyRoutine": [
    { "time": "08:00", "activity": "Take medicine", "completed": false }
  ],
  "caregiverId": "ObjectId"
}
```

### Caregiver
```json
{
  "_id": "ObjectId",
  "name": "Dr. Sharma",
  "email": "sharma@gmail.com",
  "passwordHash": "hashed",
  "patientIds": ["ObjectId"]
}
```

### Reminder
```json
{
  "_id": "ObjectId",
  "patientId": "ObjectId",
  "time": "08:00",
  "message": "Time to take your morning medicine, Ramesh",
  "type": "medicine | meal | water | appointment | other",
  "isActive": true,
  "lastTriggered": "Date"
}
```

### Photo
```json
{
  "_id": "ObjectId",
  "patientId": "ObjectId",
  "imageUrl": "https://res.cloudinary.com/...",
  "caption": "This is your daughter Priya",
  "personName": "Priya"
}
```

### ConversationLog
```json
{
  "_id": "ObjectId",
  "patientId": "ObjectId",
  "messages": [
    { "role": "patient | ai", "content": "Hello", "timestamp": "Date" }
  ],
  "startTime": "Date",
  "endTime": "Date",
  "distressScore": 0
}
```

### DistressEvent
```json
{
  "_id": "ObjectId",
  "patientId": "ObjectId",
  "timestamp": "Date",
  "triggerType": "confusion_keyword | short_response | repeated_question | help_button | negative_emotion",
  "messageSnippet": "I don't know where I am",
  "distressScore": 7,
  "acknowledged": false
}
```

---

## API Routes

### Base URL
```
http://localhost:5000
```

### Authentication
Protected routes require a JWT token in the header:
```
Authorization: Bearer <token>
```

---

## Auth Routes

### POST `/api/auth/register`
Register a new caregiver.

**Headers:** None

**Request Body:**
```json
{
  "name": "Dr. Sharma",
  "email": "sharma@gmail.com",
  "password": "test1234"
}
```

**Success Response (201):**
```json
{
  "message": "✅ Caregiver registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "caregiver": {
    "id": "65f8a2b3c1234567890abcde",
    "name": "Dr. Sharma",
    "email": "sharma@gmail.com"
  }
}
```

---

### POST `/api/auth/login`
Login a caregiver and get JWT token.

**Headers:** None

**Request Body:**
```json
{
  "email": "sharma@gmail.com",
  "password": "test1234"
}
```

**Success Response (200):**
```json
{
  "message": "✅ Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "caregiver": {
    "id": "65f8a2b3c1234567890abcde",
    "name": "Dr. Sharma",
    "email": "sharma@gmail.com",
    "patientIds": ["65f8a2b3c1234567890abcdf"]
  }
}
```

---

### GET `/api/auth/curr-caregiver`
Get currently logged in caregiver.

**Headers:** `Authorization: Bearer <token>`

**Success Response (200):**
```json
{
  "caregiver": {
    "_id": "65f8a2b3c1234567890abcde",
    "name": "Dr. Sharma",
    "email": "sharma@gmail.com",
    "patientIds": ["65f8a2b3c1234567890abcdf"]
  }
}
```

---

## Patient Routes

> These routes do NOT require authentication — they are used by the patient interface.

### GET `/api/patient/profile/:id`
Get patient profile by ID.

**Headers:** None

**Success Response (200):**
```json
{
  "patient": {
    "_id": "65f8a2b3c1234567890abcdf",
    "name": "Ramesh",
    "age": 74,
    "cognitiveStage": "moderate",
    "familyMembers": [
      { "name": "Priya", "relation": "daughter" },
      { "name": "Suresh", "relation": "son" }
    ],
    "preferences": ["tea"],
    "storedFacts": [
      { "fact": "Patient likes drinking tea in the morning" }
    ],
    "dailyRoutine": [
      { "_id": "routineItemId", "time": "08:00", "activity": "Take medicine", "completed": false }
    ]
  }
}
```

---

### GET `/api/patient/:id/photos`
Get all family photos for a patient.

**Headers:** None

**Success Response (200):**
```json
{
  "photos": [
    {
      "_id": "65f8a2b3c1234567890abce0",
      "patientId": "65f8a2b3c1234567890abcdf",
      "imageUrl": "https://res.cloudinary.com/dzy8q3bwh/image/upload/...",
      "caption": "This is your daughter Priya, she loves you very much",
      "personName": "Priya"
    }
  ]
}
```

---

### GET `/api/patient/:id/routine`
Get patient's daily routine.

**Headers:** None

**Success Response (200):**
```json
{
  "name": "Ramesh",
  "dailyRoutine": [
    { "_id": "routineItemId", "time": "07:00", "activity": "Wake up", "completed": false },
    { "_id": "routineItemId", "time": "08:00", "activity": "Take morning medicine", "completed": false },
    { "_id": "routineItemId", "time": "09:00", "activity": "Breakfast", "completed": false }
  ]
}
```

---

### GET `/api/patient/:id/reminders`
Get all active reminders for a patient.

**Headers:** None

**Success Response (200):**
```json
{
  "reminders": [
    {
      "_id": "65f8a2b3c1234567890abce1",
      "patientId": "65f8a2b3c1234567890abcdf",
      "time": "08:00",
      "message": "Time to take your morning medicine, Ramesh",
      "type": "medicine",
      "isActive": true
    }
  ]
}
```

---

### PATCH `/api/patient/:id/routine/:routineId`
Mark a routine item as completed.

**Headers:** None

**Success Response (200):**
```json
{
  "message": "✅ Routine item marked complete"
}
```

---

### PATCH `/api/patient/:id/reminder/:reminderId/acknowledge`
Acknowledge a reminder after patient dismisses it.

**Headers:** None

**Success Response (200):**
```json
{
  "message": "✅ Reminder acknowledged"
}
```

---

## Caregiver Routes

> All caregiver routes require authentication.
> **Headers for all:** `Authorization: Bearer <token>`

### POST `/api/caregiver/patient`
Create a new patient profile.

**Request Body:**
```json
{
  "name": "Ramesh",
  "age": 74,
  "cognitiveStage": "moderate",
  "familyMembers": [
    { "name": "Priya", "relation": "daughter" },
    { "name": "Suresh", "relation": "son" }
  ],
  "dailyRoutine": [
    { "time": "07:00", "activity": "Wake up" },
    { "time": "08:00", "activity": "Take morning medicine" }
  ]
}
```

**Success Response (201):**
```json
{
  "message": "✅ Patient created successfully",
  "patient": {
    "_id": "65f8a2b3c1234567890abcdf",
    "name": "Ramesh",
    "age": 74,
    "cognitiveStage": "moderate"
  }
}
```

---

### PUT `/api/caregiver/patient/:id`
Update patient profile.

**Request Body (any fields to update):**
```json
{
  "name": "Ramesh",
  "age": 74,
  "cognitiveStage": "severe",
  "preferences": ["tea", "morning walks"]
}
```

**Success Response (200):**
```json
{
  "message": "✅ Patient updated successfully",
  "patient": { "...updated patient object..." }
}
```

---

### POST `/api/caregiver/reminder`
Add a new reminder for a patient.

**Request Body:**
```json
{
  "patientId": "65f8a2b3c1234567890abcdf",
  "time": "08:00",
  "message": "Time to take your morning medicine, Ramesh",
  "type": "medicine"
}
```

> `type` options: `medicine | meal | water | appointment | other`

**Success Response (201):**
```json
{
  "message": "✅ Reminder added successfully",
  "reminder": {
    "_id": "65f8a2b3c1234567890abce1",
    "patientId": "65f8a2b3c1234567890abcdf",
    "time": "08:00",
    "message": "Time to take your morning medicine, Ramesh",
    "type": "medicine",
    "isActive": true
  }
}
```

---

### PUT `/api/caregiver/reminder/:id`
Update an existing reminder.

**Request Body:**
```json
{
  "time": "09:00",
  "message": "Updated reminder message",
  "type": "medicine",
  "isActive": true
}
```

**Success Response (200):**
```json
{
  "message": "✅ Reminder updated successfully",
  "reminder": { "...updated reminder object..." }
}
```

---

### DELETE `/api/caregiver/reminder/:id`
Delete a reminder.

**Success Response (200):**
```json
{
  "message": "✅ Reminder deleted successfully"
}
```

---

### POST `/api/caregiver/photo`
Save a photo URL and caption (use after uploading via `/api/upload/photo`).

**Request Body:**
```json
{
  "patientId": "65f8a2b3c1234567890abcdf",
  "imageUrl": "https://res.cloudinary.com/...",
  "caption": "This is your daughter Priya, she loves you very much",
  "personName": "Priya"
}
```

**Success Response (201):**
```json
{
  "message": "✅ Photo added successfully",
  "photo": { "...photo object..." }
}
```

---

### DELETE `/api/caregiver/photo/:id`
Delete a photo record from MongoDB.

**Success Response (200):**
```json
{
  "message": "✅ Photo deleted successfully"
}
```

---

### GET `/api/caregiver/logs/:patientId`
Get all conversation logs for a patient.

**Success Response (200):**
```json
{
  "logs": [
    {
      "_id": "65f8a2b3c1234567890abce2",
      "patientId": "65f8a2b3c1234567890abcdf",
      "messages": [
        { "role": "patient", "content": "Good morning", "timestamp": "2026-03-23T..." },
        { "role": "ai", "content": "Good morning Ramesh!", "timestamp": "2026-03-23T..." }
      ],
      "startTime": "2026-03-23T08:00:00Z",
      "endTime": "2026-03-23T08:15:00Z",
      "distressScore": 2
    }
  ]
}
```

---

### GET `/api/caregiver/distress/:patientId`
Get all distress events for a patient.

**Success Response (200):**
```json
{
  "events": [
    {
      "_id": "65f8a2b3c1234567890abce3",
      "patientId": "65f8a2b3c1234567890abcdf",
      "timestamp": "2026-03-23T08:10:00Z",
      "triggerType": "confusion_keyword",
      "messageSnippet": "I don't know where I am",
      "distressScore": 7,
      "acknowledged": false
    }
  ]
}
```

---

### PATCH `/api/caregiver/distress/:id/acknowledge`
Mark a distress event as acknowledged.

**Success Response (200):**
```json
{
  "message": "✅ Distress event acknowledged",
  "event": { "...updated event with acknowledged: true..." }
}
```

---

### POST `/api/caregiver/message`
Send a real-time message to the patient via Socket.io.

**Request Body:**
```json
{
  "patientId": "65f8a2b3c1234567890abcdf",
  "message": "Hello Ramesh, how are you feeling today?"
}
```

**Success Response (200):**
```json
{
  "message": "✅ Message sent to patient"
}
```

> This emits a `caregiver_message` Socket.io event to the patient's browser instantly.

---

### PUT `/api/caregiver/patient/:id/routine`
Update the full daily routine for a patient.

**Request Body:**
```json
{
  "dailyRoutine": [
    { "time": "07:00", "activity": "Wake up" },
    { "time": "08:00", "activity": "Take morning medicine" },
    { "time": "09:00", "activity": "Breakfast" },
    { "time": "13:00", "activity": "Lunch" },
    { "time": "20:00", "activity": "Take evening medicine" },
    { "time": "21:00", "activity": "Dinner" }
  ]
}
```

**Success Response (200):**
```json
{
  "message": "✅ Routine updated successfully",
  "dailyRoutine": [ "...updated routine array..." ]
}
```

---

## AI Routes

> These routes do NOT require authentication — used by the patient interface.

### POST `/api/ai/chat`
Send a message to the AI and get a response.

**Headers:** None

**Request Body:**
```json
{
  "patientId": "65f8a2b3c1234567890abcdf",
  "message": "Good morning, who are you?",
  "sessionMessages": []
}
```

> `sessionMessages` — pass the full conversation history from previous messages in this session. Start with `[]` for a new session. The frontend should store and pass this array with every request.

**Success Response (200):**
```json
{
  "reply": "Good morning Ramesh. I am your helper. How are you feeling today?",
  "updatedMessages": [
    { "role": "patient", "content": "Good morning, who are you?", "timestamp": "..." },
    { "role": "ai", "content": "Good morning Ramesh. I am your helper.", "timestamp": "..." }
  ],
  "distressResult": {
    "score": 0,
    "triggerType": null,
    "isDistressed": false
  }
}
```

> Always pass `updatedMessages` back as `sessionMessages` in the next request to maintain conversation history.

**Distress detected example:**
```json
{
  "reply": "You are safe Ramesh. I am here with you. There is nothing to worry about.",
  "updatedMessages": [ "..." ],
  "distressResult": {
    "score": 6,
    "triggerType": "confusion_keyword",
    "isDistressed": true
  }
}
```

> When `isDistressed: true` — a distress event is saved to MongoDB and a Socket.io alert is sent to the caregiver dashboard automatically.

---

### POST `/api/ai/end-session`
End a conversation session — saves log to DB and extracts facts for AI memory.

**Headers:** None

**Request Body:**
```json
{
  "patientId": "65f8a2b3c1234567890abcdf",
  "sessionMessages": [
    { "role": "patient", "content": "I like drinking tea in the morning" },
    { "role": "ai", "content": "That sounds lovely Ramesh." }
  ]
}
```

**Success Response (200):**
```json
{
  "message": "✅ Session saved successfully",
  "facts": [
    "Patient likes drinking tea in the morning"
  ]
}
```

> Call this when the patient closes the chat or navigates away. Facts extracted here are stored in the patient profile and used by the AI in the next session.

---

## Upload Routes

### POST `/api/upload/photo`
Upload a photo to Cloudinary and save to MongoDB.

**Headers:** `Authorization: Bearer <token>`

**Body:** `form-data` (NOT JSON)

| Key | Type | Value |
|-----|------|-------|
| `photo` | File | Select image file (jpg/png/webp, max 5MB) |
| `patientId` | Text | Patient's MongoDB ID |
| `caption` | Text | e.g. "This is your daughter Priya" |
| `personName` | Text | e.g. "Priya" |

**Success Response (201):**
```json
{
  "message": "✅ Photo uploaded successfully",
  "photo": {
    "_id": "65f8a2b3c1234567890abce0",
    "patientId": "65f8a2b3c1234567890abcdf",
    "imageUrl": "https://res.cloudinary.com/dzy8q3bwh/image/upload/v123/alzheimer/...",
    "caption": "This is your daughter Priya, she loves you very much",
    "personName": "Priya"
  }
}
```

---

### DELETE `/api/upload/photo/:id`
Delete a photo from both Cloudinary and MongoDB.

**Headers:** `Authorization: Bearer <token>`

**Success Response (200):**
```json
{
  "message": "✅ Photo deleted successfully"
}
```

---

## Socket.io Events

The frontend needs to connect to Socket.io and join the appropriate room.

### Connect
```js
import { io } from "socket.io-client";
const socket = io("http://localhost:5000");
```

### Join Patient Room
```js
// Call this when patient page loads
socket.emit("join_patient_room", patientId);
```

### Join Caregiver Room
```js
// Call this when caregiver logs in
socket.emit("join_caregiver_room", caregiverId);
```

---

### Events the Patient Page Listens To

#### `reminder`
Fired when a scheduled reminder is due.
```js
socket.on("reminder", (data) => {
  // data = { message: "Time to take your medicine", type: "medicine" }
  // Show fullscreen popup and speak aloud
});
```

#### `caregiver_message`
Fired when caregiver sends a message to patient.
```js
socket.on("caregiver_message", (data) => {
  // data = { message: "Hello Ramesh", from: "Caregiver", timestamp: "..." }
  // Show message on patient screen
});
```

---

### Events the Caregiver Dashboard Listens To

#### `distress_alert`
Fired when patient shows signs of distress.
```js
socket.on("distress_alert", (data) => {
  /*
  data = {
    patientId: "...",
    patientName: "Ramesh",
    distressScore: 7,
    triggerType: "confusion_keyword",
    messageSnippet: "I don't know where I am",
    timestamp: "..."
  }
  */
  // Show alert notification on caregiver dashboard
});
```

---

## Error Responses

All error responses follow this format:

```json
{
  "message": "❌ Error description here"
}
```

| Status Code | Meaning |
|------------|---------|
| 400 | Bad request — missing or invalid fields |
| 401 | Unauthorized — missing or invalid token |
| 404 | Not found — resource doesn't exist |
| 500 | Server error — something went wrong on backend |

---

## Important Notes for Frontend

1. **Patient ID** — Get this from caregiver login response (`patientIds` array) or from creating a patient.
2. **Token Storage** — Store JWT token in `localStorage` or a cookie after login. Send it with every caregiver request.
3. **Session Messages** — For AI chat, always store `updatedMessages` from each response and send it back as `sessionMessages` in the next request.
4. **End Session** — Always call `POST /api/ai/end-session` when the patient closes the chat to save the conversation and extract memory facts.
5. **Socket.io** — Connect to Socket.io on page load for both patient and caregiver pages to receive real-time events.
6. **Photo Upload** — Use `multipart/form-data` not JSON for photo uploads.
7. **Cognitive Stage** — Values are exactly: `mild`, `moderate`, `severe` (lowercase).
8. **Reminder Time Format** — Always `HH:MM` in 24hr format e.g. `"08:00"`, `"13:30"`.
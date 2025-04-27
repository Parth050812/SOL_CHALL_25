
# Quizroom

Quizroom is a web application designed to create and take quizzes with features like classrooms, quizzes, quiz tests, and more. It consists of both a frontend built with React and a backend for serving API requests.

## Features:
- Create and manage quizzes
- Join classrooms and participate in quizzes
- Dashboard for quiz tracking
- Chatbot integration
- Real-time student lists and quiz solutions
## Youtube Video made for Solution Challenge 2025
Here I Explained the Project idea and Gave a demonstration of the Project 
[![Watch the video](https://github.com/user-attachments/assets/8e7e96e9-fb2b-4a39-9287-815abf78b861)](https://youtu.be/vCnu0zpsiTA)

## Prerequisites
Before running the project, make sure you have the following installed:

- **Node.js** (version 14 or above)
- **npm** (comes bundled with Node.js)
- **Vite** (for frontend development)

## Setup Instructions

### 1. Clone the repository

First, clone the repository to your local machine:

```bash
git clone https://github.com/Parth050812/SOL_CHALL_25.git
```

## 2. Install Dependencies

### Frontend Setup
Navigate to the `frontend` directory and install the required dependencies using npm:

```bash
cd frontend
npm install
```

### Backend Setup
Navigate to the `backend` directory and install the required dependencies using npm:

```bash
cd backend
npm install
```
## 3. Running the Application
### Start the Backend Server
To run the backend server:
```bash
cd backend
node server.js
```
The server should now be running on http://localhost:5000 (or a different port if specified).

### Start the Frontend App
To run the frontend React app:
```bash
cd frontend
npm run dev
```
This will start the development server for the frontend, typically running at http://localhost:5173 for vite

## File structure
```bash
.
├── backend
│   ├── package.json
│   ├── package-lock.json
│   └── server.js
├── frontend
│   ├── eslint.config.js
│   ├── index.html
│   ├── package.json
│   ├── package-lock.json
│   ├── public
│   │   └── bulb.ico
│   ├── README.md
│   ├── src
│   │   ├── App.css
│   │   ├── App.jsx
│   │   ├── assets
│   │   │   └── react.svg
│   │   ├── components
│   │   │   ├── bu
│   │   │   ├── Chatbot.jsx
│   │   │   └── ui
│   │   │       ├── button.jsx
│   │   │       ├── card.jsx
│   │   │       └── Input.jsx
│   │   ├── index.css
│   │   ├── main.jsx
│   │   ├── pages
│   │   │   ├── ClassroomPage.jsx
│   │   │   ├── ClassroomQuizzes.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── EditQuiz.jsx
│   │   │   ├── Home.jsx
│   │   │   ├── JoinedClassroomPage.jsx
│   │   │   ├── Log.jsx
│   │   │   ├── PerformanceCard.jsx
│   │   │   ├── quizM.jsx
│   │   │   ├── QuizSolution.jsx
│   │   │   ├── QuizTest.jsx
│   │   │   ├── Sign.jsx
│   │   │   ├── StudentList.jsx
│   │   │   └── UploadQuiz.jsx
│   │   └── supabase.jsx
│   └── vite.config.js
└── README.md

9 directories, 36 files
```


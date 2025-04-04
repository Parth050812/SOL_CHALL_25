import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useState } from 'react'
import Dashboard from "./pages/Dashboard";
import Log from "./pages/Log"
import Sign from "./pages/Sign";
import './App.css'

import EditQuiz from "@/pages/EditQuiz";
import QuizTest from './pages/QuizTest';
import QuizSolution from "./pages/QuizSolution";
import ClassroomPage from "./pages/ClassroomPage";
import JoinedClassroomPage from "./pages/JoinedClassroomPage";
import Home from "./pages/Home"

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
    <Router>
      <Routes>
        <Route path="/" element={<Home/>}></Route>
        <Route path="/signup" element={<Sign/>}></Route>
        <Route path="/login" element={<Log/>}></Route>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/edit-quiz/:quizId" element={<EditQuiz />} />
        <Route path="/quizTest/:quizId" element={<QuizTest />} />
        <Route path="/quiz-solution/:quizId" element={<QuizSolution />} />
        <Route path="/classroom/:classroomId" element={<ClassroomPage />} />
        <Route path="/joinedClassrooms/:classroomId" element={<JoinedClassroomPage />} />
      </Routes>
    </Router>
    </>
  )
}

export default App

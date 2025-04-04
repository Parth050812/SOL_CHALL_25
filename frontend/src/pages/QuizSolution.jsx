import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Chatbot from "../components/Chatbot"; // Chatbot component

const QuizSolution = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { quizData, userAnswers, score, quizId, classroomId,role } = location.state || {};

  if (!quizData || !userAnswers) {
    return <div className="text-center text-lg font-semibold">Loading solutions...</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Quiz Solutions</h1>
      <h2 className="text-lg mb-4">Your Score: {score} / {quizData.questions.length}</h2>

      {quizData.questions.map((question, index) => {
        const isCorrect = userAnswers[index] === question.correctAnswer.trim();

        return (
          <div key={index} className={`p-4 mt-4 rounded-lg shadow-md ${isCorrect ? "bg-green-200" : "bg-red-200"}`}>
            <h3 className="font-semibold">{index + 1}. {question.question}</h3>

            {question.options.map((option, i) => (
              <p key={i} className={`mt-1 ${option.split(")")[0].trim() === question.correctAnswer.trim() ? "text-green-600 font-bold" : ""}`}>
                {option}
              </p>
            ))}

            <p className="mt-2">
              <strong>Your Answer:</strong> {userAnswers[index] || "Not Answered"}
            </p>
            <p><strong>Correct Answer:</strong> {question.correctAnswer}</p>

            {!isCorrect && (
              <Chatbot 
                question={question.question} 
                options={question.options} 
                correctAnswer={question.correctAnswer} 
                topic={quizData.title} 
              />
            )}
          </div>
        );
      })}

      {/* Action Buttons */}
      <div className="mt-6 flex gap-4">
        <button
          onClick={() => navigate(`/quizTest/${quizId}`,{state: { classroomId: classroomId }}, { replace: true })}
          className="px-5 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition duration-300"
        >
          Reattempt Quiz
        </button>

        <button
          onClick={() => {
            if (role === "teacher") {
              navigate(`/classroom/${classroomId}`, { replace: true });
            } else {
              navigate(`/joinedClassrooms/${classroomId}`, { replace: true });
            }
          }}
          className="px-5 py-2 bg-gray-600 text-white font-semibold rounded-lg shadow-md hover:bg-gray-700 transition duration-300"
        >
          Back to Classroom
        </button>
      </div>
    </div>
  );
};

export default QuizSolution;

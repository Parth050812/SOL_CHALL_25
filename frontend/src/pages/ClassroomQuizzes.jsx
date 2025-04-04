import React, { useEffect, useState } from "react";
import { supabase } from "../supabase.jsx";
import { useNavigate } from "react-router-dom";

const ClassroomQuizzes = ({ classroomId, userId, refresh }) => {
  const [quizzes, setQuizzes] = useState([]);
  const navigate = useNavigate(); 

  useEffect(() => {
    const fetchUploadedQuizzes = async () => {
      const { data, error } = await supabase
        .from("classroom_quizzes")
        .select("quiz_id, quizzes!inner(title)")
        .eq("classroom_id", classroomId);

      if (error) {
        console.error("Error fetching uploaded quizzes:", error);
      } else {
        setQuizzes(data);
      }
    };

    fetchUploadedQuizzes();
  }, [classroomId, refresh]);

  const handleEditQuiz = (quizId) => {
    navigate(`/edit-quiz/${quizId}`);
  };

  const handleStartQuiz = (quizId) => {
    navigate(`/quizTest/${quizId}`,{ state: { classroomId: classroomId } });
  };

  return (
    <div className="mt-4 p-4 bg-white rounded-lg shadow-md">
      <h2 className="text-lg font-bold mb-2">Quizzes</h2>
      {quizzes.length > 0 ? (
        <ul className="space-y-2">
          {quizzes.map((quiz) => (
            <li
              key={quiz.quiz_id}
              className="flex justify-between items-center p-3 border rounded-lg bg-gray-100 hover:bg-gray-200 transition"
            >
              <span className="text-gray-800">{quiz.quizzes?.title || "Untitled Quiz"}</span>
              <div className="flex gap-2">
                <button
                  className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-all"
                  onClick={() => handleStartQuiz(quiz.quiz_id)}
                >
                  Start Quiz
                </button>
                <button
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-all"
                  onClick={() => handleEditQuiz(quiz.quiz_id)}
                >
                  Edit Quiz
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500">No quizzes available.</p>
      )}
    </div>
  );
};

export default ClassroomQuizzes;

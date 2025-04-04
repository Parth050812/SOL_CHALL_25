import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../supabase"; 
import Card, { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Button from "@/components/ui/button";

const JoinedClassroomPage = () => {
  const { classroomId } = useParams();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [classroomName, setClassroomName] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
      }
    };
    getUser();
  }, []);

  useEffect(() => {
    if (!userId) return;

    const fetchQuizzes = async () => {
      setLoading(true);
    
      const { data: classroomQuizzes, error: quizError } = await supabase
        .from("classroom_quizzes")
        .select("quiz_id")
        .eq("classroom_id", classroomId);
    
      if (quizError) {
        console.error("Error fetching classroom quizzes:", quizError);
        setLoading(false);
        return;
      }
    
      if (classroomQuizzes.length === 0) {
        setQuizzes([]);
        setLoading(false);
        return;
      }
    
      const quizIds = classroomQuizzes.map(q => q.quiz_id);
    
      const { data: quizData, error: quizDetailsError } = await supabase
        .from("quizzes")
        .select("id, title, questions")
        .in("id", quizIds);
    
      if (quizDetailsError) {
        console.error("Error fetching quizzes:", quizDetailsError);
        setLoading(false);
        return;
      }
    
      const { data: quizAttempts, error: attemptError } = await supabase
        .from("student_quiz_attempts")
        .select("quiz_id, classroom_id, first_attempt_score, last_attempt_score")
        .eq("student_id", userId)
        .eq("classroom_id", classroomId) 
        .in("quiz_id", quizIds);
    
      if (attemptError) {
        console.error("Error fetching quiz attempts:", attemptError);
        setLoading(false);
        return;
      }
    
      const quizzesWithScores = quizData.map(quiz => {
        const attempt = quizAttempts.find(
          attempt => attempt.quiz_id === quiz.id && attempt.classroom_id === classroomId
        );
        const totalQuestions = quiz.questions ? quiz.questions.length : 0;
    
        return {
          ...quiz,
          firstAttemptScore: attempt ? attempt.first_attempt_score : null,
          lastAttemptScore: attempt ? attempt.last_attempt_score : null,
          totalQuestions
        };
      });
    
      setQuizzes(quizzesWithScores);
      setLoading(false);
    };

    fetchQuizzes();
  }, [classroomId, userId]);

  useEffect(() => {
    const fetchClassroomName = async () => {
      const { data, error } = await supabase
        .from("classrooms")
        .select("name")
        .eq("id", classroomId)
        .single();

      if (error) {
        console.error("Error fetching classroom name:", error);
      } else {
        setClassroomName(data.name);
      }
    };

    fetchClassroomName();
  }, [classroomId]);

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 flex flex-col items-center p-6">
      {/* Classroom Name Header */}
      <h1 className="text-3xl font-extrabold text-blue-600 mb-6">
        {classroomName || "Loading..."}
      </h1>

      {/* Page Content */}
      <div className="w-full max-w-4xl bg-white p-6 rounded-lg shadow-md border border-gray-300">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Available Quizzes</h2>
        <p className="text-gray-600 mb-6">
          Once you attempt the quiz, your first attempt will be recorded permanently.
        </p>

        {loading ? (
          <p className="text-center text-gray-600">Loading quizzes...</p>
        ) : quizzes.length > 0 ? (
          quizzes.map(quiz => (
            <Card key={quiz.id} className="mb-4 p-4 shadow-sm rounded-lg border border-gray-200 flex justify-between items-center">
              <div>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">{quiz.title}</CardTitle>
                </CardHeader>
                <CardContent>
                <Button 
                  onClick={() => navigate(`/quizTest/${quiz.id}`, { state: { classroomId } })} 
                  className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-md"
                >
                  Start Quiz
                </Button>
                </CardContent>
              </div>

              {/* Score & Rank Section */}
              <div className="text-right">
                {quiz.firstAttemptScore !== null ? (
                  <div className="text-lg">
                    <p className="font-semibold text-gray-700">
                      First Attempt: <span className="text-blue-500">{quiz.firstAttemptScore}/{quiz.totalQuestions}</span>
                    </p>
                    <p className="font-semibold text-gray-700">
                      Last Attempt: <span className="text-green-500">{quiz.lastAttemptScore}/{quiz.totalQuestions}</span>
                    </p>
                  </div>
                ) : (
                  <p className="text-gray-500">Not attempted</p>
                )}
              </div>
            </Card>
          ))
        ) : (
          <p className="text-center text-gray-600">No quizzes available in this classroom.</p>
        )}

        {/* Back to Dashboard Button */}
        <div className="flex justify-center mt-6">
          <button
            onClick={() => navigate("/dashboard")}
            className="px-5 py-2.5 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-500 transition"
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default JoinedClassroomPage;

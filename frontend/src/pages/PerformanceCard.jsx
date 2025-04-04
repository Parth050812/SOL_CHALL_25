import React, { useEffect, useState } from "react";
import { supabase } from "../supabase.jsx";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from "chart.js";
import Card, { CardContent, CardHeader, CardTitle } from "@/components/ui/card";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const PerformanceCard = ({ studentId }) => {
  const [correct, setCorrect] = useState(0);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const fetchPerformance = async () => {
      if (!studentId) return;
      const { data: quizAttempts, error: attemptError } = await supabase
        .from("student_quiz_attempts")
        .select("quiz_id, first_attempt_score")
        .eq("student_id", studentId);
    
      if (attemptError) {
        console.error("Error fetching quiz attempts:", attemptError);
        return;
      }
    
      
    
      if (!quizAttempts || quizAttempts.length === 0) {
        console.log("No quiz attempts found for this student.");
        setCorrect(0);
        setTotal(0);
        return;
      }
    
      
      const quizIds = [...new Set(quizAttempts.map((attempt) => attempt.quiz_id))];

      
      const { data: quizzes, error: quizError } = await supabase
        .from("quizzes")
        .select("id, questions")
        .in("id", quizIds);
    
      if (quizError) {
        console.error("Error fetching quizzes:", quizError);
        return;
      }
    
      const quizQuestionCounts = quizzes.reduce((acc, quiz) => {
        if (Array.isArray(quiz.questions)) {
          acc[quiz.id] = quiz.questions.length;
        } else {
          console.error(`Unexpected questions format for quiz ${quiz.id}:`, quiz.questions);
          acc[quiz.id] = 0; 
        }
        return acc;
      }, {});

      let totalCorrect = 0;
      let totalQuestions = 0;

      
      quizAttempts.forEach((attempt) => {
        totalCorrect += attempt.first_attempt_score || 0; 
        totalQuestions += quizQuestionCounts[attempt.quiz_id] || 0;
      });

      
      setCorrect(totalCorrect);
      setTotal(totalQuestions);
    };

    fetchPerformance();
  }, [studentId]);

  
  const incorrect = total > 0 ? total - correct : 0;

  
  const accuracy = total > 0 ? (correct / total) * 100 : 0;

  let progressMessage;
  if (accuracy >= 75) {
    progressMessage = "Great job! Keep it up! 🎉";
  } else if (accuracy >= 50) {
    progressMessage = "Good progress, but you can improve! 💪";
  } else {
    progressMessage = "Keep practicing! You got this! 🚀";
  }
  
  
  const data = {
    labels: ["Correct Answers", "Incorrect Answers"],
    datasets: [
      {
        label: "Performance",
        data: [correct, incorrect],
        backgroundColor: ["#4CAF50", "#FF4D4D"], 
        borderRadius: 5,
      },
    ],
  };

  return (
    <Card className="mb-3">
      <CardHeader>
        <CardTitle>Performance</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center">
          <p className="text-gray-700 text-lg mb-2">Track your progress over time.</p>
          
          {total > 0 ? (
            <div className="w-full max-w-sm">
              <Bar data={data} options={{ responsive: true, maintainAspectRatio: false }} />
            </div>
          ) : (
            <p className="text-gray-500">No quizzes attempted yet.</p>
          )}
          
          <p className="mt-4 font-semibold text-lg text-blue-500">{progressMessage}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default PerformanceCard;

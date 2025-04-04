import React, { useEffect, useState } from "react";
import { supabase } from "../supabase.jsx";

const StudentList = ({ classroomId, setProgressData }) => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudentsWithScores = async () => {
      if (!classroomId) return;

      setLoading(true);

   
      const { data: studentData, error: studentError } = await supabase
        .from("classroom_students")
        .select("id, student_id, student_username")
        .eq("classroom_id", classroomId);

      if (studentError) {
        console.error("Error fetching students:", studentError);
        setLoading(false);
        return;
      }

      if (studentData.length === 0) {
        setStudents([]);
        setProgressData(null); 
        setLoading(false);
        return;
      }

     
      const studentIds = studentData.map((s) => s.student_id);

      const { data: quizAttempts, error: attemptError } = await supabase
        .from("student_quiz_attempts")
        .select("student_id, quiz_id, first_attempt_score, last_attempt_score")
        .in("student_id", studentIds)
        .eq("classroom_id", classroomId);

      if (attemptError) {
        console.error("Error fetching quiz attempts:", attemptError);
        setLoading(false);
        return;
      }

    
      const quizIds = [...new Set(quizAttempts.map((attempt) => attempt.quiz_id))];

      const { data: quizzes, error: quizError } = await supabase
        .from("quizzes")
        .select("id, questions")
        .in("id", quizIds);

      if (quizError) {
        console.error("Error fetching quizzes:", quizError);
        setLoading(false);
        return;
      }

      const quizQuestionCounts = quizzes.reduce((acc, quiz) => {
        acc[quiz.id] = quiz.questions.length;
        return acc;
      }, {});

      const studentScores = studentData.map((student) => {
        const attempts = quizAttempts.filter((attempt) => attempt.student_id === student.student_id);
        const totalMarksFirst = attempts.reduce((sum, attempt) => sum + (attempt.first_attempt_score || 0), 0);
        const totalMarksLast = attempts.reduce((sum, attempt) => sum + (attempt.last_attempt_score || 0), 0);
        const totalQuestions = attempts.reduce((sum, attempt) => sum + (quizQuestionCounts[attempt.quiz_id] || 0), 0);

        const firstAttemptPercentage = totalQuestions > 0 ? (totalMarksFirst / totalQuestions) * 100 : 0;
        const lastAttemptPercentage = totalQuestions > 0 ? (totalMarksLast / totalQuestions) * 100 : 0;

        return {
          ...student,
          totalMarksFirst,
          totalMarksLast,
          totalQuestions,
          firstAttemptPercentage,
          lastAttemptPercentage,
        };
      });

      studentScores.sort((a, b) => {
        if (b.totalQuestions !== a.totalQuestions) {
          return b.totalQuestions - a.totalQuestions; 
        }
        return b.totalMarksFirst - a.totalMarksFirst; 
      });

      setStudents(studentScores);

      setProgressData(studentScores);

      setLoading(false);
    };

    fetchStudentsWithScores();
  }, [classroomId, setProgressData]);

  return (
    <div>
      {loading ? (
        <p>Loading...</p>
      ) : students.length > 0 ? (
        <ul className="border p-2 rounded">
          {students.map((student, index) => (
            <li key={student.id} className="p-2 border-b flex justify-between">
              <span>#{index + 1} {student.student_username}</span>
              <span className="font-semibold">
                {student.totalMarksFirst}/{student.totalQuestions} ({student.firstAttemptPercentage.toFixed(1)}%)
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p>No students have joined yet.</p>
      )}
    </div>
  );
};

export default StudentList;

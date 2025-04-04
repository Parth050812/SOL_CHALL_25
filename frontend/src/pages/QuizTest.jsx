import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../supabase";
import { useLocation } from "react-router-dom";

const QuizTest = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [quizData, setQuizData] = useState(null);
  const [userAnswers, setUserAnswers] = useState({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [timeLeft, setTimeLeft] = useState(600); 
  const [finished, setFinished] = useState(false);
  const [score, setScore] = useState(0);
  const [classroom_Id, setClassroomId] = useState(null); 
  const location = useLocation();
  const { classroomId } = location.state || {};
  
  useEffect(() => {
    const fetchQuiz = async () => {
      const { data, error } = await supabase
        .from("quizzes")
        .select(`
          title, 
          questions, 
          classroom_quizzes (classroom_id)  -- Join with classroom_quizzes
        `)
        .eq("id", quizId)
        .single();
  
      if (error) {
        console.error("❌ Error fetching quiz:", error.message);
        return;
      }
      if (!data || !data.questions || !Array.isArray(data.questions)) {
        console.error("❌ Invalid quiz data:", data);
        return;
      }
  
      setQuizData(data);
      setClassroomId(data.classroom_quizzes?.[0]?.classroom_id || null);
    };
    fetchQuiz();
  }, [quizId]);

  

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  
  const handleAnswerChange = (index, answer) => {
    setUserAnswers((prev) => ({ ...prev, [index]: answer.split(")")[0].trim() }));
  };

  const handleSubmit = async () => {
    setFinished(true);

    if (document.fullscreenElement) {
        document.exitFullscreen();
    }

    let newScore = 0;
    quizData.questions.forEach((q, i) => {
        if (userAnswers[i] === q.correctAnswer.trim()) {
            newScore++;
        }
    });

    setScore(newScore);  

   
    const { data: user, error: userError } = await supabase.auth.getUser();
    if (userError) {
        console.error("Error fetching user:", userError.message);
        return;
    }
    const student_id = user.user.id;
    const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", student_id)
    .single();

    if (profileError) {
        console.error("Error fetching user profile:", profileError.message);
        return;
    }

    const isTeacher = profile?.role === "teacher"; 
    const classroom_id = classroomId;  
    if (!classroom_id) {
        console.error("Error: classroom_id is missing!");
        return;
    }

   
    if (!isTeacher) {
      const { data: existingAttempt, error: attemptError } = await supabase
        .from("student_quiz_attempts")
        .select("first_attempt_score, last_attempt_score")
        .eq("student_id", student_id)
        .eq("quiz_id", quizId)
        .eq("classroom_id", classroom_id)
        .single();
    
      if (attemptError && attemptError.code !== "PGRST116") {
        console.error("Error checking previous attempt:", attemptError.message);
        return;
      }
    
      if (existingAttempt) {
        const { error: updateError } = await supabase
          .from("student_quiz_attempts")
          .update({ last_attempt_score: newScore })
          .eq("student_id", student_id)
          .eq("quiz_id", quizId)
          .eq("classroom_id", classroom_id);
    
        if (updateError) {
          console.error("Error updating attempt:", updateError.message);
        }
      } else {
        const { error: insertError } = await supabase
          .from("student_quiz_attempts")
          .insert([
            {
              student_id,
              classroom_id,
              quiz_id: quizId,
              first_attempt_score: newScore,
              last_attempt_score: newScore,
            },
          ]);
    
        if (insertError) {
          console.error("Error inserting attempt:", insertError.message);
        }
      }
    }

    
    navigate(`/quiz-solution/${quizId}`, { 
      state: { 
        quizData, 
        userAnswers, 
        score: newScore, 
        quizId, 
        classroomId ,
        role: profile?.role 
      }, 
      replace: true 
    });    
  };

  useEffect(() => {
    const enterFullScreen = async () => {
      try {
        await document.documentElement.requestFullscreen();
      } catch (err) {
        console.warn("Fullscreen request failed:", err);
      }
    };
    enterFullScreen();

    const preventFullscreenExit = () => {
      console.log("Fullscreen state changed. FullscreenElement:", document.fullscreenElement, "Finished:", finished);
      if (!document.fullscreenElement && !finished) {
        console.log("Exiting fullscreen, calling handleSubmit");
        const confirmExit = window.confirm("Exiting fullscreen will submit your quiz. Are you sure?");
        if (!confirmExit) {
          handleSubmit();
        } else {
          enterFullScreen();
        }
      }
    };

    document.addEventListener("fullscreenchange", preventFullscreenExit);
    document.addEventListener("webkitfullscreenchange", preventFullscreenExit);
    document.addEventListener("mozfullscreenchange", preventFullscreenExit);
    document.addEventListener("msfullscreenchange", preventFullscreenExit);

    return () => {
      document.removeEventListener("fullscreenchange", preventFullscreenExit);
      document.removeEventListener("webkitfullscreenchange", preventFullscreenExit);
      document.removeEventListener("mozfullscreenchange", preventFullscreenExit);
      document.removeEventListener("msfullscreenchange", preventFullscreenExit);
    };
  }, [finished, handleSubmit]);

  useEffect(() => {
    const detectTabSwitch = () => {
      console.log("Tab switch detected. Hidden:", document.hidden, "HasFocus:", document.hasFocus());
      if ((document.hidden || !document.hasFocus()) && !finished) {
        console.log("Tab switched or focus lost, calling handleSubmit");
        handleSubmit();
      }
    };

    document.addEventListener("visibilitychange", detectTabSwitch);
    window.addEventListener("blur", detectTabSwitch);

    return () => {
      document.removeEventListener("visibilitychange", detectTabSwitch);
      window.removeEventListener("blur", detectTabSwitch);
    };
  }, [finished, handleSubmit]);

  useEffect(() => {
    const blockShortcuts = (e) => {
      if (["F5", "F12"].includes(e.key) || e.ctrlKey || e.altKey) {
        console.log("Blocked shortcut:", e.key);
        e.preventDefault();
      }
    };

    const blockContextMenu = (e) => {
      console.log("Blocked context menu");
      e.preventDefault();
    };

    document.addEventListener("keydown", blockShortcuts);
    window.addEventListener("contextmenu", blockContextMenu);

    return () => {
      document.removeEventListener("keydown", blockShortcuts);
      window.removeEventListener("contextmenu", blockContextMenu);
    };
  }, []);


  if (!quizData) return <div className="flex items-center justify-center h-screen">Loading quiz...</div>;

  return (
    <div className="fullscreen">
 
  <div className="text-center bg-black text-white p-2 font-bold">
    If you exit fullscreen, your quiz will be submitted.
  </div>

  <div className="flex h-screen bg-gray-100">
   
    <div className="w-1/4 bg-gray-800 text-white p-6">
      <h2 className="text-xl font-semibold mb-4">Quiz Menu</h2>
      {quizData.questions.map((_, i) => (
        <button
          key={i}
          className={`w-full p-3 text-left rounded-md mb-2 ${
            i === currentQuestion ? "bg-blue-500" : "bg-gray-700 hover:bg-gray-600"
          }`}
          onClick={() => setCurrentQuestion(i)}
        >
          Question {i + 1}
        </button>
      ))}
    </div>

   
    <div className="w-3/4 h-3/4 flex flex-col p-6">
     
      <div className="text-right text-red-500 text-lg font-bold">
        Time Left: {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, "0")}
      </div>

      
      <div className="bg-white p-6 rounded-lg shadow-md flex-1 overflow-auto">
        <h2 className="text-xl font-semibold mb-4">
          {quizData.questions[currentQuestion]?.question || "Loading Question..."}
        </h2>
        {quizData.questions[currentQuestion]?.options.map((option, idx) => (
          <label key={idx} className="block bg-gray-200 p-3 rounded-md my-2 cursor-pointer">
            <input
              type="radio"
              name={`question-${currentQuestion}`}
              value={option}
              checked={userAnswers[currentQuestion] === option.split(")")[0].trim()}
              onChange={() => handleAnswerChange(currentQuestion, option)}
              className="mr-2"
            />
            {option}
          </label>
        ))}
      </div>

     
      <div className="flex justify-between mt-4">
        <button
          className="bg-gray-500 text-white px-6 py-2 rounded-lg"
          onClick={() => setCurrentQuestion((prev) => prev - 1)}
          disabled={currentQuestion === 0}
        >
          Previous
        </button>
        <button
          className="bg-blue-500 text-white px-6 py-2 rounded-lg"
          onClick={() => setCurrentQuestion((prev) => (prev + 1) % quizData.questions.length)}
        >
          Save & Next
        </button>
      </div>

     
      <div className="mt-4 flex justify-center">
        <button className="bg-green-500 text-white px-6 py-2 rounded-lg w-full max-w-sm" onClick={handleSubmit}>
          Submit Quiz
        </button>
      </div>
    </div>
  </div>
</div>
  );
};

export default QuizTest;
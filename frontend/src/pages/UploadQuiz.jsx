import React, { useState, useEffect } from "react";
import Select from "react-select";
import { supabase } from "../supabase.jsx";

const UploadQuiz = ({ classroomId, onQuizUpload }) => {
  const [quizzes, setQuizzes] = useState([]);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchQuizzes = async () => {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        console.error("User not found:", userError);
        return;
      }

      const { data, error } = await supabase
        .from("quizzes")
        .select("id, title")
        .eq("user_id", user.id);

      if (error) {
        console.error("Error fetching quizzes:", error);
      } else {
        setQuizzes(data.map(q => ({ value: q.id, label: q.title })));
      }
    };

    fetchQuizzes();
  }, []);

  const handleUpload = async () => {
    if (!selectedQuiz) {
      alert("Please select a quiz.");
      return;
    }
    setLoading(true);

    
    const { data: existingQuiz, error: checkError } = await supabase
      .from("classroom_quizzes")
      .select("quiz_id")
      .eq("classroom_id", classroomId)
      .eq("quiz_id", selectedQuiz.value)
      .single();

    if (checkError && checkError.code !== "PGRST116") {
      console.error("Error checking existing quiz:", checkError);
      setLoading(false);
      return;
    }

    if (existingQuiz) {
      alert("Quiz is already added to this classroom!");
      setLoading(false);
      return;
    }

    
    const { error } = await supabase
      .from("classroom_quizzes")
      .insert([{ classroom_id: classroomId, quiz_id: selectedQuiz.value }]);

    setLoading(false);
    if (error) {
      console.error("Error uploading quiz:", error);
      alert("Failed to upload quiz.");
    } else {
      alert("Quiz uploaded successfully!");
      setSelectedQuiz(null);
      onQuizUpload(); 
    }
  };

  return (
    <div className="p-6 border rounded bg-white shadow-md">
      <h2 className="text-xl font-bold mb-3">Upload a Quiz</h2>
      <Select
        options={quizzes}
        value={selectedQuiz}
        onChange={setSelectedQuiz}
        placeholder="Select a quiz..."
        isSearchable
        className="mb-4"
      />
      <button
        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-all"
        onClick={handleUpload}
        disabled={loading}
      >
        {loading ? "Uploading..." : "Upload Quiz"}
      </button>
    </div>
  );
};

export default UploadQuiz;

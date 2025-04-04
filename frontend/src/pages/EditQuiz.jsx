import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../supabase";
import Card, { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Button from "@/components/ui/button";

const EditQuiz = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchQuiz = async () => {
      const { data, error } = await supabase
        .from("quizzes")
        .select("*")
        .eq("id", quizId)
        .single();

      if (error) {
        console.error("Error fetching quiz:", error.message);
        return;
      }

      if (data) {
        setQuiz(data);
        setQuestions(Array.isArray(data.questions) ? data.questions : []);
      }
    };

    fetchQuiz();
  }, [quizId]);

  const addNewQuestion = () => {
    setQuestions([...questions, { question: "", options: ["", "", "", ""], correctAnswer: "" }]);
  };

  const deleteQuestion = (index) => {
    const newQuestions = questions.filter((_, i) => i !== index);
    setQuestions(newQuestions);
  };

  const saveQuiz = async () => {
    setLoading(true);
    const { error } = await supabase.from("quizzes").update({ questions }).eq("id", quizId);

    if (error) {
      setMessage("❌ Error saving quiz");
      console.error("Error updating quiz:", error.message);
    } else {
      setMessage("✅ Quiz saved successfully!");
      setTimeout(() => navigate("/dashboard"), 1000);
    }
    setLoading(false);
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Edit Quiz: {quiz?.title || "Loading..."}</h2>
      {message && <p className="text-center text-green-500">{message}</p>}
      <Card>
        <CardHeader>
          <CardTitle>Questions</CardTitle>
        </CardHeader>
        <CardContent>
          {questions.length > 0 ? (
            questions.map((q, index) => (
              <div key={index} className="mb-6 p-4 border rounded">
                <label className="block font-semibold">Question:</label>
                <input
                  type="text"
                  value={q.question || ""}
                  onChange={(e) => {
                    const newQuestions = [...questions];
                    newQuestions[index].question = e.target.value;
                    setQuestions(newQuestions);
                  }}
                  className="w-full p-2 border rounded"
                />

                <label className="block mt-2 font-semibold">Options:</label>
                {q.options?.map((option, i) => (
                  <input
                    key={i}
                    type="text"
                    value={option || ""}
                    onChange={(e) => {
                      const newQuestions = [...questions];
                      newQuestions[index].options[i] = e.target.value;
                      setQuestions(newQuestions);
                    }}
                    className="w-full p-2 border rounded mt-1"
                  />
                ))}

                <label className="block mt-2 font-semibold">Correct Answer:</label>
                <input
                  type="text"
                  value={q.correctAnswer || ""}
                  onChange={(e) => {
                    const newQuestions = [...questions];
                    newQuestions[index].correctAnswer = e.target.value;
                    setQuestions(newQuestions);
                  }}
                  className="w-full p-2 border rounded"
                />
                <Button
                  className="mt-2 bg-red-500"
                  onClick={() => deleteQuestion(index)}
                >
                  ❌ Delete Question
                </Button>
              </div>
            ))
          ) : (
            <p>No questions available</p>
          )}

         
          <Button className="mt-4 bg-blue-500" onClick={addNewQuestion}>
            ➕ Add New Question
          </Button>

          
          <Button className="mt-4 bg-green-500" onClick={saveQuiz} disabled={loading}>
            {loading ? "Saving..." : "Save Quiz"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default EditQuiz;

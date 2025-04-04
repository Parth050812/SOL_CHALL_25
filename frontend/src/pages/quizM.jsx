import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Card, { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Button from "@/components/ui/button";
import { Local } from "../supabase";

const QuizM = () => {
  const [context, setContext] = useState("");
  const [topic, setTopic] = useState("");
  const [numQuestions, setNumQuestions] = useState(5);
  const [difficulty, setDifficulty] = useState("easy");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleGenerateQuiz = async () => {
    if (!topic.trim()) {
      alert("Please enter a quiz topic.");
      return;
    }
  
    const userId = localStorage.getItem("userId");
    if (!userId) {
      alert("User not authenticated. Please log in again.");
      return;
    }
  
    setLoading(true);
  
    try {
      const response = await fetch(`${Local}/generate-quiz/text`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic,context, numQuestions, difficulty, userId }),
      });
  
      const data = await response.json();
  
      if (response.ok) {
        navigate(`/edit-quiz/${data.quizId}`);
      } else {
        alert("Failed to generate quiz.");
        console.error("Backend Error:", data.error);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Server error. Check if the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Create a New Quiz</h2>
      <Card>
        <CardHeader>
          <CardTitle>Quiz Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <label className="block">
              Topic:
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full p-2 border rounded"
              />
            </label>
            <label className="block">
              Write some info for how you want your quiz:
              <input
                type="text"
                value={context}
                onChange={(e) => setContext(e.target.value)}
                className="w-full p-2 border rounded"
              />
            </label>
            <label className="block">
              Number of Questions:
              <input
                type="number"
                value={numQuestions}
                onChange={(e) => setNumQuestions(Number(e.target.value))}
                min="1"
                className="w-full p-2 border rounded"
              />
            </label>

            <label className="block">
              Difficulty:
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full p-2 border rounded"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </label>

            <Button className="w-full mt-2" onClick={handleGenerateQuiz} disabled={loading}>
              {loading ? "Generating..." : "Generate Quiz"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuizM;

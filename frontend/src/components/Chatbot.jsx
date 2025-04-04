import React, { useState } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import { Local } from "../supabase";

const Chatbot = ({ question, options, correctAnswer, topic }) => {
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const handleAskAI = async () => {
    setLoading(true);
    setResponse(""); // Clear previous response
    try {
      const { data } = await axios.post(`${Local}/chatbot`, {
        question,
        options,
        correctAnswer,
        topic
      });
      setResponse(data.response);
    } catch (error) {
      console.error("Chatbot error:", error);
      setResponse("Sorry, I couldn't fetch the explanation.");
    }
    setLoading(false);
  };

  return (
    <div className="mt-4 p-4 border rounded bg-gray-100">
      <button
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition duration-300"
        onClick={handleAskAI}
        disabled={loading}
      >
        {loading ? "Fetching Explanation..." : "Ask Chatbot for Explanation"}
      </button>

      {response && (
        <div className="mt-3 text-gray-700 p-3 border rounded bg-white shadow">
          <h4 className="font-semibold">AI Explanation:</h4>
          <ReactMarkdown>{response}</ReactMarkdown>
        </div>
      )}
    </div>
  );
};

export default Chatbot;

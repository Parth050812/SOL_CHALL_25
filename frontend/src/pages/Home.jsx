import React from 'react';
import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#667eea] via-[#764ba2] to-[#6b8dd6] flex items-center justify-center relative p-6">

      <div className="absolute top-4 right-4 space-x-4">
        <Link to="/login">
          <button className="bg-white text-indigo-700 font-semibold px-4 py-2 rounded-2xl shadow hover:bg-indigo-100 transition">
            Login
          </button>
        </Link>
        <Link to="/signup">
          <button className="bg-indigo-600 text-white font-semibold px-4 py-2 rounded-2xl shadow hover:bg-indigo-700 transition">
            Sign Up
          </button>
        </Link>
      </div>

      <div className="text-center">
        <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold text-white drop-shadow-xl">
          Welcome to QuizRoom
        </h1>
        <p className="mt-6 text-lg sm:text-xl text-white/80 max-w-xl mx-auto">
          Empowering teachers. Engaging students. Revolutionizing assessments.
        </p>
      </div>
    </div>
  );
}

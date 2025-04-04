import { useState } from "react";
import { supabase } from "../supabase";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

const Log = () => {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    let email = identifier;

 
    if (!identifier.includes("@")) {
      const { data, error } = await supabase
        .from("profiles")
        .select("email, id") 
        .eq("username", identifier)
        .single();

      if (error || !data) {
        console.error("Username not found:", error?.message || "No such user");
        alert("Invalid username or email.");
        return;
      }
      email = data.email;
    }

   
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.user) {
      console.error("Login error:", error?.message || "User not found");
      alert("Invalid credentials. Please try again.");
      return;
    }

  
    localStorage.setItem("userId", data.user.id);
    navigate("/dashboard");
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-orange-500 to-indigo-600">
      <div className="bg-white bg-opacity-20 backdrop-blur-lg p-8 rounded-xl shadow-2xl w-96">
        <h2 className="text-4xl font-bold text-transparent bg-gradient-to-br from-orange-500 to-indigo-600 bg-clip-text text-center mb-6">
          Login
        </h2>

        <input
          type="text"
          placeholder="Username or Email"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          className="w-full p-3 mb-3 border border-gray-300 bg-white bg-opacity-90 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 mb-5 border border-gray-300 bg-white bg-opacity-90 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
        />

        <button
          className="w-full bg-orange-500 hover:bg-orange-700 text-white font-bold py-3 rounded-lg transition duration-300"
          onClick={handleLogin}
        >
          Log In
        </button>

        <p className="mt-4 text-sm text-black text-center">
          Don't have an account?{" "}
          <Link to="/signup" className="text-orange-600 hover:underline">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Log;

import { useState } from "react";
import { supabase } from "../supabase";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

const Sign = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student"); 
  const navigate = useNavigate();

  const handleSignUp = async () => {
    const { data, error } = await supabase.auth.signUp({ email, password });

    if (error) {
      console.error("Sign-up error:", error.message);
    } else {
      const { error: profileError } = await supabase
        .from("profiles")
        .insert([{ username, email, id: data.user.id, role }]);

      if (profileError) {
        console.error("Error saving profile:", profileError.message);
      } else {
        console.log("User signed up and profile created:", data.user);
        navigate("/login");
      }
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-indigo-600 to-orange-500">
      <div className="bg-white bg-opacity-20 backdrop-blur-lg p-8 rounded-xl shadow-2xl w-96">
        <h2 className="text-4xl font-bold text-transparent bg-gradient-to-r from-indigo-600 to-orange-500 bg-clip-text text-center mb-6">
          Sign Up
        </h2>

        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full p-3 mb-3 border border-gray-300 bg-white bg-opacity-90 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
        />

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 mb-3 border border-gray-300 bg-white bg-opacity-90 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 mb-5 border border-gray-300 bg-white bg-opacity-90 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
        />

      
        <div className="flex justify-between mb-5">
          <label
            className={`cursor-pointer text-center w-1/2 py-2 rounded-l-lg ${
              role === "student" ? "bg-blue-500 text-white" : "bg-gray-200 text-black"
            }`}
            onClick={() => setRole("student")}
          >
            Student
            <input
              type="radio"
              name="role"
              value="student"
              checked={role === "student"}
              onChange={() => setRole("student")}
              className="hidden"
            />
          </label>

          <label
            className={`cursor-pointer text-center w-1/2 py-2 rounded-r-lg ${
              role === "teacher" ? "bg-blue-500 text-white" : "bg-gray-200 text-black"
            }`}
            onClick={() => setRole("teacher")}
          >
            Teacher
            <input
              type="radio"
              name="role"
              value="teacher"
              checked={role === "teacher"}
              onChange={() => setRole("teacher")}
              className="hidden"
            />
          </label>
        </div>

        <button
          className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition duration-300"
          onClick={handleSignUp}
        >
          Sign Up
        </button>

        <p className="mt-4 text-sm text-black text-center">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-900 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Sign;

import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import UploadQuiz from "../pages/UploadQuiz";
import StudentList from "../pages/StudentList";
import ClassroomQuizzes from "../pages/ClassroomQuizzes";
import { supabase } from "../supabase.jsx";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from "chart.js";


ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const ClassroomPage = () => {
  const { classroomId } = useParams();
  const navigate = useNavigate();
  const [refreshQuizzes, setRefreshQuizzes] = useState(false);
  const [classroomName, setClassroomName] = useState("");
  const [progressData, setProgressData] = useState(null);

  useEffect(() => {
    const fetchClassroomName = async () => {
      const { data, error } = await supabase
        .from("classrooms")
        .select("name")
        .eq("id", classroomId)
        .single();

      if (error) {
        console.error("Error fetching classroom name:", error);
      } else {
        setClassroomName(data.name);
      }
    };

    fetchClassroomName();
  }, [classroomId]);

  const handleQuizUpload = () => {
    setRefreshQuizzes((prev) => !prev);
  };

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 flex flex-col items-center p-6">
      <h1 className="text-3xl font-extrabold text-blue-600 mb-6">
        {classroomName || "Loading..."}
      </h1>

      <div className="flex w-full max-w-6xl gap-6">
        <div className="w-1/2 space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-300">
            <UploadQuiz classroomId={classroomId} onQuizUpload={handleQuizUpload} />
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-300">
            <ClassroomQuizzes classroomId={classroomId} refresh={refreshQuizzes} />
          </div>

          <div className="flex justify-center">
            <button
              onClick={() => navigate("/dashboard")}
              className="px-5 py-2.5 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-500 transition"
            >
              ← Back to Dashboard
            </button>
          </div>
        </div>

        <div className="w-1/2 bg-white p-6 rounded-lg shadow-md border border-gray-300">
          <h2 className="text-xl font-bold text-blue-600 mb-4">Students in Classroom</h2>
          <StudentList classroomId={classroomId} setProgressData={setProgressData} />

          {progressData ? (
            <Bar
              data={{
                labels: ["First Attempt", "Last Attempt"],
                datasets: [{
                  label: "Average Score (%)",
                  data: [
                    progressData.reduce((sum, s) => sum + s.firstAttemptPercentage, 0) / progressData.length,
                    progressData.reduce((sum, s) => sum + s.lastAttemptPercentage, 0) / progressData.length,
                  ],
                  backgroundColor: ["#FF6384", "#36A2EB"],
                }],
              }}
            />
          ) : <p>Loading progress data...</p>}
        </div>
      </div>
    </div>
  );
};

export default ClassroomPage;

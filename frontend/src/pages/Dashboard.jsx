import React, { useState, useEffect } from "react";
import Card, { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Button from "@/components/ui/button";
import Input from "@/components/ui/Input"
import { supabase } from "../supabase"; 
import { useNavigate } from "react-router-dom";
import QuizM from "@/pages/quizM"; 
import PerformanceCard from "@/pages/PerformanceCard"

const Dashboard = () => {
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showQuizM, setShowQuizM] = useState(false); 
  const [quizzes, setQuizzes] = useState([]); 
  
  const [classroomName, setClassroomName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [classrooms, setClassrooms] = useState([]);
  const [generatedCode, setGeneratedCode] = useState("");
  const [joinedClassrooms,setJoinedClassrooms]=useState("")
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState("");

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error logging out:", error);
    } else {
      navigate("/login"); 
    }
  };

  const generateCode = () => {
    return Math.random().toString(36).substr(2, 6).toUpperCase();
  };

  const handleCreateClassroom = async () => {
    if (classroomName.trim() === "") return;
  
    const { data: user, error: authError } = await supabase.auth.getUser();
    if (authError || !user?.user) {
      console.error("Error fetching user:", authError?.message);
      return;
    }
    const code = generateCode();
    const { data, error } = await supabase
      .from("classrooms")
      .insert([
        {
          name: classroomName,
          code: code,
          teacher_id: user.user.id, 
        },
      ])
      .select()
      .single(); 
    if (error) {
      console.error("Error inserting classroom:", error.message);
    } else {
      setClassrooms([...classrooms, data]); 
      setGeneratedCode(code);
      setClassroomName(""); 
    }
  };
  useEffect(() => {
    const fetchUser = async () => {
      const { data: authData, error: authError } = await supabase.auth.getUser();
  
      if (authError || !authData?.user) {
        console.error("Error fetching user:", authError?.message);
        return;
      }
      setUser(authData.user);
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("username")
        .eq("id", authData.user.id)
        .single();
      if (profileError) {
        console.error("Error fetching username:", profileError.message);
      } else {
        setUsername(profileData.username);
      }
    };
    fetchUser();
  }, []);

  const handleJoinClassroom = async () => {
    if (!joinCode.trim()) return;
    const { data: user, error: authError } = await supabase.auth.getUser();
    if (authError || !user?.user) {
      console.error("Error fetching user:", authError?.message);
      return;
    }
    const { data: profile, error: profileError } = await supabase
      .from("profiles") 
      .select("username") 
      .eq("id", user.user.id)
      .single();
    if (profileError || !profile?.username) {
      console.error("Error fetching student username:", profileError?.message);
      alert("Failed to fetch username. Try again.");
      return;
    }
      const { data: classroom, error } = await supabase
      .from("classrooms")
      .select("*")
      .eq("code", joinCode)
      .single();
  
    if (error || !classroom) {
      alert("Invalid Code!");
      return;
    }
   const { error: insertError } = await supabase
      .from("classroom_students")
      .insert([
        {
          classroom_id: classroom.id,
          student_id: user.user.id,
          student_username: profile.username, 
        },
      ]);
    if (insertError) {
      console.error("Error joining classroom:", insertError.message);
      return;
    }
    setJoinedClassrooms([...joinedClassrooms, classroom]);
    alert(`Joined Classroom: ${classroom.name}`);
    setJoinCode("");
  };



  const navigate = useNavigate();
  useEffect(() => {
    const fetchUserRole = async () => {
      const { data: user, error: authError } = await supabase.auth.getUser();
      if (authError || !user?.user) {
        console.error("Error fetching user:", authError?.message);
        navigate("/login"); 
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.user.id)
        .single();

      if (error) {
        console.error("Error fetching role:", error.message);
      } else {
        setRole(data.role);
      }
      if (data.role === "teacher") fetchClassrooms(user.user.id);
      if (data.role === "student") fetchJoinedClassrooms(user.user.id);
      setLoading(false);
    };
    /*classroom thing*/
    const fetchClassrooms = async () => {
      const { data: user, error: authError } = await supabase.auth.getUser();
      if (authError || !user?.user) {
        console.error("Error fetching user:", authError?.message);
        return;
      }

      const { data, error } = await supabase
        .from("classrooms")
        .select("*")
        .eq("teacher_id", user.user.id); 

      if (error) {
        console.error("Error fetching classrooms:", error.message);
      } else {
        setClassrooms(data);
      }
    };



    const fetchQuizzes = async () => {
      const { data: user, error: authError } = await supabase.auth.getUser();

      if (authError || !user?.user) {
        console.error("Error fetching user:", authError?.message);
        return;
      }

       

      
      const { data, error } = await supabase
        .from("quizzes")
        .select("*")
        .eq("user_id", user.user.id); 

      if (error) {
        console.error("Error fetching quizzes:", error.message);
      } else {
        
        setQuizzes(data);
      }
    };

    const fetchJoinedClassrooms = async () => {
      const { data: user, error: authError } = await supabase.auth.getUser();
      if (authError || !user?.user) {
        console.error("Error fetching user:", authError?.message);
        return;
      }
    
      const { data, error } = await supabase
        .from("classroom_students")
        .select("classroom_id, classrooms(name)") 
        .eq("student_id", user.user.id);
    
      if (error) {
        console.error("Error fetching classrooms:", error.message);
      } else {
        const formattedClassrooms = data.map((item) => ({
          id: item.classroom_id,
          name: item.classrooms?.name || "Unknown Classroom", 
        }));
        setJoinedClassrooms(formattedClassrooms);
      }
    };

    fetchUserRole();
    fetchQuizzes();
    fetchClassrooms();
    fetchJoinedClassrooms();
  }, [navigate]);
 




  if (loading) return <p>Loading...</p>;

  return (
    <div className="p-6 space-y-6 w-full min-h-screen bg-gradient-to-r from-blue-500 to-purple-600">
     <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl text-white font-bold">Dashboard</h1>
        <div className="flex items-center gap-4">
        <div className="flex items-center gap-3 bg-white p-2 rounded-lg shadow-md">
  <div className="w-10 h-10 bg-blue-500 text-white flex items-center justify-center rounded-full font-bold text-lg">
    {username ? username.charAt(0).toUpperCase() : "?"}
  </div>
  <span className="text-gray-800 font-semibold text-lg">{username || "Guest"}</span>
</div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Logout
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
        
        <Card className="mb-3">
            <CardHeader>
              <CardTitle>Classrooms</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Check your Classrooms</p>
              {role === "teacher" && (
                <Card className="w-96 p-4 shadow-lg">
                  <CardContent>
                    <h2 className="text-xl font-semibold mb-3">Create a Classroom</h2>
                    <Input
                      type="text"
                      placeholder="Enter Classroom Name"
                      value={classroomName}
                      onChange={(e) => setClassroomName(e.target.value)}
                    />
                    <Button className="mt-3 w-full" onClick={handleCreateClassroom}>
                      Create Classroom
                    </Button>
                    {generatedCode && (
                      <p className="mt-3 text-green-600">
                        Classroom Code: <strong>{generatedCode}</strong>
                      </p>
                    )}
                  </CardContent>
                </Card>
              )}

              {role === "student" && (
                <Card className="w-96 p-4 shadow-lg">
                  <CardContent>
                    <h2 className="text-xl font-semibold mb-3">Join a Classroom</h2>
                    <Input
                      type="text"
                      placeholder="Enter Classroom Code"
                      value={joinCode}
                      onChange={(e) => setJoinCode(e.target.value)}
                    />
                    <Button className="mt-3 w-full" onClick={handleJoinClassroom}>
                      Join Classroom
                    </Button>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
          <div className="mt-6">
          {role === "teacher" && (
  <div>
    <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
      Your Created Classrooms
    </h2>
    {classrooms.length > 0 ? (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {classrooms.map((classroom) => (
          <Card
            key={classroom.id}
            className="transition-transform transform hover:scale-105 shadow-lg border border-gray-200 bg-white rounded-lg"
          >
            <CardHeader className="bg-blue-500 text-white p-4 rounded-t-lg">
              <CardTitle className="text-lg font-semibold">{classroom.name}</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <p className="text-gray-700">Code: <strong>{classroom.code}</strong></p>
              <Button 
                className="mt-3 w-full bg-blue-500 text-white hover:bg-blue-600 transition-all"
                onClick={() => navigate(`/classroom/${classroom.id}`)}
              >
                 Enter Classroom
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    ) : (
      <Card className="p-6 text-center bg-white shadow-md">
        <CardHeader>
          <CardTitle className="text-gray-700">No classrooms created yet.</CardTitle>
        </CardHeader>
      </Card>
    )}
  </div>
)}

{role === "student" && (
  <div>
    <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
       Your Enrolled Classrooms
    </h2>
    {joinedClassrooms.length > 0 ? (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {joinedClassrooms.map((Classrooms) => (
          <Card
            key={Classrooms.id}
            className="transition-transform transform hover:scale-105 shadow-lg border border-gray-200 bg-white rounded-lg"
          >
            <CardHeader className="bg-green-500 text-white p-4 rounded-t-lg">
              <CardTitle className="text-lg font-semibold">{Classrooms.name}</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <Button 
                className="mt-3 w-full bg-green-500 text-white hover:bg-green-600 transition-all"
                onClick={() => navigate(`/joinedClassrooms/${Classrooms.id}`)}
              >
                 Enter Classroom
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    ) : (
      <Card className="p-6 text-center bg-white shadow-md">
        <CardHeader>
          <CardTitle className="text-gray-700">No enrolled classrooms yet.</CardTitle>
        </CardHeader>
      </Card>
    )}
  </div>
)}

          </div>
        </div>
        
        <div className=" ">
        
        {role === "student" && <PerformanceCard studentId={user.id} />}
        {role === "teacher" && (
        <div className="mt-0.5">
          {/* Quiz Management for Teacher */}
          <Card className=" ">
            <CardHeader>
              <CardTitle>Create & Manage Quiz</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Create quizzes by topic or upload PDFs.</p>
              <Button className="mt-2 w-full" onClick={() => setShowQuizM(!showQuizM)}>
                {showQuizM ? "Close Quiz Manager" : "Open Quiz Manager"}
              </Button>
            </CardContent>
          </Card>

          
        </div>
      )}

      {/* Show Quiz Management inside Dashboard */}
      {showQuizM && (
        <div className="mt-6">
          <QuizM />
        </div>
      )}
        </div>
        
      </div>

    </div>
  );
};

export default Dashboard;

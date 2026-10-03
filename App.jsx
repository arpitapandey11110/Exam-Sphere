import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import Header from "./components/Header";
import CollegeHeader from "./components/CollegeHeader";
import Footer from "./components/Footer";
import Login from "./components/Login";
import Register from "./components/Register";
import StreamPage from "./components/StreamPage";
import CoursesPage from "./components/CoursesPage";
import SubjectsPage from "./components/SubjectsPage";
import StudentPortal from "./components/StudentPortal";
import TeacherDashboard from "./components/TeacherDashboard";
import TeacherPortal from "./components/TeacherPortal";
import AdminDashboard from "./components/AdminDashboard";
import AdminUsers from "./components/AdminUsers";
import AdminSettings from "./components/AdminSettings";
import AdminContent from "./components/AdminContent";
import AdminAnalytics from "./components/AdminAnalytics";
import CollegePage from "./components/CollegePage";
import PapersPage from "./components/PapersPage";
import ForgotPassword from "./components/ForgotPassword";
import ResetPassword from "./components/ResetPassword";
import introImage from "./assets/intro.jpg";
import { FaBook, FaChalkboardTeacher, FaClipboardList } from "react-icons/fa";




function HomePage() {
  const navigate = useNavigate();
  
  return (
    <main style={{ flex: 1 }}>
      <div
        style={{
          position: "relative",
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px",
        }}
      >
        {/* Background Image */}
        <img
          src={introImage}
          alt="Exam Preparation"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            zIndex: -1,
          }}
        />

        {/* Overlay */}
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100vh",
            background: "rgba(0, 85, 165, 0.4)",
            zIndex: -1,
          }}
        ></div>

        {/* Intro Text */}
        <div
          style={{
            color: "white",
            maxWidth: "500px",
            padding: "20px",
            marginRight: "40px",
          }}
        >
          <h1 style={{ fontSize: "3rem", fontWeight: "bold" }}>
            Welcome to ExamSphere
          </h1>
          <p style={{ fontSize: "1.2rem", marginBottom: "20px" }}>
            Your one-stop platform for exam preparation resources,
            empowering students and teachers for smarter exam prep.
          </p>
          
          <div style={{ marginBottom: "30px" }}>
            <button
              onClick={() => navigate('/student-portal')}
              style={{
                backgroundColor: "rgba(0, 85, 165, 0.4)",
                border: "2px solid white",
                color: "white",
                padding: "12px 24px",
                borderRadius: "8px",
                fontSize: "1.1rem",
                fontWeight: "bold",
                cursor: "pointer",
                transition: "all 0.3s ease",
                marginRight: "15px"
              }}
              onMouseOver={(e) => {
                e.target.style.backgroundColor = "white";
                e.target.style.color = "#dc2626";
              }}
              onMouseOut={(e) => {
                e.target.style.backgroundColor = "rgba(0, 85, 165, 0.4)";
                e.target.style.color = "white";
              }}
            >
              Explore Student Portal
            </button>
          </div>

          {/* Features */}
          <div style={{ display: "flex", gap: "20px" }}>
            <div style={{ textAlign: "center" }}>
              <FaBook size={40} />
              <p>Study Resources</p>
            </div>
            <div style={{ textAlign: "center" }}>
              <FaChalkboardTeacher size={40} />
              <p>Teacher Friendly</p>
            </div>
            <div style={{ textAlign: "center" }}>
              <FaClipboardList size={40} />
              <p>Easy Search</p>
            </div>
          </div>
        </div>

        {/* Floating Login Card */}
        <div
          style={{
            backdropFilter: "blur(12px)",
            background: "rgba(0, 85, 165, 0.4)",
            padding: "25px",
            borderRadius: "15px",
            boxShadow: "0px 4px 30px rgba(0, 85, 165, 0.14)",
            maxWidth: "350px",
            width: "100%",
          }}
        >
          <Login />
        </div>
      </div>
    </main>
  );
}

export default function App() {
  return (
    <Router>
      {/* Flex container for sticky footer layout */}
      <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        <Header />

        <div style={{ flex: 1 }}>
          <Routes>
            {/* Home Page */}
            <Route path="/" element={<>
              <HomePage />
              <Footer />
            </>} />

            {/* Register Page */}
            <Route
              path="/register"
              element={<Register />}
            />

            {/* Forgot Password */}
            <Route
              path="/forgot-password"
              element={<ForgotPassword />}
            />

            {/* Reset Password */}
            <Route
              path="/reset-password"
              element={<ResetPassword />}
            />

            {/* Student Portal Routes with College Header */}
            <Route path="/streams" element={
              <div>
                <CollegeHeader />
                <StreamPage />
              </div>
            } />
            <Route path="/courses/:streamId" element={
              <div>
                <CollegeHeader />
                <CoursesPage />
              </div>
            } />
            <Route path="/subjects/:streamId/:courseId" element={
              <div>
                <CollegeHeader />
                <SubjectsPage />
              </div>
            } />
            <Route path="/papers/:streamId/:courseId/:year" element={
              <div>
                <CollegeHeader />
                <PapersPage />
              </div>
            } />
            
            {/* Portal Routes */}
            <Route path="/student-portal" element={<StudentPortal />} />
            <Route path="/college/:college/portal" element={<StudentPortal />} />
            <Route path="/teacher-portal" element={<TeacherPortal />} />
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/settings" element={<AdminSettings />} />
            <Route path="/admin/content" element={<AdminContent />} />
            <Route path="/admin/analytics" element={<AdminAnalytics />} />
            <Route path="/college/:collegeName" element={<CollegePage />} />
          </Routes>
        </div>
        {/* Footer only on homepage now */}
      </div>
    </Router>
  );
}

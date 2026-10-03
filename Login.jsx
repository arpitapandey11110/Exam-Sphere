// client/src/components/Login.jsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useToast } from "./ToastProvider.jsx";
import { FaEye, FaEyeSlash } from "react-icons/fa";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      console.log("🔐 Attempting login for:", email);
      
      const base = import.meta.env.VITE_API_URL || 'http://localhost:5003';
      const response = await fetch(`${base}/api/login`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      console.log("📨 Login response:", data);

      if (response.ok && data.success) {
        console.log("✅ Login successful");
        toast.success(`Welcome back, ${data.user.firstName}!`);
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('token', data.token);
        
        // Redirect based on user role (case-insensitive)
        const userRole = (data.user.role || '').toLowerCase();
        if (userRole === 'admin') {
          // Admin can choose which portal to access, default to admin dashboard
          navigate("/admin-dashboard");
        } else if (userRole === 'teacher') {
          navigate("/teacher-portal");
        } else {
          // Students go to student portal
          navigate("/student-portal");
        }
      } else {
        console.error("❌ Login failed:", data);
        const msg = data.error || "Login failed";
        setError(msg);
        toast.error(msg);
      }
    } catch (err) {
      console.error("❌ Login error:", err);
      setError("Connection error. Make sure the server is running on port 5003.");
      toast.error("Connection error. Check server status.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "auto", marginTop: "50px" }}>
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ width: "100%", marginBottom: "10px", padding: "8px" }}
        />
        <div style={{ position: "relative", width: "100%", marginBottom: "10px" }}>
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: "100%", marginBottom: "0px", padding: "8px 40px 8px 8px" }}
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", background: "transparent", border: "none", cursor: "pointer", padding: 0, color: "#6b7280", display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>
        <div style={{ textAlign: "right", marginBottom: "10px" }}>
          <Link to="/forgot-password" style={{ color: "#0055a5", fontSize: "14px", fontWeight: 600 }}>
            Forgot password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: "10px",
            backgroundColor: loading ? "#999" : "#0055a5",
            color: "white",
            fontSize: "16px",
            border: "none",
            borderRadius: "5px",
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>

      {error && <p style={{ color: "red", marginTop: "10px" }}>{error}</p>}

      <p style={{ marginTop: "15px", fontSize: "14px" }}>
        New here?{" "}
        <Link to="/register" style={{ color: "#0055a5", fontWeight: "bold" }}>
          Register
        </Link>
      </p>
    </div>
  );
}
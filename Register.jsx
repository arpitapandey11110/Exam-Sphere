// client/src/components/Register.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import intro from "../assets/intro.jpg";
import { useToast } from "./ToastProvider.jsx";
import { FaEye, FaEyeSlash } from "react-icons/fa";

export default function Register() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [college, setCollege] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("");
  const [error, setError] = useState("");
  const [adminCode, setAdminCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpRequested, setOtpRequested] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const navigate = useNavigate();
  const toast = useToast();

  const colleges = [
    "Chetana College",
    "C. H. M. College, Ulhasnagar",
    "D. G. Ruparel College of Arts, Science and Commerce, Matunga",
    "Elphinstone College, Kala Ghoda, Fort",
    "Guru Nanak Khalsa College (King's Circle), Matunga",
    "H.R. College of Commerce and Economics, Churchgate",
    "Jai Hind College, Churchgate",
    "Jashbhai Maganbhai Patel College of Commerce, Goregaon",
    "K. P. B. Hinduja College of Commerce, Charni Road",
    "Kalasadan, Sion",
    "Kishinchand Chellaram College, Churchgate",
    "M. M. K. College, Bandra West",
    "Kirti M. Doongursee College, Dadar West",
    "K.J. Somaiya College of Arts & Commerce, Vidyavihar",
    "K.J. Somaiya College of Science & Commerce, Vidyavihar",
    "Malini Kishor Sanghvi College of Commerce & Economics, JVPD, Vile Parle",
    "Mithibai College, Vile Parle",
    "Mulund College of Commerce, Mulund West",
    "Narsee Monjee College of Commerce and Economics, Vile Parle West",
    "NES Ratnam College Of Arts, Science & Commerce, Bhandup",
    "Patkar-Varde College, Goregaon",
    "R. D. National College, Bandra West",
    "Ramnarain Ruia College, Matunga",
    "Ramniranjan Anandilal Podar College of Commerce and Economics, Matunga",
    "Ramniranjan Jhunjhunwala College of Arts, Science & Commerce.",
    "Royal College of Science, Arts and Commerce, Mira Road",
    "Sanpada College of Commerce and Technology, Sanpada",
    "Sathaye College, formerly Parle College, Vile Parle",
    "Shri M.D. Shah Mahila College of Arts and Commerce, Malad West",
    "Siddharth College of Arts Science and Commerce, Buddha Bhavan, Fort",
    "SIES College of Arts, Science, and Commerce, Sion West",
    "SIES (Nerul) College of Arts, Science and Commerce, Nerul",
    "S.K. Somaiya College of Arts & Sciences, Vidyavihar",
    "South Indians' Welfare Society College, Wadala",
    "SPDT Lions Juhu College of Arts, Commerce and Science, Mumbai, Andheri East",
    "St. Andrew's College, Bandra",
    "St. Xavier's College, Dhobitalao, Fort",
    "Sydenham College of Commerce and Economics, Churchgate",
    "Thakur College of Science and Commerce, Thakur Village, Kandivali",
    "Tolani College of Commerce, Andheri",
    "Vani Vidyalaya High School and Junior College, Mulund West",
    "VIVA College of Arts, Science and Commerce, Virar",
    "Wilson College, Girgaon",
    "Universal Ai University, Karjat"
  ];

  const isValidTeacherEmail = (addr) => {
    const e = String(addr || '').toLowerCase();
    // Simple client-side heuristic; server has authoritative validation
    return /@[a-z0-9.-]+\.(edu|ac\.in)$/i.test(e);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (!otpRequested) {
        // Step 1: request OTP
        // Frontend validations for initial registration details
        if (password !== confirmPassword) {
          const msg = "Password should be same";
          setError(msg);
          toast.error(msg);
          setLoading(false);
          return;
        }
        if (password.length < 6) {
          setError("Password must be at least 6 characters long!");
          setLoading(false);
          return;
        }
        if (!role) {
          setError("Please select your role (Student, Teacher, or Admin).");
          setLoading(false);
          return;
        }
        if (role === 'teacher' && !isValidTeacherEmail(email)) {
          setError("Teachers must use a valid college email (e.g., ends with .edu or .ac.in)");
          setLoading(false);
          return;
        }

        console.log("📝 Requesting OTP for:", email);
        const base = import.meta.env.VITE_API_URL || 'http://localhost:5003';
        const resp = await fetch(`${base}/api/register/request-otp`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            firstName,
            lastName,
            email,
            college,
            password,
            role,
            adminCode: role === 'admin' ? adminCode : undefined,
          }),
        });
        const data = await resp.json();
        console.log("📨 Request-OTP response:", data);
        if (resp.ok && data.success) {
          setOtpRequested(true);
          toast.success(`OTP sent to ${email}. Please check your email.`);
        } else {
          const msg = data.error || `Failed to request OTP (${resp.status})`;
          setError(msg);
          toast.error(msg);
        }
      } else {
        // Step 2: verify OTP and finish registration
        if (!otp || String(otp).trim().length < 4) {
          setError("Please enter the OTP sent to your email.");
          setLoading(false);
          return;
        }
        console.log("✅ Verifying OTP for:", email);
        const base = import.meta.env.VITE_API_URL || 'http://localhost:5003';
        const resp = await fetch(`${base}/api/register/verify-otp`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, otp }),
        });
        const data = await resp.json();
        console.log("📨 Verify-OTP response:", data);
        if (resp.ok && data.success) {
          toast.success("Registration complete! Please login.");
          navigate("/");
        } else {
          const msg = data.error || `OTP verification failed (${resp.status})`;
          setError(msg);
          toast.error(msg);
        }
      }
    } catch (err) {
      console.error("❌ Registration error:", err);
      setError("Connection error. Make sure the server is running on port 5003.");
      toast.error("Connection error. Check server status.");
    } finally {
      setLoading(false);
    }
  };
  const passwordsMismatch = !otpRequested && password.length > 0 && confirmPassword.length > 0 && password !== confirmPassword;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        minHeight: "100vh",
        backgroundImage: `linear-gradient(rgba(0,0,0,0.45), rgba(0,0,0,0.45)), url(${intro})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        overflow: "auto",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "480px",
          background: "rgba(255,255,255,0.95)",
          backdropFilter: "saturate(180%) blur(6px)",
          borderRadius: "16px",
          boxShadow: "0 20px 50px rgba(0,0,0,0.15)",
          border: "1px solid #e5e7eb",
          padding: "24px",
        }}
      >
        <h2 style={{ margin: 0, marginBottom: "8px", fontSize: "28px", fontWeight: 800, color: "#111827", textAlign: "center" }}>
          Register
        </h2>
        <p style={{ margin: 0, marginBottom: "16px", fontSize: "14px", color: "#6b7280", textAlign: "center" }}>
          Create your EXAMSPHERE account
        </p>
        <form onSubmit={handleRegister}>
          <input
            type="text"
            placeholder="First Name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
            disabled={otpRequested}
            style={{ width: "100%", marginBottom: "10px", padding: "10px", border: "1px solid #d1d5db", borderRadius: "10px", outline: "none" }}
          />
          <input
            type="text"
            placeholder="Last Name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
            disabled={otpRequested}
            style={{ width: "100%", marginBottom: "10px", padding: "10px", border: "1px solid #d1d5db", borderRadius: "10px", outline: "none" }}
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={otpRequested}
            style={{ width: "100%", marginBottom: "10px", padding: "10px", border: "1px solid #d1d5db", borderRadius: "10px", outline: "none" }}
          />

          <select
            value={college}
            onChange={(e) => setCollege(e.target.value)}
            required
            disabled={otpRequested}
            style={{ width: "100%", marginBottom: "10px", padding: "10px", border: "1px solid #d1d5db", borderRadius: "10px", outline: "none", background: "#fff" }}
          >
            <option value="">Select College</option>
            {colleges.map((c, index) => (
              <option key={index} value={c}>
                {c}
              </option>
            ))}
          </select>

          <div style={{ position: "relative", width: "100%", marginBottom: "10px" }}>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Set Password (min 6 characters)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={otpRequested}
              style={{ width: "100%", padding: "10px 40px 10px 10px", border: "1px solid #d1d5db", borderRadius: "10px", outline: "none" }}
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              style={{
                position: "absolute",
                right: "10px",
                top: "50%",
                transform: "translateY(-50%)",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                padding: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#6b7280",
              }}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
          <div style={{ position: "relative", width: "100%", marginBottom: "10px" }}>
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={otpRequested}
              aria-invalid={!otpRequested && passwordsMismatch}
              style={{ width: "100%", padding: "10px 40px 10px 10px", border: (!otpRequested && passwordsMismatch) ? "1px solid #ef4444" : "1px solid #d1d5db", borderRadius: "10px", outline: "none" }}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((prev) => !prev)}
              aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
              style={{
                position: "absolute",
                right: "10px",
                top: "50%",
                transform: "translateY(-50%)",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                padding: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#6b7280",
              }}
            >
              {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
          {!otpRequested && passwordsMismatch && (
            <p style={{ color: "#b91c1c", marginTop: "-6px", marginBottom: "10px", fontSize: "12px" }}>
              Password should be same
            </p>
          )}

          <div style={{ marginBottom: "10px" }}>
            <label>
              <input
                type="radio"
                value="student"
                checked={role === "student"}
                onChange={(e) => setRole(e.target.value)}
                required
                disabled={otpRequested}
              />{" "}
              Student
            </label>
            <label style={{ marginLeft: "15px" }}>
              <input
                type="radio"
                value="teacher"
                checked={role === "teacher"}
                onChange={(e) => setRole(e.target.value)}
                required
                disabled={otpRequested}
              />{" "}
              Teacher
            </label>
            <label style={{ marginLeft: "15px" }}>
              <input
                type="radio"
                value="admin"
                checked={role === "admin"}
                onChange={(e) => setRole(e.target.value)}
                required
                disabled={otpRequested}
              />{" "}
              Admin
            </label>
          </div>

          {role === 'admin' && !otpRequested && (
            <input
              type="password"
              placeholder="Admin invitation code"
              value={adminCode}
              onChange={(e) => setAdminCode(e.target.value)}
              required
              style={{ width: "100%", marginBottom: "10px", padding: "10px", border: "1px solid #d1d5db", borderRadius: "10px", outline: "none" }}
            />
          )}

          {otpRequested && (
            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
              style={{ width: "100%", marginBottom: "10px", padding: "10px", border: "1px solid #d1d5db", borderRadius: "10px", outline: "none", letterSpacing: "3px" }}
            />
          )}
          <button
            type="submit"
            disabled={loading || (!otpRequested && passwordsMismatch)}
            style={{
              width: "100%",
              padding: "10px",
              backgroundColor: (loading || (!otpRequested && passwordsMismatch)) ? "#999" : "#0055a5",
              color: "white",
              fontSize: "16px",
              border: "none",
              borderRadius: "8px",
              cursor: (loading || (!otpRequested && passwordsMismatch)) ? "not-allowed" : "pointer",
              boxShadow: "0 6px 14px rgba(0, 85, 165, 0.35)",
            }}
          >
            {loading ? (otpRequested ? "Verifying..." : "Requesting OTP...") : (otpRequested ? "Verify & Register" : "Request OTP")}
          </button>
        </form>
        {error && (
          <p style={{ color: "#b91c1c", marginTop: "10px", textAlign: "center" }}>{error}</p>
        )}
        <p style={{ marginTop: "10px", textAlign: "center" }}>
          Already have an account? <Link to="/">Login</Link>
        </p>
      </div>
    </div>
  );
}
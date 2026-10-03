// client/src/components/ForgotPassword.jsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useToast } from "./ToastProvider.jsx";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const base = import.meta.env.VITE_API_URL || 'http://localhost:5003';
      const resp = await fetch(`${base}/api/password/forgot`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await resp.json().catch(() => ({}));
      if (resp.ok) {
        toast.success("If an account exists with that email, a reset link has been sent.");
        navigate("/");
      } else {
        const msg = data.error || `Request failed (${resp.status})`;
        toast.error(msg);
      }
    } catch (err) {
      toast.error("Connection error. Check server status.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "420px", margin: "40px auto", padding: "20px", background: "#fff", borderRadius: "12px", boxShadow: "0 10px 25px rgba(0,0,0,0.08)", border: "1px solid #e5e7eb" }}>
      <h2 style={{ marginTop: 0 }}>Forgot Password</h2>
      <p style={{ color: "#6b7280", marginTop: 0 }}>Enter your email address and we'll send you instructions to reset your password.</p>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ width: "100%", marginBottom: "10px", padding: "10px", border: "1px solid #d1d5db", borderRadius: "8px" }}
        />
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
            borderRadius: "8px",
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Sending..." : "Send reset link"}
        </button>
      </form>
      <p style={{ marginTop: "12px", fontSize: "14px", textAlign: "center" }}>
        Remembered your password? <Link to="/" style={{ color: "#0055a5", fontWeight: 600 }}>Back to login</Link>
      </p>
    </div>
  );
}

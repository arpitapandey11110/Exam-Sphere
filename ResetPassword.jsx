// client/src/components/ResetPassword.jsx
import { useState, useMemo } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { useToast } from "./ToastProvider.jsx";
import { FaEye, FaEyeSlash } from "react-icons/fa";

export default function ResetPassword() {
  const [params] = useSearchParams();
  const token = params.get("token") || "";
  const email = params.get("email") || "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const toast = useToast();
  const navigate = useNavigate();

  const passwordsMismatch = useMemo(() => (
    newPassword.length > 0 && confirmPassword.length > 0 && newPassword !== confirmPassword
  ), [newPassword, confirmPassword]);

  const invalidLink = !token || !email;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (invalidLink) {
      toast.error("Invalid or missing reset link.");
      return;
    }
    if (passwordsMismatch) {
      toast.error("Password should be same");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters long!");
      return;
    }

    setLoading(true);
    try {
      const base = import.meta.env.VITE_API_URL || 'http://localhost:5003';
      const resp = await fetch(`${base}/api/password/reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, token, newPassword }),
      });
      const data = await resp.json().catch(() => ({}));
      if (resp.ok && data.success) {
        toast.success("Password updated. Please login.");
        navigate("/");
      } else {
        const msg = data.error || `Reset failed (${resp.status})`;
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
      <h2 style={{ marginTop: 0 }}>Reset Password</h2>
      {invalidLink ? (
        <>
          <p style={{ color: "#b91c1c" }}>Invalid or expired reset link.</p>
          <p><Link to="/" style={{ color: "#0055a5", fontWeight: 600 }}>Back to login</Link></p>
        </>
      ) : (
        <form onSubmit={handleSubmit}>
          <div style={{ position: "relative", width: "100%", marginBottom: "10px" }}>
            <input
              type={showNew ? "text" : "password"}
              placeholder="New password (min 6 characters)"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              style={{ width: "100%", padding: "10px 40px 10px 10px", border: "1px solid #d1d5db", borderRadius: "10px", outline: "none" }}
            />
            <button
              type="button"
              onClick={() => setShowNew((prev) => !prev)}
              aria-label={showNew ? "Hide new password" : "Show new password"}
              style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", background: "transparent", border: "none", cursor: "pointer", padding: 0, color: "#6b7280", display: "flex", alignItems: "center", justifyContent: "center" }}
            >
              {showNew ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          <div style={{ position: "relative", width: "100%", marginBottom: "10px" }}>
            <input
              type={showConfirm ? "text" : "password"}
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              aria-invalid={passwordsMismatch}
              style={{ width: "100%", padding: "10px 40px 10px 10px", border: passwordsMismatch ? "1px solid #ef4444" : "1px solid #d1d5db", borderRadius: "10px", outline: "none" }}
            />
            <button
              type="button"
              onClick={() => setShowConfirm((prev) => !prev)}
              aria-label={showConfirm ? "Hide confirm password" : "Show confirm password"}
              style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", background: "transparent", border: "none", cursor: "pointer", padding: 0, color: "#6b7280", display: "flex", alignItems: "center", justifyContent: "center" }}
            >
              {showConfirm ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          {passwordsMismatch && (
            <p style={{ color: "#b91c1c", marginTop: "-6px", marginBottom: "10px", fontSize: "12px" }}>
              Password should be same
            </p>
          )}

          <button
            type="submit"
            disabled={loading || passwordsMismatch || newPassword.length < 6}
            style={{
              width: "100%",
              padding: "10px",
              backgroundColor: (loading || passwordsMismatch || newPassword.length < 6) ? "#999" : "#0055a5",
              color: "white",
              fontSize: "16px",
              border: "none",
              borderRadius: "8px",
              cursor: (loading || passwordsMismatch || newPassword.length < 6) ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Updating..." : "Update password"}
          </button>
        </form>
      )}
    </div>
  );
}

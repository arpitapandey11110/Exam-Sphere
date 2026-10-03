import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AdminSettings() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const u = localStorage.getItem("user");
    if (!u) { navigate("/"); return; }
    const parsed = JSON.parse(u);
    if ((parsed.role || "").toLowerCase() !== "admin") { navigate("/"); return; }
    setUser(parsed);
  }, [navigate]);

  if (!user) return null;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>
        <button onClick={() => navigate("/admin-dashboard")} className="px-4 py-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors">Back to Dashboard</button>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-600">Placeholder settings page. We can add forms for college info, upload limits, authentication settings, etc.</p>
      </div>
    </div>
  );
}



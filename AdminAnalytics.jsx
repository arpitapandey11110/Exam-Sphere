import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AdminAnalytics() {
  const [user, setUser] = useState(null);
  const [data, setData] = useState({ registrations: [], logins: [] });
  const navigate = useNavigate();

  useEffect(() => {
    const u = localStorage.getItem("user");
    if (!u) { navigate("/"); return; }
    const parsed = JSON.parse(u);
    if ((parsed.role || "").toLowerCase() !== "admin") { navigate("/"); return; }
    setUser(parsed);

    const token = localStorage.getItem("token") || "";
    const base = import.meta.env.VITE_API_URL || 'http://localhost:5003';
    fetch(`${base}/api/admin/analytics/summary`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => { if (d && d.success) setData({ registrations: d.registrations, logins: d.logins }); })
      .catch(() => {});
  }, [navigate]);

  if (!user) return null;

  const Row = ({ label, series }) => (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{label}</h3>
      {series.length === 0 ? (
        <div className="text-sm text-gray-500">No data</div>
      ) : (
        <ul className="text-sm text-gray-700 space-y-1">
          {series.map((d) => (
            <li key={d._id} className="flex justify-between"><span>{d._id}</span><span>{d.count}</span></li>
          ))}
        </ul>
      )}
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <button onClick={() => navigate("/admin-dashboard")} className="px-4 py-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors">Back to Dashboard</button>
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        <Row label="Daily Registrations (last 7 days)" series={data.registrations} />
        <Row label="Daily Logins (last 7 days)" series={data.logins} />
      </div>
    </div>
  );
}



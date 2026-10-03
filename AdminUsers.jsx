import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "./ToastProvider.jsx";
import { useConfirm } from "./ConfirmProvider.jsx";

export default function AdminUsers() {
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const toast = useToast();
  const confirm = useConfirm();

  useEffect(() => {
    const u = localStorage.getItem("user");
    if (!u) { navigate("/"); return; }
    const parsed = JSON.parse(u);
    if ((parsed.role || "").toLowerCase() !== "admin") { navigate("/"); return; }
    setUser(parsed);

    const token = localStorage.getItem("token") || "";
    const base = import.meta.env.VITE_API_URL || 'http://localhost:5003';
    fetch(`${base}/api/admin/users`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => { if (d && d.success) setUsers(d.users || []); else setError(d.error || "Failed to load users"); })
      .catch(() => setError("Failed to load users"))
      .finally(() => setLoading(false));
  }, [navigate]);

  const handleDelete = async (id) => {
    const ok = await confirm({ title: 'Delete user?', message: 'This action cannot be undone.' });
    if (!ok) return;
    const token = localStorage.getItem("token") || "";
    const base = import.meta.env.VITE_API_URL || 'http://localhost:5003';
    const res = await fetch(`${base}/api/admin/users/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    if (res.ok && data.success) {
      setUsers(prev => prev.filter(u => u._id !== id));
      toast.success('User deleted');
    } else {
      toast.error(data.error || "Delete failed");
    }
  };

  const handleRoleChange = async (id, role) => {
    const token = localStorage.getItem("token") || "";
    const base = import.meta.env.VITE_API_URL || 'http://localhost:5003';
    const res = await fetch(`${base}/api/admin/users/${id}/role`, { method: "PATCH", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ role }) });
    const data = await res.json();
    if (res.ok && data.success) {
      setUsers(prev => prev.map(u => u._id === id ? data.user : u));
      toast.success('Role updated');
    } else {
      toast.error(data.error || "Update failed");
    }
  };

  if (!user) return null;
  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
        <button onClick={() => navigate("/admin-dashboard")} className="px-4 py-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors">Back to Dashboard</button>
      </div>

      <div className="bg-white rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
              <th className="px-6 py-3" />
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map(u => (
              <tr key={u._id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{u.firstName} {u.lastName}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{u.email}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <select value={u.role} onChange={e => handleRoleChange(u._id, e.target.value)} className="border border-gray-300 rounded px-2 py-1">
                    <option value="student">student</option>
                    <option value="teacher">teacher</option>
                    <option value="admin">admin</option>
                  </select>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                  <button onClick={() => handleDelete(u._id)} className="text-red-600 hover:text-red-800">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}



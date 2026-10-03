import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "./ToastProvider.jsx";
import { useConfirm } from "./ConfirmProvider.jsx";

export default function AdminContent() {
  const [user, setUser] = useState(null);
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState("");
  const navigate = useNavigate();
  const toast = useToast();
  const confirm = useConfirm();

  useEffect(() => {
    const u = localStorage.getItem("user");
    if (!u) { navigate("/"); return; }
    const parsed = JSON.parse(u);
    if ((parsed.role || "").toLowerCase() !== "admin") { navigate("/"); return; }
    setUser(parsed);

    const token = localStorage.getItem('token') || '';
    setLoading(true);
    const base = import.meta.env.VITE_API_URL || 'http://localhost:5003';
    fetch(`${base}/api/admin/papers`, { headers: { Authorization: `Bearer ${token}` }})
      .then(r => r.json())
      .then(d => {
        if (d && d.success) setPapers(d.papers || []); else setError(d.error || 'Failed to load papers');
      })
      .catch(() => setError('Failed to load papers'))
      .finally(() => setLoading(false));
  }, [navigate]);

  const handleDelete = async (paper) => {
    const ok = await confirm({ title: 'Delete paper?', message: `Delete ${paper.subject} • ${paper.academicYear} • ${paper.course}?` });
    if (!ok) return;
    const token = localStorage.getItem('token') || '';
    const base = import.meta.env.VITE_API_URL || 'http://localhost:5003';
    const collegeParam = paper.college ? `?college=${encodeURIComponent(paper.college)}` : '';
    setDeletingId(paper.id);
    try {
      const res = await fetch(`${base}/api/college/upload/${encodeURIComponent(paper.course)}/${encodeURIComponent(paper.academicYear)}/${encodeURIComponent(paper.subject)}/${encodeURIComponent(paper.id)}${collegeParam}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json().catch(()=>({}));
      if (!res.ok) {
        const msg = data.error || 'Delete failed';
        toast.error(msg);
      } else {
        setPapers(prev => prev.filter(p => p.id !== paper.id));
        toast.success('Paper deleted');
      }
    } catch (e) {
      toast.error('Delete failed');
    } finally {
      setDeletingId("");
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Content Management</h1>
        <button onClick={() => navigate("/admin-dashboard")} className="px-4 py-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors">Back to Dashboard</button>
      </div>
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">All Question Papers</h2>
        {loading && <div className="text-gray-500 text-sm">Loading...</div>}
        {error && <div className="text-red-600 text-sm mb-3">{error}</div>}
        {!loading && papers.length === 0 && <div className="text-gray-500 text-sm">No papers found.</div>}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">College</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Course</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Year</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Paper Year</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">File</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {papers.map((p) => {
                const base = import.meta.env.VITE_API_URL || 'http://localhost:5003';
                const href = p.fileUrl?.startsWith('http') ? p.fileUrl : `${base}${p.fileUrl || ''}`;
                return (
                  <tr key={p.id}>
                    <td className="px-4 py-2 text-sm text-gray-700">{p.college}</td>
                    <td className="px-4 py-2 text-sm text-gray-700">{p.department}</td>
                    <td className="px-4 py-2 text-sm text-gray-700">{p.course}</td>
                    <td className="px-4 py-2 text-sm text-gray-700">{p.academicYear}</td>
                    <td className="px-4 py-2 text-sm text-gray-700">{p.subject}</td>
                    <td className="px-4 py-2 text-sm text-gray-700">{p.yearOfPaper || ''}</td>
                    <td className="px-4 py-2 text-sm"><a href={href} target="_blank" rel="noreferrer" className="text-blue-600 hover:text-blue-800">View</a></td>
                    <td className="px-4 py-2 text-sm">
                      <button
                        onClick={() => handleDelete(p)}
                        disabled={deletingId === p.id}
                        className="text-red-600 hover:text-red-800 disabled:opacity-50"
                      >
                        {deletingId === p.id ? 'Deleting…' : 'Delete'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}



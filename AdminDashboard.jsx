import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Users, 
  BookOpen, 
  FileText, 
  Settings, 
  BarChart3, 
  Shield,
  GraduationCap,
  LogOut
} from "lucide-react";
import { useToast } from "./ToastProvider.jsx";

export default function AdminDashboard() {
  const [user, setUser] = useState(null);
  const [colleges, setColleges] = useState([]);
  const [selectedCollege, setSelectedCollege] = useState("");
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalStudents: 0,
    totalTeachers: 0,
    totalAdmins: 0,
    totalPapers: 0
  });
  const [paperCount, setPaperCount] = useState(0);
  const navigate = useNavigate();
  const [recent, setRecent] = useState([]);
  const toast = useToast();
  const collegesFromRegister = [
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

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      navigate('/');
      return;
    }

    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== 'admin') {
      toast.error('Access denied. Admin privileges required.');
      navigate('/');
      return;
    }

    setUser(parsedUser);
    // Load colleges for admin filtering
    const base = import.meta.env.VITE_API_URL || 'http://localhost:5003';
    fetch(`${base}/api/college/colleges`)
      .then(r => r.json())
      .then(list => Array.isArray(list) && setColleges(list))
      .catch(() => {});

    // Fetch real stats (global)
    const token = localStorage.getItem('token') || '';
    fetch(`${base}/api/admin/stats`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(d => {
        if (d && d.success) setStats(d.stats);
      })
      .catch(() => {});

    // Papers count removed from portal

    fetch(`${base}/api/admin/recent-activity`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(d => {
        if (d && d.success) setRecent(d.recent || []);
      })
      .catch(() => {});
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/');
  };

  const StatCard = ({ title, value, icon, color }) => (
    <div className="bg-white rounded-lg shadow-md p-6 border-l-4" style={{ borderLeftColor: color }}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div className="text-3xl" style={{ color }}>
          {icon}
        </div>
      </div>
    </div>
  );

  const ActionCard = ({ title, description, icon, onClick, color }) => (
    <div 
      onClick={onClick}
      className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow duration-300 border-t-4"
      style={{ borderTopColor: color }}
    >
      <div className="flex items-center space-x-4">
        <div className="text-3xl" style={{ color }}>
          {icon}
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
      </div>
    </div>
  );

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <Shield className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-sm text-gray-600">Welcome back, {user.firstName}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">College:</span>
                <select
                  value={selectedCollege}
                  onChange={(e) => setSelectedCollege(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                >
                  <option value="">All Colleges</option>
                  {colleges.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* College Directory for Admin */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Colleges</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {collegesFromRegister.map((c) => (
              <div key={c} className="bg-white rounded-md border p-4 flex items-center justify-between">
                <div className="text-sm text-gray-800 mr-3 truncate" title={c}>{c}</div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => navigate(`/student-portal?college=${encodeURIComponent(c)}`)}
                    className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Student
                  </button>
                  <button
                    onClick={() => navigate(`/teacher-portal?college=${encodeURIComponent(c)}`)}
                    className="px-3 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50"
                  >
                    Teacher
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* Stats Overview */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">System Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Total Users"
              value={stats.totalUsers}
              icon={<Users />}
              color="#3B82F6"
            />
            <StatCard
              title="Students"
              value={stats.totalStudents}
              icon={<GraduationCap />}
              color="#10B981"
            />
            <StatCard
              title="Teachers"
              value={stats.totalTeachers}
              icon={<BookOpen />}
              color="#F59E0B"
            />
            <StatCard
              title="Admins"
              value={stats.totalAdmins}
              icon={<Shield />}
              color="#64748B"
            />
            {/* Papers stat removed */}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <ActionCard
              title="Student Portal"
              description="Access student portal and view student activities"
              icon={<GraduationCap />}
              onClick={() => navigate('/student-portal')}
              color="#10B981"
            />
            <ActionCard
              title="Teacher Portal"
              description="Access teacher portal and manage content"
              icon={<BookOpen />}
              onClick={() => navigate('/teacher-portal')}
              color="#F59E0B"
            />
            <ActionCard
              title="User Management"
              description="Manage users, roles, and permissions"
              icon={<Users />}
              onClick={() => navigate('/admin/users')}
              color="#3B82F6"
            />
            <ActionCard
              title="Content Management"
              description="Manage courses, subjects, and papers"
              icon={<BookOpen />}
              onClick={() => navigate('/admin/content')}
              color="#8B5CF6"
            />
            <ActionCard
              title="Analytics"
              description="View system usage and performance metrics"
              icon={<BarChart3 />}
              onClick={() => navigate('/admin/analytics')}
              color="#06B6D4"
            />
            <ActionCard
              title="System Settings"
              description="Configure system settings and preferences"
              icon={<Settings />}
              onClick={() => navigate('/admin/settings')}
              color="#6B7280"
            />
          </div>
        </div>

        {/* Recent Activity (live) */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
          <div className="space-y-3">
            {recent.length === 0 && (
              <div className="text-sm text-gray-500">No recent registrations yet.</div>
            )}
            {recent.map((u) => (
              <div key={u._id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">
                  New {u.role} registered: {u.firstName} {u.lastName} ({u.email})
                </span>
                <span className="text-xs text-gray-400 ml-auto">
                  {new Date(u.createdAt).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

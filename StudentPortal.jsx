import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLocation, useParams } from "react-router-dom";
import { useToast } from "./ToastProvider.jsx";
import {
  ArrowLeft,
  GraduationCap,
  Palette,
  Atom,
  Calculator,
  BookOpen,
  FileText,
  LogOut,
} from "lucide-react";

// Simple Button component
const Button = ({ children, onClick, size = "default", variant = "default", className = "", ...props }) => {
  const baseStyles =
    "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";

  const sizeStyles = {
    default: "h-10 py-2 px-4",
    sm: "h-9 px-3 rounded-md",
    lg: "h-11 px-8 rounded-md",
  };

  const variantStyles = {
    default: "bg-blue-600 text-white hover:bg-blue-700",
    outline: "border border-gray-300 bg-white hover:bg-gray-100 text-gray-700",
  };

  return (
    <button
      onClick={onClick}
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

// AcademicCard for streams/courses/subjects
const AcademicCard = ({ title, icon, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="group bg-white border-2 rounded-xl p-8 text-center cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg hover:border-blue-400"
    >
      <div className="text-6xl mb-4 text-blue-600 group-hover:scale-110 transition-transform duration-300">
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-gray-800 mb-2">{title}</h3>
    </div>
  );
};

// YearBadge for academic years
const YearBadge = ({ year, subjects, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="group bg-white border rounded-xl p-6 text-center cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg"
    >
      <div className="text-xl font-semibold text-gray-800 mb-2">{year}</div>
      <p className="text-sm text-gray-500 mb-4">{subjects.length} Subjects</p>

      {/* Subjects preview on hover */}
      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="text-xs text-gray-600">
          <div className="bg-gray-100 rounded-lg p-3 mt-3">
            <p className="font-medium mb-2">Subjects:</p>
            <ul className="space-y-1 text-left px-4">
              {subjects.slice(0, 3).map((subject, index) => (
                <li key={index}>• {subject}</li>
              ))}
              {subjects.length > 3 && <li>• +{subjects.length - 3} more</li>}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

// Example data
const collegeData = [
  {
    id: "arts",
    name: "Arts",
    icon: <Palette className="mx-auto" />,
    courses: [
      {
        id: "ba-english",
        name: "BA English Literature",
        subjects: {
          "First Year": ["Poetry", "Prose", "Drama", "Grammar"],
          "Second Year": ["Modern Literature", "Criticism", "World Literature"],
          "Third Year": ["Research Project", "Comparative Literature"],
        },
      },
    ],
  },
  {
    id: "science",
    name: "Science",
    icon: <Atom className="mx-auto" />,
    courses: [
      {
        id: "bsc-cs",
        name: "BSc Computer Science",
        subjects: {
          "First Year": ["Programming in C", "Maths"],
          "Second Year": ["Data Structures", "DBMS"],
          "Third Year": ["Networks", "Machine Learning"],
        },
      },
    ],
  },
  {
    id: "commerce",
    name: "Commerce",
    icon: <Calculator className="mx-auto" />,
    courses: [
      {
        id: "bcom",
        name: "B.Com",
        subjects: {
          "First Year": ["Accounting", "Economics"],
          "Second Year": ["Taxation", "Auditing"],
          "Third Year": ["Finance", "Business Law"],
        },
      },
    ],
  },
];

// RD National fallback catalog used if backend returns empty
const rdNationalFallback = {
  "Science": [
    "B.Sc Computer Science",
    "B.Sc Information Technology",
    "B.Sc Biotechnology",
    "B.Sc General Science"
  ],
  "Commerce & Management": [
    "B.Com (General)",
    "B.Com (Accounting & Finance)",
    "BMS (Bachelor of Management Studies)"
  ],
  "Arts / Humanities": [
    "B.A (General)",
    "B.A Multimedia & Mass Communication"
  ],
  yearsByCourse: {
    "B.Sc Computer Science": ["FY", "SY", "TY"],
    "B.Sc Information Technology": ["FY", "SY", "TY"],
    "B.Sc Biotechnology": ["FY", "SY", "TY"],
    "B.Sc General Science": ["FY", "SY", "TY"],
    "B.Com (General)": ["FY", "SY", "TY"],
    "B.Com (Accounting & Finance)": ["FY", "SY", "TY"],
    "BMS (Bachelor of Management Studies)": ["FY", "SY", "TY"],
    "B.A (General)": ["FY", "SY", "TY"],
    "B.A Multimedia & Mass Communication": ["FY", "SY", "TY"]
  },
  subjectsByCourseYear: {
    "B.A (General)": {
      "FY": [
        "English / Communication Skills",
        "Optional Subject A (e.g. History / Political Science)",
        "Optional Subject B (e.g. Economics / Psychology)",
        "Language / Second Language / Foundation Course"
      ],
      "SY": [
        "Core Subject A",
        "Core Subject B",
        "Electives / Minor Subjects",
        "Foundation / Soft Skills / Communication"
      ],
      "TY": [
        "Advanced Topics / Specialization in chosen subjects",
        "Dissertation / Project Work / Seminar",
        "Electives / Research Methodologies",
        "Practical / Presentation / Field Work (if any)"
      ]
    },
    "B.A Multimedia & Mass Communication": {
      "FY": [
        "Introduction to Communication / Media Studies",
        "Basics of Journalism",
        "English / Writing Skills",
        "Elective / Social Science Subject"
      ],
      "SY": [
        "Audio / Video Production Basics",
        "Media Ethics / Law",
        "Reporting / Editing Skills",
        "Electives (Design / Photography etc.)"
      ],
      "TY": [
        "Advertising / PR / Digital Media",
        "Project / Internship in Media Houses",
        "Specialization Electives (Film, Broadcast etc.)",
        "Research / Presentation / Portfolio"
      ]
    },
    "B.Sc Computer Science": {
      "FY": [
        "Programming Fundamentals",
        "Mathematics I",
        "Physics / Chemistry I",
        "English / Communication Skills"
      ],
      "SY": [
        "Data Structures",
        "Discrete Mathematics",
        "Electronics / Digital Logic",
        "Laboratory Work"
      ],
      "TY": [
        "Algorithms",
        "Operating Systems",
        "Project Work / Dissertation",
        "Electives (e.g. AI, Web Dev etc.)"
      ]
    },
    "B.Sc Information Technology": {
      "FY": [
        "Basics of IT / Computing",
        "Mathematics I",
        "Physics / Chemistry I",
        "English / Communication Skills"
      ],
      "SY": [
        "Database Systems",
        "Networking",
        "Web Technologies",
        "Laboratory Work"
      ],
      "TY": [
        "Software Engineering",
        "Mobile / Emerging Technologies",
        "Project Work",
        "Electives"
      ]
    },
    "B.Sc Biotechnology": {
      "FY": [
        "Biology / Cell Biology",
        "Chemistry I",
        "Mathematics / Statistics",
        "English / Communication Skills"
      ],
      "SY": [
        "Genetics / Microbiology",
        "Biochemistry",
        "Lab Techniques",
        "Electives / Minor Subjects"
      ],
      "TY": [
        "Molecular Biology",
        "Biotech Applications / Techniques",
        "Research / Project Work",
        "Electives"
      ]
    },
    "B.Sc General Science": {
      "FY": ["Physics I", "Chemistry I", "Mathematics I", "English"],
      "SY": ["Physics II", "Chemistry II", "Optional Subject I", "Optional Subject II"],
      "TY": ["Advanced Topics in Chosen Subjects", "Project / Dissertation", "Electives / Minor Subjects", "Practical Lab Work"]
    },
    "B.Com (General)": {
      "FY": ["Financial Accounting I", "Business Law / Organization", "Economics I / Microeconomics", "English / Business Communication"],
      "SY": ["Cost Accounting / Management Accounting", "Economics II / Macroeconomics", "Company Law / Business Regulations", "Optional Electives / Taxation Basics"],
      "TY": ["Advanced Accounting / Auditing", "Income Tax / GST / Indirect Taxes", "Project / Research Work", "Electives / Specialization"]
    },
    "B.Com (Accounting & Finance)": {
      "FY": ["Financial Accounting I", "Principles of Management", "Microeconomics", "English / Communication Skills"],
      "SY": ["Corporate Accounting", "Business Mathematics & Statistics", "Cost and Management Accounting", "Finance Basics / Banking"],
      "TY": ["Financial Markets / Investment Analysis", "Auditing / Taxation", "Project / Internship / Research", "Electives in Finance / Accounting"]
    },
    "BMS (Bachelor of Management Studies)": {
      "FY": ["Principles of Management", "Financial Accounting I", "Microeconomics / Economics I", "Business Communication / Soft Skills"],
      "SY": ["Organizational Behavior", "Marketing Principles", "Statistics for Business", "Human Resource / Operations Basics"],
      "TY": ["Strategic Management", "Business Finance / Investment", "Project / Case Studies", "Electives (e.g. Digital Marketing, Entrepreneurship etc.)"]
    }
  }
};

export default function StudentPortal() {
  const [currentView, setCurrentView] = useState("streams");
  const [selectedStream, setSelectedStream] = useState(null); // department name
  const [selectedCourse, setSelectedCourse] = useState(null); // course name (string)
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [user, setUser] = useState(null);
  const [papers, setPapers] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();
  const paramsRoute = useParams();
  const toast = useToast();
  const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5003';
  const collegeFromQuery = new URLSearchParams(location.search).get('college');
  const storedUserCollege = (() => { try { return JSON.parse(localStorage.getItem('user') || '{}').college || ''; } catch { return ''; } })();
  const resolvedCollegeName = (
    (collegeFromQuery ? decodeURIComponent(collegeFromQuery) : '') ||
    (user?.college && String(user.college)) ||
    storedUserCollege ||
    (paramsRoute.college ? decodeURIComponent(paramsRoute.college) : '') ||
    ''
  );

  // Normalize and unify department labels to avoid duplicates like
  // "Commerce" vs "Commerce & Management", or "Masters" vs "Postgraduate"
  const normalizeDeptKey = (s) => String(s || '').toLowerCase().replace(/[^a-z]+/g, '');
  const unifyDeptLabel = (s) => {
    const n = normalizeDeptKey(s);
    if (n.includes('commerce')) return 'Commerce & Management';
    if (n.includes('postgraduate') || n.includes('masters') || n === 'pg') return 'Postgraduate';
    if (n.includes('arts') || n.includes('humanities')) return 'Arts / Humanities';
    if (n.includes('science')) return 'Science';
    return s;
  };

  // Backend-driven lists
  const [departments, setDepartments] = useState([]); // [{ _id, name }]
  const [courses, setCourses] = useState([]); // [string]
  const [years, setYears] = useState([]); // ["FY","SY","TY"] etc.
  const [subjects, setSubjects] = useState([]); // [string]
  const [yearToSubjectCount, setYearToSubjectCount] = useState({});
  const [departmentsLoading, setDepartmentsLoading] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      navigate('/');
      return;
    }

    const parsedUser = JSON.parse(userData);
    // Allow students and admins to access student portal
    if (parsedUser.role !== 'student' && parsedUser.role !== 'admin') {
      toast.error('Access denied. Student portal is only accessible to students and admins.');
      navigate('/');
      return;
    }

    // If admin navigates with ?college=XYZ, scope portal to that college
    if (parsedUser.role === 'admin' && collegeFromQuery) {
      parsedUser.college = decodeURIComponent(collegeFromQuery);
    }

    setUser(parsedUser);
  }, [navigate, collegeFromQuery]);

  // Load departments on mount
  useEffect(() => {
    const base = import.meta.env.VITE_API_URL || 'http://localhost:5003';
    const load = async () => {
      setDepartmentsLoading(true);
      try {
        const collegeFromRoute = paramsRoute.college ? decodeURIComponent(paramsRoute.college) : null;
        const collegeParam = (collegeFromRoute || user?.college) ? `?college=${encodeURIComponent(collegeFromRoute || user?.college)}` : '';
        let res = await fetch(`${base}/api/college/departments${collegeParam}`);
        let data = await res.json();
        if (!Array.isArray(data) || data.length === 0) {
          // Fallback: try without college filter
          res = await fetch(`${base}/api/college/departments`);
          data = await res.json();
        }
        // Unify and de-duplicate department labels while preserving a valid original name
        const rawList = (Array.isArray(data) ? data : [])
          .map(d => (typeof d === 'string' ? { name: d } : { name: d?.name }))
          .filter(d => d && d.name);
        const seen = new Set();
        const unique = [];
        for (const item of rawList) {
          const display = unifyDeptLabel(item.name);
          const key = normalizeDeptKey(display);
          if (seen.has(key)) continue;
          seen.add(key);
          unique.push({ name: item.name, display });
        }
        setDepartments(unique);
      } catch {
        setDepartments([]);
      } finally {
        setDepartmentsLoading(false);
      }
    };
    load();
  }, [user, paramsRoute.college]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/');
  };

  // Helpers to reconcile deletions without waiting for network
  const paperKeyOf = (p) => (p?._id || p?.id || (typeof p?.fileUrl === 'string' ? decodeURIComponent((p.fileUrl.split('/').pop() || '')) : ''));
  const removeByKeys = (keys = []) => {
    if (!Array.isArray(keys) || keys.length === 0) return;
    setPapers(prev => prev.filter(p => !keys.includes(paperKeyOf(p))));
  };

  // Helper: refresh papers for the currently selected Course • Year • Subject
  const refreshCurrentPapers = async () => {
    try {
      const base = import.meta.env.VITE_API_URL || 'http://localhost:5003';
      const courseName = typeof selectedCourse === 'string' ? selectedCourse : selectedCourse?.name;
      if (!courseName || !selectedYear || !selectedSubject) return;
      const collegeFromRoute = paramsRoute.college ? decodeURIComponent(paramsRoute.college) : null;
      const collegeVal = collegeFromRoute || user?.college || '';
      const collegeParam = collegeVal ? `?college=${encodeURIComponent(collegeVal)}` : '';
      const sep = collegeParam ? '&' : '?';
      const url = `${base}/api/college/courses/${encodeURIComponent(courseName)}/${encodeURIComponent(selectedYear)}/${encodeURIComponent(selectedSubject)}${collegeParam}${sep}_=${Date.now()}`;
      let r = await fetch(url, { cache: 'no-store' });
      let data = await r.json();
      if (!Array.isArray(data)) data = [];
      setPapers(data);
    } catch {
      setPapers([]);
    }
  };

  // Listen for teacher portal updates (upload/delete) and refresh if it matches current selection
  useEffect(() => {
    let bc;
    try {
      if ('BroadcastChannel' in window) {
        bc = new BroadcastChannel('papers-updates');
        bc.onmessage = (ev) => {
          const { type, course, year, subject, key, keys } = ev?.data || {};
          const courseName = typeof selectedCourse === 'string' ? selectedCourse : selectedCourse?.name;
          const eq = (a, b) => String(a || '').toLowerCase() === String(b || '').toLowerCase();
          if (type && course && year && subject && courseName && currentView === 'papers') {
            if (eq(course, courseName) && eq(year, selectedYear) && eq(subject, selectedSubject)) {
              // immediate UI reconcile
              if (type.includes('deleted')) {
                if (Array.isArray(keys) && keys.length) removeByKeys(keys);
                else if (key) removeByKeys([key]);
              }
              refreshCurrentPapers();
            }
          }
        };
      }
    } catch {}

    const onStorage = (e) => {
      if (e.key === 'teacherChange') {
        try {
          const payload = JSON.parse(e.newValue || '{}');
          const { type, course, year, subject, key, keys } = payload || {};
          const courseName = typeof selectedCourse === 'string' ? selectedCourse : selectedCourse?.name;
          const eq = (a, b) => String(a || '').toLowerCase() === String(b || '').toLowerCase();
          if (type && course && year && subject && courseName && currentView === 'papers') {
            if (eq(course, courseName) && eq(year, selectedYear) && eq(subject, selectedSubject)) {
              if (String(type || '').includes('deleted')) {
                if (Array.isArray(keys) && keys.length) removeByKeys(keys);
                else if (key) removeByKeys([key]);
              }
              refreshCurrentPapers();
            }
          }
        } catch {}
      }
    };
    window.addEventListener('storage', onStorage);
    const onCustom = (e) => {
      try {
        const { type, course, year, subject, key, keys } = (e && e.detail) || {};
        const courseName = typeof selectedCourse === 'string' ? selectedCourse : selectedCourse?.name;
        const eq = (a, b) => String(a || '').toLowerCase() === String(b || '').toLowerCase();
        if (type && course && year && subject && courseName && currentView === 'papers') {
          if (eq(course, courseName) && eq(year, selectedYear) && eq(subject, selectedSubject)) {
            if (String(type || '').includes('deleted')) {
              if (Array.isArray(keys) && keys.length) removeByKeys(keys);
              else if (key) removeByKeys([key]);
            }
            refreshCurrentPapers();
          }
        }
      } catch {}
    };
    window.addEventListener('papers-updated', onCustom);
    return () => {
      if (bc) try { bc.close(); } catch {}
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('papers-updated', onCustom);
    };
  }, [selectedCourse, selectedYear, selectedSubject, currentView, user?.college]);

  const handleStreamSelect = async (dept) => {
    let deptName = typeof dept === 'string' ? dept : dept?.name;
    // Map common labels from static fallback to backend department names
    if (deptName === 'Arts') deptName = 'Arts / Humanities';
    if (deptName === 'Commerce') deptName = 'Commerce & Management';
    if (deptName === 'Masters') deptName = 'Postgraduate';
    setSelectedStream(deptName);
    setSelectedCourse(null);
    setSelectedYear("");
    setSelectedSubject("");
    setSubjects([]);
    setPapers([]);
    setCurrentView("courses");
    const base = import.meta.env.VITE_API_URL || 'http://localhost:5003';
    try {
      const collegeParam = user?.college ? `?college=${encodeURIComponent(user.college)}` : '';
      let res = await fetch(`${base}/api/college/departments/${encodeURIComponent(deptName)}${collegeParam}`);
      let data = await res.json();
      if (!Array.isArray(data) || data.length === 0) {
        // Fallback: try without college filter
        res = await fetch(`${base}/api/college/departments/${encodeURIComponent(deptName)}`);
        data = await res.json();
      }
      const names = Array.isArray(data) ? data.map((c) => (typeof c === 'string' ? c : c?.name)).filter(Boolean) : [];
      setCourses(names);
    } catch {
      setCourses([]);
    }
  };

  const handleCourseSelect = async (course) => {
    const courseName = typeof course === 'string' ? course : course?.name;
    setSelectedCourse(courseName);
    setSelectedYear("");
    setSelectedSubject("");
    setSubjects([]);
    setPapers([]);
    setCurrentView("years");
    const base = import.meta.env.VITE_API_URL || 'http://localhost:5003';
    try {
      const collegeParam = user?.college ? `?college=${encodeURIComponent(user.college)}` : '';
      let res = await fetch(`${base}/api/college/courses/${encodeURIComponent(courseName)}${collegeParam}`);
      let data = await res.json();
      if (!Array.isArray(data) || data.length === 0) {
        res = await fetch(`${base}/api/college/courses/${encodeURIComponent(courseName)}`);
        data = await res.json();
      }
      const fallbackYears = rdNationalFallback.yearsByCourse[courseName] || [];
      const yearsList = (Array.isArray(data) && data.length ? data : fallbackYears) || [];
      setYears(yearsList);
      // Load subject counts per year so UI reflects backend
      const counts = {};
      for (const y of yearsList) {
        try {
          let sres = await fetch(`${base}/api/college/courses/${encodeURIComponent(courseName)}/${encodeURIComponent(y)}${collegeParam}`);
          let sdata = await sres.json();
          if (!Array.isArray(sdata) || sdata.length === 0) {
            sres = await fetch(`${base}/api/college/courses/${encodeURIComponent(courseName)}/${encodeURIComponent(y)}`);
            sdata = await sres.json();
          }
          counts[y] = Array.isArray(sdata) ? sdata.length : 0;
        } catch {
          counts[y] = 0;
        }
      }
      setYearToSubjectCount(counts);
    } catch {
      const fallbackYears = rdNationalFallback.yearsByCourse[courseName] || [];
      setYears(fallbackYears);
      setYearToSubjectCount({});
    }
  };

  const handleYearSelect = async (year) => {
    setSelectedYear(year);
    setSelectedSubject("");
    setPapers([]);
    setCurrentView("subjects");
    const base = import.meta.env.VITE_API_URL || 'http://localhost:5003';
    try {
      const collegeParam = user?.college ? `?college=${encodeURIComponent(user.college)}` : '';
      let res = await fetch(`${base}/api/college/courses/${encodeURIComponent(selectedCourse)}/${encodeURIComponent(year)}${collegeParam}`);
      let data = await res.json();
      if (!Array.isArray(data) || data.length === 0) {
        res = await fetch(`${base}/api/college/courses/${encodeURIComponent(selectedCourse)}/${encodeURIComponent(year)}`);
        data = await res.json();
      }
      const apiSubjects = Array.isArray(data) ? data.map(s => s.name) : [];
      const fallbackSubjects = rdNationalFallback.subjectsByCourseYear[selectedCourse]?.[year] || [];
      setSubjects(apiSubjects.length ? apiSubjects : fallbackSubjects);
    } catch {
      const fallbackSubjects = rdNationalFallback.subjectsByCourseYear[selectedCourse]?.[year] || [];
      setSubjects(fallbackSubjects);
    }
  };

  const handleSubjectSelect = (subject) => {
    setSelectedSubject(subject);
    setCurrentView("papers");
    // Load papers from backend for this course/year/subject
    try {
      const base = import.meta.env.VITE_API_URL || 'http://localhost:5003';
      const courseName = typeof selectedCourse === 'string' ? selectedCourse : selectedCourse?.name;
      if (!courseName || !selectedYear || !subject) {
        setPapers([]);
        return;
      }
      const collegeFromRoute = paramsRoute.college ? decodeURIComponent(paramsRoute.college) : null;
      const collegeVal = collegeFromRoute || user?.college || '';
      const collegeParam = collegeVal ? `?college=${encodeURIComponent(collegeVal)}` : '';
      const sep = collegeParam ? '&' : '?';
      fetch(`${base}/api/college/courses/${encodeURIComponent(courseName)}/${encodeURIComponent(selectedYear)}/${encodeURIComponent(subject)}${collegeParam}${sep}_=${Date.now()}`, { cache: 'no-store' })
        .then(async r => {
          let data = await r.json();
          if (!Array.isArray(data)) {
            const r2 = await fetch(`${base}/api/college/courses/${encodeURIComponent(courseName)}/${encodeURIComponent(selectedYear)}/${encodeURIComponent(subject)}?_=${Date.now()}`, { cache: 'no-store' });
            data = await r2.json();
          }
          setPapers(Array.isArray(data) ? data : []);
        })
        .catch(() => setPapers([]));
    } catch {
      setPapers([]);
    }
  };

  const handleBack = () => {
    switch (currentView) {
      case "courses":
        setCurrentView("streams");
        setSelectedStream(null);
        break;
      case "years":
        setCurrentView("courses");
        setSelectedCourse(null);
        break;
      case "subjects":
        setCurrentView("years");
        setSelectedYear("");
        break;
      case "papers":
        setCurrentView("subjects");
        setSelectedSubject("");
        break;
      default:
        break;
    }
  };

  const questionPapers = ["2024", "2023", "2022", "2021", "2020"]; // deprecated

  // If deep-linked with course/year/subject, preselect them
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const course = params.get('course');
    const year = params.get('year');
    const subject = params.get('subject');
    if (course) {
      // Use backend to fetch directly
      setSelectedCourse(course);
      setCurrentView(year ? (subject ? 'papers' : 'subjects') : 'years');
      if (year) setSelectedYear(year);
      if (subject) {
        setSelectedSubject(subject);
        const base = import.meta.env.VITE_API_URL || 'http://localhost:5003';
        fetch(`${base}/api/college/courses/${encodeURIComponent(course)}/${encodeURIComponent(year)}/${encodeURIComponent(subject)}`)
          .then(r => r.json())
          .then(data => Array.isArray(data) ? setPapers(data) : setPapers([]))
          .catch(() => setPapers([]));
      }
    }
  }, [location.search]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="text-white shadow-md bg-gradient-to-b from-rose-700 to-rose-600">
        <div className="max-w-7xl mx-auto px-6 py-8">

            <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {currentView !== "streams" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBack}
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              )}
              <div>
                <h1 className="text-3xl font-bold flex items-center gap-3">
                  <GraduationCap className="w-8 h-8" />
                  {resolvedCollegeName || 'Student'} - Student Portal
                </h1>
                <p className="text-white/80 mt-2">
                  Exam Repository & Management System
                </p>
              </div>
            </div>
            {user && (
              <div className="flex items-center gap-4">
                <span className="text-white/90">
                  Welcome, {user.firstName} {user.role === 'admin' && '(Admin)'}
                </span>
                {user.role === 'admin' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate('/admin-dashboard')}
                    className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                  >
                    Admin Dashboard
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {currentView === "streams" && (
          <div>
            <div className="text-center mb-12">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Select Academic Stream
              </h2>
              <p className="text-gray-600">
                Choose your field of study to access course materials
              </p>
            </div>
            {/* Breadcrumb */}
            <div className="text-gray-400 text-sm -mt-8 mb-6 text-left">Portal</div>
            {departmentsLoading ? (
              <div className="text-center text-gray-500">Loading streams...</div>
            ) : (
              <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                {departments.length > 0 ? (
                  departments.map((d) => (
                    <div
                      key={d._id || d.name}
                      onClick={() => handleStreamSelect(d.name)}
                      className="group bg-white border-2 rounded-xl p-8 text-center cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg border-blue-200"
                    >
                      <div className="text-rose-700 mb-4 group-hover:scale-110 transition-transform duration-300">
                        <GraduationCap className="mx-auto w-8 h-8" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-800">{d.display || d.name}</h3>
                    </div>
                  ))
                ) : (
                  <>
                    <div
                      onClick={() => handleStreamSelect(collegeData.find(s=>s.id==='arts'))}
                      className="group bg-white border-2 rounded-xl p-8 text-center cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg border-orange-200"
                    >
                      <div className="text-rose-700 mb-4 group-hover:scale-110 transition-transform duration-300">
                        <Palette className="mx-auto w-8 h-8" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-800">Arts</h3>
                    </div>
                    <div
                      onClick={() => handleStreamSelect(collegeData.find(s=>s.id==='science'))}
                      className="group bg-white border-2 rounded-xl p-8 text-center cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg border-blue-200"
                    >
                      <div className="text-rose-700 mb-4 group-hover:scale-110 transition-transform duration-300">
                        <Atom className="mx-auto w-8 h-8" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-800">Science</h3>
                    </div>
                    <div
                      onClick={() => handleStreamSelect(collegeData.find(s=>s.id==='commerce'))}
                      className="group bg-white border-2 rounded-xl p-8 text-center cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg border-green-200"
                    >
                      <div className="text-rose-700 mb-4 group-hover:scale-110 transition-transform duration-300">
                        <Calculator className="mx-auto w-8 h-8" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-800">Commerce</h3>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {currentView === "courses" && selectedStream && (
          <div>
            <div className="text-center mb-12">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                {selectedStream} Courses
              </h2>
              <p className="text-gray-600">
                Select your course to view academic years
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.length === 0 ? (
                ((rdNationalFallback[selectedStream] || []).length > 0 ? (
                  rdNationalFallback[selectedStream].map((course) => (
                    <AcademicCard
                      key={course}
                      title={course}
                      icon={<BookOpen className="mx-auto" />}
                      onClick={() => handleCourseSelect(course)}
                    />
                  ))
                ) : (
                  <div className="text-center text-gray-500 col-span-3">No courses found for {selectedStream}.</div>
                ))
              ) : courses.map((course) => (
                <AcademicCard
                  key={course}
                  title={course}
                  icon={<BookOpen className="mx-auto" />}
                  onClick={() => handleCourseSelect(course)}
                />
              ))}
            </div>
          </div>
        )}

        {currentView === "years" && selectedCourse && (
          <div>
            <div className="text-center mb-12">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                {typeof selectedCourse === 'string' ? selectedCourse : selectedCourse?.name} - Academic Years
              </h2>
              <p className="text-gray-600">Hover over a year to see subjects</p>
            </div>
            <div className="flex justify-center gap-8 flex-wrap">
              {years.map((year) => (
                <YearBadge
                  key={year}
                  year={year}
                  subjects={new Array(yearToSubjectCount[year] || 0).fill('')}
                  onClick={() => handleYearSelect(year)}
                />
              ))}
            </div>
              </div>
        )}

        {currentView === "subjects" && selectedCourse && selectedYear && (
          <div>
            <div className="text-center mb-12">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                {typeof selectedCourse === 'string' ? selectedCourse : selectedCourse?.name} - {selectedYear}
              </h2>
              <div className="flex items-center justify-center gap-3 mb-2">
                <p className="text-gray-600">Select a subject to view available materials</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="ml-2"
                  onClick={() => handleYearSelect(selectedYear)}
                >
                  Refresh
                </Button>
              </div>
              <p className="text-sm text-gray-500">{subjects.length} Subjects</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {subjects.map((subject, index) => (
                <AcademicCard
                  key={index}
                  title={subject}
                  icon={<FileText className="mx-auto" />}
                  onClick={() => handleSubjectSelect(subject)}
                />
              ))}
            </div>
          </div>
        )}

        {currentView === "papers" && selectedSubject && (
          <div>
            <div className="text-center mb-12">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                {selectedSubject} - Question Papers
              </h2>
              <p className="text-gray-600">{papers.length > 0 ? 'Available question papers' : 'No papers uploaded yet for this subject.'}</p>
            </div>
            {papers.length > 0 ? (
              <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-6 max-w-4xl mx-auto">
                {papers.map((p, idx) => {
                  const fileHref = typeof p.fileUrl === 'string'
                    ? (p.fileUrl.startsWith('http') ? p.fileUrl : `${apiBase}${p.fileUrl}`)
                    : '#';
                  return (
                  <a key={idx} href={fileHref} target="_blank" rel="noreferrer" className="bg-white border rounded-lg p-6 text-center hover:shadow-lg transition-all duration-300 hover:scale-105">
                    <div className="text-3xl font-bold text-blue-600 mb-2">{p.year || 'Paper'}</div>
                    <p className="text-sm text-gray-500 mb-4">Question Paper (PDF)</p>
                    <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-700 text-white">View / Download</Button>
                  </a>
                )})}
              </div>
            ) : (
              <div className="text-center text-gray-500">No papers uploaded yet for this subject.</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

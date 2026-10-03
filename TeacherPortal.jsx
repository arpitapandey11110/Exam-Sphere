import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { 
  Upload, 
  FileText, 
  Users, 
  Settings, 
  LogOut,
  GraduationCap,
  BookOpen,
  BarChart3
} from "lucide-react";
import { useToast } from "./ToastProvider.jsx";
import { useConfirm, usePrompt } from "./ConfirmProvider.jsx";

export default function TeacherPortal() {
  const [files, setFiles] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [years, setYears] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loadingDepts, setLoadingDepts] = useState(false);
  const [deptError, setDeptError] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [loadingPapers, setLoadingPapers] = useState(false);
  const [editingIndex, setEditingIndex] = useState(-1);
  const [editYear, setEditYear] = useState("");
  const [editFile, setEditFile] = useState(null);
  const [bulkDeleting, setBulkDeleting] = useState(false);

  const [selectedDept, setSelectedDept] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [paperYear, setPaperYear] = useState("");
  const [user, setUser] = useState(null);
  const [persistedStats, setPersistedStats] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('teacherPortalStats') || '{}');
    } catch {
      return {};
    }
  });
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const confirm = useConfirm();
  const prompt = usePrompt();
  // Helper: fetch papers for a given selection and update files list
  const fetchPapersFor = async (courseName, yearName, subjectName) => {
    if (!courseName || !yearName) return;
    try {
      setLoadingPapers(true);
      const base = import.meta.env.VITE_API_URL || 'http://localhost:5003';
      // If no subject provided, aggregate across all subjects for this course/year
      let subjectsToFetch = [];
      if (!subjectName) {
        try {
          const collegeParam = user?.college ? `?college=${encodeURIComponent(user.college)}` : '';
          let subRes = await fetch(`${base}/api/college/courses/${encodeURIComponent(courseName)}/${encodeURIComponent(yearName)}${collegeParam}`);
          let subData = await subRes.json();
          if (!Array.isArray(subData) || subData.length === 0) {
            subRes = await fetch(`${base}/api/college/courses/${encodeURIComponent(courseName)}/${encodeURIComponent(yearName)}`);
            subData = await subRes.json();
          }
          subjectsToFetch = Array.isArray(subData) ? subData.map(s => s.name) : [];
        } catch {}
      } else {
        subjectsToFetch = [subjectName];
      }

      const allPapers = [];
      for (const subj of subjectsToFetch) {
        try {
          const collegeParam = user?.college ? `?college=${encodeURIComponent(user.college)}` : '';
          let res = await fetch(`${base}/api/college/courses/${encodeURIComponent(courseName)}/${encodeURIComponent(yearName)}/${encodeURIComponent(subj)}${collegeParam}`);
          let data = await res.json();
          if (!Array.isArray(data) || data.length === 0) {
            // Fallback without college filter
            res = await fetch(`${base}/api/college/courses/${encodeURIComponent(courseName)}/${encodeURIComponent(yearName)}/${encodeURIComponent(subj)}`);
            data = await res.json();
          }
          (Array.isArray(data) ? data : []).forEach(p => {
          const name = typeof p.fileUrl === 'string' ? decodeURIComponent(p.fileUrl.split('/').pop() || 'paper.pdf') : 'paper.pdf';
          const pid = p?._id || p?.id || p?.paperId || null;
          allPapers.push({ id: pid, name, url: p.fileUrl, paperYear: p.year, course: courseName, year: yearName, subject: subj, uploadedAt: '' });
          });
        } catch {}
      }
      // If subject not provided and no subjects fetched (edge case), keep current files
      setFiles(allPapers);
    } catch {
      setFiles([]);
    } finally {
      setLoadingPapers(false);
    }
  };

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      navigate('/');
      return;
    }

    const parsedUser = JSON.parse(userData);
    // If admin navigates with ?college=XYZ, scope portal to that college
    const params = new URLSearchParams(location.search);
    const collegeFromQuery = params.get('college');
    if (collegeFromQuery && parsedUser.role === 'admin') {
      parsedUser.college = collegeFromQuery;
    }
    // Allow teachers and admins to access teacher portal
    if (parsedUser.role !== 'teacher' && parsedUser.role !== 'admin') {
      toast.error('Access denied. Teacher portal is only accessible to teachers and admins.');
      navigate('/');
      return;
    }

    setUser(parsedUser);
  }, [navigate, location.search]);

  useEffect(() => {
    // Load departments scoped by user's college if provided
    const base = import.meta.env.VITE_API_URL || 'http://localhost:5003';
    const load = async () => {
      setDeptError("");
      setLoadingDepts(true);
      try {
        const collegeParam = user?.college ? `?college=${encodeURIComponent(user.college)}` : '';
        let res = await fetch(`${base}/api/college/departments${collegeParam}`);
        let data = await res.json();
        if (!Array.isArray(data) || data.length === 0) {
          // Fallback without college scope
          res = await fetch(`${base}/api/college/departments`);
          data = await res.json();
        }
        const list = Array.isArray(data) ? data : [];
        if (list.length === 0) setDeptError('No departments found. Seed the database or remove college filter.');
        setDepartments(list);
      } catch (e) {
        setDepartments([]);
        setDeptError('Failed to load departments. Check server.');
      } finally {
        setLoadingDepts(false);
      }
    };
    load();
  }, [navigate, user]);

  // Persist selection to localStorage whenever it changes
  useEffect(() => {
    const selection = {
      dept: selectedDept,
      course: selectedCourse,
      year: selectedYear,
      subject: selectedSubject,
    };
    localStorage.setItem('teacherPortalSelection', JSON.stringify(selection));
  }, [selectedDept, selectedCourse, selectedYear, selectedSubject]);

  // Persist dashboard stats (counts) whenever they change
  useEffect(() => {
    const stats = {
      uploadedFiles: files.length,
      courses: courses.length,
      subjects: subjects.length,
    };
    localStorage.setItem('teacherPortalStats', JSON.stringify(stats));
    setPersistedStats(stats);
  }, [files.length, courses.length, subjects.length]);

  const reloadDepartmentsWithoutCollege = async () => {
    try {
      setLoadingDepts(true);
      setDeptError("");
      const base = import.meta.env.VITE_API_URL || 'http://localhost:5003';
      const res = await fetch(`${base}/api/college/departments`);
      const data = await res.json();
      setDepartments(Array.isArray(data) ? data : []);
    } catch {
      setDeptError('Retry failed.');
    } finally {
      setLoadingDepts(false);
    }
  };

  // If query params are present, preselect dept/course
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const dept = params.get('dept');
    const course = params.get('course');
    const base = import.meta.env.VITE_API_URL || 'http://localhost:5003';
    async function hydrate() {
      if (dept) {
        setSelectedDept(dept);
        try {
          const res = await fetch(`${base}/api/college/departments/${encodeURIComponent(dept)}`);
          const data = await res.json();
          setCourses(data || []);
          if (course && data?.includes(course)) {
            setSelectedCourse(course);
            const yrRes = await fetch(`${base}/api/college/courses/${encodeURIComponent(course)}`);
            const yr = await yrRes.json();
            setYears(yr || []);
          }
        } catch {}
      } else {
        // No query params: attempt to restore last selection from localStorage
        try {
          const savedRaw = localStorage.getItem('teacherPortalSelection');
          if (savedRaw) {
            const saved = JSON.parse(savedRaw);
            if (saved?.dept) {
              setSelectedDept(saved.dept);
              try {
                const res = await fetch(`${base}/api/college/departments/${encodeURIComponent(saved.dept)}`);
                const data = await res.json();
                setCourses(Array.isArray(data) ? data : []);
                if (saved?.course && data?.includes(saved.course)) {
                  setSelectedCourse(saved.course);
                  const yrRes = await fetch(`${base}/api/college/courses/${encodeURIComponent(saved.course)}`);
                  const yr = await yrRes.json();
                  setYears(Array.isArray(yr) ? yr : []);
                  if (saved?.year) setSelectedYear(saved.year);
                  if (saved?.subject) setSelectedSubject(saved.subject);
                  // Immediately fetch papers so dashboard counts reflect server state
                  if (saved?.year) fetchPapersFor(saved.course, saved.year, saved.subject || undefined);
                }
              } catch {}
            }
          }
        } catch {}
      }
    }
    hydrate();
  }, [location.search]);

  // If course and year are restored but subjects list is empty, fetch subjects to keep stats updated
  useEffect(() => {     
    async function ensureSubjects() {
      if (!selectedCourse || !selectedYear || subjects.length > 0) return;
      try {
        const base = import.meta.env.VITE_API_URL || 'http://localhost:5003';
        const collegeParam = user?.college ? `?college=${encodeURIComponent(user.college)}` : '';
        let res = await fetch(`${base}/api/college/courses/${encodeURIComponent(selectedCourse)}/${encodeURIComponent(selectedYear)}${collegeParam}`);
        let data = await res.json();
        if (!Array.isArray(data) || data.length === 0) {
          res = await fetch(`${base}/api/college/courses/${encodeURIComponent(selectedCourse)}/${encodeURIComponent(selectedYear)}`);
          data = await res.json();
        }
        setSubjects(Array.isArray(data) ? data.map(s => s.name) : []);
      } catch {}
    }
    ensureSubjects();
  }, [selectedCourse, selectedYear, user?.college, subjects.length]);

const handleDeptChange = async (e) => {
  const deptName = e.target.value;
  if (deptName === "__add__") {
    const name = await prompt({ title: 'New department', placeholder: 'Department name' });
    setSelectedDept("");
    if (!name) return;
    try {
      const base = import.meta.env.VITE_API_URL || 'http://localhost:5003';
      const college = user?.college || '';
      await fetch(`${base}/api/college/departments`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` }, body: JSON.stringify({ name, college }) });
      const res = await fetch(`${base}/api/college/departments${college ? `?college=${encodeURIComponent(college)}` : ''}`);
      const data = await res.json();
      setDepartments(Array.isArray(data) ? data : []);
      toast.success('Department added');
    } catch {
      toast.error('Failed to add department');
    }
    return;
  }
  setSelectedDept(deptName);
  setSelectedCourse("");
  setSelectedYear("");
  setSelectedSubject("");
  setCourses([]);
  setYears([]);
  setSubjects([]);
  if (!deptName) return;
  try {
    const base = import.meta.env.VITE_API_URL || 'http://localhost:5003';
    const collegeParam = user?.college ? `?college=${encodeURIComponent(user.college)}` : '';
    let res = await fetch(`${base}/api/college/departments/${encodeURIComponent(deptName)}${collegeParam}`);
    let data = await res.json();
    if (!Array.isArray(data) || data.length === 0) {
      res = await fetch(`${base}/api/college/departments/${encodeURIComponent(deptName)}`);
      data = await res.json();
    }
    setCourses(Array.isArray(data) ? data : []);
  } catch (e) {
    toast.error('Failed to load courses');
  }
};

  const handleCourseChange = async (e) => {
    const courseName = e.target.value;
    if (courseName === "__add__") {
      const name = await prompt({ title: 'New course', placeholder: 'Course name' });
      setSelectedCourse("");
      setSelectedYear("");
      setSelectedSubject("");
      setYears([]);
      setSubjects([]);
      if (!name || !selectedDept) return;
      try {
        const base = import.meta.env.VITE_API_URL || 'http://localhost:5003';
        const collegeParam = user?.college ? `?college=${encodeURIComponent(user.college)}` : '';
        await fetch(`${base}/api/college/departments/${encodeURIComponent(selectedDept)}/courses${collegeParam}`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` }, body: JSON.stringify({ name }) });
        const res = await fetch(`${base}/api/college/departments/${encodeURIComponent(selectedDept)}${collegeParam}`);
        const data = await res.json();
        setCourses(Array.isArray(data) ? data : []);
        toast.success('Course added');
      } catch {
        toast.error('Failed to add course');
      }
      return;
    }
    setSelectedCourse(courseName);
    setSelectedYear("");
    setSelectedSubject("");
    setYears([]);
    setSubjects([]);
    if (!courseName) return;
    try {
      const base = import.meta.env.VITE_API_URL || 'http://localhost:5003';
      const collegeParam = user?.college ? `?college=${encodeURIComponent(user.college)}` : '';
      let res = await fetch(`${base}/api/college/courses/${encodeURIComponent(courseName)}${collegeParam}`);
      let data = await res.json();
      if (!Array.isArray(data) || data.length === 0) {
        res = await fetch(`${base}/api/college/courses/${encodeURIComponent(courseName)}`);
        data = await res.json();
      }
      setYears(Array.isArray(data) ? data : []);
    } catch {}
  };

  const handleCoursePick = async (courseName) => {
    setSelectedCourse(courseName);
    setSelectedYear("");
    setSelectedSubject("");
    setYears([]);
    setSubjects([]);
    if (!courseName) return;
    try {
      const base = import.meta.env.VITE_API_URL || 'http://localhost:5003';
      const collegeParam = user?.college ? `?college=${encodeURIComponent(user.college)}` : '';
      const res = await fetch(`${base}/api/college/courses/${encodeURIComponent(courseName)}${collegeParam}`);
      const data = await res.json();
      setYears(data);
    } catch {}
  };

  const handleYearChange = async (e) => {
    const y = e.target.value;
    if (y === "__add__") {
      // Create a new year bucket
      const label = await prompt({ title: 'New year label', placeholder: 'e.g., FY, SY, TY or First Year' });
      if (!label || !selectedCourse) return;
      try {
        const base = import.meta.env.VITE_API_URL || 'http://localhost:5003';
        const collegeParam = user?.college ? `?college=${encodeURIComponent(user.college)}` : '';
        let resp = await fetch(`${base}/api/college/courses/${encodeURIComponent(selectedCourse)}/years${collegeParam}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
          body: JSON.stringify({ year: label })
        });
        if (!resp.ok) {
          // Fallback without college scoping
          resp = await fetch(`${base}/api/college/courses/${encodeURIComponent(selectedCourse)}/years`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
            body: JSON.stringify({ year: label })
          });
        }
        if (!resp.ok) {
          const err = await resp.json().catch(()=>({}));
          toast.error(err.error || 'Failed to add year');
          return;
        }
        // server returns updated years list
        let data;
        try {
          data = await resp.json();
        } catch {
          const res = await fetch(`${base}/api/college/courses/${encodeURIComponent(selectedCourse)}${collegeParam}`);
          data = await res.json();
        }
        const ys = Array.isArray(data?.years) ? data.years : (Array.isArray(data) ? data : []);
        setYears(ys);
        setSelectedYear(label);
        setSelectedSubject("");
        setSubjects([]);
        toast.success('Year added');
      } catch (e) {
        toast.error('Failed to add year');
      }
      return;
    }
    setSelectedYear(y);
    setSelectedSubject("");
    setSubjects([]);
    if (!selectedCourse || !y) return;
    try {
      const base = import.meta.env.VITE_API_URL || 'http://localhost:5003';
      const collegeParam = user?.college ? `?college=${encodeURIComponent(user.college)}` : '';
      let res = await fetch(`${base}/api/college/courses/${encodeURIComponent(selectedCourse)}/${encodeURIComponent(y)}${collegeParam}`);
      let data = await res.json();
      if (!Array.isArray(data) || data.length === 0) {
        res = await fetch(`${base}/api/college/courses/${encodeURIComponent(selectedCourse)}/${encodeURIComponent(y)}`);
        data = await res.json();
      }
      setSubjects(Array.isArray(data) ? data.map(s => s.name) : []);
    } catch {}
  };

  const handleSubjectChange = async (e) => {
    const val = e.target.value;
    if (val === "__add__") {
      const name = await prompt({ title: 'New subject', placeholder: 'Subject name' });
      if (!name || !selectedCourse || !selectedYear) return;
      try {
        const base = import.meta.env.VITE_API_URL || 'http://localhost:5003';
        const collegeParam = user?.college ? `?college=${encodeURIComponent(user.college)}` : '';
        let resp = await fetch(`${base}/api/college/courses/${encodeURIComponent(selectedCourse)}/${encodeURIComponent(selectedYear)}/subjects${collegeParam}`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` }, body: JSON.stringify({ name }) });
        if (!resp.ok) {
          // fallback without college
          resp = await fetch(`${base}/api/college/courses/${encodeURIComponent(selectedCourse)}/${encodeURIComponent(selectedYear)}/subjects`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` }, body: JSON.stringify({ name }) });
        }
        if (!resp.ok) {
          const err = await resp.json().catch(()=>({}));
          toast.error(err.error || 'Failed to add subject');
          return;
        }
        let data;
        try {
          data = await resp.json();
        } catch {
          let res = await fetch(`${base}/api/college/courses/${encodeURIComponent(selectedCourse)}/${encodeURIComponent(selectedYear)}${collegeParam}`);
          data = await res.json();
        }
        const subs = Array.isArray(data?.subjects) ? data.subjects : (Array.isArray(data) ? data.map(d=>d.name) : []);
        setSubjects(subs);
        setSelectedSubject(name);
        toast.success('Subject added');
      } catch {
        toast.error('Failed to add subject');
      }
      return;
    }
    setSelectedSubject(val);
  };

  // Load existing papers for selected course/year/subject
  useEffect(() => {
    async function loadPapers() {
      if (!selectedCourse || !selectedYear || !selectedSubject) {
        setFiles([]);
        return;
      }
      try {
        setLoadingPapers(true);
        const base = import.meta.env.VITE_API_URL || 'http://localhost:5003';
        const collegeParam = user?.college ? `?college=${encodeURIComponent(user.college)}` : '';
        const res = await fetch(`${base}/api/college/courses/${encodeURIComponent(selectedCourse)}/${encodeURIComponent(selectedYear)}/${encodeURIComponent(selectedSubject)}${collegeParam}`);
        let data = await res.json();
        if (!Array.isArray(data)) data = [];
        const mapped = data.map(p => {
          const name = typeof p.fileUrl === 'string' ? decodeURIComponent(p.fileUrl.split('/').pop() || 'paper.pdf') : 'paper.pdf';
          return {
            id: p._id || p.id || p.paperId || null,
            name,
            url: p.fileUrl,
            paperYear: p.year,
            course: selectedCourse,
            year: selectedYear,
            subject: selectedSubject,
            uploadedAt: ''
          };
        });
        setFiles(mapped);
      } catch (e) {
        setFiles([]);
      } finally {
        setLoadingPapers(false);
      }
    }
    loadPapers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCourse, selectedYear, selectedSubject, user?.college]);

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    const fileInput = document.getElementById('file-upload-input');
    const file = selectedFile || fileInput.files?.[0];
    if (!selectedCourse || !selectedYear || !selectedSubject || !file) {
      toast.error('Please select course, year, subject and choose a PDF.');
      return;
    }
    if (file.type !== 'application/pdf') {
      toast.error('Only PDF files are allowed.');
      return;
    }
    const token = localStorage.getItem('token');
    const form = new FormData();
    form.append('paper', file);
    if (paperYear) form.append('paperYear', paperYear);
    const base = import.meta.env.VITE_API_URL || 'http://localhost:5003';
    if (user?.college) form.append('college', user.college);
    setUploading(true);
    const res = await fetch(`${base}/api/college/upload/${encodeURIComponent(selectedCourse)}/${encodeURIComponent(selectedYear)}/${encodeURIComponent(selectedSubject)}`,
      { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: form });
    const data = await res.json();
    if (res.ok) {
      setFiles(prev => [
        ...prev,
        {
          name: file.name,
          size: file.size,
          url: data?.paper?.fileUrl,
          id: (data?.paper?._id || data?.paper?.id || data?.paper?.paperId || null),
          paperYear: data?.paper?.year,
          course: selectedCourse,
          year: selectedYear,
          subject: selectedSubject,
          uploadedAt: new Date().toISOString()
        }
      ]);
      fileInput.value = '';
      setSelectedFile(null);
      setUploading(false);
      try {
        // Notify other tabs (Student Portal) to refresh papers list
        localStorage.setItem('teacherUpload', String(Date.now()));
        if ('BroadcastChannel' in window) {
          const bc = new BroadcastChannel('papers-updates');
          bc.postMessage({ type: 'uploaded', course: selectedCourse, year: selectedYear, subject: selectedSubject, at: Date.now() });
          bc.close();
        }
      } catch {}
      toast.success('Uploaded successfully');
    } else {
      setUploading(false);
      toast.error(data.error || 'Upload failed');
    }
  };

  const handleDeleteAll = async () => {
    if (!files.length) return;
    const count = files.filter(f => f.id || (f.url && (f.url.split('/').pop() || '').length > 0)).length;
    if (count === 0) { toast.error('No deletable papers found.'); return; }
    const title = 'Delete all papers?';
    const message = `Delete all ${count} papers for ${selectedCourse || ''}${selectedYear ? ' • ' + selectedYear : ''}${selectedSubject ? ' • ' + selectedSubject : ''}?`;
    const ok = await confirm({ title, message });
    if (!ok) return;
    setBulkDeleting(true);
    const token = localStorage.getItem('token') || '';
    const base = import.meta.env.VITE_API_URL || 'http://localhost:5003';
    const collegeParam = user?.college ? `?college=${encodeURIComponent(user.college)}` : '';
    let success = 0;
    const toDelete = files.filter(f => f.id || (f.url && (f.url.split('/').pop() || '').length > 0));
    const keys = toDelete.map(f => f.id || decodeURIComponent((f.url || '').split('/').pop() || ''));
    for (const f of toDelete) {
      try {
        const paperKey = f.id || decodeURIComponent((f.url || '').split('/').pop() || '');
        const res = await fetch(`${base}/api/college/upload/${encodeURIComponent(f.course)}/${encodeURIComponent(f.year)}/${encodeURIComponent(f.subject)}/${encodeURIComponent(paperKey)}${collegeParam}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` }});
        if (res.ok) success++;
      } catch {}
    }
    setFiles(prev => prev.filter(f => {
      const key = f.id || decodeURIComponent((f.url || '').split('/').pop() || '');
      return !toDelete.some(td => (td.id || decodeURIComponent((td.url || '').split('/').pop() || '')) === key);
    }));
    setBulkDeleting(false);
    if (success > 0) {
      try {
        localStorage.setItem('teacherChange', JSON.stringify({ type: 'bulk-deleted', course: selectedCourse, year: selectedYear, subject: selectedSubject, keys, at: Date.now() }));
        if ('BroadcastChannel' in window) {
          const bc = new BroadcastChannel('papers-updates');
          bc.postMessage({ type: 'bulk-deleted', course: selectedCourse, year: selectedYear, subject: selectedSubject, keys, at: Date.now() });
          bc.close();
        }
        try { window.dispatchEvent(new CustomEvent('papers-updated', { detail: { type: 'bulk-deleted', course: selectedCourse, year: selectedYear, subject: selectedSubject, keys, at: Date.now() } })); } catch {}
      } catch {}
      toast.success(`Deleted ${success} of ${toDelete.length} papers`);
    }
    else toast.error('No papers deleted');
  };

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
              <GraduationCap className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{user?.college || 'Teacher'} - Teacher Portal</h1>
                <p className="text-sm text-gray-600">Welcome back, {user.firstName} {user.role === 'admin' && '(Admin)'}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {user.role === 'admin' && (
                <button
                  onClick={() => navigate('/admin-dashboard')}
                  className="px-4 py-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors"
                >
                  Admin Dashboard
                </button>
              )}
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
        {/* Stats Overview */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Dashboard</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Uploaded Files"
              value={files.length || persistedStats.uploadedFiles || 0}
              icon={<FileText />}
              color="#3B82F6"
            />
            
            <StatCard
              title="Courses Loaded"
              value={courses.length || persistedStats.courses || 0}
              icon={<BookOpen />}
              color="#F59E0B"
            />
            <StatCard
              title="Subjects"
              value={subjects.length || persistedStats.subjects || 0}
              icon={<BarChart3 />}
              color="#EF4444"
            />
          </div>
        </div>

        {/* File Upload Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Upload Question Paper</h2>
          <p className="text-gray-600 mb-4">Select course, year, subject, and upload a PDF paper.</p>

          <form onSubmit={handleUploadSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <select value={selectedDept} onChange={handleDeptChange} className="border rounded-md p-2" disabled={loadingDepts}>
                <option value="">Select Department</option>
                {Array.from(new Set(departments.map(d => (typeof d === 'string' ? d : d?.name)).filter(Boolean))).map((name) => (
                  <option key={name} value={name}>{name}</option>
                ))}
                <option value="__add__">+ Add Department…</option>
              </select>
              
              {selectedDept && (
                <button type="button" className="border rounded-md px-3 py-2 text-sm" onClick={async () => {
                  const ok = await confirm({ title: 'Remove department?', message: 'This will remove the department and everything inside it.' });
                  if (!ok) return;
                  const base = import.meta.env.VITE_API_URL || 'http://localhost:5003';
                  const collegeParam = user?.college ? `?college=${encodeURIComponent(user.college)}` : '';
                  await fetch(`${base}/api/college/departments/${encodeURIComponent(selectedDept)}${collegeParam}`, { method: 'DELETE', headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
                  setSelectedDept("");
                  setSelectedCourse("");
                  setSelectedYear("");
                  setSelectedSubject("");
                  const res = await fetch(`${base}/api/college/departments${collegeParam}`);
                  const data = await res.json();
                  setDepartments(Array.isArray(data) ? data : []);
                  toast.success('Department removed');
                }}>Remove Department</button>
              )}
              {departments.length === 0 && (
                <div className="md:col-span-2 text-sm text-gray-500 flex items-center gap-3">
                  <span>{deptError || 'No departments available yet.'}</span>
                  <button type="button" onClick={reloadDepartmentsWithoutCollege} className="px-2 py-1 border rounded-md hover:bg-gray-50">Retry</button>
                </div>
              )}
              <select value={selectedCourse} onChange={handleCourseChange} className="border rounded-md p-2" disabled={!selectedDept}>
                <option value="">Select Course</option>
                {courses.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
                <option value="__add__">+ Add Course…</option>
              </select>
              
              {selectedCourse && (
                <button type="button" className="border rounded-md px-3 py-2 text-sm" onClick={async () => {
                  const ok = await confirm({ title: 'Remove course?', message: 'This will remove this course and all its years/subjects.' });
                  if (!ok) return;
                  const base = import.meta.env.VITE_API_URL || 'http://localhost:5003';
                  const collegeParam = user?.college ? `?college=${encodeURIComponent(user.college)}` : '';
                  await fetch(`${base}/api/college/departments/${encodeURIComponent(selectedDept)}/courses/${encodeURIComponent(selectedCourse)}${collegeParam}`, { method: 'DELETE', headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
                  setSelectedCourse("");
                  setYears([]);
                  setSubjects([]);
                  const res = await fetch(`${base}/api/college/departments/${encodeURIComponent(selectedDept)}${collegeParam}`);
                  const data = await res.json();
                  setCourses(Array.isArray(data) ? data : []);
                  toast.success('Course removed');
                }}>Remove Course</button>
              )}
              {selectedDept && courses.length > 0 && (
                <div className="md:col-span-2 flex flex-wrap gap-2">
                  {courses.map((c) => (
                    <button
                      type="button"
                      key={c}
                      onClick={() => handleCoursePick(c)}
                      className={`px-3 py-1 rounded-md border ${selectedCourse === c ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'}`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              )}
              <select value={selectedYear} onChange={handleYearChange} className="border rounded-md p-2" disabled={!selectedCourse}>
                <option value="">Select Year</option>
                {years.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
                <option value="__add__">+ Add Year…</option>
              </select>
              {/* Add Year handled in handleYearChange */}
              {selectedYear && (
                <button type="button" className="border rounded-md px-3 py-2 text-sm" onClick={async () => {
                  const ok = await confirm({ title: 'Remove year?', message: 'This will remove this year and all its subjects.' });
                  if (!ok) return;
                  const base = import.meta.env.VITE_API_URL || 'http://localhost:5003';
                  const collegeParam = user?.college ? `?college=${encodeURIComponent(user.college)}` : '';
                  await fetch(`${base}/api/college/courses/${encodeURIComponent(selectedCourse)}/years/${encodeURIComponent(selectedYear)}${collegeParam}`, { method: 'DELETE', headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
                  setSelectedYear("");
                  setSubjects([]);
                  const res = await fetch(`${base}/api/college/courses/${encodeURIComponent(selectedCourse)}${collegeParam}`);
                  const data = await res.json();
                  setYears(Array.isArray(data) ? data : []);
                  toast.success('Year removed');
                }}>Remove Year</button>
              )}
              <select value={selectedSubject} onChange={handleSubjectChange} className="border rounded-md p-2" disabled={!selectedYear}>
                <option value="">Select Subject</option>
                {subjects.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
                <option value="__add__">+ Add Subject…</option>
              </select>
              {/* Add Subject handled in handleSubjectChange */}
              {selectedSubject && (
                <button type="button" className="border rounded-md px-3 py-2 text-sm" onClick={async () => {
                  const ok = await confirm({ title: 'Remove subject?', message: `Remove ${selectedSubject} from ${selectedCourse} • ${selectedYear}?` });
                  if (!ok) return;
                  const base = import.meta.env.VITE_API_URL || 'http://localhost:5003';
                  const collegeParam = user?.college ? `?college=${encodeURIComponent(user.college)}` : '';
                  await fetch(`${base}/api/college/courses/${encodeURIComponent(selectedCourse)}/${encodeURIComponent(selectedYear)}/subjects/${encodeURIComponent(selectedSubject)}${collegeParam}`, { method: 'DELETE', headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
                  setSelectedSubject("");
                  let res = await fetch(`${base}/api/college/courses/${encodeURIComponent(selectedCourse)}/${encodeURIComponent(selectedYear)}${collegeParam}`);
                  let data = await res.json();
                  if (!Array.isArray(data) || data.length === 0) {
                    res = await fetch(`${base}/api/college/courses/${encodeURIComponent(selectedCourse)}/${encodeURIComponent(selectedYear)}`);
                    data = await res.json();
                  }
                  setSubjects(Array.isArray(data) ? data.map(d => d.name) : []);
                  toast.success('Subject removed');
                }}>Remove Subject</button>
              )}
              <input type="number" placeholder="Paper Year (e.g. 2024)" className="border rounded-md p-2" value={paperYear} onChange={e=>setPaperYear(e.target.value)} />
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                <Upload className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                <input type="file" accept="application/pdf" className="hidden" id="file-upload-input" onChange={(e)=> setSelectedFile(e.target.files?.[0] || null)} />
                <label htmlFor="file-upload-input" className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
                  Choose PDF
                </label>
                {selectedFile && (
                  <div className="mt-3 text-sm text-gray-700">
                    <div className="font-medium">Selected:</div>
                    <div>{selectedFile.name} ({(selectedFile.size/1024/1024).toFixed(2)} MB)</div>
                    <button
                      type="button"
                      className="mt-2 inline-flex items-center px-3 py-1 text-xs border rounded-md hover:bg-gray-50"
                      onClick={() => {
                        setSelectedFile(null);
                        const el = document.getElementById('file-upload-input');
                        if (el) el.value = '';
                      }}
                    >
                      Clear
                    </button>
                  </div>
                )}
              </div>
            </div>
            <div>
              <button type="submit" disabled={uploading} className={`px-6 py-2 rounded-md text-white ${uploading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'}`}>{uploading ? 'Uploading...' : 'Upload'}</button>
            </div>
          </form>
        </div>

        {/* Uploaded Files */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Uploaded Files</h2>
            <button
              type="button"
              onClick={handleDeleteAll}
              disabled={bulkDeleting || files.length === 0}
              className="px-3 py-1 text-sm border rounded-md hover:bg-gray-50 disabled:opacity-50"
            >
              {bulkDeleting ? 'Deleting…' : 'Delete All'}
            </button>
          </div>
          {loadingPapers && <div className="text-gray-500 text-sm">Loading papers...</div>}
          {!loadingPapers && files.length === 0 && (
            <div className="text-gray-500 text-sm">No papers uploaded yet for the current selection.</div>
          )}
          <div className="space-y-3">
            {files.map((file, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <FileText className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-900 font-medium">{file.name}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500">{file.size ? (file.size / 1024).toFixed(1) + ' KB' : ''}</span>
                      {file.url && (
                        (() => {
                          const base = import.meta.env.VITE_API_URL || 'http://localhost:5003';
                          const href = file.url.startsWith('http') ? file.url : `${base}${file.url}`;
                          return (
                            <a className="text-blue-600 hover:text-blue-800 text-sm" href={href} target="_blank" rel="noreferrer">View</a>
                          );
                        })()
                      )}
                      {(() => {
                        const paperKey = file.id || (file.url ? decodeURIComponent((file.url.split('/').pop() || '')) : '');
                        if (!paperKey || editingIndex === index) return null;
                        return (
                          <button
                            type="button"
                            onClick={() => {
                              setEditingIndex(index);
                              setEditYear(file.paperYear || "");
                              setEditFile(null);
                            }}
                            className="text-gray-700 hover:text-gray-900 text-sm"
                          >
                            Edit
                          </button>
                        );
                      })()}
                      {(() => {
                        const paperKey = file.id || (file.url ? decodeURIComponent((file.url.split('/').pop() || '')) : '');
                        if (!paperKey) return null;
                        return (
                          <button
                            type="button"
                            onClick={async () => {
                              const ok = await confirm({ title: 'Delete paper?', message: `Delete ${file.name} • ${file.subject} (${file.year})?` });
                              if (!ok) return;
                              const base = import.meta.env.VITE_API_URL || 'http://localhost:5003';
                              const collegeParam = user?.college ? `?college=${encodeURIComponent(user.college)}` : '';
                              try {
                                const resp = await fetch(`${base}/api/college/upload/${encodeURIComponent(file.course)}/${encodeURIComponent(file.year)}/${encodeURIComponent(file.subject)}/${encodeURIComponent(paperKey)}${collegeParam}`, { method: 'DELETE', headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }});
                                if (!resp.ok) {
                                  const e = await resp.json().catch(()=>({}));
                                  toast.error(e.error || 'Delete failed');
                                  return;
                                }
                                setFiles(prev => prev.filter((_, i) => i !== index));
                                try {
                                  localStorage.setItem('teacherChange', JSON.stringify({ type: 'deleted', course: file.course, year: file.year, subject: file.subject, key: paperKey, at: Date.now() }));
                                  if ('BroadcastChannel' in window) {
                                    const bc = new BroadcastChannel('papers-updates');
                                    bc.postMessage({ type: 'deleted', course: file.course, year: file.year, subject: file.subject, key: paperKey, at: Date.now() });
                                    bc.close();
                                  }
                                  try { window.dispatchEvent(new CustomEvent('papers-updated', { detail: { type: 'deleted', course: file.course, year: file.year, subject: file.subject, key: paperKey, at: Date.now() } })); } catch {}
                                } catch {}
                                toast.success('Paper deleted');
                              } catch {}
                            }}
                            className="text-red-600 hover:text-red-800 text-sm"
                          >
                            Delete
                          </button>
                        );
                      })()}
                    </div>
                  </div>
                  <div className="mt-1 text-xs text-gray-500">
                    <span>{file.course} • {file.year} • {file.subject}</span>
                    {file.paperYear ? <span> • Paper Year: {file.paperYear}</span> : null}
                  </div>

                  {editingIndex === index && (
                    <div className="mt-3 p-3 bg-white rounded border border-gray-200">
                      <div className="grid md:grid-cols-3 gap-3 items-center">
                        <input
                          type="number"
                          placeholder="Paper Year (e.g. 2024)"
                          className="border rounded-md p-2"
                          value={editYear}
                          onChange={(e) => setEditYear(e.target.value)}
                        />
                        <div>
                          <input
                            type="file"
                            accept="application/pdf"
                            onChange={(e) => setEditFile(e.target.files?.[0] || null)}
                            className="block text-sm"
                          />
                        </div>
                        <div className="flex gap-2 justify-end">
                          <button
                            type="button"
                            className="px-3 py-1 text-sm border rounded-md hover:bg-gray-50"
                            onClick={() => { setEditingIndex(-1); setEditFile(null); }}
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            className="px-3 py-1 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700"
                            onClick={async () => {
                              const token = localStorage.getItem('token');
                              if (!token) { toast.error('Not authenticated'); return; }
                              const base = import.meta.env.VITE_API_URL || 'http://localhost:5003';
                              const collegeParam = user?.college ? `?college=${encodeURIComponent(user.college)}` : '';
                              const form = new FormData();
                              if (editYear) form.append('paperYear', String(editYear));
                              if (editFile) {
                                if (editFile.type !== 'application/pdf') { toast.error('Only PDF files are allowed.'); return; }
                                form.append('paper', editFile);
                              }
                              try {
                                const paperKey = file.id || (file.url ? decodeURIComponent((file.url.split('/').pop() || '')) : '');
                                const res = await fetch(`${base}/api/college/upload/${encodeURIComponent(file.course)}/${encodeURIComponent(file.year)}/${encodeURIComponent(file.subject)}/${encodeURIComponent(paperKey)}${collegeParam}`, { method: 'PUT', headers: { Authorization: `Bearer ${token}` }, body: form });
                                const data = await res.json();
                                if (!res.ok) { toast.error(data.error || 'Update failed'); return; }
                                setFiles(prev => prev.map((f, i) => i === index ? {
                                  ...f,
                                  paperYear: data?.paper?.year ?? f.paperYear,
                                  url: data?.paper?.fileUrl ?? f.url,
                                  name: data?.paper?.fileUrl ? decodeURIComponent((data.paper.fileUrl.split('/').pop() || f.name)) : f.name
                                } : f));
                                setEditingIndex(-1);
                                setEditFile(null);
                                toast.success('Paper updated');
                              } catch (e) {
                                toast.error('Update failed');
                              }
                            }}
                          >
                            Save
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow">
              <div className="flex items-center space-x-3">
                <BookOpen className="w-8 h-8 text-blue-600" />
                <div>
                  <h3 className="font-semibold text-gray-900">Manage Courses</h3>
                  <p className="text-sm text-gray-600">Add or edit course content</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow">
              <div className="flex items-center space-x-3">
                <Settings className="w-8 h-8 text-gray-600" />
                <div>
                  <h3 className="font-semibold text-gray-900">Settings</h3>
                  <p className="text-sm text-gray-600">Account preferences</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
    }
  

import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import { collegeData } from "../data";
import { ArrowLeft, FileText, Download, Calendar, BookOpen, ChevronRight, Search, Filter } from "lucide-react";
import axios from "axios";

export default function PapersPage() {
  const { streamId, courseId, year } = useParams();
  const navigate = useNavigate();
  const [streamData, setStreamData] = useState(null);
  const [courseData, setCourseData] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const foundStream = collegeData.streams.find(
      (s) => s.id === streamId
    );
    if (foundStream) {
      setStreamData(foundStream);
      const foundCourse = foundStream.courses.find(
        (c) => c.id === courseId
      );
      if (foundCourse) {
        setCourseData(foundCourse);
        setSubjects(foundCourse.subjects[year] || []);
      }
    }
  }, [streamId, courseId, year]);

  const fetchPapers = useCallback(async () => {
    if (!courseData) return;
    try {
      setLoading(true);
      setError("");
      const base = import.meta.env.VITE_API_URL || "http://localhost:5003";
      const courseName = courseData.name;
      let subjectsRes = await axios.get(
        `${base}/api/college/courses/${encodeURIComponent(courseName)}/${encodeURIComponent(year)}`
      );
      const subjectObjs = Array.isArray(subjectsRes.data) ? subjectsRes.data : [];
      const subjectNames = subjectObjs.map((s) => (typeof s === 'string' ? s : s?.name)).filter(Boolean);
      const allPapers = [];
      for (const subj of subjectNames) {
        try {
          const papersRes = await axios.get(
            `${base}/api/college/courses/${encodeURIComponent(courseName)}/${encodeURIComponent(year)}/${encodeURIComponent(subj)}`
          );
          const arr = Array.isArray(papersRes.data) ? papersRes.data : [];
          for (const p of arr) {
            const filename = typeof p.fileUrl === 'string' ? decodeURIComponent(p.fileUrl.split('/').pop() || 'paper.pdf') : '';
            allPapers.push({
              id: p._id || `${subj}-${p.year}-${filename}`,
              title: filename || `${subj} Paper`,
              subject: subj,
              year: p.year,
              filename,
              fileUrl: p.fileUrl,
              course: courseName,
            });
          }
        } catch {}
      }
      setPapers(allPapers);
    } catch (e) {
      setError(e?.response?.data?.error || e.message || "Failed to load papers");
      setPapers([]);
    } finally {
      setLoading(false);
    }
  }, [courseData, year]);

  useEffect(() => {
    fetchPapers();
  }, [fetchPapers]);

  // Auto-refresh when tab regains focus or when Teacher Portal signals an upload via localStorage
  useEffect(() => {
    const onFocus = () => fetchPapers();
    const onStorage = (e) => {
      if (e.key === 'teacherUpload') fetchPapers();
    };
    window.addEventListener('visibilitychange', onFocus);
    window.addEventListener('storage', onStorage);
    // BroadcastChannel support for instant updates
    let bc;
    try {
      if ('BroadcastChannel' in window) {
        bc = new BroadcastChannel('papers-updates');
        bc.onmessage = (msg) => {
          const payload = msg?.data || {};
          // Optionally filter by current course/year
          if (!payload?.course || !courseData) return fetchPapers();
          const sameCourse = String(payload.course).toLowerCase() === String(courseData.name).toLowerCase();
          const sameYear = String(payload.year).toLowerCase() === String(year).toLowerCase();
          if (sameCourse && sameYear) fetchPapers();
        };
      }
    } catch {}
    return () => {
      window.removeEventListener('visibilitychange', onFocus);
      window.removeEventListener('storage', onStorage);
      try { if (bc) bc.close(); } catch {}
    };
  }, [fetchPapers]);

  if (!streamData || !courseData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading papers...</p>
        </div>
      </div>
    );
  }

  const getStreamColor = (variant) => {
    const colors = {
      arts: {
        gradient: "from-blue-400 to-blue-600",
        accent: "text-blue-600",
        bg: "bg-blue-50",
        border: "border-blue-200"
      },
      science: {
        gradient: "from-blue-400 to-blue-600",
        accent: "text-blue-600",
        bg: "bg-blue-50",
        border: "border-blue-200"
      },
      commerce: {
        gradient: "from-blue-400 to-blue-600",
        accent: "text-blue-600",
        bg: "bg-blue-50",
        border: "border-blue-200"
      }
    };
    return colors[variant] || colors.arts;
  };

  const colors = getStreamColor(streamData.variant);
  const years = Object.keys(courseData.subjects);
  const availableYears = collegeData.questionPapers;
  const normalizedSelectedYear = selectedYear || year;

  // Filter papers by course/year if metadata present
  const filteredPapers = papers.filter(p => {
    const matchesYear = normalizedSelectedYear ? String(p.year) === String(normalizedSelectedYear) : true;
    const matchesCourse = courseData?.name ? (p.course ? String(p.course).toLowerCase().includes(courseData.name.toLowerCase()) : true) : true;
    const matchesSubject = searchTerm ? (p.subject ? String(p.subject).toLowerCase().includes(searchTerm.toLowerCase()) : false) : true;
    return matchesYear && matchesCourse && matchesSubject;
  });

  const handleDownload = (filename, fileUrl) => {
    const base = import.meta.env.VITE_API_URL || "http://localhost:5003";
    const url = fileUrl?.startsWith('/uploads/') ? `${base}${fileUrl}` : `${base}/uploads/${filename}`;
    window.open(url, "_blank");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-blue-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center mb-6">
            <button
              onClick={() => navigate(`/subjects/${streamId}/${courseId}`)}
              className="flex items-center gap-2 text-white/80 hover:text-white transition-colors duration-300"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Subjects
            </button>
          </div>
          <h1 className="text-4xl font-bold mb-4">{courseData.name} - {year} Year</h1>
          <p className="text-xl text-blue-100">
            Access past question papers for all subjects
          </p>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <nav className="flex items-center space-x-2 text-sm text-gray-600">
            <button 
              onClick={() => navigate('/')}
              className="hover:text-blue-600 transition-colors duration-300"
            >
              Home
            </button>
            <ChevronRight className="w-4 h-4" />
            <button 
              onClick={() => navigate('/streams')}
              className="hover:text-blue-600 transition-colors duration-300"
            >
              Streams
            </button>
            <ChevronRight className="w-4 h-4" />
            <button 
              onClick={() => navigate(`/courses/${streamId}`)}
              className="hover:text-blue-600 transition-colors duration-300"
            >
              {streamData.name}
            </button>
            <ChevronRight className="w-4 h-4" />
            <button 
              onClick={() => navigate(`/subjects/${streamId}/${courseId}`)}
              className="hover:text-blue-600 transition-colors duration-300"
            >
              {courseData.name}
            </button>
            <ChevronRight className="w-4 h-4" />
            <span className="text-blue-600 font-medium">{year} Year</span>
          </nav>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="py-8 bg-white border-b">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search subjects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-gray-400" />
                <span className="text-sm text-gray-600">Filter by year:</span>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Years</option>
                  {availableYears.map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
              <button
                onClick={fetchPapers}
                className="px-3 py-2 rounded-md border text-sm hover:bg-gray-50"
                title="Reload papers"
              >
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Papers List */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">Available Papers</h2>
          {loading ? (
            <div className="text-center text-gray-600">Loading papers…</div>
          ) : error ? (
            <div className="text-center text-red-600">{error}</div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredPapers.length === 0 ? (
                <div className="md:col-span-2 lg:col-span-3 text-center text-gray-600">No papers found.</div>
              ) : (
                filteredPapers.map((p) => (
                  <div key={p.id} className="bg-white rounded-xl shadow border hover:shadow-lg transition p-6">
                    <div className={`h-16 ${colors.bg} rounded flex items-center px-4 mb-4`}>
                      <BookOpen className={`w-6 h-6 ${colors.accent} mr-2`} />
                      <div className="font-semibold text-gray-800 truncate">{p.title}</div>
                    </div>
                    <div className="text-sm text-gray-600 mb-1">Subject: {p.subject}</div>
                    <div className="text-sm text-gray-600 mb-4">Year: {p.year || '-'}</div>
                    <button
                      onClick={() => handleDownload(p.filename, p.fileUrl)}
                      className="w-full inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                    >
                      <Download className="w-4 h-4" /> Download
                    </button>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">
            Study Resources
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center group">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-200 transition-colors duration-300">
                <FileText className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Past Papers</h3>
              <p className="text-gray-600 text-sm">5 years of question papers for each subject</p>
            </div>
            <div className="text-center group">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-200 transition-colors duration-300">
                <Download className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Easy Download</h3>
              <p className="text-gray-600 text-sm">Quick and easy access to all resources</p>
            </div>
            <div className="text-center group">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-200 transition-colors duration-300">
                <Calendar className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Year-wise Access</h3>
              <p className="text-gray-600 text-sm">Organized by academic years for easy navigation</p>
            </div>
            <div className="text-center group">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-200 transition-colors duration-300">
                <BookOpen className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Comprehensive</h3>
              <p className="text-gray-600 text-sm">Complete coverage of all subjects and topics</p>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="py-16 bg-blue-600">
        <div className="max-w-4xl mx-auto px-6 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Need Help with Your Studies?</h2>
          <p className="text-xl text-blue-100 mb-8">
            Our comprehensive collection of past papers will help you excel in your exams.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => navigate('/streams')}
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors duration-300"
            >
              Explore Other Streams
            </button>
            <button 
              onClick={() => navigate('/')}
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors duration-300"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

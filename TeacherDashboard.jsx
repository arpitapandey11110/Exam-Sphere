import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Upload, FileText, Users, BookOpen, Search, Download, Eye, Edit, Trash2, BarChart3, Clock, CheckCircle } from "lucide-react";
import { collegeData } from "../data";

export default function TeacherDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedStream, setSelectedStream] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [files, setFiles] = useState([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Mock data for uploaded files
  useEffect(() => {
    const mockFiles = [
      {
        id: 1,
        name: "Mathematics Assignment 1.pdf",
        type: "pdf",
        size: "2.3 MB",
        stream: "science",
        course: "bsc-cs",
        year: "First Year",
        subject: "Mathematics",
        uploadedAt: "2024-01-15",
        downloads: 45,
        status: "published"
      },
      {
        id: 2,
        name: "Physics Lab Manual.docx",
        type: "docx",
        size: "1.8 MB",
        stream: "science",
        course: "bsc-physics",
        year: "Second Year",
        subject: "Physics",
        uploadedAt: "2024-01-14",
        downloads: 32,
        status: "published"
      },
      {
        id: 3,
        name: "Economics Notes.pdf",
        type: "pdf",
        size: "3.1 MB",
        stream: "arts",
        course: "ba-economics",
        year: "First Year",
        subject: "Microeconomics",
        uploadedAt: "2024-01-13",
        downloads: 28,
        status: "draft"
      }
    ];
    setFiles(mockFiles);
  }, []);

  const getFileIcon = (type) => {
    const icons = {
      pdf: <FileText className="w-8 h-8 text-blue-500" />,
      docx: <FileText className="w-8 h-8 text-blue-600" />,
      pptx: <FileText className="w-8 h-8 text-blue-700" />,
      xlsx: <FileText className="w-8 h-8 text-blue-500" />,
      jpg: <FileText className="w-8 h-8 text-blue-600" />,
      png: <FileText className="w-8 h-8 text-blue-600" />,
      default: <FileText className="w-8 h-8 text-gray-500" />
    };
    return icons[type] || icons.default;
  };

  const getStatusColor = (status) => {
    const colors = {
      published: "bg-blue-100 text-blue-800",
      draft: "bg-blue-200 text-blue-900",
      archived: "bg-gray-100 text-gray-800"
    };
    return colors[status] || colors.draft;
  };

  const filteredFiles = files.filter(file => {
    const matchesSearch = file.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         file.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStream = !selectedStream || file.stream === selectedStream;
    const matchesCourse = !selectedCourse || file.course === selectedCourse;
    const matchesYear = !selectedYear || file.year === selectedYear;
    
    return matchesSearch && matchesStream && matchesCourse && matchesYear;
  });

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setUploading(true);
      setTimeout(() => {
        const newFile = {
          id: Date.now(),
          name: file.name,
          type: file.name.split('.').pop(),
          size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
          stream: selectedStream,
          course: selectedCourse,
          year: selectedYear,
          subject: "General",
          uploadedAt: new Date().toISOString().split('T')[0],
          downloads: 0,
          status: "published"
        };
        setFiles(prev => [newFile, ...prev]);
        setUploading(false);
        setShowUploadModal(false);
      }, 2000);
    }
  };

  const getStreamName = (streamId) => {
    const stream = collegeData.streams.find(s => s.id === streamId);
    return stream ? stream.name : streamId;
  };

  const getCourseName = (courseId) => {
    const stream = collegeData.streams.find(s => s.id === selectedStream);
    if (stream) {
      const course = stream.courses.find(c => c.id === courseId);
      return course ? course.name : courseId;
    }
    return courseId;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-blue-600 text-white py-8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Teacher Portal</h1>
              <p className="text-blue-100 mt-2">Manage your course materials and assignments</p>
            </div>
            <button
              onClick={() => setShowUploadModal(true)}
              className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors duration-300 flex items-center gap-2"
            >
              <Upload className="w-5 h-5" />
              Upload Files
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6">
          <nav className="flex space-x-8">
            {[
              { id: 'dashboard', name: 'Dashboard', icon: BarChart3 },
              { id: 'files', name: 'My Files', icon: FileText },
              { id: 'courses', name: 'Courses', icon: BookOpen },
              { id: 'students', name: 'Students', icon: Users }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors duration-300 ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <FileText className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Files</p>
                    <p className="text-2xl font-bold text-gray-900">{files.length}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <CheckCircle className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Published</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {files.filter(f => f.status === 'published').length}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-200 rounded-lg">
                    <Clock className="w-6 h-6 text-blue-700" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Drafts</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {files.filter(f => f.status === 'draft').length}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Download className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Downloads</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {files.reduce((sum, file) => sum + file.downloads, 0)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Files */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Recent Files</h3>
              </div>
              <div className="divide-y divide-gray-200">
                {files.slice(0, 5).map(file => (
                  <div key={file.id} className="px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center">
                      {getFileIcon(file.type)}
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-900">{file.name}</p>
                        <p className="text-sm text-gray-500">
                          {getStreamName(file.stream)} • {getCourseName(file.course)} • {file.year}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(file.status)}`}>
                        {file.status}
                      </span>
                      <span className="text-sm text-gray-500">{file.downloads} downloads</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Files Tab */}
        {activeTab === 'files' && (
          <div className="space-y-6">
            {/* Search and Filters */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Search files..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <select
                    value={selectedStream}
                    onChange={(e) => setSelectedStream(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">All Streams</option>
                    {collegeData.streams.map(stream => (
                      <option key={stream.id} value={stream.id}>{stream.name}</option>
                    ))}
                  </select>
                  
                  <select
                    value={selectedCourse}
                    onChange={(e) => setSelectedCourse(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={!selectedStream}
                  >
                    <option value="">All Courses</option>
                    {selectedStream && collegeData.streams.find(s => s.id === selectedStream)?.courses.map(course => (
                      <option key={course.id} value={course.id}>{course.name}</option>
                    ))}
                  </select>
                  
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">All Years</option>
                    <option value="First Year">First Year</option>
                    <option value="Second Year">Second Year</option>
                    <option value="Third Year">Third Year</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Files Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredFiles.map(file => (
                <div key={file.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow duration-300">
                  <div className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center">
                        {getFileIcon(file.type)}
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-gray-900 truncate max-w-48">
                            {file.name}
                          </h3>
                          <p className="text-xs text-gray-500">{file.size}</p>
                        </div>
                      </div>
                      <div className="flex space-x-1">
                        <button className="p-1 text-gray-400 hover:text-gray-600">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-1 text-gray-400 hover:text-gray-600">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="p-1 text-gray-400 hover:text-red-600">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                        <span>{getStreamName(file.stream)}</span>
                        <span>{file.downloads} downloads</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(file.status)}`}>
                          {file.status}
                        </span>
                        <span className="text-xs text-gray-500">{file.uploadedAt}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Courses Tab */}
        {activeTab === 'courses' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {collegeData.streams.map(stream => (
                <div key={stream.id} className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">{stream.name}</h3>
                  <div className="space-y-2">
                    {stream.courses.map(course => (
                      <div key={course.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm font-medium text-gray-700">{course.name}</span>
                        <button
                          onClick={() => navigate(`/teacher-portal?dept=${encodeURIComponent(stream.name)}&course=${encodeURIComponent(course.name)}`)}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          Manage
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Students Tab */}
        {activeTab === 'students' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Student Management</h3>
            <p className="text-gray-500">Student management features will be available here.</p>
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Upload File</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select Stream</label>
                  <select
                    value={selectedStream}
                    onChange={(e) => setSelectedStream(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Choose Stream</option>
                    {collegeData.streams.map(stream => (
                      <option key={stream.id} value={stream.id}>{stream.name}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select Course</label>
                  <select
                    value={selectedCourse}
                    onChange={(e) => setSelectedCourse(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={!selectedStream}
                  >
                    <option value="">Choose Course</option>
                    {selectedStream && collegeData.streams.find(s => s.id === selectedStream)?.courses.map(course => (
                      <option key={course.id} value={course.id}>{course.name}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select Year</label>
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Choose Year</option>
                    <option value="First Year">First Year</option>
                    <option value="Second Year">Second Year</option>
                    <option value="Third Year">Third Year</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Upload File</label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                    <div className="space-y-1 text-center">
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="flex text-sm text-gray-600">
                        <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                          <span>Upload a file</span>
                          <input
                            type="file"
                            className="sr-only"
                            onChange={handleFileUpload}
                            disabled={uploading}
                          />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500">PNG, JPG, PDF, DOCX up to 10MB</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                  disabled={uploading}
                >
                  {uploading ? 'Uploading...' : 'Upload'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

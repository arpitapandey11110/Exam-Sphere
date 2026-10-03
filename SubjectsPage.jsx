import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { collegeData } from "../data";
import { ArrowLeft, BookOpen, Calendar, FileText, ChevronRight, GraduationCap } from "lucide-react";

export default function SubjectsPage() {
  const { streamId, courseId } = useParams();
  const navigate = useNavigate();
  const [streamData, setStreamData] = useState(null);
  const [courseData, setCourseData] = useState(null);

  useEffect(() => {
    const foundStream = collegeData.streams.find(
      (s) => s.id === streamId
    );
    if (foundStream) {
      setStreamData(foundStream);
      const foundCourse = foundStream.courses.find(
        (c) => c.id === courseId
      );
      setCourseData(foundCourse);
    }
  }, [streamId, courseId]);

  if (!streamData || !courseData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-light-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading subjects...</p>
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-blue-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center mb-6">
            <button
              onClick={() => navigate(`/courses/${streamId}`)}
              className="flex items-center gap-2 text-white/80 hover:text-white transition-colors duration-300"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Courses
            </button>
          </div>
          <h1 className="text-4xl font-bold mb-4">{courseData.name}</h1>
          <p className="text-xl text-blue-100">
            Explore subjects by year
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
            <span className="text-blue-600 font-medium">{courseData.name}</span>
          </nav>
        </div>
      </div>

      {/* Year Selection */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">
            Select Academic Year
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {years.map((year) => {
              const subjects = courseData.subjects[year];
              const subjectCount = subjects.length;
              
              return (
                <div
                  key={year}
                  className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 hover:scale-105 group cursor-pointer"
                  onClick={() => navigate(`/papers/${streamId}/${courseId}/${encodeURIComponent(year)}`)}
                >
                  <div className={`${colors.bg} flex items-center justify-center`}>
                    <div className="text-center py-6">
                      <GraduationCap className={`w-8 h-8 ${colors.accent} mx-auto mb-2`} />
                      <span className={`text-sm font-semibold ${colors.accent}`}>{year}</span>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-3 group-hover:text-blue-600 transition-colors duration-300">
                      {year} Year
                    </h3>
                    <p className="text-gray-600 mb-4 text-sm">
                      {subjectCount} subjects available
                    </p>
                    
                    <div className="mb-4">
                      <div className="text-sm text-gray-500 mb-2">Subjects Preview:</div>
                      <div className="flex flex-wrap gap-1">
                        {subjects.slice(0, 3).map((subject, index) => (
                          <span
                            key={index}
                            className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded"
                          >
                            {subject.length > 15 ? subject.substring(0, 15) + '...' : subject}
                          </span>
                        ))}
                        {subjects.length > 3 && (
                          <span className="text-xs text-gray-500">
                            +{subjects.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">View Subjects</span>
                      <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all duration-300" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Course Overview */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">
            Course Overview
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center group">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-200 transition-colors duration-300">
                <BookOpen className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Comprehensive Study</h3>
              <p className="text-gray-600 text-sm">Complete coverage of all essential topics</p>
            </div>
            <div className="text-center group">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-200 transition-colors duration-300">
                <Calendar className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Year-wise Structure</h3>
              <p className="text-gray-600 text-sm">Organized progression through academic years</p>
            </div>
            <div className="text-center group">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-200 transition-colors duration-300">
                <FileText className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Syllabus</h3>
              <p className="text-gray-600 text-sm">Overview of subjects by year</p>
            </div>
            <div className="text-center group">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-200 transition-colors duration-300">
                <GraduationCap className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Academic Excellence</h3>
              <p className="text-gray-600 text-sm">Designed for academic success and growth</p>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="py-16 bg-blue-600">
        <div className="max-w-4xl mx-auto px-6 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Your Studies?</h2>
          <p className="text-xl text-blue-100 mb-8">
            Explore your subjects and excel in your academic journey.
          </p>
          <button 
            onClick={() => navigate(`/papers/${streamId}/${courseId}/${encodeURIComponent(years[0])}`)}
            className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors duration-300"
          >
            Start with First Year
          </button>
        </div>
      </div>
    </div>
  );
}
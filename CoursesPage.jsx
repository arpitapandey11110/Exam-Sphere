import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { collegeData } from "../data";
import { ArrowLeft, BookOpen, Users, Clock, Award, ChevronRight } from "lucide-react";

export default function CoursesPage() {
  const { streamId } = useParams();
  const navigate = useNavigate();
  const [streamData, setStreamData] = useState(null);

  useEffect(() => {
    const foundStream = collegeData.streams.find(
      (s) => s.id === streamId
    );
    setStreamData(foundStream);
  }, [streamId]);

  if (!streamData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading courses...</p>
        </div>
      </div>
    );
  }

  const getStreamColor = (variant) => {
    const colors = {
      arts: {
        gradient: "rgba(0, 85, 165, 0.4)",
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-blue-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center mb-6">
            <button
              onClick={() => navigate('/streams')}
              className="flex items-center gap-2 text-white/80 hover:text-white transition-colors duration-300"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Streams
            </button>
          </div>
          <h1 className="text-4xl font-bold mb-4">{streamData.name} Courses</h1>
          <p className="text-xl text-blue-100">
            Choose from our comprehensive range of {streamData.name.toLowerCase()} programs
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
            <span className="text-blue-600 font-medium">{streamData.name}</span>
          </nav>
        </div>
      </div>

      {/* Courses Grid */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {streamData.courses.map((course) => {
              const totalSubjects = Object.values(course.subjects).flat().length;
              const years = Object.keys(course.subjects).length;
              
              return (
                <div
                  key={course.id}
                  className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 hover:scale-105 group cursor-pointer"
                  onClick={() => navigate(`/subjects/${streamId}/${course.id}`)}
                >
                  <div className={`h-24 ${colors.bg} flex items-center justify-center`}>
                    <BookOpen className={`w-8 h-8 ${colors.accent}`} />
                  </div>
                  
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-3 group-hover:text-blue-600 transition-colors duration-300">
                      {course.name}
                    </h3>
                    <p className="text-gray-600 mb-4 text-sm">
                      Comprehensive program covering all essential subjects and practical applications
                    </p>
                    
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="text-center">
                        <div className={`text-2xl font-bold ${colors.accent}`}>{years}</div>
                        <div className="text-xs text-gray-500">Years</div>
                      </div>
                      <div className="text-center">
                        <div className={`text-2xl font-bold ${colors.accent}`}>{totalSubjects}</div>
                        <div className="text-xs text-gray-500">Subjects</div>
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

      {/* Course Features */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">
            What Makes Our Courses Special?
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center group">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-200 transition-colors duration-300">
                <BookOpen className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Comprehensive Curriculum</h3>
              <p className="text-gray-600 text-sm">Well-structured programs covering all essential topics</p>
            </div>
            <div className="text-center group">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-200 transition-colors duration-300">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Expert Faculty</h3>
              <p className="text-gray-600 text-sm">Learn from experienced professors and industry experts</p>
            </div>
            <div className="text-center group">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-200 transition-colors duration-300">
                <Clock className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Flexible Learning</h3>
              <p className="text-gray-600 text-sm">Study at your own pace with flexible schedules</p>
            </div>
            <div className="text-center group">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-200 transition-colors duration-300">
                <Award className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Industry Recognition</h3>
              <p className="text-gray-600 text-sm">Courses recognized by leading industry bodies</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
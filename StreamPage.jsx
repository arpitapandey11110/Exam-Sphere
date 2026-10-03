import { useNavigate } from "react-router-dom";
import { Palette, Atom, Calculator, ArrowRight, Users, BookOpen, TrendingUp, GraduationCap, Microscope, Briefcase } from "lucide-react";
import { collegeData } from "../data";

export default function StreamPage() {
  const navigate = useNavigate();

  const getIcon = (iconName) => {
    const icons = {
      Palette: <Palette className="w-16 h-16" />,
      Atom: <Atom className="w-16 h-16" />,
      Calculator: <Calculator className="w-16 h-16" />
    };
    return icons[iconName];
  };

  const getStreamDescription = (streamId) => {
    const descriptions = {
      arts: "Explore humanities, literature, languages, and social sciences. Perfect for creative minds and future leaders in media, education, and public service.",
      science: "Dive into the world of scientific discovery with courses in biology, chemistry, physics, mathematics, and technology. Build the foundation for innovation.",
      commerce: "Master the principles of business, finance, and economics. Prepare for careers in banking, accounting, management, and entrepreneurship."
    };
    return descriptions[streamId];
  };

  const getStreamStats = (streamId) => {
    const stats = {
      arts: { courses: 6, students: "1500+", placement: "85%" },
      science: { courses: 8, students: "2000+", placement: "92%" },
      commerce: { courses: 4, students: "1800+", placement: "88%" }
    };
    return stats[streamId];
  };

  const getStreamColor = (variant) => {
    const colors = {
      arts: {
        gradient: "from- blue-400 to-blue-600",
        hover: "hover:from-blue-500 hover:to-blue-700",
        accent: "text-blue-600",
        bg: "bg-blue-50",
        border: "border-blue-200"
      },
      science: {
        gradient: "from-blue-400 to-blue-600",
        hover: "hover:from-blue-500 hover:to-blue-700",
        accent: "text-blue-600",
        bg: "bg-blue-50",
        border: "border-blue-200"
      },
      commerce: {
        gradient: "from-blue-400 to-blue-600",
        hover: "hover:from-blue-500 hover:to-blue-700",
        accent: "text-blue-600",
        bg: "bg-blue-50",
        border: "border-blue-200"
      }
    };
    return colors[variant] || colors.arts;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Banner */}
      <div className="bg-blue-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h1 className="text-4xl font-bold mb-4">Academic Departments</h1>
          <p className="text-xl text-blue-100">
            Choose your academic stream and explore our comprehensive course offerings
          </p>
        </div>
      </div>

      {/* Streams Grid */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {collegeData.streams.map((stream) => {
              const stats = getStreamStats(stream.id);
              const colors = getStreamColor(stream.variant);
              
              return (
                <div
                  key={stream.id}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-105 group cursor-pointer border border-gray-200"
                  onClick={() => navigate(`/courses/${stream.id}`)}
                >
                  <div className={`h-48 ${colors.bg} flex items-center justify-center`}>
                    <div className="text-center">
                      <div className={`${colors.accent} mb-4`}>
                        {getIcon(stream.icon)}
                      </div>
                      <h3 className="text-2xl font-bold text-gray-800 group-hover:text-blue-600 transition-colors duration-300">
                        {stream.name}
                      </h3>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <p className="text-gray-600 mb-6 leading-relaxed text-sm">
                      {getStreamDescription(stream.id)}
                    </p>
                    
                    <div className="grid grid-cols-3 gap-4 mb-6">
                      <div className="text-center">
                        <div className={`text-2xl font-bold ${colors.accent}`}>{stats.courses}</div>
                        <div className="text-xs text-gray-500">Courses</div>
                      </div>
                      <div className="text-center">
                        <div className={`text-2xl font-bold ${colors.accent}`}>{stats.students}</div>
                        <div className="text-xs text-gray-500">Students</div>
                      </div>
                      <div className="text-center">
                        <div className={`text-2xl font-bold ${colors.accent}`}>{stats.placement}</div>
                        <div className="text-xs text-gray-500">Placement</div>
                      </div>
                    </div>
                    
                    <button className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-all flex items-center justify-center gap-2 group-hover:shadow-lg">
                      Explore Courses
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">
            Why Choose Our Academic Programs?
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center group">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-200 transition-colors duration-300">
                <GraduationCap className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Expert Faculty</h3>
              <p className="text-gray-600 text-sm">Learn from industry experts and experienced professors</p>
            </div>
            <div className="text-center group">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-200 transition-colors duration-300">
                <Microscope className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Modern Labs</h3>
              <p className="text-gray-600 text-sm">State-of-the-art laboratories and equipment</p>
            </div>
            <div className="text-center group">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-200 transition-colors duration-300">
                <Briefcase className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Industry Connect</h3>
              <p className="text-gray-600 text-sm">Strong industry partnerships and internship programs</p>
            </div>
            <div className="text-center group">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-200 transition-colors duration-300">
                <TrendingUp className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Career Support</h3>
              <p className="text-gray-600 text-sm">Comprehensive placement assistance and career guidance</p>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="py-16 bg-blue-600">
        <div className="max-w-4xl mx-auto px-6 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Your Academic Journey?</h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of students who have found their path to success through our comprehensive programs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => navigate('/')}
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors duration-300"
            >
              Learn More
            </button>
            <button 
              onClick={() => navigate('/register')}
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors duration-300"
            >
              Get Started
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

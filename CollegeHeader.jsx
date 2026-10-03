import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, Menu, X } from "lucide-react";

export default function CollegeHeader() {
  const navigate = useNavigate();
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleDropdownToggle = (dropdown) => {
    setActiveDropdown(activeDropdown === dropdown ? null : dropdown);
  };

  const handleStreamClick = (streamId) => {
    navigate(`/courses/${streamId}`);
    setActiveDropdown(null);
  };

  return (
    <header className="bg-white shadow-lg">
      {/* Top Navigation Bar */}
      <div className="bg-gray-100 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-2 text-sm">
            <div className="flex space-x-6">
              <a href="#" className="text-gray-600 hover:text-blue-600 transition-colors">IQAC</a>
              <a href="#" className="text-gray-600 hover:text-blue-600 transition-colors">NAAC</a>
              <a href="#" className="text-gray-600 hover:text-blue-600 transition-colors">LIBRARY</a>
              <a href="#" className="text-gray-600 hover:text-blue-600 transition-colors">NIRF</a>
              <a href="#" className="text-gray-600 hover:text-blue-600 transition-colors">EVENTS</a>
              <a href="#" className="text-gray-600 hover:text-blue-600 transition-colors">INITIATIVES</a>
              <a href="#" className="text-gray-600 hover:text-blue-600 transition-colors">TENDERS</a>
              <a href="#" className="text-gray-600 hover:text-blue-600 transition-colors">STUDENTS</a>
              <a href="#" className="text-gray-600 hover:text-blue-600 transition-colors">RECRUITMENTS</a>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Logo */}
            <div className="flex items-center">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-xl">E</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">ExamSphere</h1>
                  <p className="text-sm text-gray-600">Student Portal</p>
                </div>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-8">
              <button
                onClick={() => navigate('/')}
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
              >
                HOME
              </button>
              
              <div className="relative">
                <button
                  onClick={() => handleDropdownToggle('departments')}
                  className="flex items-center text-gray-700 hover:text-blue-600 font-medium transition-colors"
                >
                  DEPARTMENTS
                  <ChevronDown className="ml-1 h-4 w-4" />
                </button>
                
                {activeDropdown === 'departments' && (
                  <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                    <div className="py-2">
                      <button
                        onClick={() => handleStreamClick('arts')}
                        className="w-full text-left px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 flex items-center justify-between"
                      >
                        Arts
                        <ChevronDown className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleStreamClick('science')}
                        className="w-full text-left px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 flex items-center justify-between"
                      >
                        Science
                        <ChevronDown className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleStreamClick('commerce')}
                        className="w-full text-left px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 flex items-center justify-between"
                      >
                        Commerce
                        <ChevronDown className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={() => navigate('/student-portal')}
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
              >
                STUDENT PORTAL
              </button>
              
              <button
                onClick={() => navigate('/teacher-portal')}
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
              >
                TEACHER PORTAL
              </button>
              
              <button
                onClick={() => navigate('/register')}
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
              >
                REGISTER
              </button>
            </nav>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-gray-700 hover:text-blue-600"
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200">
            <div className="px-4 py-2 space-y-1">
              <button
                onClick={() => { navigate('/'); setMobileMenuOpen(false); }}
                className="block w-full text-left px-3 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-md"
              >
                HOME
              </button>
              <button
                onClick={() => { navigate('/streams'); setMobileMenuOpen(false); }}
                className="block w-full text-left px-3 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-md"
              >
                DEPARTMENTS
              </button>
              <button
                onClick={() => { navigate('/student-portal'); setMobileMenuOpen(false); }}
                className="block w-full text-left px-3 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-md"
              >
                STUDENT PORTAL
              </button>
              <button
                onClick={() => { navigate('/teacher-portal'); setMobileMenuOpen(false); }}
                className="block w-full text-left px-3 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-md"
              >
                TEACHER PORTAL
              </button>
              <button
                onClick={() => { navigate('/register'); setMobileMenuOpen(false); }}
                className="block w-full text-left px-3 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-md"
              >
                REGISTER
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Breadcrumb Navigation */}
      <div className="bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
          <nav className="flex items-center space-x-2 text-sm">
            <button
              onClick={() => navigate('/')}
              className="hover:text-blue-200 transition-colors"
            >
              HOME
            </button>
            <span className="text-blue-200">/</span>
            <span className="font-medium">STUDENT PORTAL</span>
          </nav>
        </div>
      </div>
    </header>
  );
}

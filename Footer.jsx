import { UserRound, Building2, GraduationCap, BookOpen } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-transparent">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-white/90 backdrop-blur rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.08)] border border-gray-100">
          <div className="px-6 py-6 sm:py-8">
            <h3 className="text-center text-xl sm:text-2xl font-extrabold text-gray-900 mb-6">
              How It Works
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* 1. Register */}
              <div className="text-center">
                <div className="mx-auto mb-3 w-10 h-10 rounded-full flex items-center justify-center bg-rose-50 text-rose-500">
                  <UserRound className="w-5 h-5" />
                </div>
                <div className="font-semibold text-gray-900">1. Register</div>
                <p className="text-sm text-gray-500 mt-1">Create your account as a student or teacher</p>
              </div>

              {/* 2. Select College */}
              <div className="text-center">
                <div className="mx-auto mb-3 w-10 h-10 rounded-full flex items-center justify-center bg-blue-50 text-blue-500">
                  <Building2 className="w-5 h-5" />
                </div>
                <div className="font-semibold text-gray-900">2. Select College</div>
                <p className="text-sm text-gray-500 mt-1">Choose your college and department</p>
              </div>

              {/* 3. Pick Year */}
              <div className="text-center">
                <div className="mx-auto mb-3 w-10 h-10 rounded-full flex items-center justify-center bg-green-50 text-green-600">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div className="font-semibold text-gray-900">3. Pick Year</div>
                <p className="text-sm text-gray-500 mt-1">Select your academic year and semester</p>
              </div>

              {/* 4. Access Papers */}
              <div className="text-center">
                <div className="mx-auto mb-3 w-10 h-10 rounded-full flex items-center justify-center bg-purple-50 text-purple-500">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div className="font-semibold text-gray-900">4. Access Papers</div>
                <p className="text-sm text-gray-500 mt-1">Browse, download, or upload exam papers</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

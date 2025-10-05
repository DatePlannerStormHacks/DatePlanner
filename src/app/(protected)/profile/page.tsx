import Profile from "@/components/Profile";
import ProtectedHeader from "@/components/ProtectedHeader";

export default function ProfilePage() {
  return (
    <div>
      <ProtectedHeader />
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-fuchsia-50 py-12">
        <div className="container mx-auto px-4">
          {/* Page Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-slate-800 mb-4">
              Your Profile
            </h1>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Manage your account information and personalize your DatePlanner experience.
            </p>
          </div>

          {/* Profile Component */}
          <Profile />

          {/* Quick Actions */}
          <div className="mt-12 max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-slate-800 mb-4">Quick Actions</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <a
                  href="/form"
                  className="flex items-center gap-3 p-4 bg-gradient-to-r from-indigo-50 to-indigo-100 rounded-xl hover:from-indigo-100 hover:to-indigo-200 transition-all duration-200 group"
                >
                  <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    <span className="text-white text-lg">🎯</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-slate-800">Plan a Date</h3>
                    <p className="text-sm text-slate-600">Create your perfect itinerary</p>
                  </div>
                </a>
                
                <a
                  href="/dashboard"
                  className="flex items-center gap-3 p-4 bg-gradient-to-r from-fuchsia-50 to-fuchsia-100 rounded-xl hover:from-fuchsia-100 hover:to-fuchsia-200 transition-all duration-200 group"
                >
                  <div className="w-10 h-10 bg-fuchsia-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    <span className="text-white text-lg">📊</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-slate-800">Dashboard</h3>
                    <p className="text-sm text-slate-600">View your date history</p>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
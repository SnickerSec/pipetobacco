import { Outlet } from 'react-router-dom';

export default function PublicLayout() {
  return (
    <div className="min-h-screen bg-tobacco-50">
      {/* Simple header for public pages */}
      <header className="bg-white shadow-sm border-b border-tobacco-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <a href="/" className="flex items-center space-x-2">
              <span className="text-3xl text-ember-600 font-script font-bold">Herf Social</span>
            </a>
            <div className="flex items-center space-x-4">
              <a
                href="/login"
                className="bg-ember-600 text-white px-4 py-2 rounded-lg hover:bg-ember-700 font-medium"
              >
                Sign In
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Page content */}
      <main>
        <Outlet />
      </main>

      {/* Simple footer */}
      <footer className="bg-white border-t border-tobacco-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-tobacco-600 text-sm">
            <p>&copy; 2025 Herf Social. A community for cigar and pipe tobacco enthusiasts.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

import { Outlet, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { apiClient } from "../lib/apiClient";
import { AssignmentNotifications } from "../components/AssignmentNotifications";

function RootLayout() {
  const { user, setUser, loading } = useAuth();

  const handleLogout = async () => {
    try {
      await apiClient.post("/auth/logout");
      setUser(null);
    } catch (err) {
      // optional: log or show error
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white shadow">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
          <Link to="/dashboard" className="font-semibold text-slate-900">
            Collaborative Task Manager
          </Link>
          <nav className="space-x-4 text-sm flex items-center">
            <Link
              to="/dashboard"
              className="text-slate-700 hover:text-slate-900"
            >
              Dashboard
            </Link>

            {!loading && user && (
              <>
              <Link
                  to="/profile"
                  className="text-slate-700 hover:text-slate-900"
                >
                  Hi, {user.name}
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-slate-700 hover:text-slate-900"
                >
                  Logout
                </button>
              </>
            )}

            {!loading && !user && (
              <Link
                to="/auth/login"
                className="text-slate-700 hover:text-slate-900"
              >
                Login
              </Link>
            )}
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-4 py-6">
          <Outlet />
        </div>
      </main>
      <AssignmentNotifications />
    </div>
  );
}

export default RootLayout;

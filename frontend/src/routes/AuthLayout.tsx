import { Outlet, Link } from "react-router-dom";

function AuthLayout() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <div className="w-full max-w-md bg-white shadow rounded-lg p-6">
        <div className="mb-4 text-center">
          <Link to="/" className="text-lg font-semibold text-slate-900">
            Collaborative Task Manager
          </Link>
        </div>
        <Outlet />
      </div>
    </div>
  );
}

export default AuthLayout;

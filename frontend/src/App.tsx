import { Route, Routes, Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { MultiStepForm } from "./components/MultiStepForm";
import { Login } from "./components/Login";

interface User {
  id: string | number;
  email: string;
  role: string;
  name?: string;
  companyId: string;
}

export default function App() {
  const navigate = useNavigate();
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const t = localStorage.getItem("token");
    const u = localStorage.getItem("user");
    if (t) {
      setToken(t);
      if (u) {
        setUser(JSON.parse(u));
      }
    }
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
    navigate("/login");
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "bg-red-100 text-red-800";
      case "MANAGER":
        return "bg-blue-100 text-blue-800";
      case "VIEWER":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getRoleBadge = (role: string) => {
    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(
          role
        )}`}
      >
        {role}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link
            to="/"
            className="text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors"
          >
            Product Transparency Platform
          </Link>

          <nav className="flex items-center space-x-6">
            {token && user ? (
              <>
                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">
                      {user.name || user.email}
                    </div>
                    <div className="text-xs text-gray-500">
                      {user.companyId}
                    </div>
                  </div>
                  {getRoleBadge(user.role)}
                </div>
                <button
                  onClick={logout}
                  className="text-sm text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md hover:bg-gray-100 transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="text-sm text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md hover:bg-gray-100 transition-colors"
              >
                Login
              </Link>
            )}
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <Routes>
          <Route
            path="/"
            element={
              token && user ? (
                <MultiStepForm user={user} />
              ) : (
                <div className="text-center py-12">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    Welcome to Product Transparency Platform
                  </h2>
                  <p className="text-gray-600 mb-8">
                    Please log in to access the transparency assessment tools.
                  </p>
                  <Link
                    to="/login"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                  >
                    Get Started
                  </Link>
                </div>
              )
            }
          />
          <Route
            path="/login"
            element={
              <Login
                onLoggedIn={(t, u) => {
                  localStorage.setItem("token", t);
                  localStorage.setItem("user", JSON.stringify(u));
                  setToken(t);
                  setUser(u);
                  navigate("/");
                }}
              />
            }
          />
        </Routes>
      </main>
    </div>
  );
}

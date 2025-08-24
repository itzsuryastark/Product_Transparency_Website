import { Route, Routes, Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { MultiStepForm } from "./components/MultiStepForm";
import { Login } from "./components/Login";

export default function App() {
  const navigate = useNavigate();
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const t = localStorage.getItem("token");
    setToken(t);
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    navigate("/login");
  };

  return (
    <div className="min-h-screen">
      <header className="bg-white shadow">
        <div className="max-w-5xl mx-auto px-4 py-3 flex justify-between items-center">
          <Link to="/" className="font-semibold">
            Product Transparency
          </Link>
          <nav className="space-x-4">
            {token ? (
              <button
                onClick={logout}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Logout
              </button>
            ) : (
              <Link
                to="/login"
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Login
              </Link>
            )}
          </nav>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-4 py-6">
        <Routes>
          <Route path="/" element={<MultiStepForm />} />
          <Route
            path="/login"
            element={
              <Login
                onLoggedIn={(t) => {
                  localStorage.setItem("token", t);
                  setToken(t);
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

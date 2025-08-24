import { useState } from "react";

type Props = { onLoggedIn: (token: string, user: any) => void };

export function Login({ onLoggedIn }: Props) {
  const [email, setEmail] = useState("manager@example.com");
  const [password, setPassword] = useState("manager1234");
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const res = await fetch("http://localhost:8000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) throw new Error("Login failed");
      const data = await res.json();
      onLoggedIn(data.token, data.user);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const quickLogin = (demoUser: {
    email: string;
    password: string;
    role: string;
  }) => {
    setEmail(demoUser.email);
    setPassword(demoUser.password);
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        Product Transparency Platform
      </h2>

      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email
          </label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter your email"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter your password"
          />
        </div>

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <button
          type="submit"
          className="w-full bg-blue-600 text-white px-4 py-2 rounded-md font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
        >
          Sign in
        </button>
      </form>

      <div className="mt-6">
        <h3 className="text-sm font-medium text-gray-700 mb-3">
          Demo Accounts:
        </h3>
        <div className="space-y-2">
          <button
            onClick={() =>
              quickLogin({
                email: "admin@example.com",
                password: "admin1234",
                role: "ADMIN",
              })
            }
            className="w-full text-left p-2 bg-green-50 border border-green-200 rounded-md hover:bg-green-100 transition-colors"
          >
            <div className="text-sm font-medium text-green-800">Admin User</div>
            <div className="text-xs text-green-600">
              Full access to all features
            </div>
          </button>

          <button
            onClick={() =>
              quickLogin({
                email: "manager@example.com",
                password: "manager1234",
                role: "MANAGER",
              })
            }
            className="w-full text-left p-2 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 transition-colors"
          >
            <div className="text-sm font-medium text-blue-800">
              Manager User
            </div>
            <div className="text-xs text-blue-600">
              Can create products and reports
            </div>
          </button>

          <button
            onClick={() =>
              quickLogin({
                email: "viewer@example.com",
                password: "viewer1234",
                role: "VIEWER",
              })
            }
            className="w-full text-left p-2 bg-gray-50 border border-gray-200 rounded-md hover:bg-gray-100 transition-colors"
          >
            <div className="text-sm font-medium text-gray-800">Viewer User</div>
            <div className="text-xs text-gray-600">
              Can only view and download reports
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}

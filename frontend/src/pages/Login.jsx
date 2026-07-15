import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { loginUser } from "../services/authService";
import useAuth from "../hooks/useAuth";
import logo from "../assets/logo.svg";

const Login = () => {
  const navigate = useNavigate();

  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { email, password } = formData;

    if (!email || !password) {
      toast.error("Please Fill the all Fields");
      return;
    }

    try {
      const data = await loginUser(formData);

      login(data.user, data.token);

      toast.success(data.message);

      navigate("/dashboard");
    } catch (error) {
      toast.error(error.response?.data?.message || "Login Failed");
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col justify-between items-center bg-gradient-to-br from-slate-50 to-slate-100 p-4 font-sans text-slate-700 selection:bg-teal-500/20">
      <div className="w-full max-w-md flex flex-col items-center mt-12 sm:mt-16">
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="w-14 h-14 bg-white rounded-2xl shadow-md border border-slate-100 flex items-center justify-center text-teal-500 mb-4 transition-transform hover:scale-105">
            <img src={logo} alt="" />
          </div>
          <h1 className="text-3xl font-bold text-teal-800 tracking-tight">
            Let's<span className="text-sky-500"> Chat</span>
          </h1>
          <p className="text-xs font-medium text-slate-400 mt-1 tracking-wide uppercase">
            Real Time Chat Application
          </p>
        </div>

        <div className="w-full bg-white/70 backdrop-blur-2xl rounded-3xl border border-white shadow-2xl shadow-slate-200/50 overflow-hidden">
          <div className="flex border-b border-slate-100/80 text-sm font-semibold">
            <button className="flex-1 py-4 text-center text-teal-600 border-b-2 border-teal-500 transition-all">
              Login
            </button>
            <Link
              to="/register"
              className="flex-1 py-4 text-center text-slate-400 hover:text-slate-600 transition-all"
            >
              Register
            </Link>
          </div>

          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-5">
            <div className="relative flex items-center">
              <span className="absolute left-4 text-slate-400 text-lg">@</span>
              <input
                type="text"
                name="email"
                placeholder="Email or Username"
                value={formData.email}
                onChange={handleChange}
                className="w-full pl-11 pr-4 py-3.5 bg-slate-50/60 border border-slate-100 rounded-xl outline-none text-slate-700 placeholder-slate-400 text-sm font-medium transition-all focus:bg-white focus:border-teal-400 focus:ring-4 focus:ring-teal-500/10"
              />
            </div>

            <div className="relative flex items-center">
              <span className="absolute left-4 text-slate-400">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </span>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                className="w-full pl-11 pr-11 py-3.5 bg-slate-50/60 border border-slate-100 rounded-xl outline-none text-slate-700 placeholder-slate-400 text-sm font-medium transition-all focus:bg-white focus:border-teal-400 focus:ring-4 focus:ring-teal-500/10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
              </button>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-3.5 flex items-center justify-center gap-2 text-sm font-semibold text-white rounded-xl bg-gradient-to-r from-teal-500 to-sky-500 hover:from-teal-600 hover:to-sky-600 active:scale-[0.99] shadow-lg shadow-teal-500/20 transition-all duration-200 cursor-pointer"
              >
                <span>Join Chat</span>
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                  />
                </svg>
              </button>
              <p className="text-center text-sm text-slate-muted pt-2 mt-4">
                Don't have an account?{" "}
                <Link
                  to="/register"
                  className="text-teal-600 text-electric font-semibold hover:underline"
                >
                  Register
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;

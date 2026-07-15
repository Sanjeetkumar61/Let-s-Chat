import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { registerUser } from "../services/authService";
import useAuth from "../hooks/useAuth";
import logo from "../assets/logo.svg";

const Register = () => {
  const navigate = useNavigate();

  const { login } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { name, email, password } = formData;

    if (!name || !email || !password) {
      toast.error("Please Fill the all Fields");
      return;
    }

    try {
      const data = await registerUser(formData);

      login(data.user, data.token);

      toast.success(data.message);

      navigate("/dashboard");
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Registration Failed! Please Try Again",
      );
    }
  };

  return (
    <div className="h-screen w-full fixed inset-0 flex flex-col justify-between items-center bg-gradient-to-br from-slate-50 to-slate-100 p-4 font-sans text-slate-700 selection:bg-teal-500/20 overflow-hidden">
      <div className="w-full max-w-md flex flex-col items-center my-auto">
        <div className="flex flex-col items-center mb-6 text-center">
          <div className="w-14 h-14 bg-white rounded-2xl shadow-md border border-slate-100 flex items-center justify-center text-teal-500 mb-3 transition-transform hover:scale-105">
            <img src={logo} alt="" />
          </div>
          <h1 className="text-3xl font-bold text-teal-800 tracking-tight">
            Let's<span className="text-sky-500"> Chat</span>
          </h1>
          <p className="text-xs font-medium text-slate-400 mt-1 tracking-wide uppercase">
            Real Time Chat Application
          </p>
        </div>

        <div className="w-full bg-white/70 backdrop-blur-md rounded-3xl border border-white shadow-xl shadow-slate-200/50 overflow-hidden">
          <div className="flex border-b border-slate-100/80 text-sm font-semibold">
            <Link
              to="/login"
              className="flex-1 py-4 text-center text-slate-400 hover:text-slate-600 transition-all"
            >
              Login
            </Link>
            <button
              type="button"
              className="flex-1 py-4 text-center text-teal-600 border-b-2 border-teal-500 transition-all"
            >
              Register
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-4">
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
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </span>
              <input
                type="text"
                name="name"
                placeholder="Full Name"
                value={formData.name}
                onChange={handleChange}
                className="w-full pl-11 pr-4 py-3 bg-slate-50/60 border border-slate-100 rounded-xl outline-none text-slate-700 placeholder-slate-400 text-sm font-medium transition-all focus:bg-white focus:border-teal-400 focus:ring-4 focus:ring-teal-500/10"
              />
            </div>

            <div className="relative flex items-center">
              <span className="absolute left-4 text-slate-400 text-lg">@</span>
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleChange}
                className="w-full pl-11 pr-4 py-3 bg-slate-50/60 border border-slate-100 rounded-xl outline-none text-slate-700 placeholder-slate-400 text-sm font-medium transition-all focus:bg-white focus:border-teal-400 focus:ring-4 focus:ring-teal-500/10"
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
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                className="w-full pl-11 pr-4 py-3 bg-slate-50/60 border border-slate-100 rounded-xl outline-none text-slate-700 placeholder-slate-400 text-sm font-medium transition-all focus:bg-white focus:border-teal-400 focus:ring-4 focus:ring-teal-500/10"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-3.5 flex items-center justify-center gap-2 text-sm font-semibold text-white rounded-xl bg-gradient-to-r from-teal-500 to-sky-500 hover:from-teal-600 hover:to-sky-600 active:scale-[0.99] shadow-lg shadow-teal-500/20 transition-all duration-200 cursor-pointer"
              >
                <span>Create Account</span>
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
              <p className="text-center text-sm text-slate-muted pt-2 border-t border-slate-200/60 mt-4">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="text-teal-600 text-electric-hover font-semibold hover:underline"
                >
                  Login
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;

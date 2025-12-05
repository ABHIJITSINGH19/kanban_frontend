import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Mail, Lock, Eye, EyeOff, LogIn } from "lucide-react";
import {
  loginUser,
  clearError,
  selectAuthLoading,
  selectAuthError,
  selectIsAuthenticated,
} from "../../store/slices/authSlice";

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [showPassword, setShowPassword] = useState(false);
  const isLoading = useSelector(selectAuthLoading);
  const error = useSelector(selectAuthError);
  const isAuthenticated = useSelector(selectIsAuthenticated);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  const onSubmit = async (data) => {
    const result = await dispatch(loginUser(data));
    if (loginUser.fulfilled.match(result)) {
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-4 sm:py-8 md:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-lg border border-gray-200 shadow-sm p-4 sm:p-6 md:p-8">
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Sign In
          </h1>
          <p className="text-gray-600 text-xs sm:text-sm">
            Welcome back to Task Management
          </p>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4 sm:space-y-6"
        >
          <div>
            <label
              htmlFor="email"
              className="block text-xs sm:text-sm font-bold text-gray-900 mb-1.5 sm:mb-2"
            >
              Email Address
            </label>
            <div className="relative">
              <Mail
                className="absolute left-2.5 sm:left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={16}
              />
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Invalid email address",
                  },
                })}
                className={`w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-2.5 text-sm sm:text-base border ${
                  errors.email ? "border-red-500" : "border-gray-300"
                } rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              />
            </div>
            {errors.email && (
              <p className="mt-1 text-xs sm:text-sm text-red-500">
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-xs sm:text-sm font-bold text-gray-900 mb-1.5 sm:mb-2"
            >
              Password
            </label>
            <div className="relative">
              <Lock
                className="absolute left-2.5 sm:left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={16}
              />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                {...register("password", {
                  required: "Password is required",
                })}
                className={`w-full pl-8 sm:pl-10 pr-8 sm:pr-10 py-2 sm:py-2.5 text-sm sm:text-base border ${
                  errors.password ? "border-red-500" : "border-gray-300"
                } rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2.5 sm:right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1 text-xs sm:text-sm text-red-500">
                {errors.password.message}
              </p>
            )}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-2.5 sm:p-3">
              <p className="text-xs sm:text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="flex items-center justify-end">
            <button
              type="button"
              onClick={() => navigate("/forgot-password")}
              className="text-xs sm:text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Forgot password?
            </button>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full bg-linear-to-r from-blue-500 to-purple-600 text-white font-medium py-2.5 sm:py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-md text-sm sm:text-base ${
              isLoading
                ? "opacity-50 cursor-not-allowed"
                : "hover:from-blue-600 hover:to-purple-700"
            }`}
          >
            {isLoading ? (
              <>
                <span>Signing in...</span>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              </>
            ) : (
              <>
                <span>Sign In</span>
                <LogIn size={16} className="sm:w-[18px] sm:h-[18px]" />
              </>
            )}
          </button>
        </form>

        <div className="mt-4 sm:mt-6 text-center">
          <p className="text-xs sm:text-sm text-gray-600">
            Don't have an account?{" "}
            <button
              type="button"
              onClick={() => navigate("/register")}
              className="text-blue-600 underline hover:text-blue-700 font-medium"
            >
              Create Account
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;

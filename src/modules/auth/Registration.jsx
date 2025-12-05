import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Mail, Lock, Eye, EyeOff, UserPlus, User, Check } from "lucide-react";
import {
  registerUser,
  clearError,
  clearRegistrationSuccess,
  selectAuthLoading,
  selectAuthError,
  selectRegistrationSuccess,
  selectRegistrationMessage,
} from "../../store/slices/authSlice";

const Registration = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [showPassword, setShowPassword] = useState(false);
  const isLoading = useSelector(selectAuthLoading);
  const error = useSelector(selectAuthError);
  const registrationSuccess = useSelector(selectRegistrationSuccess);
  const registrationMessage = useSelector(selectRegistrationMessage);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      accountType: "regular",
    },
  });

  const password = watch("password");
  const hasMinLength = password?.length >= 8;

  useEffect(() => {
    dispatch(clearError());
    dispatch(clearRegistrationSuccess());
  }, [dispatch]);

  useEffect(() => {
    if (registrationSuccess) {
      const timer = setTimeout(() => {
        navigate("/login");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [registrationSuccess, navigate]);

  const onSubmit = async (data) => {
    const result = await dispatch(registerUser(data));
    if (registerUser.fulfilled.match(result)) {
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-4 sm:py-8 md:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-lg border border-gray-200 shadow-sm p-4 sm:p-6 md:p-8">
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Create Account
          </h1>
          <p className="text-gray-600 text-xs sm:text-sm">
            Sign up to get started with Task Management
          </p>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4 sm:space-y-6"
        >
          <div>
            <label
              htmlFor="name"
              className="block text-xs sm:text-sm font-bold text-gray-900 mb-1.5 sm:mb-2"
            >
              Name
            </label>
            <div className="relative">
              <User
                className="absolute left-2.5 sm:left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={16}
              />
              <input
                id="name"
                type="text"
                placeholder="Enter your name"
                {...register("name", {
                  required: "Name is required",
                  minLength: {
                    value: 2,
                    message: "Name must be at least 2 characters",
                  },
                })}
                className={`w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-2.5 text-sm sm:text-base border ${
                  errors.name ? "border-red-500" : "border-gray-300"
                } rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              />
            </div>
            {errors.name && (
              <p className="mt-1 text-xs sm:text-sm text-red-500">
                {errors.name.message}
              </p>
            )}
          </div>

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
                  minLength: {
                    value: 8,
                    message: "Password must be at least 8 characters",
                  },
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

            <div className="mt-2 sm:mt-3 bg-gray-100 rounded-lg p-2.5 sm:p-3 border border-gray-200">
              <p className="text-xs font-bold text-gray-900 uppercase mb-1.5 sm:mb-2">
                Password Must Have:
              </p>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <Check
                    size={14}
                    className={`sm:w-4 sm:h-4 ${
                      hasMinLength ? "text-green-500" : "text-gray-400"
                    }`}
                  />
                  <span
                    className={`text-xs sm:text-sm ${
                      hasMinLength ? "text-gray-900" : "text-gray-500"
                    }`}
                  >
                    At least 8 characters
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-xs sm:text-sm font-bold text-gray-900 mb-1.5 sm:mb-2"
            >
              Confirm Password
            </label>
            <div className="relative">
              <Lock
                className="absolute left-2.5 sm:left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={16}
              />
              <input
                id="confirmPassword"
                type={showPassword ? "text" : "password"}
                placeholder="Confirm your password"
                {...register("confirmPassword", {
                  required: "Please confirm your password",
                  validate: (value) =>
                    value === password || "Passwords do not match",
                })}
                className={`w-full pl-8 sm:pl-10 pr-8 sm:pr-10 py-2 sm:py-2.5 text-sm sm:text-base border ${
                  errors.confirmPassword ? "border-red-500" : "border-gray-300"
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
            {errors.confirmPassword && (
              <p className="mt-1 text-xs sm:text-sm text-red-500">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-bold text-gray-900 mb-2 sm:mb-3">
              Account Type
            </label>
            <div className="space-y-2 sm:space-y-3">
              <label className="flex items-start gap-2 sm:gap-3 cursor-pointer">
                <input
                  type="radio"
                  value="regular"
                  {...register("accountType", {
                    required: "Please select an account type",
                  })}
                  className="mt-1 w-4 h-4 text-red-600 border-gray-300 focus:ring-red-500"
                />
                <div className="flex-1">
                  <span className="block text-xs sm:text-sm font-bold text-gray-900">
                    Regular User
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-2 sm:gap-3 cursor-pointer">
                <input
                  type="radio"
                  value="administrator"
                  {...register("accountType")}
                  className="mt-1 w-4 h-4 text-red-600 border-gray-300 focus:ring-red-500"
                />
                <div className="flex-1">
                  <span className="block text-xs sm:text-sm font-bold text-gray-900">
                    Manager
                  </span>
                  <span className="block text-xs sm:text-sm text-gray-600 mt-0.5">
                    Create and manage tasks.
                  </span>
                </div>
              </label>
            </div>
            {errors.accountType && (
              <p className="mt-1 text-xs sm:text-sm text-red-500">
                {errors.accountType.message}
              </p>
            )}
          </div>

          {registrationSuccess && registrationMessage && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-2.5 sm:p-3">
              <p className="text-xs sm:text-sm text-green-600">
                {registrationMessage}
              </p>
              <p className="text-xs text-green-500 mt-1">
                Redirecting to login page...
              </p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-2.5 sm:p-3">
              <p className="text-xs sm:text-sm text-red-600">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || registrationSuccess}
            className={`w-full bg-linear-to-r from-blue-500 to-purple-600 text-white font-medium py-2.5 sm:py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-md text-sm sm:text-base ${
              isLoading || registrationSuccess
                ? "opacity-50 cursor-not-allowed"
                : "hover:from-blue-600 hover:to-purple-700"
            }`}
          >
            {isLoading ? (
              <>
                <span>Creating Account...</span>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              </>
            ) : registrationSuccess ? (
              <>
                <span>Account Created!</span>
                <Check size={16} className="sm:w-[18px] sm:h-[18px]" />
              </>
            ) : (
              <>
                <span>Create Account</span>
                <UserPlus size={16} className="sm:w-[18px] sm:h-[18px]" />
              </>
            )}
          </button>
        </form>

        <div className="mt-4 sm:mt-6 text-center">
          <p className="text-xs sm:text-sm text-gray-600">
            Already have an account?{" "}
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="text-blue-600 underline hover:text-blue-700 font-medium"
            >
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Registration;

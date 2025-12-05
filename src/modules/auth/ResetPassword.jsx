import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Lock, Eye, EyeOff, CheckCircle, ArrowLeft } from "lucide-react";
import {
  resetPassword,
  clearError,
  clearPasswordResetSuccess,
  logoutUser,
  selectAuthLoading,
  selectAuthError,
  selectPasswordResetSuccess,
  selectPasswordResetMessage,
} from "../../store/slices/authSlice";

const ResetPassword = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { token } = useParams();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const isLoading = useSelector(selectAuthLoading);
  const error = useSelector(selectAuthError);
  const passwordResetSuccess = useSelector(selectPasswordResetSuccess);
  const passwordResetMessage = useSelector(selectPasswordResetMessage);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const password = watch("password");
  const hasMinLength = password?.length >= 8;

  useEffect(() => {
    dispatch(clearError());
    dispatch(clearPasswordResetSuccess());
  }, [dispatch]);

  useEffect(() => {
    if (passwordResetSuccess) {
      dispatch(logoutUser());
      const timer = setTimeout(() => {
        navigate("/login");
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [passwordResetSuccess, navigate, dispatch]);

  const onSubmit = async (data) => {
    await dispatch(
      resetPassword({
        token,
        password: data.password,
        confirmPassword: data.confirmPassword,
      })
    );
  };

  if (passwordResetSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-4 sm:py-8 md:py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full bg-white rounded-lg border border-gray-200 shadow-sm p-4 sm:p-6 md:p-8">
          <div className="text-center">
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 flex flex-col items-center gap-3">
              <CheckCircle className="text-green-600" size={48} />
              <div>
                <p className="text-lg font-semibold text-green-800">
                  Password Reset Successful!
                </p>
                <p className="text-sm text-green-700 mt-1">
                  {passwordResetMessage ||
                    "Your password has been reset successfully."}
                </p>
                <p className="text-xs text-green-600 mt-2">
                  Redirecting to login page...
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-4 sm:py-8 md:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-lg border border-gray-200 shadow-sm p-4 sm:p-6 md:p-8">
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Reset Password
          </h1>
          <p className="text-gray-600 text-xs sm:text-sm">
            Enter your new password below
          </p>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4 sm:space-y-6"
        >
          <div>
            <label
              htmlFor="password"
              className="block text-xs sm:text-sm font-bold text-gray-900 mb-1.5 sm:mb-2"
            >
              New Password
            </label>
            <div className="relative">
              <Lock
                className="absolute left-2.5 sm:left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={16}
              />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your new password"
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
            {password && (
              <div className="mt-2 space-y-1">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-1.5 h-1.5 rounded-full ${
                      hasMinLength ? "bg-green-500" : "bg-gray-300"
                    }`}
                  />
                  <span
                    className={`text-xs ${
                      hasMinLength ? "text-green-600" : "text-gray-500"
                    }`}
                  >
                    At least 8 characters
                  </span>
                </div>
              </div>
            )}
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-xs sm:text-sm font-bold text-gray-900 mb-1.5 sm:mb-2"
            >
              Confirm New Password
            </label>
            <div className="relative">
              <Lock
                className="absolute left-2.5 sm:left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={16}
              />
              <input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm your new password"
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
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-2.5 sm:right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="mt-1 text-xs sm:text-sm text-red-500">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-2.5 sm:p-3">
              <p className="text-xs sm:text-sm text-red-600">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full bg-blue-600 text-white font-medium py-2.5 sm:py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-md text-sm sm:text-base ${
              isLoading ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-700"
            }`}
          >
            {isLoading ? (
              <>
                <span>Resetting Password...</span>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              </>
            ) : (
              <span>Reset Password</span>
            )}
          </button>
        </form>

        <div className="mt-4 sm:mt-6 text-center">
          <button
            type="button"
            onClick={() => navigate("/login")}
            className="text-xs sm:text-sm text-gray-600 hover:text-gray-900 font-medium flex items-center justify-center gap-2"
          >
            <ArrowLeft size={16} />
            Back to Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;

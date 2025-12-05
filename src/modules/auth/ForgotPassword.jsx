import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";
import {
  forgotPassword,
  clearError,
  clearPasswordResetSuccess,
  selectAuthLoading,
  selectAuthError,
  selectPasswordResetSuccess,
  selectPasswordResetMessage,
} from "../../store/slices/authSlice";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isLoading = useSelector(selectAuthLoading);
  const error = useSelector(selectAuthError);
  const passwordResetSuccess = useSelector(selectPasswordResetSuccess);
  const passwordResetMessage = useSelector(selectPasswordResetMessage);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: "",
    },
  });

  useEffect(() => {
    dispatch(clearError());
    dispatch(clearPasswordResetSuccess());
  }, [dispatch]);

  const onSubmit = async (data) => {
    await dispatch(forgotPassword(data.email));
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-4 sm:py-8 md:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-lg border border-gray-200 shadow-sm p-4 sm:p-6 md:p-8">
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Forgot Password
          </h1>
          <p className="text-gray-600 text-xs sm:text-sm">
            Enter your email address and we'll send you a link to reset your
            password
          </p>
        </div>

        {passwordResetSuccess ? (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
              <CheckCircle
                className="text-green-600 shrink-0 mt-0.5"
                size={20}
              />
              <div>
                <p className="text-sm font-medium text-green-800">
                  {passwordResetMessage || "Password reset link sent!"}
                </p>
                <p className="text-xs text-green-700 mt-1">
                  Please check your email for the password reset link.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="w-full bg-blue-600 text-white font-medium py-2.5 sm:py-3 px-4 rounded-lg transition-all duration-200 hover:bg-blue-700 text-sm sm:text-base"
            >
              Back to Login
            </button>
          </div>
        ) : (
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

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-2.5 sm:p-3">
                <p className="text-xs sm:text-sm text-red-600">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full bg-blue-600 text-white font-medium py-2.5 sm:py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-md text-sm sm:text-base ${
                isLoading
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-blue-700"
              }`}
            >
              {isLoading ? (
                <>
                  <span>Sending...</span>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                </>
              ) : (
                <span>Send Reset Link</span>
              )}
            </button>
          </form>
        )}

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

export default ForgotPassword;

import { useState, useEffect, useRef, memo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Play, Pause, MoreHorizontal, Edit, Trash } from "lucide-react";
import { useTimer } from "../hooks/useTimer.js";
import {
  startTimerAPI,
  pauseTimerAPI,
  resumeTimerAPI,
  selectTaskTimer,
} from "../store/slices/timerSlice.js";
import { selectUser } from "../store/slices/authSlice.js";

const Card = memo(function Card({
  title,
  description,
  priority,
  onClick,
  onEdit,
  onDelete,
  variant = "board",
  className = "",
  taskId,
}) {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const { formattedTime, isRunning } = useTimer(taskId);
  const timerData = useSelector((state) => selectTaskTimer(state, taskId));

  const isManager = user?.role === "manager";

  useEffect(() => {
    if (!showMenu) return;

    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showMenu]);

  const handleToggleMenu = (e) => {
    e.stopPropagation();
    setShowMenu((prev) => !prev);
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    setShowMenu(false);
    onEdit && onEdit();
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    setShowMenu(false);
    onDelete && onDelete();
  };

  if (variant === "list") {
    return (
      <div
        onClick={onClick}
        className={`group flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 sm:p-4 hover:bg-slate-200 transition-all cursor-pointer border-b border-slate-800 last:border-b-0 gap-3 sm:gap-0 ${className}`}
      >
        <div className="flex flex-col gap-1 flex-1 min-w-0">
          <h3 className="text-slate-800 font-medium text-sm sm:text-base">
            {title}
          </h3>
          <p className="text-slate-600 text-xs sm:text-sm line-clamp-1">
            {description}
          </p>
        </div>

        <div className="flex items-center gap-3 sm:gap-4 lg:gap-6 w-full sm:w-auto justify-end sm:justify-start">
          <span
            className={`px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-xs font-medium whitespace-nowrap ${
              priority === "High" || priority === "Critical"
                ? "bg-red-500/10 text-red-400 border border-red-500/20"
                : priority === "Medium"
                ? "bg-orange-500/10 text-orange-400 border border-orange-500/20"
                : "bg-slate-500/10 text-slate-400 border border-slate-500/20"
            }`}
          >
            {priority}
          </span>

          <button
            onClick={(e) => {
              e.stopPropagation();
              if (!taskId) return;

              if (isRunning) {
                dispatch(pauseTimerAPI(taskId));
              } else {
                if (timerData && timerData.totalTime > 0) {
                  dispatch(resumeTimerAPI(taskId));
                } else {
                  dispatch(startTimerAPI(taskId));
                }
              }
            }}
            className={`flex items-center gap-1.5 sm:gap-2 lg:gap-3 font-mono text-xs sm:text-sm transition-colors cursor-pointer ${
              isRunning
                ? "text-yellow-600 hover:text-yellow-500"
                : "text-slate-600 hover:text-slate-700"
            }`}
          >
            {isRunning ? (
              <Pause size={12} className="sm:w-3.5 sm:h-3.5" />
            ) : (
              <Play size={12} className="sm:w-3.5 sm:h-3.5 ml-0.5" />
            )}
            <span className="whitespace-nowrap">{formattedTime}</span>
          </button>

          {isManager && (
            <div className="relative" ref={menuRef}>
              <button
                onClick={handleToggleMenu}
                className={`p-1.5 sm:p-2 rounded-lg transition-colors ${
                  showMenu
                    ? "bg-slate-800 text-white"
                    : "text-slate-600 hover:text-white hover:bg-slate-800"
                }`}
                aria-label="More options"
              >
                <MoreHorizontal size={16} className="sm:w-[18px] sm:h-[18px]" />
              </button>

              {showMenu && (
                <div className="absolute right-0 top-full mt-2 w-36 sm:w-40 bg-white border border-slate-800 rounded-xl shadow-xl z-50 overflow-hidden">
                  <button
                    onClick={handleEdit}
                    className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-left text-xs sm:text-sm text-slate-700 hover:bg-slate-100 hover:text-slate-900 flex items-center gap-2 transition-colors"
                  >
                    <Edit size={12} className="sm:w-3.5 sm:h-3.5" /> Edit Task
                  </button>
                  <button
                    onClick={handleDelete}
                    className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-left text-xs sm:text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                  >
                    <Trash size={12} className="sm:w-3.5 sm:h-3.5" /> Delete
                    Task
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <article
      onClick={onClick}
      className={`group relative bg-slate-100 border border-slate-800 rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-5 shadow-sm hover:shadow-md transition-shadow cursor-pointer w-full max-w-sm ${className}`}
    >
      <div className="flex justify-between items-start mb-2 gap-2">
        <h3 className="text-slate-800 font-bold text-base sm:text-lg pr-6 sm:pr-8 flex-1 min-w-0">
          {title}
        </h3>

        {isManager && (
          <div className="relative shrink-0" ref={menuRef}>
            <button
              onClick={handleToggleMenu}
              className={`text-slate-600 hover:text-white p-1 rounded-md hover:bg-slate-800 transition-all ${
                showMenu ? "opacity-100" : "opacity-0 group-hover:opacity-100"
              }`}
              aria-label="More options"
            >
              <MoreHorizontal size={18} className="sm:w-5 sm:h-5" />
            </button>

            {showMenu && (
              <div className="absolute right-0 top-8 sm:top-10 w-28 sm:w-32 bg-white border border-slate-800 rounded-lg shadow-xl z-10 overflow-hidden">
                <button
                  onClick={handleEdit}
                  className="w-full text-left px-3 sm:px-4 py-2 text-xs sm:text-sm text-slate-700 hover:bg-slate-100 hover:text-slate-900 flex items-center gap-2"
                >
                  <Edit size={12} className="sm:w-3.5 sm:h-3.5" />
                  Edit
                </button>
                <button
                  onClick={handleDelete}
                  className="w-full text-left px-3 sm:px-4 py-2 text-xs sm:text-sm text-red-600 hover:bg-red-50 hover:text-red-700 flex items-center gap-2"
                >
                  <Trash size={12} className="sm:w-3.5 sm:h-3.5" />
                  Delete
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <p className="text-slate-600 text-xs sm:text-sm mb-4 sm:mb-6 line-clamp-2">
        {description}
      </p>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
        <div className="flex items-center gap-2 sm:gap-3">
          {priority && (
            <span
              className={`px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                priority === "High" || priority === "Critical"
                  ? "bg-red-500/10 text-red-400 border border-red-500/20"
                  : priority === "Medium"
                  ? "bg-orange-500/10 text-orange-400 border border-orange-500/20"
                  : "bg-slate-500/10 text-slate-400 border border-slate-500/20"
              }`}
            >
              {priority}
            </span>
          )}
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            if (!taskId) return;

            if (isRunning) {
              dispatch(pauseTimerAPI(taskId));
            } else {
              if (timerData && timerData.totalTime > 0) {
                dispatch(resumeTimerAPI(taskId));
              } else {
                dispatch(startTimerAPI(taskId));
              }
            }
          }}
          className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full border border-slate-800 bg-slate-200 hover:bg-slate-300 transition-colors cursor-pointer"
        >
          {isRunning ? (
            <Pause
              size={12}
              className="sm:w-3.5 sm:h-3.5 text-red-600 fill-red-600"
            />
          ) : (
            <Play
              size={12}
              className="sm:w-3.5 sm:h-3.5 text-slate-700 fill-slate-700"
            />
          )}
          <span
            className={`text-xs sm:text-sm font-medium whitespace-nowrap ${
              isRunning ? "text-black" : "text-slate-700"
            }`}
          >
            {formattedTime}
          </span>
        </button>
      </div>
    </article>
  );
});

export default Card;

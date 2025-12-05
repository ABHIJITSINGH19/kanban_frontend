import { useDispatch, useSelector } from "react-redux";
import { X, Clock, Play, Pause, Calendar, User } from "lucide-react";
import {
  startTimerAPI,
  pauseTimerAPI,
  resumeTimerAPI,
  selectTaskTimer,
} from "../store/slices/timerSlice.js";
import { useTimer } from "../hooks/useTimer.js";

const TaskCard = ({ isOpen, onClose, task }) => {
  const dispatch = useDispatch();
  const { formattedTime, isRunning } = useTimer(task?.id);
  const timerData = useSelector((state) => selectTaskTimer(state, task?.id));

  if (!isOpen || !task) return null;

  const handleTimerAction = () => {
    if (!task?.id) return;

    if (isRunning) {
      dispatch(pauseTimerAPI(task.id));
    } else {
      if (timerData && timerData.totalTime > 0) {
        dispatch(resumeTimerAPI(task.id));
      } else {
        dispatch(startTimerAPI(task.id));
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 sm:p-6">
      <div className="bg-[#0B1120] border border-slate-800 rounded-xl sm:rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 max-h-[90vh] sm:max-h-[95vh] flex flex-col">
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-800">
          <h2 className="text-lg sm:text-xl font-bold text-white pr-2 sm:pr-0">
            {task.title}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors p-1 hover:bg-slate-800 rounded-full shrink-0"
            aria-label="Close"
          >
            <X size={18} className="sm:w-5 sm:h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-6 sm:space-y-8 overflow-y-auto flex-1">
          <div className="bg-[#111827] rounded-lg sm:rounded-xl p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 border border-slate-800">
            <div className="flex items-center gap-2 sm:gap-3 text-slate-400">
              <Clock size={18} className="sm:w-5 sm:h-5" />
              <span className="font-medium text-sm sm:text-base">
                Time Tracked
              </span>
            </div>
            <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto">
              <div className="bg-[#1F2937] px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-white font-mono font-medium border border-slate-700 min-w-[70px] sm:min-w-[80px] text-center text-sm sm:text-base">
                {formattedTime}
              </div>
              <button
                onClick={handleTimerAction}
                className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg border transition-colors font-medium text-sm sm:text-base flex-1 sm:flex-initial ${
                  isRunning
                    ? "bg-red-500/10 text-red-400 border-red-500/50 hover:bg-red-500/20"
                    : "bg-[#3A3018] text-yellow-500 border-yellow-900/50 hover:bg-[#4D4020]"
                }`}
              >
                {isRunning ? (
                  <>
                    <Pause size={14} className="sm:w-4 sm:h-4 fill-current" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play size={14} className="sm:w-4 sm:h-4 fill-current" />
                    {formattedTime === "0:00" ? "Start" : "Resume"}
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="space-y-1.5 sm:space-y-2">
            <label className="text-slate-400 text-xs sm:text-sm font-medium">
              Description
            </label>
            <p className="text-white text-sm sm:text-base lg:text-lg leading-relaxed">
              {task.description || "No description provided."}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
            <div className="space-y-1.5 sm:space-y-2">
              <label className="text-slate-400 text-xs sm:text-sm font-medium">
                Status
              </label>
              <div className="text-white font-medium text-base sm:text-lg capitalize">
                {task.status}
              </div>
            </div>

            <div className="space-y-1.5 sm:space-y-2">
              <label className="text-slate-400 text-xs sm:text-sm font-medium">
                Priority
              </label>
              <div className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full bg-[#3A3018] border border-yellow-900/50 text-yellow-500 text-xs sm:text-sm font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-yellow-500"></span>
                {task.priority || "Medium"}
              </div>
            </div>

            <div className="space-y-1.5 sm:space-y-2">
              <label className="text-slate-400 text-xs sm:text-sm font-medium">
                Assignee
              </label>
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-orange-600/50 flex items-center justify-center bg-orange-500/10 text-orange-500 shrink-0">
                  <User size={16} className="sm:w-5 sm:h-5" />
                </div>
                <span className="text-white font-medium text-sm sm:text-base truncate">
                  {task.assignee?.name || "Unassigned"}
                </span>
              </div>
            </div>

            <div className="space-y-1.5 sm:space-y-2">
              <label className="text-slate-400 text-xs sm:text-sm font-medium">
                Created
              </label>
              <div className="flex items-center gap-2 text-white font-medium text-sm sm:text-base">
                <Calendar
                  size={16}
                  className="sm:w-[18px] sm:h-[18px] text-slate-400"
                />
                {task.createdDate || "Jan 20, 2024"}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;

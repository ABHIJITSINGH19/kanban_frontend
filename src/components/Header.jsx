import { useState } from "react";
import { useSelector } from "react-redux";
import CreateTask from "../utils/CreateTask";
import { selectUser } from "../store/slices/authSlice";
import { ListPlus, Menu, User } from "lucide-react";

export default function Header({ onMenuClick }) {
  const user = useSelector(selectUser);
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);

  return (
    <header className="h-16 sm:h-20 bg-linear-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-slate-700 flex items-center justify-between px-4 sm:px-6 lg:px-8 shadow-lg">
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2 rounded-lg hover:bg-slate-700/50 transition-colors text-white"
        aria-label="Open menu"
      >
        <Menu size={20} />
      </button>

      <div className="flex items-center gap-3 sm:gap-4 lg:gap-6 ml-auto">
        {user?.role === "manager" && (
          <>
            <button
              onClick={() => setIsCreateTaskOpen(true)}
              className="p-1.5 sm:p-2 flex items-center gap-1.5 sm:gap-2 rounded-lg hover:bg-slate-700/50 transition-colors text-white"
              aria-label="Create new task"
            >
              <ListPlus
                size={18}
                className="sm:w-5 sm:h-5 text-slate-300 hover:text-white transition-colors"
              />
              <span className="hidden sm:inline text-sm sm:text-base">
                New Task
              </span>
            </button>

            <div className="hidden sm:block w-px h-6 bg-slate-600"></div>
          </>
        )}

        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border-2 border-blue-500 shadow-md bg-blue-600 flex items-center justify-center text-white shrink-0">
          <User size={16} className="sm:w-5 sm:h-5" />
        </div>
      </div>

      {isCreateTaskOpen && (
        <CreateTask onClose={() => setIsCreateTaskOpen(false)} />
      )}
    </header>
  );
}

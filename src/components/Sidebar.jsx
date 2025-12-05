import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  ListTodo,
  Users,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Check,
  User,
} from "lucide-react";
import { logoutUser, selectUser } from "../store/slices/authSlice";

const menu = [
  { name: "Tasks", path: "/", icon: ListTodo },
  { name: "Users", path: "/users", icon: Users },
];

export default function Sidebar({ isMobileOpen, setIsMobileOpen }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate("/login");
  };

  const handleLinkClick = () => {
    setIsMobileOpen(false);
  };

  return (
    <>
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <aside
        className={`${
          isCollapsed ? "w-16 sm:w-20" : "w-72"
        } bg-white h-screen flex flex-col border-r border-slate-200 font-sans transition-all duration-300 fixed lg:static z-50 ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="p-4 sm:p-6">
          <div
            className={`flex items-center ${
              isCollapsed ? "justify-center" : "justify-between"
            }`}
          >
            {!isCollapsed && (
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-blue-200 shadow-lg">
                  <span className="text-white font-bold text-lg sm:text-xl">
                    A
                  </span>
                </div>
                <div>
                  <h1 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                    ABHI.
                  </h1>
                  <p className="text-xs text-slate-500 font-medium hidden sm:block">
                    Task Management
                  </p>
                </div>
              </div>
            )}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className={`hidden lg:flex p-1 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors ${
                  isCollapsed ? "mb-2" : ""
                }`}
                aria-label="Toggle sidebar"
              >
                <Menu size={20} />
              </button>
              <button
                onClick={() => setIsMobileOpen(false)}
                className="lg:hidden p-1 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors"
                aria-label="Close sidebar"
              >
                <X size={20} />
              </button>
            </div>
          </div>
        </div>

        <div className="h-px bg-slate-200 mx-4 sm:mx-6"></div>

        <nav className="flex-1 px-2 sm:px-4 py-4 space-y-4 sm:space-y-6 overflow-y-auto">
          <div>
            {!isCollapsed && (
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2 sm:px-4 mb-2 sm:mb-3">
                Main
              </p>
            )}
            <div className="space-y-1">
              {menu.map((item) => {
                const IconComponent = item.icon;
                const isActive = pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={handleLinkClick}
                    className={`flex items-center ${
                      isCollapsed
                        ? "justify-center px-2"
                        : "justify-between px-3 sm:px-4"
                    } py-2.5 sm:py-3 rounded-xl font-medium cursor-pointer transition-all duration-200 group ${
                      isActive
                        ? "bg-slate-100 text-slate-900"
                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                    title={isCollapsed ? item.name : ""}
                  >
                    <div className="flex items-center gap-2 sm:gap-3">
                      <IconComponent
                        size={18}
                        className={`sm:w-5 sm:h-5 ${
                          isActive
                            ? "text-blue-600"
                            : "text-slate-400 group-hover:text-slate-600"
                        }`}
                      />
                      {!isCollapsed && (
                        <span className="text-sm sm:text-base">
                          {item.name}
                        </span>
                      )}
                    </div>
                    {isActive && !isCollapsed && (
                      <ChevronRight
                        size={16}
                        className="text-slate-900"
                        strokeWidth={3}
                      />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        </nav>

        <div className="p-3 sm:p-4 border-t border-slate-100">
          <div
            className={`flex items-center ${
              isCollapsed ? "justify-center" : "gap-2 sm:gap-3 px-2 sm:px-3"
            } py-2 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer group`}
          >
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-blue-100 flex items-center justify-center border-2 border-white shadow-sm shrink-0">
              <User size={16} className="sm:w-5 sm:h-5 text-blue-600" />
            </div>
            {!isCollapsed && (
              <>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    <p className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                      {user?.name || "User"}
                    </p>
                    <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-blue-500 flex items-center justify-center shrink-0">
                      <Check
                        size={6}
                        className="text-white sm:w-2 sm:h-2"
                        strokeWidth={4}
                      />
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 truncate hidden sm:block">
                    {user?.email || "user@example.com"}
                  </p>
                </div>
                <button className="text-slate-400 group-hover:text-slate-600 hidden sm:block">
                  <ChevronRight size={20} />
                </button>
              </>
            )}
          </div>

          <button
            onClick={handleLogout}
            className={`w-full mt-2 flex items-center ${
              isCollapsed ? "justify-center" : "gap-2 sm:gap-3 px-3 sm:px-4"
            } py-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 font-medium transition-all duration-300 text-xs sm:text-sm`}
            title={isCollapsed ? "Logout" : ""}
          >
            <LogOut size={16} className="sm:w-[18px] sm:h-[18px]" />
            {!isCollapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
}

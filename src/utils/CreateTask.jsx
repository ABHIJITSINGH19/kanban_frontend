import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { X, ChevronDown } from "lucide-react";
import {
  createTask,
  updateTask,
  selectTasksError,
} from "../store/slices/taskSlice";
import { getAllUsers, selectUsers } from "../store/slices/userSlice";

const CreateTask = ({ onClose, task = null }) => {
  const dispatch = useDispatch();
  const users = useSelector(selectUsers);
  const error = useSelector(selectTasksError);
  const [isLoading, setIsLoading] = useState(false);
  const isEditMode = !!task;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      title: task?.title || "",
      description: task?.description || "",
      status: task?._backendTask?.status || "pending",
      priority: task?._backendTask?.priority?.toLowerCase() || "medium",
      assignee:
        task?.assignee?.id ||
        task?._backendTask?.assignee?._id ||
        (task?._backendTask?.assignee &&
        typeof task._backendTask.assignee === "string"
          ? task._backendTask.assignee
          : ""),
    },
  });

  useEffect(() => {
    dispatch(getAllUsers());
  }, [dispatch]);

  useEffect(() => {
    if (task) {
      reset({
        title: task.title || "",
        description: task.description || "",
        status: task._backendTask?.status || "pending",
        priority: task._backendTask?.priority?.toLowerCase() || "medium",
        assignee:
          task.assignee?.id ||
          task._backendTask?.assignee?._id ||
          (task._backendTask?.assignee &&
          typeof task._backendTask.assignee === "string"
            ? task._backendTask.assignee
            : ""),
      });
    }
  }, [task, reset]);

  const onSubmit = async (data) => {
    setIsLoading(true);
    const taskData = {
      title: data.title,
      description: data.description || "",
      assignee: data.assignee,
      status: data.status || "pending",
      priority: data.priority || "medium",
    };

    if (isEditMode) {
      const result = await dispatch(updateTask({ taskId: task.id, taskData }));
      if (updateTask.fulfilled.match(result)) {
        reset();
        onClose();
      }
    } else {
      const result = await dispatch(createTask(taskData));
      if (createTask.fulfilled.match(result)) {
        reset();
        onClose();
      }
    }
    setIsLoading(false);
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 sm:p-6">
      <div className="w-full max-w-2xl bg-slate-900 rounded-lg sm:rounded-xl border border-slate-700 shadow-2xl overflow-hidden max-h-[90vh] sm:max-h-[95vh] flex flex-col">
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-700">
          <h2 className="text-lg sm:text-xl font-semibold text-white">
            {isEditMode ? "Edit Task" : "Create Task"}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors p-1"
            aria-label="Close"
          >
            <X size={18} className="sm:w-5 sm:h-5" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col flex-1 overflow-hidden"
        >
          <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 overflow-y-auto flex-1">
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-2.5 sm:p-3">
                <p className="text-red-400 text-xs sm:text-sm">{error}</p>
              </div>
            )}

            <div className="space-y-1.5 sm:space-y-2">
              <label className="text-xs sm:text-sm font-medium text-slate-400">
                Title <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                placeholder="Enter task title"
                {...register("title", {
                  required: "Title is required",
                })}
                className={`w-full bg-slate-950 border ${
                  errors.title ? "border-red-500" : "border-slate-700"
                } rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors`}
              />
              {errors.title && (
                <p className="text-red-400 text-xs">{errors.title.message}</p>
              )}
            </div>

            <div className="space-y-1.5 sm:space-y-2">
              <label className="text-xs sm:text-sm font-medium text-slate-400">
                Description
              </label>
              <textarea
                placeholder="Enter task description"
                rows={4}
                {...register("description")}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors resize-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-1.5 sm:space-y-2">
                <label className="text-xs sm:text-sm font-medium text-slate-400">
                  Status
                </label>
                <div className="relative">
                  <select
                    {...register("status")}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base text-white appearance-none focus:outline-none focus:border-blue-500 transition-colors"
                  >
                    <option value="pending">To Do</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                  <ChevronDown
                    className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 text-slate-400 pointer-events-none"
                    size={14}
                    strokeWidth={2.5}
                  />
                </div>
              </div>

              <div className="space-y-1.5 sm:space-y-2">
                <label className="text-xs sm:text-sm font-medium text-slate-400">
                  Priority
                </label>
                <div className="relative">
                  <select
                    {...register("priority")}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base text-white appearance-none focus:outline-none focus:border-blue-500 transition-colors"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                  <ChevronDown
                    className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 text-slate-400 pointer-events-none"
                    size={14}
                    strokeWidth={2.5}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1.5 sm:space-y-2">
              <label className="text-xs sm:text-sm font-medium text-slate-400">
                Assignee <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <select
                  {...register("assignee", {
                    required: "Assignee is required",
                  })}
                  className={`w-full bg-slate-950 border ${
                    errors.assignee ? "border-red-500" : "border-slate-700"
                  } rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base text-white appearance-none focus:outline-none focus:border-blue-500 transition-colors`}
                >
                  <option value="">Select assignee</option>
                  {users.map((user) => (
                    <option key={user._id} value={user._id}>
                      {user.name} ({user.email})
                    </option>
                  ))}
                </select>
                <ChevronDown
                  className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 text-slate-400 pointer-events-none"
                  size={14}
                  strokeWidth={2.5}
                />
              </div>
              {errors.assignee && (
                <p className="text-red-400 text-xs">
                  {errors.assignee.message}
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3 px-4 sm:px-6 py-3 sm:py-4 border-t border-slate-700 bg-slate-900/50">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-white bg-slate-800 border border-slate-700 rounded-lg hover:bg-slate-700 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-slate-900 bg-teal-500 rounded-lg hover:bg-teal-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
                  {isEditMode ? "Updating..." : "Creating..."}
                </>
              ) : isEditMode ? (
                "Update Task"
              ) : (
                "Create Task"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default CreateTask;

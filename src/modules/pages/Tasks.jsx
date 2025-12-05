import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import Card from "../../utils/Card";
import TaskCard from "../../utils/TaskCard";
import CreateTask from "../../utils/CreateTask";
import { LayoutGrid, List } from "lucide-react";
import {
  getAllTasks,
  updateTask,
  deleteTask,
  selectTasks,
  selectTasksLoading,
  selectTasksError,
  instantUpdateTaskStatus,
} from "../../store/slices/taskSlice";
import { syncTimerStateFromTasks } from "../../store/slices/timerSlice";

const DraggableTaskCard = ({ task, onClick, onEdit, onDelete }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={(e) => {
        if (!isDragging) {
          onClick?.(e);
        }
      }}
    >
      <Card
        title={task.title}
        description={task.description}
        tags={task.tags}
        status={task.status}
        assignee={task.assignee}
        dueDate={task.dueDate}
        priority={task.priority}
        taskId={task.id}
        onClick={() => {}}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    </div>
  );
};

const DroppableColumn = ({
  id,
  title,
  color,
  tasks,
  onTaskClick,
  onTaskEdit,
  onTaskDelete,
}) => {
  const { setNodeRef } = useDroppable({ id });
  const taskIds = tasks.map((task) => task.id);

  return (
    <div
      ref={setNodeRef}
      className="flex flex-col gap-2 sm:gap-4 bg-[#0f172a] p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-800/50 min-h-[200px]"
    >
      <div className="flex items-center gap-2 mb-2">
        <div className={`w-2 h-2 rounded-full ${color}`}></div>
        <h2 className="text-slate-400 font-semibold text-sm sm:text-base">
          {title}
        </h2>
        <span className="bg-slate-800 text-slate-400 text-xs px-2 py-0.5 rounded-full">
          {tasks.length}
        </span>
      </div>
      <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
        <div className="flex flex-col gap-2 sm:gap-4">
          {tasks.map((task) => (
            <DraggableTaskCard
              key={task.id}
              task={task}
              onClick={() => onTaskClick(task)}
              onEdit={() => onTaskEdit(task)}
              onDelete={() => onTaskDelete(task)}
            />
          ))}
        </div>
      </SortableContext>
    </div>
  );
};

const Tasks = () => {
  const [selectedTask, setSelectedTask] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [view, setView] = useState("board");
  const [activeId, setActiveId] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState(null);

  const dispatch = useDispatch();
  const backendTasks = useSelector(selectTasks);
  const isLoading = useSelector(selectTasksLoading);
  const error = useSelector(selectTasksError);

  const statusMap = {
    pending: "todo",
    "in-progress": "in-progress",
    completed: "done",
  };

  const reverseStatusMap = {
    todo: "pending",
    "in-progress": "in-progress",
    done: "completed",
  };

  useEffect(() => {
    dispatch(getAllTasks());
  }, [dispatch]);

  useEffect(() => {
    if (
      backendTasks &&
      Array.isArray(backendTasks) &&
      backendTasks.length > 0
    ) {
      const hasTimerData = backendTasks.some(
        (task) =>
          task.totalTrackedTime !== undefined || task.timerState !== undefined
      );
      if (hasTimerData) {
        dispatch(syncTimerStateFromTasks(backendTasks));
      }
    }
  }, [backendTasks, dispatch]);

  const transformTask = (backendTask) => {
    return {
      id: backendTask._id,
      title: backendTask.title,
      description: backendTask.description || "",
      tags: [],
      status: statusMap[backendTask.status] || "todo",
      priority: backendTask.priority
        ? backendTask.priority.charAt(0).toUpperCase() +
          backendTask.priority.slice(1)
        : "Medium",
      assignee: backendTask.assignee
        ? {
            name: backendTask.assignee.name || "Unknown",
            id: backendTask.assignee._id,
          }
        : { name: "Unassigned" },
      dueDate: backendTask.dueDate || "No due date",
      createdDate: backendTask.createdAt
        ? new Date(backendTask.createdAt).toLocaleDateString()
        : "",
      _backendTask: backendTask,
    };
  };

  const tasks = backendTasks.map(transformTask);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const columns = [
    { id: "todo", title: "To Do", color: "bg-blue-500", status: "todo" },
    {
      id: "in-progress",
      title: "In Progress",
      color: "bg-yellow-500",
      status: "in-progress",
    },
    { id: "done", title: "Done", color: "bg-green-500", status: "done" },
  ];

  const handleStatusUpdate = async (taskId, newStatus) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task || !task._backendTask) return;

    const backendStatus = reverseStatusMap[newStatus];
    if (task._backendTask.status === backendStatus) return;

    dispatch(instantUpdateTaskStatus({ taskId, newStatus: backendStatus }));

    const result = await dispatch(
      updateTask({
        taskId: taskId,
        taskData: { status: backendStatus },
      })
    );

    if (updateTask.rejected.match(result)) {
      dispatch(getAllTasks());
    }
  };

  const handleTaskEdit = (task) => {
    setTaskToEdit(task);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setTaskToEdit(null);
    dispatch(getAllTasks());
  };

  const handleTaskDelete = async (task) => {
    if (window.confirm(`Are you sure you want to delete "${task.title}"?`)) {
      const result = await dispatch(deleteTask(task.id));
      if (deleteTask.fulfilled.match(result)) {
        dispatch(getAllTasks());
      }
    }
  };

  const getTasksByStatus = (status) => {
    return tasks.filter((task) => task.status === status);
  };

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    const activeTask = tasks.find((task) => task.id === activeId);
    if (!activeTask) return;

    const overColumn = columns.find((col) => col.id === overId);
    if (overColumn && activeTask.status !== overColumn.status) {
      handleStatusUpdate(activeId, overColumn.status);
      return;
    }

    const overTask = tasks.find((task) => task.id === overId);
    if (overTask) {
      if (activeTask.status !== overTask.status) {
        handleStatusUpdate(activeId, overTask.status);
        return;
      }

      if (activeTask.status === overTask.status) {
        return;
      }
    }
  };

  const handleDragCancel = () => {
    setActiveId(null);
  };

  const handleCardClick = (task) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTask(null);
  };

  const activeTask = activeId
    ? tasks.find((task) => task.id === activeId)
    : null;

  return (
    <div className="space-y-4 sm:space-y-6 px-2 sm:px-0">
      {error && (
        <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3 sm:p-4">
          <p className="text-red-400 text-xs sm:text-sm">{error}</p>
        </div>
      )}

      {isLoading && tasks.length === 0 && (
        <div className="flex items-center justify-center py-8 sm:py-12">
          <div className="text-slate-400 text-sm sm:text-base">
            Loading tasks...
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-400">Tasks</h2>
        <div className="flex bg-slate-800 p-1 rounded-lg border border-slate-700">
          <button
            onClick={() => setView("board")}
            className={`p-1.5 sm:p-2 rounded-md transition-all ${
              view === "board"
                ? "bg-slate-700 text-white shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
            aria-label="Board view"
          >
            <LayoutGrid size={18} className="sm:w-5 sm:h-5" />
          </button>
          <button
            onClick={() => setView("list")}
            className={`p-1.5 sm:p-2 rounded-md transition-all ${
              view === "list"
                ? "bg-slate-700 text-white shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
            aria-label="List view"
          >
            <List size={18} className="sm:w-5 sm:h-5" />
          </button>
        </div>
      </div>

      {view === "board" ? (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragCancel={handleDragCancel}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 pb-6 sm:pb-8">
            {columns.map((column) => (
              <DroppableColumn
                key={column.id}
                id={column.id}
                title={column.title}
                color={column.color}
                tasks={getTasksByStatus(column.status)}
                onTaskClick={handleCardClick}
                onTaskEdit={handleTaskEdit}
                onTaskDelete={handleTaskDelete}
              />
            ))}
          </div>
          <DragOverlay>
            {activeTask ? (
              <div className="opacity-90">
                <Card
                  title={activeTask.title}
                  description={activeTask.description}
                  tags={activeTask.tags}
                  status={activeTask.status}
                  assignee={activeTask.assignee}
                  dueDate={activeTask.dueDate}
                  priority={activeTask.priority}
                  taskId={activeTask.id}
                />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      ) : (
        <div className="space-y-4 sm:space-y-6">
          {columns.map((section) => {
            const sectionTasks = getTasksByStatus(section.status);

            return (
              <div
                key={section.id}
                className="bg-[#0f172a] border border-slate-800/50 rounded-xl sm:rounded-2xl"
              >
                <div className="w-full flex items-center justify-between p-3 sm:p-4 rounded-t-xl sm:rounded-t-2xl">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className={`w-2 h-2 rounded-full ${section.color}`} />
                    <span className="text-slate-200 font-semibold text-sm sm:text-base">
                      {section.title}
                    </span>
                    <span className="bg-slate-800 text-slate-400 text-xs px-2 py-0.5 rounded-full border border-slate-700">
                      {sectionTasks.length}
                    </span>
                  </div>
                </div>

                <div className="border-t border-slate-800/50">
                  {sectionTasks.length > 0 ? (
                    sectionTasks.map((task) => (
                      <Card
                        key={task.id}
                        variant="list"
                        title={task.title}
                        description={task.description}
                        priority={task.priority}
                        assignee={task.assignee}
                        taskId={task.id}
                        className="last:rounded-b-xl sm:last:rounded-b-2xl"
                        onClick={() => handleCardClick(task)}
                        onEdit={() => handleTaskEdit(task)}
                        onDelete={() => handleTaskDelete(task)}
                      />
                    ))
                  ) : (
                    <div className="p-6 sm:p-8 text-center text-slate-500 text-xs sm:text-sm">
                      No tasks in this section
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <TaskCard
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        task={selectedTask}
      />

      {isEditModalOpen && (
        <CreateTask onClose={handleCloseEditModal} task={taskToEdit} />
      )}
    </div>
  );
};

export default Tasks;

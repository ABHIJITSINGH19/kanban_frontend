import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../utils/api";
import { loginUser } from "./authSlice";

export const getAllTasks = createAsyncThunk(
  "tasks/getAll",
  async (filters = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      if (filters.status) params.append("status", filters.status);
      if (filters.assignee) params.append("assignee", filters.assignee);
      if (filters.priority) params.append("priority", filters.priority);

      const queryString = params.toString();
      const url = queryString
        ? `/tasks/alltasks?${queryString}`
        : "/tasks/alltasks";
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Failed to fetch tasks"
      );
    }
  }
);

export const createTask = createAsyncThunk(
  "tasks/create",
  async (taskData, { rejectWithValue }) => {
    try {
      const response = await api.post("/tasks/createtask", taskData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Failed to create task"
      );
    }
  }
);

export const updateTask = createAsyncThunk(
  "tasks/update",
  async ({ taskId, taskData }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/tasks/updatetask/${taskId}`, taskData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Failed to update task"
      );
    }
  }
);

export const deleteTask = createAsyncThunk(
  "tasks/delete",
  async (taskId, { rejectWithValue }) => {
    try {
      await api.delete(`/tasks/deletetask/${taskId}`);
      return taskId;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Failed to delete task"
      );
    }
  }
);

const initialState = {
  tasks: [],
  currentTask: null,
  isLoading: false,
  error: null,
  filters: {
    status: null,
    assignee: null,
    priority: null,
  },
};

const taskSlice = createSlice({
  name: "tasks",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentTask: (state) => {
      state.currentTask = null;
    },
    clearAllTasks: (state) => {
      state.tasks = [];
      state.currentTask = null;
      state.error = null;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {
        status: null,
        assignee: null,
        priority: null,
      };
    },
    instantUpdateTaskStatus: (state, action) => {
      const { taskId, newStatus } = action.payload;
      const task = state.tasks.find((t) => t._id === taskId);
      if (task) {
        task.status = newStatus;
      }
      if (state.currentTask?._id === taskId) {
        state.currentTask.status = newStatus;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAllTasks.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getAllTasks.fulfilled, (state, action) => {
        state.isLoading = false;
        state.tasks = action.payload.tasks || [];
        state.error = null;
      })
      .addCase(getAllTasks.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      .addCase(createTask.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createTask.fulfilled, (state, action) => {
        state.isLoading = false;
        state.tasks.unshift(action.payload.task);
        state.error = null;
      })
      .addCase(createTask.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(updateTask.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateTask.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.tasks.findIndex(
          (t) => t._id === action.payload.task._id
        );
        if (index !== -1) {
          state.tasks[index] = action.payload.task;
        }
        if (state.currentTask?._id === action.payload.task._id) {
          state.currentTask = action.payload.task;
        }
        state.error = null;
      })
      .addCase(updateTask.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(deleteTask.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.isLoading = false;
        state.tasks = state.tasks.filter((t) => t._id !== action.payload);
        if (state.currentTask?._id === action.payload) {
          state.currentTask = null;
        }
        state.error = null;
      })
      .addCase(deleteTask.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(loginUser.pending, (state) => {
        state.tasks = [];
        state.currentTask = null;
        state.error = null;
      });
  },
});

export const {
  clearError,
  clearCurrentTask,
  clearAllTasks,
  setFilters,
  clearFilters,
  instantUpdateTaskStatus,
} = taskSlice.actions;

export const selectTasks = (state) => state.tasks.tasks;
export const selectCurrentTask = (state) => state.tasks.currentTask;
export const selectTasksLoading = (state) => state.tasks.isLoading;
export const selectTasksError = (state) => state.tasks.error;
export const selectTasksFilters = (state) => state.tasks.filters;

export default taskSlice.reducer;

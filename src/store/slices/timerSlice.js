import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../utils/api";
import { loginUser } from "./authSlice";

export const startTimerAPI = createAsyncThunk(
  "timer/start",
  async (taskId, { rejectWithValue, getState, dispatch }) => {
    try {
      const state = getState();
      const previousActiveTaskId = state.timer.activeTaskId;

      const response = await api.post(`/tasks/${taskId}/timer/start`);

      if (previousActiveTaskId && previousActiveTaskId !== taskId) {
        dispatch(getTimerStatus(previousActiveTaskId));
      }

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Failed to start timer"
      );
    }
  }
);

export const pauseTimerAPI = createAsyncThunk(
  "timer/pause",
  async (taskId, { rejectWithValue }) => {
    try {
      const response = await api.post(`/tasks/${taskId}/timer/pause`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Failed to pause timer"
      );
    }
  }
);

export const resumeTimerAPI = createAsyncThunk(
  "timer/resume",
  async (taskId, { rejectWithValue, getState, dispatch }) => {
    try {
      const state = getState();
      const previousActiveTaskId = state.timer.activeTaskId;

      const response = await api.post(`/tasks/${taskId}/timer/resume`);

      if (previousActiveTaskId && previousActiveTaskId !== taskId) {
        dispatch(getTimerStatus(previousActiveTaskId));
      }

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Failed to resume timer"
      );
    }
  }
);

export const getTimerStatus = createAsyncThunk(
  "timer/getStatus",
  async (taskId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/tasks/${taskId}/timer/status`);
      return { taskId, ...response.data };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Failed to get timer status"
      );
    }
  }
);

const loadTimerStateFromStorage = () => {
  try {
    const stored = localStorage.getItem("timerState");
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.tasks) {
        Object.keys(parsed.tasks).forEach((taskId) => {
          const task = parsed.tasks[taskId];
          if (task.sessionStartTime) {
            const sessionStart = Number(task.sessionStartTime);
            if (task.isRunning) {
              const now = Date.now();
              const maxAge = 24 * 60 * 60 * 1000;
              if (
                isNaN(sessionStart) ||
                sessionStart <= 0 ||
                now - sessionStart > maxAge
              ) {
                task.isRunning = false;
                task.sessionStartTime = null;
                if (parsed.activeTaskId === taskId) {
                  parsed.activeTaskId = null;
                }
              } else {
                task.sessionStartTime = sessionStart;
              }
            } else {
              task.sessionStartTime = null;
            }
          } else if (task.isRunning) {
            task.isRunning = false;
            if (parsed.activeTaskId === taskId) {
              parsed.activeTaskId = null;
            }
          }
        });
      }
      return {
        ...parsed,
        isLoading: false,
        error: null,
      };
    }
  } catch (error) {
    console.error("Failed to load timer state from localStorage:", error);
  }
  return {
    activeTaskId: null,
    tasks: {},
    isLoading: false,
    error: null,
  };
};

const initialState = loadTimerStateFromStorage();

const timerSlice = createSlice({
  name: "timer",
  initialState,
  reducers: {
    startTimer: (state, action) => {
      const taskId = action.payload;

      if (state.activeTaskId && state.activeTaskId !== taskId) {
        const activeTask = state.tasks[state.activeTaskId];
        if (activeTask && activeTask.isRunning) {
          const elapsedTime = Date.now() - activeTask.sessionStartTime;
          state.tasks[state.activeTaskId] = {
            ...activeTask,
            totalTime: activeTask.totalTime + elapsedTime,
            isRunning: false,
            sessionStartTime: null,
          };
        }
      }

      if (!state.tasks[taskId]) {
        state.tasks[taskId] = {
          totalTime: 0,
          isRunning: false,
          sessionStartTime: null,
        };
      }

      state.tasks[taskId].isRunning = true;
      state.tasks[taskId].sessionStartTime = Date.now();
      state.activeTaskId = taskId;
    },

    pauseTimer: (state, action) => {
      const taskId = action.payload || state.activeTaskId;

      if (taskId && state.tasks[taskId] && state.tasks[taskId].isRunning) {
        const elapsedTime = Date.now() - state.tasks[taskId].sessionStartTime;
        state.tasks[taskId].totalTime += elapsedTime;
        state.tasks[taskId].isRunning = false;
        state.tasks[taskId].sessionStartTime = null;

        if (state.activeTaskId === taskId) {
          state.activeTaskId = null;
        }
      }
    },

    resumeTimer: (state, action) => {
      const taskId = action.payload;

      if (state.activeTaskId && state.activeTaskId !== taskId) {
        const activeTask = state.tasks[state.activeTaskId];
        if (activeTask && activeTask.isRunning) {
          const elapsedTime = Date.now() - activeTask.sessionStartTime;
          state.tasks[state.activeTaskId] = {
            ...activeTask,
            totalTime: activeTask.totalTime + elapsedTime,
            isRunning: false,
            sessionStartTime: null,
          };
        }
      }

      if (state.tasks[taskId]) {
        state.tasks[taskId].isRunning = true;
        state.tasks[taskId].sessionStartTime = Date.now();
        state.activeTaskId = taskId;
      }
    },

    stopTimer: (state, action) => {
      const taskId = action.payload || state.activeTaskId;

      if (taskId && state.tasks[taskId]) {
        if (state.tasks[taskId].isRunning) {
          const elapsedTime = Date.now() - state.tasks[taskId].sessionStartTime;
          state.tasks[taskId].totalTime += elapsedTime;
        }
        state.tasks[taskId].isRunning = false;
        state.tasks[taskId].sessionStartTime = null;

        if (state.activeTaskId === taskId) {
          state.activeTaskId = null;
        }
      }
    },

    resetTimer: (state, action) => {
      const taskId = action.payload;
      if (state.tasks[taskId]) {
        state.tasks[taskId] = {
          totalTime: 0,
          isRunning: false,
          sessionStartTime: null,
        };
        if (state.activeTaskId === taskId) {
          state.activeTaskId = null;
        }
      }
    },
    syncTimerStateFromTasks: (state, action) => {
      const tasks = action.payload;

      if (!tasks || !Array.isArray(tasks)) {
        return;
      }

      const savedActiveTaskId = state.activeTaskId;
      const currentLocalTimer = savedActiveTaskId
        ? state.tasks[savedActiveTaskId]
        : null;
      const hasValidLocalRunningTimer =
        currentLocalTimer &&
        currentLocalTimer.isRunning &&
        currentLocalTimer.sessionStartTime &&
        Date.now() - currentLocalTimer.sessionStartTime < 24 * 60 * 60 * 1000;

      state.activeTaskId = null;

      const newTasks = {};

      tasks.forEach((task) => {
        const taskId = task._id || task.id;
        if (!taskId) return;

        const totalTrackedTime = task.totalTrackedTime ?? 0;

        const serverCalculatedTotalTime =
          task.currentTotalTime ?? totalTrackedTime;

        const timerState = task.timerState || {};
        const isRunning = timerState.isRunning === true;

        let currentSessionStart = null;
        if (timerState.currentSessionStart) {
          try {
            const date = new Date(timerState.currentSessionStart);
            if (!isNaN(date.getTime())) {
              currentSessionStart = date.getTime();
            }
          } catch (e) {
            currentSessionStart = null;
          }
        }

        if (isRunning && currentSessionStart) {
          newTasks[taskId] = {
            totalTime: totalTrackedTime,
            isRunning: true,
            sessionStartTime: currentSessionStart,
            serverTotalTime: serverCalculatedTotalTime,
            lastServerSync: Date.now(),
          };
          state.activeTaskId = taskId;
        } else if (
          hasValidLocalRunningTimer &&
          savedActiveTaskId === taskId &&
          currentLocalTimer
        ) {
          newTasks[taskId] = {
            ...currentLocalTimer,
            totalTime: totalTrackedTime,
          };
          state.activeTaskId = taskId;
        } else {
          newTasks[taskId] = {
            totalTime: totalTrackedTime,
            isRunning: false,
            sessionStartTime: null,
            serverTotalTime: serverCalculatedTotalTime,
            lastServerSync: Date.now(),
          };
        }
      });

      state.tasks = newTasks;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(startTimerAPI.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(startTimerAPI.fulfilled, (state, action) => {
        state.isLoading = false;
        const task = action.payload.task;
        const taskId = task._id;

        if (state.activeTaskId && state.activeTaskId !== taskId) {
          const activeTask = state.tasks[state.activeTaskId];
          if (activeTask && activeTask.isRunning) {
            const elapsedTime = Date.now() - activeTask.sessionStartTime;
            const newTotalTime = activeTask.totalTime + elapsedTime;
            state.tasks[state.activeTaskId] = {
              ...activeTask,
              totalTime: newTotalTime,
              isRunning: false,
              sessionStartTime: null,
              serverTotalTime: newTotalTime,
              lastServerSync: Date.now(),
            };
          }
        }

        if (task.timerState?.isRunning) {
          state.activeTaskId = taskId;
          const sessionStartTime = new Date(
            task.timerState.currentSessionStart
          ).getTime();
          const serverTotalTime =
            task.currentTotalTime || task.totalTrackedTime || 0;
          state.tasks[taskId] = {
            totalTime: task.totalTrackedTime || 0,
            isRunning: true,
            sessionStartTime: sessionStartTime,
            serverTotalTime: serverTotalTime,
            lastServerSync: Date.now(),
          };
        }
        state.error = null;
      })
      .addCase(startTimerAPI.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(pauseTimerAPI.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(pauseTimerAPI.fulfilled, (state, action) => {
        state.isLoading = false;
        const task = action.payload.task;
        const taskId = task._id;

        if (state.tasks[taskId]) {
          const serverTotalTime =
            task.currentTotalTime || task.totalTrackedTime || 0;
          state.tasks[taskId].isRunning = false;
          state.tasks[taskId].totalTime = task.totalTrackedTime || 0;
          state.tasks[taskId].sessionStartTime = null;
          state.tasks[taskId].serverTotalTime = serverTotalTime;
          state.tasks[taskId].lastServerSync = Date.now();
        }
        if (state.activeTaskId === taskId) {
          state.activeTaskId = null;
        }
        state.error = null;
      })
      .addCase(pauseTimerAPI.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(resumeTimerAPI.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(resumeTimerAPI.fulfilled, (state, action) => {
        state.isLoading = false;
        const task = action.payload.task;
        const taskId = task._id;

        if (state.activeTaskId && state.activeTaskId !== taskId) {
          const activeTask = state.tasks[state.activeTaskId];
          if (activeTask && activeTask.isRunning) {
            const elapsedTime = Date.now() - activeTask.sessionStartTime;
            const newTotalTime = activeTask.totalTime + elapsedTime;
            state.tasks[state.activeTaskId] = {
              ...activeTask,
              totalTime: newTotalTime,
              isRunning: false,
              sessionStartTime: null,
              serverTotalTime: newTotalTime,
              lastServerSync: Date.now(),
            };
          }
        }

        if (task.timerState?.isRunning) {
          state.activeTaskId = taskId;
          const sessionStartTime = new Date(
            task.timerState.currentSessionStart
          ).getTime();
          const serverTotalTime =
            task.currentTotalTime || task.totalTrackedTime || 0;
          state.tasks[taskId] = {
            totalTime: task.totalTrackedTime || 0,
            isRunning: true,
            sessionStartTime: sessionStartTime,
            serverTotalTime: serverTotalTime,
            lastServerSync: Date.now(),
          };
        }
        state.error = null;
      })
      .addCase(resumeTimerAPI.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(getTimerStatus.fulfilled, (state, action) => {
        const { taskId, timer } = action.payload;
        const sessionStartTime = timer.currentSessionStart
          ? new Date(timer.currentSessionStart).getTime()
          : null;

        state.tasks[taskId] = {
          totalTime: timer.totalTrackedTime || 0,
          isRunning: timer.isRunning || false,
          sessionStartTime: sessionStartTime,
          serverTotalTime: timer.totalTime || timer.totalTrackedTime || 0,
          lastServerSync: Date.now(),
        };
        if (timer.isRunning) {
          state.activeTaskId = taskId;
        }
      })
      .addCase(loginUser.pending, (state) => {
        state.activeTaskId = null;
        state.tasks = {};
        state.error = null;
        localStorage.removeItem("timerState");
      });
  },
});

export const {
  startTimer,
  pauseTimer,
  resumeTimer,
  stopTimer,
  resetTimer,
  syncTimerStateFromTasks,
  clearError: clearTimerError,
} = timerSlice.actions;

export const selectActiveTaskId = (state) => state.timer.activeTaskId;
export const selectTaskTimer = (state, taskId) => state.timer.tasks[taskId];
export const selectIsTaskRunning = (state, taskId) =>
  state.timer.tasks[taskId]?.isRunning || false;
export const selectTaskTotalTime = (state, taskId) =>
  state.timer.tasks[taskId]?.totalTime || 0;
export const selectTimerLoading = (state) => state.timer.isLoading;
export const selectTimerError = (state) => state.timer.error;

export default timerSlice.reducer;

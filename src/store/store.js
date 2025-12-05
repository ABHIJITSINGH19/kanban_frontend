import { configureStore } from "@reduxjs/toolkit";
import timerReducer from "./slices/timerSlice.js";
import authReducer from "./slices/authSlice.js";
import taskReducer from "./slices/taskSlice.js";
import userReducer from "./slices/userSlice.js";

let saveTimeout = null;
const timerPersistenceMiddleware = (store) => (next) => (action) => {
  const result = next(action);

  if (action.type?.startsWith("timer/")) {
    if (saveTimeout) {
      clearTimeout(saveTimeout);
    }

    saveTimeout = setTimeout(() => {
      const timerState = store.getState().timer;
      try {
        const stateToSave = {
          activeTaskId: timerState.activeTaskId,
          tasks: timerState.tasks,
        };
        localStorage.setItem("timerState", JSON.stringify(stateToSave));
      } catch (error) {
        console.error("Failed to save timer state to localStorage:", error);
      }
    }, 500);
  }
  return result;
};

export const store = configureStore({
  reducer: {
    timer: timerReducer,
    auth: authReducer,
    tasks: taskReducer,
    users: userReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(timerPersistenceMiddleware),
});

export default store;

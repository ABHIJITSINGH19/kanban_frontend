import { useSelector, useDispatch } from "react-redux";
import { useEffect, useState, useRef } from "react";
import {
  selectTaskTimer,
  selectIsTaskRunning,
  getTimerStatus,
} from "../store/slices/timerSlice.js";

export const formatTime = (seconds) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  }
  return `${minutes}:${secs.toString().padStart(2, "0")}`;
};

export const useTimer = (taskId) => {
  const dispatch = useDispatch();
  const timer = useSelector((state) => selectTaskTimer(state, taskId));
  const isRunning = useSelector((state) => selectIsTaskRunning(state, taskId));
  const [currentTime, setCurrentTime] = useState(0);
  const syncIntervalRef = useRef(null);
  const displayIntervalRef = useRef(null);
  const lastServerTimeRef = useRef(0);
  const lastServerSyncRef = useRef(0);

  useEffect(() => {
    if (!timer || !taskId) {
      setCurrentTime(0);
      if (syncIntervalRef.current) clearInterval(syncIntervalRef.current);
      if (displayIntervalRef.current) clearInterval(displayIntervalRef.current);
      return;
    }

    if (isRunning && timer.sessionStartTime) {
      const serverBaseTime = timer.serverTotalTime
        ? timer.serverTotalTime / 1000
        : timer.totalTime / 1000;

      const timeSinceServerSync = timer.lastServerSync
        ? (Date.now() - timer.lastServerSync) / 1000
        : (Date.now() - timer.sessionStartTime) / 1000;

      const initialTime = serverBaseTime + timeSinceServerSync;
      setCurrentTime(initialTime);
      lastServerTimeRef.current = serverBaseTime;
      lastServerSyncRef.current = timer.lastServerSync || Date.now();

      syncIntervalRef.current = setInterval(() => {
        dispatch(getTimerStatus(taskId));
      }, 30000);

      displayIntervalRef.current = setInterval(() => {
        const elapsedSinceSync =
          (Date.now() - lastServerSyncRef.current) / 1000;
        setCurrentTime(lastServerTimeRef.current + elapsedSinceSync);
      }, 1000);

      return () => {
        if (syncIntervalRef.current) clearInterval(syncIntervalRef.current);
        if (displayIntervalRef.current)
          clearInterval(displayIntervalRef.current);
      };
    } else {
      const pausedTime = timer.serverTotalTime
        ? timer.serverTotalTime / 1000
        : timer.totalTime / 1000;
      setCurrentTime(pausedTime);

      if (syncIntervalRef.current) clearInterval(syncIntervalRef.current);
      if (displayIntervalRef.current) clearInterval(displayIntervalRef.current);
    }
  }, [timer, isRunning, taskId, dispatch]);

  useEffect(() => {
    if (timer?.serverTotalTime && timer?.lastServerSync) {
      lastServerTimeRef.current = timer.serverTotalTime / 1000;
      lastServerSyncRef.current = timer.lastServerSync;

      if (isRunning) {
        const elapsedSinceSync = (Date.now() - timer.lastServerSync) / 1000;
        setCurrentTime(lastServerTimeRef.current + elapsedSinceSync);
      } else {
        setCurrentTime(lastServerTimeRef.current);
      }
    }
  }, [timer?.serverTotalTime, timer?.lastServerSync, isRunning]);

  return {
    totalTime: timer?.totalTime || 0,
    isRunning,
    currentTime,
    formattedTime: formatTime(currentTime),
  };
};

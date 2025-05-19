import { useAuthStore } from "../store/authStore";

const TIMEOUT_DURATION = 30 * 60 * 1000; // 30 minutes in milliseconds
let timeoutId = null;
let lastActivityTime = Date.now();
let logoutCallback = null;

const updateLastActivity = () => {
  lastActivityTime = Date.now();
};

const setupActivityListeners = () => {
  // List of events to track for user activity
  const events = [
    "mousedown",
    "mousemove",
    "keydown",
    "scroll",
    "touchstart",
    "click",
    "keypress",
  ];

  // Add listeners for each event
  events.forEach((event) => {
    window.addEventListener(event, updateLastActivity);
  });
};

const removeActivityListeners = () => {
  const events = [
    "mousedown",
    "mousemove",
    "keydown",
    "scroll",
    "touchstart",
    "click",
    "keypress",
  ];

  events.forEach((event) => {
    window.removeEventListener(event, updateLastActivity);
  });
};

const checkInactivity = () => {
  const currentTime = Date.now();
  const timeSinceLastActivity = currentTime - lastActivityTime;

  if (timeSinceLastActivity >= TIMEOUT_DURATION && logoutCallback) {
    console.log("Session timeout - logging out");
    logoutCallback();
  }
};

const startSessionTimer = (onLogout) => {
  // Store logout callback
  logoutCallback = onLogout;

  // Clear any existing timer
  if (timeoutId) {
    clearInterval(timeoutId);
  }

  // Initialize last activity time
  updateLastActivity();

  // Set up activity listeners
  setupActivityListeners();

  // Start the interval to check for inactivity
  timeoutId = setInterval(checkInactivity, 60000); // Check every minute
};

const stopSessionTimer = () => {
  if (timeoutId) {
    clearInterval(timeoutId);
    timeoutId = null;
  }
  removeActivityListeners();
  logoutCallback = null;
};

export { startSessionTimer, stopSessionTimer };

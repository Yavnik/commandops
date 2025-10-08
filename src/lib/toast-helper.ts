// Global toast function that can be called from anywhere
// This will be set by the ToastProvider when it mounts
let globalToast:
  | ((toast: {
      message: string;
      type: 'success' | 'error' | 'info';
      duration?: number;
    }) => void)
  | null = null;

export function setGlobalToast(toastFn: typeof globalToast) {
  globalToast = toastFn;
}

export function showToast(
  message: string,
  type: 'success' | 'error' | 'info' = 'info',
  duration?: number
) {
  if (globalToast) {
    globalToast({ message, type, duration });
  } else {
    // Fallback to console if toast system isn't available
    const logMessage = `Toast: ${type.toUpperCase()} - ${message}`;
    switch (type) {
      case 'error':
        console.error(logMessage);
        break;
      case 'info':
        console.info(logMessage);
        break;
      case 'success':
        console.log(logMessage);
        break;
      default:
        console.log(logMessage);
    }
  }
}

export function showSuccessToast(message: string, duration?: number) {
  showToast(message, 'success', duration);
}

export function showErrorToast(message: string, duration?: number) {
  showToast(message, 'error', duration);
}

export function showInfoToast(message: string, duration?: number) {
  showToast(message, 'info', duration);
}

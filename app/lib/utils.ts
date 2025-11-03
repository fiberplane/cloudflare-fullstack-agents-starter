import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * A rate-limited function that ensures the function is called at most once every delay period,
 * but always with the latest parameters from calls made during the rate limit period.
 *
 * @param func - The function to rate limit
 * @param delay - The rate limit delay in milliseconds
 * @returns A rate-limited version of the function
 */

export function parameterAwareDebounce<T extends (...args: A) => void, A extends unknown[]>(
  func: T,
  delay: number,
): ((...args: A) => void) & { cancel: () => void } {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  let pendingArgs: A | null = null;
  let lastCallTime = 0;

  const debounced = (...args: A) => {
    // Always capture the latest parameters
    pendingArgs = args;

    const now = Date.now();
    const timeSinceLastCall = now - lastCallTime;

    // If enough time has passed since the last call, execute immediately
    if (timeSinceLastCall >= delay) {
      lastCallTime = now;
      func(...args);
      pendingArgs = null;
      return;
    }

    // If we're within the rate limit period, schedule the call for when the period expires
    if (!timeoutId) {
      const remainingTime = delay - timeSinceLastCall;
      timeoutId = setTimeout(() => {
        timeoutId = null;
        lastCallTime = Date.now();
        if (pendingArgs) {
          func(...pendingArgs);
          pendingArgs = null;
        }
      }, remainingTime);
    }
  };

  debounced.cancel = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
    pendingArgs = null;
  };

  return debounced;
}

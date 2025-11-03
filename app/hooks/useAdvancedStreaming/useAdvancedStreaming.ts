import { useCallback, useEffect, useRef, useState } from "react";

interface StreamingTextState {
  displayedText: string;
  isComplete: boolean;
}

/**
 * Tokenize text into words while preserving whitespace patterns
 */
function tokenizeToWords(text: string): string[] {
  if (!text) {
    return [];
  }

  const words: string[] = [];
  let currentWord = "";
  let i = 0;

  while (i < text.length) {
    const char = text[i];

    if (/\s/.test(char)) {
      // If we have a current word, complete it and add trailing whitespace
      if (currentWord) {
        // Collect all consecutive whitespace
        let whitespace = "";
        while (i < text.length && /\s/.test(text[i])) {
          whitespace += text[i];
          i++;
        }
        words.push(currentWord + whitespace);
        currentWord = "";
      } else {
        // Handle leading whitespace
        let whitespace = "";
        while (i < text.length && /\s/.test(text[i])) {
          whitespace += text[i];
          i++;
        }
        if (whitespace) {
          words.push(whitespace);
        }
      }
    } else {
      currentWord += char;
      i++;
    }
  }

  // Add any remaining word (without trailing whitespace)
  if (currentWord) {
    words.push(currentWord);
  }

  return words;
}

/**
 * Hook that provides fine-grained control over streaming behavior
 */
export function useAdvancedStreaming(
  sourceText: string,
  options: {
    /** Base delay between word releases in ms */
    delayMs?: number;
    /* Important - if you set this to false, the sourceText will be displayed immediately */
    enabled?: boolean;
    /** Minimum characters to accumulate before starting to stream */
    minBufferSize?: number;
    /** Maximum characters to release per interval */
    maxCharsPerRelease?: number;
    /** Whether to use word boundaries or character-level streaming */
    useWordBoundaries?: boolean;
    /** Buffer threshold to trigger acceleration (chars) */
    accelerationThreshold?: number;
    /** Maximum words to release at once when accelerating */
    maxWordsPerAcceleration?: number;
    /** Minimum delay when accelerating (ms) */
    minAccelerationDelay?: number;
  } = {},
): StreamingTextState & {
  bufferSize: number;
  releaseRate: number;
} {
  const {
    delayMs = 40,
    enabled = true,
    minBufferSize = 10,
    maxCharsPerRelease = 50,
    useWordBoundaries = true,
    accelerationThreshold = 100,
    maxWordsPerAcceleration = 5,
    minAccelerationDelay = 10,
  } = options;

  const [displayedText, setDisplayedText] = useState(sourceText);
  const [bufferSize, setBufferSize] = useState(0);
  const [releaseRate, setReleaseRate] = useState(0);

  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const lastSourceRef = useRef(displayedText);
  const pendingContentRef = useRef("");
  const lastReleaseTimeRef = useRef(Date.now());

  const scheduleRelease = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Determine if we should accelerate based on buffer pressure
    const bufferPressure = pendingContentRef.current.length;
    const shouldAccelerate = bufferPressure >= accelerationThreshold;

    // Calculate dynamic delay and release amount
    const currentDelay = shouldAccelerate
      ? Math.max(minAccelerationDelay, delayMs * 0.25)
      : delayMs;

    const wordsToRelease = shouldAccelerate
      ? Math.min(maxWordsPerAcceleration, Math.ceil(bufferPressure / 50))
      : 1;

    timeoutRef.current = setTimeout(() => {
      if (!pendingContentRef.current) {
        return;
      }

      let releaseContent: string;

      if (useWordBoundaries) {
        // Release multiple words when accelerating
        const words = tokenizeToWords(pendingContentRef.current);
        const wordsToTake = Math.min(wordsToRelease, words.length);

        if (wordsToTake > 0) {
          const selectedWords = words.slice(0, wordsToTake);
          releaseContent = selectedWords.join("");
          const totalLength = selectedWords.reduce((sum, word) => sum + word.length, 0);
          pendingContentRef.current = pendingContentRef.current.slice(totalLength);
        } else {
          releaseContent = "";
        }
      } else {
        // Release character by character up to max limit
        const releaseLength = Math.min(maxCharsPerRelease, pendingContentRef.current.length);
        releaseContent = pendingContentRef.current.slice(0, releaseLength);
        pendingContentRef.current = pendingContentRef.current.slice(releaseLength);
      }

      if (releaseContent) {
        setDisplayedText((prev) => prev + releaseContent);

        // Update metrics
        const now = Date.now();
        const interval = now - lastReleaseTimeRef.current;
        setReleaseRate((releaseContent.length / interval) * 1000); // chars per second
        lastReleaseTimeRef.current = now;
      }

      setBufferSize(pendingContentRef.current.length);

      // Continue if more content is pending
      if (pendingContentRef.current.length > 0) {
        scheduleRelease();
      }
    }, currentDelay);
  }, [
    delayMs,
    maxCharsPerRelease,
    useWordBoundaries,
    accelerationThreshold,
    maxWordsPerAcceleration,
    minAccelerationDelay,
  ]);

  useEffect(() => {
    if (!enabled || sourceText === lastSourceRef.current) {
      return;
    }

    // Handle reset scenario
    if (
      sourceText.length < lastSourceRef.current.length ||
      !sourceText.startsWith(lastSourceRef.current)
    ) {
      if (timeoutRef.current) {
        console.debug("[useAdvancedStreaming] clearing timeout");
        clearTimeout(timeoutRef.current);
      }

      setDisplayedText("");
      setBufferSize(0);
      pendingContentRef.current = "";
      lastSourceRef.current = "";
      return;
    }

    // Add new content to buffer
    const newContent = sourceText.slice(lastSourceRef.current.length);
    lastSourceRef.current = sourceText;
    pendingContentRef.current += newContent;
    setBufferSize(pendingContentRef.current.length);

    // Start streaming if buffer meets minimum threshold
    if (pendingContentRef.current.length >= minBufferSize) {
      scheduleRelease();
    }
  }, [sourceText, enabled, minBufferSize, scheduleRelease]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    displayedText: enabled ? displayedText : sourceText,
    isComplete: enabled === false || displayedText === sourceText,
    bufferSize,
    releaseRate,
  };
}

import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useAdvancedStreaming } from "./useAdvancedStreaming";

// Mock requestAnimationFrame and cancelAnimationFrame
const mockRAF = vi.fn((callback) => setTimeout(callback, 0));
const mockCAF = vi.fn((id) => clearTimeout(id));

describe("useAdvancedStreaming", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    // Mock requestAnimationFrame and cancelAnimationFrame
    global.requestAnimationFrame = mockRAF as unknown as typeof global.requestAnimationFrame;
    global.cancelAnimationFrame = mockCAF;
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it("should stream text when enabled with no starting text", async () => {
    const { result, rerender } = renderHook(
      ({ text }) => useAdvancedStreaming(text, { enabled: true, delayMs: 50 }),
      { initialProps: { text: "" } },
    );

    // Initially should be empty
    expect(result.current.displayedText).toBe("");
    expect(result.current.isComplete).toBe(true);
    rerender({ text: "Hello world" });

    expect(result.current.isComplete).toBe(false);
    await act(async () => {
      vi.advanceTimersByTime(100);
    });

    // Should have streamed some text
    expect(result.current.displayedText).toBe("Hello world");
    expect(result.current.isComplete).toBe(true);
  });

  it("should stream text when enabled with starting text", async () => {
    const { result, rerender } = renderHook(
      ({ text }) =>
        useAdvancedStreaming(text, {
          enabled: true,
          delayMs: 50,
          // Set the min buffer size to 1 to allow streaming to start immediately
          minBufferSize: 1,
        }),
      { initialProps: { text: "Hello" } },
    );

    // Initially should show starting text
    expect(result.current.displayedText).toBe("Hello");
    expect(result.current.isComplete).toBe(true);

    // Update the text
    rerender({ text: "Hello world. Welcome to the future." });
    expect(result.current.displayedText).toBe("Hello");
    expect(result.current.isComplete).toBe(false);

    // Fast forward time to allow streaming
    await act(async () => {
      vi.advanceTimersByTime(100);
    });

    // Should have streamed the additional text
    expect(result.current.displayedText).toBe("Hello world. ");
    expect(result.current.isComplete).toBe(false);
  });

  it("should show full text immediately when disabled", () => {
    const { result } = renderHook(() => useAdvancedStreaming("Hello world", { enabled: false }));

    // Should show full text immediately
    expect(result.current.displayedText).toBe("Hello world");
    expect(result.current.isComplete).toBe(true);
  });

  it("should show full text when disabled after streaming", async () => {
    const { result, rerender } = renderHook(
      ({ text, enabled }) => useAdvancedStreaming(text, { enabled, delayMs: 50 }),
      { initialProps: { enabled: true, text: "" } },
    );

    // Initially should be empty
    expect(result.current.displayedText).toBe("");
    expect(result.current.isComplete).toBe(true);

    // Disable streaming
    rerender({ text: "Hello world", enabled: false });

    // Should show full text immediately
    expect(result.current.displayedText).toBe("Hello world");
    expect(result.current.isComplete).toBe(true);
  });

  it("should respect word boundaries when streaming", async () => {
    const { result, rerender } = renderHook(
      ({ text }) =>
        useAdvancedStreaming(text, {
          enabled: true,
          delayMs: 50,
        }),
      { initialProps: { text: "" } },
    );

    // Initially should be empty
    expect(result.current.displayedText).toBe("");
    expect(result.current.isComplete).toBe(true);

    rerender({ text: "Hello world" });
    expect(result.current.isComplete).toBe(false);
    // Fast forward time to allow streaming
    await act(async () => {
      vi.advanceTimersByTime(50);
    });

    // Should have streamed at least one word
    expect(result.current.displayedText).toBe("Hello ");
    expect(result.current.isComplete).toBe(false);

    // Fast forward more time
    await act(async () => {
      vi.advanceTimersByTime(50);
    });

    // Should have streamed the complete text
    expect(result.current.displayedText).toBe("Hello world");
    expect(result.current.isComplete).toBe(true);
  });

  it("should handle buffer size and release rate", async () => {
    const { result, rerender } = renderHook(
      ({ text }) =>
        useAdvancedStreaming(text, {
          enabled: true,
          delayMs: 50,
          minBufferSize: 5,
          maxCharsPerRelease: 3,
        }),
      { initialProps: { text: "" } },
    );

    // Initially should be empty
    expect(result.current.displayedText).toBe("");
    rerender({ text: "Hello world" });
    expect(result.current.displayedText).toBe("");
    expect(result.current.bufferSize).toBe(11); // Full text length
    expect(result.current.releaseRate).toBe(0);

    // Fast forward time to allow streaming
    await act(async () => {
      vi.advanceTimersByTime(100);
    });

    // Should have streamed some text and updated metrics
    expect(result.current.displayedText.length).toBeGreaterThan(0);
    expect(result.current.bufferSize).toBeLessThan(11);
    expect(result.current.releaseRate).toBeGreaterThan(0);
  });

  it("should handle a large amount of text", async () => {
    const largeText =
      'Boom bap! I love the energy! 🎵\n\nGiven the hackathon theme of "AI Agents and MCP Servers" and your awesome hip-hop inspired title, here are a few project ideas:\n\n**Option 1: "Boom Bap Beat Generator MCP"**\nAn MCP server that generates hip-hop beats and lyrics using AI, which could integrate with music production tools or chat interfaces for collaborative beat-making.\n\n**Option 2: "Boom Bap Social API"** \nA social platform API for hip-hop producers to share beats, get AI-powered feedback, and collaborate - with real-time notifications via email/Slack.\n\n**Option 3: "Boom Bap Event Tracker"**\nAn API that tracks hip-hop events, battles, and cyphers with AI-powered event recommendations and automated notifications to subscribers.\n\nWhich direction resonates with you most, or do you have a completely different vision for what "Boom Bap" should be?';
    const { result, rerender } = renderHook(
      ({ text }) =>
        useAdvancedStreaming(text, {
          enabled: true,
          delayMs: 50,
        }),
      { initialProps: { text: "" } },
    );
    // Initially should be empty
    expect(result.current.displayedText).toBe("");
    expect(result.current.isComplete).toBe(true);

    rerender({ text: largeText });
    await act(async () => {
      // Move two words forward
      vi.advanceTimersByTime(2 * 50);
    });
    expect(result.current.displayedText).toContain("Boom bap! ");
    expect(result.current.isComplete).toBe(false);
    await act(async () => {
      // Move the tick another couple of times and we should see the full text
      // This is much less than the nr of words in the text.
      vi.advanceTimersByTime(20 * 50);
    });

    expect(result.current.displayedText).toBe(largeText);
    expect(result.current.isComplete).toBe(true);
  });

  it("should accelerate when buffer pressure is high", async () => {
    const longText =
      "This is a very long text that should trigger acceleration when the buffer gets large enough to exceed the threshold.".repeat(
        3,
      );
    const { result, rerender } = renderHook(
      ({ text }) =>
        useAdvancedStreaming(text, {
          enabled: true,
          delayMs: 100,
          accelerationThreshold: 50,
          maxWordsPerAcceleration: 3,
          minAccelerationDelay: 20,
        }),
      { initialProps: { text: "" } },
    );

    expect(result.current.displayedText).toBe("");
    rerender({ text: longText });

    // Initially buffer should be large (> 50 chars)
    expect(result.current.bufferSize).toBeGreaterThan(50);

    // Should accelerate and release multiple words at once
    await act(async () => {
      vi.advanceTimersByTime(25); // Less than normal delay due to acceleration
    });

    // Should have released more than one word due to acceleration
    const firstRelease = result.current.displayedText;
    expect(firstRelease.split(" ").length).toBeGreaterThan(1);
    expect(result.current.isComplete).toBe(false);
  });

  it("should use normal speed when buffer pressure is low", async () => {
    const shortText = "Hello world test";
    const { result, rerender } = renderHook(
      ({ text }) =>
        useAdvancedStreaming(text, {
          enabled: true,
          delayMs: 50,
          accelerationThreshold: 100, // High threshold
          maxWordsPerAcceleration: 3,
        }),
      { initialProps: { text: "" } },
    );

    expect(result.current.displayedText).toBe("");
    rerender({ text: shortText });

    // Buffer should be below threshold
    expect(result.current.bufferSize).toBeLessThan(100);

    await act(async () => {
      vi.advanceTimersByTime(50);
    });

    // Should release one word at normal speed
    expect(result.current.displayedText).toBe("Hello ");
    expect(result.current.isComplete).toBe(false);
  });

  it("should handle custom acceleration settings", async () => {
    const mediumText = "One two three four five six seven eight nine ten eleven twelve";
    const { result, rerender } = renderHook(
      ({ text }) =>
        useAdvancedStreaming(text, {
          enabled: true,
          delayMs: 100,
          accelerationThreshold: 30,
          maxWordsPerAcceleration: 2,
          minAccelerationDelay: 10,
        }),
      { initialProps: { text: "" } },
    );

    rerender({ text: mediumText });

    // Buffer should exceed threshold
    expect(result.current.bufferSize).toBeGreaterThan(30);

    await act(async () => {
      // Should use accelerated timing (10ms instead of 100ms)
      vi.advanceTimersByTime(15);
    });

    // Should have released up to maxWordsPerAcceleration words
    const words = result.current.displayedText.trim().split(" ");
    expect(words.length).toBeLessThanOrEqual(2);
    expect(words.length).toBeGreaterThan(0);
  });
});

import type { TextUIPart, UIDataTypes, UIMessagePart, UITools } from "ai";

/**
 * Type guard to narrow UIMessagePart to TextUIPart
 */
export const isTextUIPart = <T extends UIDataTypes, U extends UITools>(
  part: UIMessagePart<T, U>,
): part is TextUIPart => {
  return part.type === "text";
};

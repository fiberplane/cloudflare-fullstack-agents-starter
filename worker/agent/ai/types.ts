export type AiContext = {
  anthropicApiKey: string;
  openAiApiKey?: string;
  gatewayAccountId: string;
  gatewayName: string;
  gatewayMetadata: Record<string, string>;
};

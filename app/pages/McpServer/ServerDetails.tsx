import { Link } from "@tanstack/react-router";
import {
  ChevronDown,
  ChevronRight,
  ExternalLink,
  MoreVertical,
  Pencil,
  RefreshCw,
} from "lucide-react";
import { useState } from "react";
import { CopyButton } from "@/app/components/copy-button";
import { Button } from "@/app/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu";
import { Skeleton } from "@/app/components/ui/skeleton";
import { TooltipProvider } from "@/app/components/ui/tooltip";
import type { McpServerInfo, McpServerUiState } from "@/app/machines/mcp-server";

interface ServerDetailsProps {
  uiState: McpServerUiState;
  server: McpServerInfo | null;
  tools: Array<{ name: string; description?: string }>;
  fitCheck: {
    createdAt: string;
    fitCheckUrl: string;
    serverName?: string | null;
    headers?: Array<{ key: string; value: string }> | null;
  };
  onReset: () => void;
  fitCheckId: string;
  error?: { message: string } | null;
}

interface ServerTableRowProps {
  server: McpServerInfo;
  tools: Array<{ name: string; description?: string }>;
  onReset: () => void;
  fitCheckUrl: string;
  serverName?: string | null;
  headers?: Array<{ key: string; value: string }> | null;
  fitCheckId: string;
}

function ServerTableRow({
  server,
  tools,
  onReset,
  fitCheckUrl,
  serverName,
  headers,
  fitCheckId,
}: ServerTableRowProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const isReady = server.state === "ready";
  const isFailed = server.state === "failed";
  const isAuthRequired = server.state === "authenticating";

  const serverTools = tools;

  return (
    <>
      {/* Main row */}
      <tr className="border-b last:border-b-0 hover:bg-muted/20">
        {/* URL column */}
        <td className="px-3 py-3">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="truncate text-sm font-medium max-w-[120px] sm:max-w-[200px] md:max-w-[300px]">
                {serverName || server.server_url}
              </span>
              <CopyButton value={fitCheckUrl} />
            </div>
            {serverName && (
              <span className="truncate text-xs text-muted-foreground max-w-[120px] sm:max-w-[200px] md:max-w-[300px]">
                {server.server_url}
              </span>
            )}
            {headers && headers.length > 0 && (
              <div className="mt-1 space-y-0.5">
                {headers.map((header, idx) => (
                  <div key={idx} className="text-xs text-muted-foreground">
                    <span className="font-medium">{header.key}:</span>{" "}
                    <span className="font-mono">{header.value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </td>

        {/* Status column */}
        <td className="px-3 py-3">
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                server.state === "ready"
                  ? "bg-green-500/10 text-green-700 dark:text-green-500"
                  : server.state === "authenticating"
                    ? "bg-yellow-500/10 text-yellow-600 dark:text-yellow-500"
                    : server.state === "connecting" || server.state === "discovering"
                      ? "bg-blue-500/10 text-blue-600 dark:text-blue-500"
                      : server.state === "failed"
                        ? "bg-destructive/10 text-destructive"
                        : "bg-muted text-muted-foreground"
              }`}
            >
              {server.state}
            </span>
            {isAuthRequired && server.auth_url && (
              <a
                href={server.auth_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-blue-500 dark:text-blue-400 underline hover:text-blue-500 dark:hover:text-blue-300 whitespace-nowrap font-medium"
              >
                Let's authenticate!
                <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
        </td>

        {/* Tools column */}
        <td className="px-3 py-3">
          {isFailed ? (
            <span className="text-xs text-muted-foreground italic">Unavailable</span>
          ) : !isReady ? (
            <span className="text-xs text-muted-foreground italic">Pending connection</span>
          ) : serverTools.length === 0 ? (
            <span className="text-xs text-muted-foreground italic">None</span>
          ) : (
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-2 text-left hover:text-foreground transition-colors"
            >
              <div className="flex flex-wrap gap-1">
                {/* On xs screens: show no tool names, just count */}
                {/* On sm screens: show 1 tool name */}
                {/* On md+ screens: show 2 tool names */}
                <span className="hidden sm:inline-flex rounded bg-primary/10 px-1.5 py-0.5 text-xs font-medium text-primary">
                  {serverTools[0]?.name}
                </span>
                {serverTools.length > 1 && (
                  <span className="hidden md:inline-flex rounded bg-primary/10 px-1.5 py-0.5 text-xs font-medium text-primary">
                    {serverTools[1]?.name}
                  </span>
                )}
                {/* Tool count badge */}
                <span className="rounded bg-muted px-1.5 py-0.5 text-xs font-medium text-muted-foreground">
                  <span className="sm:hidden">{serverTools.length}</span>
                  <span className="hidden sm:inline md:hidden">+{serverTools.length - 1}</span>
                  <span className="hidden md:inline">
                    {serverTools.length > 2 ? `+${serverTools.length - 2}` : serverTools.length}
                  </span>
                </span>
              </div>
              {isExpanded ? (
                <ChevronDown className="h-3 w-3 shrink-0 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-3 w-3 shrink-0 text-muted-foreground" />
              )}
            </button>
          )}
        </td>

        {/* Actions column */}
        <td className="px-3 py-3 text-right">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                <MoreVertical className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onReset}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Reset connection
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                {/* @ts-expect-error - TODO: Implement mcp server management */}
                <Link to="/personal-agents/$id/edit" params={{ id: fitCheckId }}>
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit details
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </td>
      </tr>

      {/* Expanded row for tools and error messages */}
      {isExpanded && (
        <tr>
          <td colSpan={4} className="px-3 py-3 bg-muted/10">
            <div className="space-y-3">
              {/* Error message */}
              {isFailed && (
                <div className="rounded-md border border-destructive/20 bg-destructive/5 p-2">
                  <p className="text-xs font-medium text-destructive">Connection Failed</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    The server may be offline or the URL may be incorrect.
                  </p>
                </div>
              )}

              {/* Tools grid */}
              {isReady && serverTools.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2">
                    Available Tools ({serverTools.length})
                  </p>
                  <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {serverTools.map((tool) => (
                      <div key={tool.name} className="rounded border bg-background p-2">
                        <div className="font-mono text-xs font-medium text-foreground">
                          {tool.name}
                        </div>
                        {tool.description && (
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                            {tool.description}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

export function ServerDetails({
  uiState,
  server,
  tools,
  fitCheck,
  onReset,
  fitCheckId,
  error,
}: ServerDetailsProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium uppercase tracking-wide text-muted-foreground sr-only">
          MCP Server Details
        </h2>
        <div className="text-xs text-muted-foreground">
          Added on {new Date(fitCheck.createdAt).toLocaleString()}
        </div>
      </div>

      {uiState === "initializing" && (
        <div className="overflow-hidden rounded-lg border">
          <table className="w-full">
            <thead className="bg-muted/50 border-b">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">
                  Server
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">
                  Status
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">
                  Available Tools
                </th>
                <th className="px-3 py-2 text-right text-xs font-medium text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="px-3 py-3">
                  <Skeleton className="h-5 w-48" />
                </td>
                <td className="px-3 py-3">
                  <Skeleton className="h-5 w-24" />
                </td>
                <td className="px-3 py-3">
                  <Skeleton className="h-5 w-32" />
                </td>
                <td className="px-3 py-3 text-right">
                  <Skeleton className="h-7 w-7 ml-auto" />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {uiState === "noServer" && (
        <div className="rounded-lg border border-muted bg-muted/10 p-6 text-center">
          <p className="text-sm text-muted-foreground">
            No MCP server configured. Please check your server configuration.
          </p>
        </div>
      )}

      {uiState === "failed" && (
        <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-6">
          <p className="text-sm font-medium text-destructive mb-1">Connection Failed</p>
          <p className="text-xs text-muted-foreground mb-3">
            {error?.message ||
              "Failed to connect to MCP server. The server may be offline or the URL may be incorrect."}
          </p>
          <Button onClick={onReset} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Reconnect
          </Button>
        </div>
      )}

      {(uiState === "needsAuth" || uiState === "ready") && server && (
        <TooltipProvider>
          <div className="overflow-hidden rounded-lg border">
            <table className="w-full">
              <thead className="bg-muted/50 border-b">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">
                    Server
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">
                    Status
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">
                    Available Tools
                  </th>
                  <th className="px-3 py-2 text-right text-xs font-medium text-muted-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                <ServerTableRow
                  server={server}
                  tools={tools}
                  onReset={onReset}
                  fitCheckUrl={fitCheck.fitCheckUrl}
                  serverName={fitCheck.serverName}
                  headers={fitCheck.headers}
                  fitCheckId={fitCheckId}
                />
              </tbody>
            </table>
          </div>
        </TooltipProvider>
      )}
    </div>
  );
}

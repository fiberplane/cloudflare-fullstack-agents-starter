import { useForm } from "@tanstack/react-form";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Bot, Loader2 } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { useCreatePersonalAgentMutation } from "@/app/lib/queries/personal-agents";

export const Route = createFileRoute("/_authenticated/agents/new")({
  component: CreateAgent,
});

function CreateAgent() {
  const navigate = useNavigate();
  const createAgentMutation = useCreatePersonalAgentMutation();

  const form = useForm({
    defaultValues: {
      agentName: "",
    },
    onSubmit: async ({ value }) => {
      try {
        const agent = await createAgentMutation.mutateAsync({
          agentName: value.agentName,
        });
        // Redirect to the detail page after successful creation
        navigate({ to: "/agents/$id", params: { id: agent.id } });
      } catch {
        // Error is already handled by the mutation state
      }
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Bot className="h-8 w-8 text-primary" />
        <h1 className="text-2xl font-bold text-foreground md:text-3xl">Create Agent</h1>
      </div>

      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <div className="mb-6">
          <h2 className="mb-2 text-xl font-semibold text-card-foreground">
            Create a Personal Agent
          </h2>
          <p className="text-muted-foreground">
            Give your agent a name to get started. You can interact with it and customize it later.
          </p>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          className="space-y-4"
        >
          <form.Field
            name="agentName"
            validators={{
              onChange: ({ value }) => {
                if (!value || value.trim().length === 0) {
                  return "Agent name is required";
                }
                if (value.trim().length < 3) {
                  return "Agent name must be at least 3 characters";
                }
                return undefined;
              },
            }}
          >
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor={field.name}>Agent Name</Label>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  placeholder="My Personal Agent"
                  className={field.state.meta.errors.length > 0 ? "border-destructive" : ""}
                />
                {field.state.meta.errors.length > 0 && (
                  <p className="text-sm text-destructive" role="alert">
                    {field.state.meta.errors.join(", ")}
                  </p>
                )}
              </div>
            )}
          </form.Field>

          <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
            {([canSubmit, isSubmitting]) => (
              <div className="flex gap-3">
                <Button
                  type="submit"
                  disabled={!canSubmit || isSubmitting || createAgentMutation.isPending}
                >
                  {isSubmitting || createAgentMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Agent"
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate({ to: "/agents" })}
                  disabled={isSubmitting || createAgentMutation.isPending}
                >
                  Cancel
                </Button>
              </div>
            )}
          </form.Subscribe>

          {createAgentMutation.isError && (
            <div className="rounded-md border border-destructive bg-destructive/10 p-3">
              <p className="text-sm text-destructive">
                {createAgentMutation.error instanceof Error
                  ? createAgentMutation.error.message
                  : "Failed to create agent. Please try again."}
              </p>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

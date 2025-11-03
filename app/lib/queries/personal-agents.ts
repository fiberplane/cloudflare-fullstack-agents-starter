import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export type PersonalAgent = {
  id: string;
  userId: string;
  agentName: string;
  createdAt: number;
  updatedAt: number;
};

export function useListPersonalAgentsQuery() {
  return useQuery({
    queryKey: ["personal-agents"],
    queryFn: async (): Promise<PersonalAgent[]> => {
      const response = await fetch("/api/v1/agents/personal-agents");
      if (!response.ok) {
        throw new Error("Failed to fetch personal agents");
      }
      return response.json();
    },
  });
}

export function usePersonalAgentQuery(id: string) {
  return useQuery({
    queryKey: ["personal-agents", id],
    queryFn: async (): Promise<PersonalAgent> => {
      const response = await fetch(`/api/v1/agents/personal-agents/${id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch personal agent");
      }
      return response.json();
    },
    enabled: !!id,
  });
}

export function useCreatePersonalAgentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { agentName: string }): Promise<PersonalAgent> => {
      const response = await fetch("/api/v1/agents/personal-agents", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({
          message: "Failed to create personal agent",
        }));
        throw new Error(error.message || "Failed to create personal agent");
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate and refetch personal agents list
      queryClient.invalidateQueries({ queryKey: ["personal-agents"] });
    },
  });
}

export function useUpdatePersonalAgentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { id: string; agentName: string }): Promise<PersonalAgent> => {
      const response = await fetch(`/api/v1/agents/personal-agents/${data.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          agentName: data.agentName,
        }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({
          message: "Failed to update personal agent",
        }));
        throw new Error(error.message || "Failed to update personal agent");
      }

      return response.json();
    },
    onSuccess: (data) => {
      // Invalidate and refetch both the list and the specific personal agent
      queryClient.invalidateQueries({ queryKey: ["personal-agents"] });
      queryClient.invalidateQueries({ queryKey: ["personal-agents", data.id] });
    },
  });
}

export function useDeletePersonalAgentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<PersonalAgent> => {
      const response = await fetch(`/api/v1/agents/personal-agents/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({
          message: "Failed to delete personal agent",
        }));
        throw new Error(error.message || "Failed to delete personal agent");
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate and refetch personal agents list
      queryClient.invalidateQueries({ queryKey: ["personal-agents"] });
    },
  });
}

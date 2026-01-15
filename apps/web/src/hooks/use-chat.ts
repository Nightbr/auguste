import { useState, useRef, useEffect, useCallback } from 'react';

export interface ToolCall {
  toolName: string;
  args?: Record<string, unknown>;
  result?: unknown;
  status: 'pending' | 'completed';
}

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  toolCalls?: ToolCall[];
}

type AgentType = 'onboarding' | 'meal-planner';

interface UseChatOptions {
  agentType?: AgentType;
}

const POLLING_DURATION_MS = 5000; // Duration to poll after receiving a message

const AGENT_ID_MAP: Record<AgentType, string> = {
  onboarding: 'onboardingAgent',
  'meal-planner': 'mealPlannerAgent',
};

export function useChat(options: UseChatOptions = {}) {
  const { agentType = 'onboarding' } = options;
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Persistent IDs for memory
  const threadIdRef = useRef(crypto.randomUUID());
  const resourceIdRef = useRef('default-user');

  // Family ID state - will be set when agent creates a family
  const [familyId, setFamilyId] = useState<string | null>(null);

  // Polling state - controls when family data should be polled
  const [isPolling, setIsPolling] = useState(false);
  const pollingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Start or reset the polling timer
  const triggerPolling = useCallback(() => {
    // Clear existing timeout if any
    if (pollingTimeoutRef.current) {
      clearTimeout(pollingTimeoutRef.current);
    }

    // Enable polling
    setIsPolling(true);

    // Set timeout to disable polling after the duration
    pollingTimeoutRef.current = setTimeout(() => {
      setIsPolling(false);
      pollingTimeoutRef.current = null;
    }, POLLING_DURATION_MS);
  }, []);

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (pollingTimeoutRef.current) {
        clearTimeout(pollingTimeoutRef.current);
      }
    };
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Load familyId from localStorage on mount
  useEffect(() => {
    const storedFamilyId = localStorage.getItem('auguste-family-id');
    if (storedFamilyId) {
      setFamilyId(storedFamilyId);
    }
  }, []);

  const handleInputChange = (value: string) => setInput(value);

  const sendMessage = async () => {
    if (!input.trim() || isLoading || !familyId) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:3001/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: input, // Only send the current message
          agentId: AGENT_ID_MAP[agentType],
          threadId: threadIdRef.current,
          resourceId: familyId || resourceIdRef.current,
          familyId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch response');
      }

      if (!response.body) {
        throw new Error('No response body');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      const assistantMessage: Message = { role: 'assistant', content: '', toolCalls: [] };

      setMessages((prev) => [...prev, assistantMessage]);

      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // Process complete SSE events
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || ''; // Keep incomplete event in buffer

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;

          try {
            const data = JSON.parse(line.slice(6));

            if (data.type === 'text') {
              assistantMessage.content += data.content;
              setMessages((prev) => {
                const newMessages = [...prev];
                newMessages[newMessages.length - 1] = { ...assistantMessage };
                return newMessages;
              });
              // Trigger polling when receiving agent messages
              // This resets the 5s timer on each chunk received
              triggerPolling();
            } else if (data.type === 'tool-call') {
              // Add a new pending tool call
              const toolCall: ToolCall = {
                toolName: data.toolName,
                args: data.args,
                status: 'pending',
              };
              assistantMessage.toolCalls = [...(assistantMessage.toolCalls || []), toolCall];
              setMessages((prev) => {
                const newMessages = [...prev];
                newMessages[newMessages.length - 1] = { ...assistantMessage };
                return newMessages;
              });
              triggerPolling();
            } else if (data.type === 'tool-result') {
              // Update the corresponding tool call with the result
              const toolCalls = assistantMessage.toolCalls || [];
              const toolIndex = toolCalls.findIndex(
                (tc) => tc.toolName === data.toolName && tc.status === 'pending',
              );
              if (toolIndex !== -1) {
                toolCalls[toolIndex] = {
                  ...toolCalls[toolIndex],
                  result: data.result,
                  status: 'completed',
                };
                assistantMessage.toolCalls = [...toolCalls];
                setMessages((prev) => {
                  const newMessages = [...prev];
                  newMessages[newMessages.length - 1] = { ...assistantMessage };
                  return newMessages;
                });
              }
              triggerPolling();
            } else if (data.type === 'error') {
              throw new Error(data.content);
            }
          } catch (parseError) {
            console.error('Failed to parse SSE event:', parseError);
          }
        }
      }
    } catch (error) {
      console.error('Error:', error);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, I encountered an error. Please make sure the API is running.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const updateFamilyId = (id: string) => {
    setFamilyId(id);
    localStorage.setItem('auguste-family-id', id);
  };

  return {
    messages,
    input,
    isLoading,
    messagesEndRef,
    handleInputChange,
    sendMessage,
    setInput,
    familyId,
    setFamilyId: updateFamilyId,
    /** Whether family data polling is currently active (5s after last agent message) */
    isPolling,
  };
}

import { useState, useRef, useEffect } from 'react';

export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Persistent IDs for memory
  const threadIdRef = useRef(crypto.randomUUID());
  const resourceIdRef = useRef('default-user');

  // Family ID state - will be set when agent creates a family
  const [familyId, setFamilyId] = useState<string | null>(null);

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
          agentId: 'onboardingAgent',
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
      const assistantMessage: Message = { role: 'assistant', content: '' };

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
  };
}

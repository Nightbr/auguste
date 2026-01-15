import { useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Header } from '@/components/layout/header';
import { ChatPanel } from '@/components/chat/chat-panel';
import { PlannerPanel } from '@/components/planner/planner-panel';
import { useChat } from '@/hooks/use-chat';
import { useFamilyReady } from '@/hooks/use-family-ready';

export function PlannerView() {
  const navigate = useNavigate();
  const {
    messages,
    input,
    isLoading,
    messagesEndRef,
    handleInputChange,
    sendMessage,
    familyId,
    isPolling,
  } = useChat({ agentType: 'meal-planner' });

  const { isReady } = useFamilyReady(familyId);

  // Redirect to family route if not ready
  useEffect(() => {
    if (!isReady && familyId) {
      navigate({ to: '/family' });
    }
  }, [isReady, familyId, navigate]);

  // Show loading if no family
  if (!familyId) {
    return (
      <div className="flex flex-col h-screen bg-[#FAF9F6]">
        <Header familyId={familyId} isFamilyReady={false} currentRoute="planner" />
        <div className="flex items-center justify-center flex-1">
          <div className="text-center p-8">
            <p className="text-escoffier-green text-lg mb-2">No Family Selected</p>
            <p className="text-escoffier-green/60 text-sm">
              Please set up your family first before planning meals.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-[#FAF9F6]">
      <Header familyId={familyId} isFamilyReady={isReady} currentRoute="planner" />
      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel: Chat (45% width) */}
        <div className="w-[45%] border-r border-escoffier-green/10">
          <ChatPanel
            messages={messages}
            isLoading={isLoading}
            input={input}
            onInputChange={handleInputChange}
            onSend={sendMessage}
            messagesEndRef={messagesEndRef}
            disabled={!familyId}
            context="planner"
          />
        </div>

        {/* Right Panel: Planner Data (55% width) */}
        <div className="w-[55%]">
          <PlannerPanel familyId={familyId} isPolling={isPolling} />
        </div>
      </div>
    </div>
  );
}

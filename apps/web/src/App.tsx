import { Header } from '@/components/layout/header';
import { ChatPanel } from '@/components/chat/chat-panel';
import { FamilyPanel } from '@/components/family/family-panel';
import { CreateFamilyModal } from '@/components/family/create-family-modal';
import { useChat } from '@/hooks/use-chat';
import '@auguste/ui/globals.css';
import './components/family/family-styles.css';

function App() {
  const {
    messages,
    input,
    isLoading,
    messagesEndRef,
    handleInputChange,
    sendMessage,
    familyId,
    setFamilyId,
  } = useChat();

  return (
    <div className="flex flex-col h-screen bg-[#FAF9F6]">
      <Header />
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
          />
        </div>

        {/* Right Panel: Family Data (55% width) */}
        <div className="w-[55%]">
          {familyId ? (
            <FamilyPanel familyId={familyId} />
          ) : (
            <div className="flex items-center justify-center h-full bg-white relative">
              <div className="text-center p-8">
                <p className="text-escoffier-green text-lg mb-2">No Family Selected</p>
                <p className="text-escoffier-green/60 text-sm">
                  Start a conversation to create your family and set up meal planning.
                </p>
                <div className="mt-6">
                  <div className="inline-block w-16 h-1 bg-escoffier-green/10 rounded-full animate-pulse"></div>
                </div>
              </div>
              <CreateFamilyModal onCreated={setFamilyId} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;

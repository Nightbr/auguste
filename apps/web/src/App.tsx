import { Header } from '@/components/layout/header';
import { MessageList } from '@/components/chat/message-list';
import { ChatInput } from '@/components/chat/chat-input';
import { useChat } from '@/hooks/use-chat';
import '@auguste/ui/globals.css';

function App() {
  const { messages, input, isLoading, messagesEndRef, handleInputChange, sendMessage } = useChat();

  return (
    <div className="flex flex-col h-screen bg-background text-foreground overflow-hidden items-center justify-center p-2 sm:p-4 md:p-8">
      <div className="flex flex-col w-full max-w-4xl h-full bg-card/30 backdrop-blur-xl border border-primary/20 rounded-xl shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden">
        <Header />
        <MessageList messages={messages} isLoading={isLoading} messagesEndRef={messagesEndRef} />
        <ChatInput
          input={input}
          isLoading={isLoading}
          onInputChange={handleInputChange}
          onSend={sendMessage}
        />
      </div>
    </div>
  );
}

export default App;

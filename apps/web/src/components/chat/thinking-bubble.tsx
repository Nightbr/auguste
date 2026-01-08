export function ThinkingBubble() {
  return (
    <div className="flex items-start mb-6">
      <div className="relative px-5 py-3 transition-all duration-300 bg-[#2d3a31]/20 backdrop-blur-md border border-white/5 shadow-md rounded-2xl flex items-center space-x-2">
        <span className="sr-only">Thinking...</span>
        <div className="h-1.5 w-1.5 bg-[#D4AF37]/80 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
        <div className="h-1.5 w-1.5 bg-[#D4AF37]/80 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
        <div className="h-1.5 w-1.5 bg-[#D4AF37]/80 rounded-full animate-bounce"></div>
      </div>
    </div>
  );
}

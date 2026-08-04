import { useState, useEffect, useRef } from "react";
import { MessageCircle, X, Send, Trash2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/lib/api";
import { toast } from "sonner";

interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

const QUICK_PROMPTS = [
  "Suggest best auctions",
  "Show electronics under ₹5000",
  "How does bidding work?",
  "Which auction is ending soon?",
];

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1.5 px-4 py-3 rounded-2xl bg-muted/80 w-fit">
      <span className="w-2 h-2 rounded-full bg-primary animate-bounce" />
      <span className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:150ms]" />
      <span className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:300ms]" />
      <span className="text-xs text-muted-foreground ml-1">Thinking...</span>
    </div>
  );
}

const ChatBot = () => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading, open]);

  useEffect(() => {
    if (!open || !user || historyLoaded) return;

    const loadHistory = async () => {
      try {
        const res = await api.get("/chat/history");
        if (res.data?.messages?.length) {
          setMessages(res.data.messages);
        }
      } catch {
        // Guest or first visit — empty history is fine
      } finally {
        setHistoryLoaded(true);
      }
    };

    loadHistory();
  }, [open, user, historyLoaded]);

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    if (!user) {
      toast.error("Please sign in to use the AI assistant");
      return;
    }

    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: trimmed }]);
    setLoading(true);

    try {
      const res = await api.post("/chat", { message: trimmed });
      const reply = res.data?.reply || "Sorry, I could not generate a response.";
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Failed to send message. Try again.";
      toast.error(msg);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Something went wrong. Please try again in a moment." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const clearHistory = async () => {
    if (!user) return;
    try {
      await api.delete("/chat/history");
      setMessages([]);
      toast.success("Chat cleared");
    } catch {
      toast.error("Could not clear chat");
    }
  };

  const formatContent = (content: string) => {
    return content.split("\n").map((line, i) => (
      <span key={i}>
        {line}
        {i < content.split("\n").length - 1 && <br />}
      </span>
    ));
  };

  return (
    <>
      {/* Floating toggle */}
      <Button
        onClick={() => setOpen((o) => !o)}
        size="lg"
        className="fixed bottom-6 right-6 z-[60] h-14 w-14 rounded-full shadow-lg bg-primary hover:bg-primary/90"
        aria-label={open ? "Close chat" : "Open AI assistant"}
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </Button>

      {open && (
        <div
          className="fixed bottom-24 right-4 sm:right-6 z-[60] w-[calc(100vw-2rem)] sm:w-[380px] max-h-[min(560px,calc(100vh-7rem))] flex flex-col rounded-2xl border bg-background/95 backdrop-blur-md shadow-2xl overflow-hidden"
          role="dialog"
          aria-label="BidBlaze AI Assistant"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b bg-primary/5">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <div>
                <p className="font-semibold text-sm">BidBlaze Assistant</p>
                <p className="text-xs text-muted-foreground">Auctions • Bids • Tips</p>
              </div>
            </div>
            {user && messages.length > 0 && (
              <Button variant="ghost" size="icon" onClick={clearHistory} title="Clear chat">
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 min-h-[280px] max-h-[360px] px-3 py-3">
            {messages.length === 0 && !loading && (
              <div className="text-center text-sm text-muted-foreground py-8 px-2">
                <p className="mb-3">Ask me anything about BidBlaze auctions!</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {QUICK_PROMPTS.map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      onClick={() => sendMessage(prompt)}
                      className="text-xs px-3 py-1.5 rounded-full border hover:bg-muted transition-colors"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-3">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] px-3 py-2 rounded-2xl text-sm ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground rounded-br-md"
                        : "bg-muted rounded-bl-md"
                    }`}
                  >
                    {formatContent(msg.content)}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <TypingIndicator />
                </div>
              )}
              <div ref={bottomRef} />
            </div>
          </ScrollArea>

          {/* Input */}
          <div className="p-3 border-t space-y-2">
            {!user && (
              <p className="text-xs text-amber-600 dark:text-amber-400 text-center">
                Sign in to chat and save history
              </p>
            )}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                sendMessage(input);
              }}
              className="flex gap-2"
            >
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={user ? "Ask about auctions..." : "Sign in to chat..."}
                disabled={!user || loading}
                className="flex-1"
              />
              <Button type="submit" size="icon" disabled={!user || loading || !input.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatBot;

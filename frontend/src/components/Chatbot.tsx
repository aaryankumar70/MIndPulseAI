import { FormEvent, useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { sendChatMessage } from '@/tasks';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const initialMessage: Message = {
  role: 'assistant',
  content:
    "Hey! I'm MindPulse Companion 🌱\n\nI can help with your well-being, stress, sleep, study habits, screen time, activities, and MindPulse plan.",
};

const suggestedQuestions = [
  'Why did my score change?',
  'What should I focus on?',
  'Explain my current plan',
  'How can I improve my sleep?',
];

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    initialMessage,
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const token = localStorage.getItem('mindpulse_token');

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth',
    });
  }, [messages, isLoading]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  async function handleSendMessage(message: string) {
    const trimmedMessage = message.trim();

    if (!trimmedMessage || isLoading || !token) {
      return;
    }

    /*
     * Keep the conversation history valid for the backend.
     *
     * The backend allows a maximum of 500 characters
     * per history message, so long assistant responses
     * must be trimmed before being sent again.
     */
    const conversationHistory = messages
      .filter(
        (msg, index) =>
          !(index === 0 && msg.role === 'assistant')
      )
      .slice(-8)
      .map((msg) => ({
        role: msg.role,
        content: msg.content.slice(0, 500),
      }));

    // Add the user's message to the chat immediately.
    setMessages((current) => [
      ...current,
      {
        role: 'user',
        content: trimmedMessage,
      },
    ]);

    setInput('');
    setIsLoading(true);

    try {
      const response = await sendChatMessage(
        trimmedMessage,
        conversationHistory,
        token
      );

      setMessages((current) => [
        ...current,
        {
          role: 'assistant',
          content: response,
        },
      ]);
    } catch (error) {
      console.error('Chatbot error:', error);

      setMessages((current) => [
        ...current,
        {
          role: 'assistant',
          content:
            "Sorry, I couldn't connect right now.\n\nPlease try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSend(event?: FormEvent) {
    event?.preventDefault();

    await handleSendMessage(input);
  }

  function handleKeyDown(
    event: React.KeyboardEvent<HTMLInputElement>
  ) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  }

  return (
    <>
      {/* Floating chatbot button */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          aria-label="Open MindPulse Companion"
          className="
            fixed bottom-5 right-5 z-50
            flex h-14 w-14 items-center justify-center
            rounded-full
            border-2 border-black
            bg-white
            text-2xl
            shadow-[4px_4px_0px_#000]
            transition-all duration-200
            hover:-translate-y-1
            hover:shadow-[5px_5px_0px_#000]
            active:translate-x-1
            active:translate-y-1
            active:shadow-[2px_2px_0px_#000]
          "
        >
          🌱
        </button>
      )}

      {/* Chat panel */}
      {isOpen && (
        <div
          className="
            fixed bottom-5 right-5 z-50
            flex h-[520px] w-[360px]
            max-w-[calc(100vw-24px)]
            flex-col
            overflow-hidden
            rounded-2xl
            border-2 border-black
            bg-white
            shadow-[6px_6px_0px_#000]
          "
        >
          {/* Header */}
          <div
            className="
              flex items-center justify-between
              border-b-2 border-black
              bg-[var(--neo-accent)]
              px-4 py-3
            "
          >
            <div className="flex items-center gap-2">
              <span className="text-xl">🌱</span>

              <div>
                <h3 className="font-bold text-black">
                  MindPulse Companion
                </h3>

                <p className="text-xs text-black/70">
                  Your well-being assistant
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Close chatbot"
              className="
                flex h-8 w-8 items-center justify-center
                rounded-lg
                border-2 border-black
                bg-white
                font-bold
                text-black
                transition-transform
                hover:-translate-y-0.5
              "
            >
              ×
            </button>
          </div>

          {/* Messages */}
          <div
            className="
              flex-1
              overflow-y-auto
              bg-[var(--neo-bg)]
              p-4
            "
          >
            <div className="space-y-3">
              {messages.map((message, index) => {
                const isUser = message.role === 'user';

                return (
                  <div
                    key={`${message.role}-${index}`}
                    className={`flex ${
                      isUser
                        ? 'justify-end'
                        : 'justify-start'
                    }`}
                  >
                    <div
                      className={`
                        max-w-[84%]
                        rounded-2xl
                        border-2 border-black
                        px-4 py-3
                        text-sm
                        leading-6
                        ${
                          isUser
                            ? 'rounded-br-sm bg-black text-white'
                            : 'rounded-bl-sm bg-white text-black'
                        }
                      `}
                    >
                      {isUser ? (
                        <div className="whitespace-pre-wrap break-words">
                          {message.content}
                        </div>
                      ) : (
                        <div
                          className="
                            break-words
                            [&_p]:mb-3
                            [&_p:last-child]:mb-0
                            [&_ul]:mb-3
                            [&_ul]:ml-5
                            [&_ul]:list-disc
                            [&_ol]:mb-3
                            [&_ol]:ml-5
                            [&_ol]:list-decimal
                            [&_li]:mb-1
                            [&_strong]:font-bold
                            [&_h1]:mb-2
                            [&_h1]:text-base
                            [&_h1]:font-bold
                            [&_h2]:mb-2
                            [&_h2]:text-base
                            [&_h2]:font-bold
                            [&_h3]:mb-2
                            [&_h3]:font-bold
                          "
                        >
                          <ReactMarkdown>
                            {message.content}
                          </ReactMarkdown>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Suggested questions */}
              {messages.length === 1 && !isLoading && (
                <div className="pt-2">
                  <p className="mb-2 text-xs font-semibold text-muted">
                    Try asking:
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {suggestedQuestions.map((question) => (
                      <button
                        key={question}
                        type="button"
                        onClick={() =>
                          handleSendMessage(question)
                        }
                        className="
                          rounded-xl
                          border-2 border-black
                          bg-white
                          px-3 py-2
                          text-left
                          text-xs
                          font-medium
                          text-black
                          transition-all
                          hover:-translate-y-0.5
                          hover:bg-black
                          hover:text-white
                          active:translate-y-0
                        "
                      >
                        {question}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Loading indicator */}
              {isLoading && (
                <div className="flex justify-start">
                  <div
                    className="
                      rounded-2xl
                      rounded-bl-sm
                      border-2 border-black
                      bg-white
                      px-4 py-3
                      text-sm
                    "
                  >
                    <span className="inline-flex gap-1">
                      <span className="animate-bounce">
                        •
                      </span>

                      <span
                        className="animate-bounce"
                        style={{
                          animationDelay: '100ms',
                        }}
                      >
                        •
                      </span>

                      <span
                        className="animate-bounce"
                        style={{
                          animationDelay: '200ms',
                        }}
                      >
                        •
                      </span>
                    </span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input */}
          <form
            onSubmit={handleSend}
            className="
              flex gap-2
              border-t-2 border-black
              bg-white
              p-3
            "
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(event) =>
                setInput(event.target.value)
              }
              onKeyDown={handleKeyDown}
              maxLength={500}
              disabled={isLoading}
              placeholder="Ask MindPulse..."
              className="
                min-w-0
                flex-1
                rounded-xl
                border-2 border-black
                bg-white
                px-3 py-2
                text-sm
                text-black
                outline-none
                placeholder:text-gray-500
                focus:ring-2
                focus:ring-black
                disabled:opacity-50
              "
            />

            <button
              type="submit"
              disabled={
                !input.trim() ||
                isLoading ||
                !token
              }
              className="
                rounded-xl
                border-2 border-black
                bg-black
                px-4
                py-2
                text-sm
                font-bold
                text-white
                transition-all
                hover:-translate-y-0.5
                disabled:cursor-not-allowed
                disabled:opacity-40
              "
            >
              Send
            </button>
          </form>
        </div>
      )}
    </>
  );
}
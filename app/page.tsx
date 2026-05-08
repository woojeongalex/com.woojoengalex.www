"use client";

import { useState, useRef, useEffect, KeyboardEvent, FormEvent } from "react";
import { Send, Loader2, RotateCcw, Database, MessageSquare } from "lucide-react";

const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";

interface Message {
  role: "user" | "assistant";
  text: string;
  ts: string;
  confidence?: number;
  sources?: string[];
}

interface SampleDataItem {
  [key: string]: string | number | boolean | null;
}

type ViewType = "qa" | "sample";

export default function TitanicQaApp() {
  const [view, setView] = useState<ViewType>("qa");

  return (
    <main className="min-h-screen bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">
      <div className="max-w-lg mx-auto px-4 py-6">
        {/* View Toggle */}
        <nav className="flex gap-2 mb-6" role="tablist">
          <button
            role="tab"
            aria-selected={view === "qa"}
            aria-label="QA 채팅 보기"
            onClick={() => setView("qa")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
              view === "qa"
                ? "border-zinc-400 dark:border-zinc-500 bg-zinc-100 dark:bg-zinc-800"
                : "border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800"
            }`}
          >
            <MessageSquare size={18} aria-hidden="true" />
            <span>QA 채팅</span>
          </button>
          <button
            role="tab"
            aria-selected={view === "sample"}
            aria-label="샘플 데이터 보기"
            onClick={() => setView("sample")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
              view === "sample"
                ? "border-zinc-400 dark:border-zinc-500 bg-zinc-100 dark:bg-zinc-800"
                : "border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800"
            }`}
          >
            <Database size={18} aria-hidden="true" />
            <span>샘플 데이터</span>
          </button>
        </nav>

        {view === "qa" ? <TitanicQAPage /> : <TitanicSampleDataPage />}
      </div>
    </main>
  );
}

function TitanicQAPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lastQuestion, setLastQuestion] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendQuestion = async (question: string) => {
    if (!question.trim()) return;

    const userMessage: Message = {
      role: "user",
      text: question,
      ts: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setLastQuestion(question);
    setInput("");
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch(`${apiBaseUrl}/titanic/qa`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });

      if (!response.ok) {
        throw new Error(`서버 오류: ${response.status}`);
      }

      const data = await response.json();
      const { answer, confidence, sources } = data;

      const assistantMessage: Message = {
        role: "assistant",
        text: answer,
        ts: new Date().toISOString(),
        confidence,
        sources,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.";
      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    sendQuestion(input);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendQuestion(input);
    }
  };

  const handleRetry = () => {
    if (lastQuestion) {
      setErrorMessage(null);
      sendQuestion(lastQuestion);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)]">
      {/* Header */}
      <header className="mb-4">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          Titanic QA Assistant
        </h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          타이타닉 데이터 기반 질의응답
        </p>
      </header>

      {/* Chat Messages */}
      <div
        className="flex-1 overflow-y-auto space-y-4 pb-4"
        role="log"
        aria-live="polite"
        aria-label="채팅 메시지"
      >
        {messages.length === 0 && (
          <div className="text-center text-zinc-500 dark:text-zinc-400 py-12">
            <p>질문을 입력해 주세요.</p>
            <p className="text-sm mt-2">예: 25세 남성 3등석 생존 가능성은?</p>
          </div>
        )}
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] px-4 py-3 rounded-2xl ${
                msg.role === "user"
                  ? "bg-zinc-800 dark:bg-zinc-200 text-white dark:text-zinc-900"
                  : "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700"
              }`}
            >
              <p className="whitespace-pre-wrap break-words">{msg.text}</p>
              {msg.role === "assistant" && (
                <div className="mt-2 pt-2 border-t border-zinc-200 dark:border-zinc-700 text-sm text-zinc-600 dark:text-zinc-400">
                  {msg.confidence !== undefined && (
                    <p>
                      <span className="font-medium">신뢰도:</span>{" "}
                      {(msg.confidence * 100).toFixed(1)}%
                    </p>
                  )}
                  {msg.sources && msg.sources.length > 0 && (
                    <p className="mt-1">
                      <span className="font-medium">출처:</span>{" "}
                      {msg.sources.join(", ")}
                    </p>
                  )}
                </div>
              )}
              <time
                className={`block text-xs mt-1 ${
                  msg.role === "user"
                    ? "text-zinc-300 dark:text-zinc-600"
                    : "text-zinc-500 dark:text-zinc-500"
                }`}
                dateTime={msg.ts}
              >
                {new Date(msg.ts).toLocaleTimeString("ko-KR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </time>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-4 py-3 rounded-2xl flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
              <span className="text-sm text-zinc-600 dark:text-zinc-400">
                응답 생성 중...
              </span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 flex items-center justify-between gap-2">
          <span className="text-sm">{errorMessage}</span>
          <button
            type="button"
            onClick={handleRetry}
            aria-label="재시도"
            className="flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg border border-red-300 dark:border-red-700 bg-white dark:bg-transparent hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
          >
            <RotateCcw size={14} aria-hidden="true" />
            <span>재시도</span>
          </button>
        </div>
      )}

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="flex-1 relative">
          <label htmlFor="question-input" className="sr-only">
            질문 입력
          </label>
          <textarea
            id="question-input"
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="예: 25세 남성 3등석 생존 가능성은?"
            maxLength={500}
            rows={1}
            disabled={isLoading}
            className="w-full px-4 py-3 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 resize-none focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:focus:ring-zinc-500 disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <span className="absolute right-3 bottom-1 text-xs text-zinc-400 dark:text-zinc-500">
            {input.length}/500
          </span>
        </div>
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          aria-label="질문 전송"
          className="px-4 py-3 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
          ) : (
            <Send className="w-5 h-5" aria-hidden="true" />
          )}
        </button>
      </form>
    </div>
  );
}

function TitanicSampleDataPage() {
  const [data, setData] = useState<SampleDataItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const response = await fetch(`${apiBaseUrl}/titanic/data`);
      if (!response.ok) {
        throw new Error(`서버 오류: ${response.status}`);
      }
      const result = await response.json();
      setData(result);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "데이터를 불러올 수 없습니다.";
      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const formatValue = (value: string | number | boolean | null): string => {
    if (value === null || value === undefined) return "-";
    if (typeof value === "boolean") return value ? "예" : "아니오";
    return String(value);
  };

  return (
    <div>
      {/* Header */}
      <header className="mb-4">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          샘플 데이터
        </h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          타이타닉 승객 데이터 목록
        </p>
      </header>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-zinc-500" aria-hidden="true" />
          <span className="ml-2 text-zinc-600 dark:text-zinc-400">
            데이터 로딩 중...
          </span>
        </div>
      )}

      {/* Error State */}
      {errorMessage && !isLoading && (
        <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 flex items-center justify-between gap-2">
          <span>{errorMessage}</span>
          <button
            type="button"
            onClick={fetchData}
            aria-label="다시 불러오기"
            className="flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg border border-red-300 dark:border-red-700 bg-white dark:bg-transparent hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
          >
            <RotateCcw size={14} aria-hidden="true" />
            <span>다시 불러오기</span>
          </button>
        </div>
      )}

      {/* Data Cards */}
      {!isLoading && !errorMessage && (
        <div className="space-y-4">
          {data.length === 0 ? (
            <p className="text-center text-zinc-500 dark:text-zinc-400 py-12">
              데이터가 없습니다.
            </p>
          ) : (
            data.map((item, idx) => (
              <article
                key={idx}
                className="p-4 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800"
              >
                <h2 className="sr-only">승객 {idx + 1}</h2>
                <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                  {Object.entries(item).map(([key, value]) => (
                    <div key={key} className="flex flex-col">
                      <dt className="font-medium text-zinc-500 dark:text-zinc-400">
                        {key}
                      </dt>
                      <dd className="text-zinc-900 dark:text-zinc-100">
                        {formatValue(value)}
                      </dd>
                    </div>
                  ))}
                </dl>
              </article>
            ))
          )}
        </div>
      )}
    </div>
  );
}

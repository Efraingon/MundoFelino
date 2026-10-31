import { useEffect, useRef, useState } from "react";
import { ArrowRight, ArrowUpRight, BookOpen, Send, ShieldCheck, X } from "lucide-react";
import { apiSendChat } from "./api";
import type { ChatMessage, ChatSource } from "./types";

const WELCOME = "¡Hola! Soy Michi, tu guía felina. Puedo orientarte sobre alimentación, salud preventiva y comportamiento. ¿Qué te gustaría saber de tu gato?";
const AVATAR = "/gatos/michi-avatar.jpg";

const initialMessages = (): ChatMessage[] => [{ id: 0, role: "assistant", content: WELCOME }];

export function useCatChat() {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [question, setQuestion] = useState("");
  const [busy, setBusy] = useState(false);
  const [retryQuestion, setRetryQuestion] = useState("");

  function reset() {
    setMessages(initialMessages());
    setQuestion("");
    setRetryQuestion("");
  }

  async function sendQuestion(rawQuestion: string, retry = false) {
    const submitted = rawQuestion.trim();
    if (!submitted || busy) return;
    setQuestion("");
    setRetryQuestion("");
    setBusy(true);
    setMessages(previous => {
      const current = previous.filter(message => !message.failed);
      return retry ? current : [...current, { id: Date.now(), role: "user", content: submitted }];
    });
    try {
      const history = messages
        .filter((message, index) => index > 0 && !message.failed)
        .slice(-8)
        .map(({ role, content }) => ({ role, content }));
      const body = await apiSendChat(submitted, history);
      if (!body.answer) throw new Error("El asistente respondió sin contenido. Puedes intentar la consulta otra vez.");
      setMessages(previous => [
        ...previous,
        {
          id: Date.now() + 1,
          role: "assistant",
          content: body.answer,
          urgency: body.urgency === "urgent" ? "urgent" : "general",
          sources: body.sources ?? [],
        },
      ]);
    } catch (err) {
      const message =
        err instanceof Error && err.name === "TimeoutError"
          ? "La consulta está tardando más de lo esperado. Inténtalo otra vez en un momento."
          : err instanceof TypeError
          ? "No logramos conectar con el asistente. Revisa la conexión e inténtalo de nuevo."
          : err instanceof Error
          ? err.message
          : "No logramos conectar con el asistente. Revisa la conexión e inténtalo de nuevo.";
      setRetryQuestion(submitted);
      setMessages(previous => [...previous, { id: Date.now() + 1, role: "assistant", content: message, failed: true }]);
    } finally {
      setBusy(false);
    }
  }

  return { messages, question, setQuestion, busy, retryQuestion, sendQuestion, reset };
}

export type CatChat = ReturnType<typeof useCatChat>;

type ChatWindowProps = {
  chat: CatChat;
  id: string;
  variant?: "inline" | "floating";
  autoFocus?: boolean;
  onClose?: () => void;
  onOpenArticle?: (source: ChatSource) => void;
};

export function ChatWindow({ chat, id, variant = "inline", autoFocus = false, onClose, onOpenArticle }: ChatWindowProps) {
  const { messages, question, setQuestion, busy, retryQuestion, sendQuestion, reset } = chat;
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const list = listRef.current;
    if (list) list.scrollTo({ top: list.scrollHeight, behavior: "smooth" });
  }, [messages, busy]);

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);

  return (
    <div className={variant === "floating" ? "chat-panel chat-panel--floating" : "chat-panel"}>
      <div className="chat-heading">
        <span className="chat-avatar">
          <img src={AVATAR} alt="" width={46} height={46} />
        </span>
        <span className="chat-id">
          <b>Michi</b>
          <small>
            <i /> {busy ? "Escribiendo…" : "En línea"}
          </small>
        </span>
        <div className="chat-heading-actions">
          <button className="chat-reset" type="button" aria-label="Empezar una conversación nueva" title="Empezar de nuevo" onClick={reset}>
            Nueva
          </button>
          {onClose && (
            <button className="chat-close" type="button" aria-label="Cerrar el chat" onClick={onClose}>
              <X size={17} />
            </button>
          )}
        </div>
      </div>
      <div className="chat-body">
        <div className="chat-messages" ref={listRef} aria-live="polite" aria-relevant="additions text">
          {messages.map(message => (
            <div className="chat-turn" key={message.id}>
              <div
                className={
                  message.role === "user"
                    ? "chat-message user-message"
                    : message.urgency === "urgent"
                    ? "chat-message assistant-message urgent-answer"
                    : "chat-message assistant-message"
                }
              >
                {message.urgency === "urgent" && <strong>Atención inmediata</strong>}
                {message.content}
              </div>
              {message.urgency === "urgent" && (
                <button
                  className="urgent-cta"
                  onClick={() => document.getElementById("veterinarios")?.scrollIntoView({ behavior: "smooth" })}
                >
                  Ver centros veterinarios <ArrowUpRight size={14} />
                </button>
              )}
              {message.sources?.length ? (
                <div className="chat-sources">
                  <span>Fuentes consultadas</span>
                  {message.sources.map(source => (
                    <button key={source.slug} type="button" onClick={() => onOpenArticle?.(source)}>
                      <BookOpen size={13} />
                      {source.title}
                      <ArrowUpRight size={12} />
                    </button>
                  ))}
                </div>
              ) : null}
              {message.failed && (
                <button className="chat-retry" type="button" onClick={() => void sendQuestion(retryQuestion, true)}>
                  Reintentar consulta <ArrowRight size={13} />
                </button>
              )}
            </div>
          ))}
          {busy && (
            <div className="chat-message assistant-message loading-message" role="status">
              <span />
              <span />
              <span /> <small>Buscando en la guía felina…</small>
            </div>
          )}
        </div>
        <div className="suggestion-row" aria-label="Ideas para preguntar">
          <button type="button" onClick={() => setQuestion("¿Qué alimentos son tóxicos para los gatos?")}>
            Alimentación
          </button>
          <button type="button" onClick={() => setQuestion("¿Qué señales indican una urgencia veterinaria?")}>
            Señales de alerta
          </button>
          <button type="button" onClick={() => setQuestion("¿Cómo ayudo a mi gato a adaptarse a casa?")}>
            Comportamiento
          </button>
        </div>
        <form
          className="chat-input"
          onSubmit={e => {
            e.preventDefault();
            void sendQuestion(question);
          }}
        >
          <label className="sr-only" htmlFor={`${id}-question`}>
            Pregunta sobre tu gato
          </label>
          <input
            ref={inputRef}
            id={`${id}-question`}
            value={question}
            onChange={e => setQuestion(e.target.value)}
            maxLength={2000}
            placeholder="Escribe tu pregunta sobre tu gato…"
            autoComplete="off"
          />
          <button type="submit" disabled={busy || !question.trim()} aria-label="Enviar pregunta">
            <Send size={17} />
          </button>
        </form>
        <p className="chat-footnote">
          <ShieldCheck size={12} /> No es un diagnóstico. Ante una emergencia, acude a una clínica veterinaria.
        </p>
      </div>
    </div>
  );
}

type ChatWidgetProps = {
  chat: CatChat;
  onOpenArticle?: (source: ChatSource) => void;
};

export function ChatWidget({ chat, onOpenArticle }: ChatWidgetProps) {
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(false);
  const launcherRef = useRef<HTMLButtonElement>(null);
  const dockRef = useRef<HTMLDivElement>(null);
  const seenRef = useRef(chat.messages.length);
  const [sectionInView, setSectionInView] = useState(false);

  useEffect(() => {
    const section = document.getElementById("consulta");
    const target = section?.querySelector(".consulta-chat") ?? section;
    if (!target || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      entries => setSectionInView(entries.some(entry => entry.isIntersecting && entry.intersectionRatio >= 0.35)),
      { threshold: [0, 0.35, 1] }
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (open) {
      seenRef.current = chat.messages.length;
      setUnread(false);
    } else if (chat.messages.length > seenRef.current) setUnread(true);
  }, [open, chat.messages.length]);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      setOpen(false);
      if (!sectionInView) launcherRef.current?.focus();
    }
    function onPointerDown(event: PointerEvent) {
      const target = event.target as Node;
      if (dockRef.current?.contains(target) || launcherRef.current?.contains(target)) return;
      setOpen(false);
    }
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [open, sectionInView]);

  return (
    <>
      {open && (
        <div className="chat-dock" ref={dockRef} id="michi-chat" role="dialog" aria-label="Chat de consulta felina con Michi">
          <ChatWindow
            chat={chat}
            id="michi"
            variant="floating"
            autoFocus
            onClose={() => {
              setOpen(false);
              if (!sectionInView) launcherRef.current?.focus();
            }}
            onOpenArticle={onOpenArticle}
          />
        </div>
      )}
      <button
        ref={launcherRef}
        type="button"
        className={sectionInView && !open ? "chat-launcher is-hidden" : "chat-launcher"}
        aria-expanded={open}
        aria-controls="michi-chat"
        aria-label={open ? "Cerrar el chat con Michi" : "Abrir el chat de consulta felina con Michi"}
        onClick={() => setOpen(value => !value)}
      >
        <span className="chat-launcher-photo">
          <img src={AVATAR} alt="" width={54} height={54} />
        </span>
        <span className="chat-launcher-copy">
          <b>¿Dudas sobre tu gato?</b>
          <small>{busyLine(chat.busy, open)}</small>
        </span>
        {unread && <span className="chat-launcher-dot" aria-hidden="true" />}
      </button>
    </>
  );
}

function busyLine(busy: boolean, open: boolean) {
  if (busy) return "Michi está escribiendo…";
  return open ? "Chat abierto · aquí sigo" : "Pregúntale a Michi";
}

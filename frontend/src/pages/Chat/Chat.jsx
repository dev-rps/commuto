import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Send, ArrowLeft, MessageSquare, Circle } from 'lucide-react';
import { getChatMessages, sendMessage } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { useToast } from '../../context/ToastContext';
import { timeAgo } from '../../lib/utils';
import { EmptyState } from '../../components';

export default function Chat() {
  const { rideId } = useParams();
  const navigate   = useNavigate();
  const { user }   = useAuth();
  const toast      = useToast();
  const { socket, events, joinRideRoom, leaveRideRoom } = useSocket();
  const [messages, setMessages]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [input, setInput]         = useState('');
  const [sending, setSending]     = useState(false);
  const scrollRef = useRef(null);
  const inputRef  = useRef(null);

  useEffect(() => {
    getChatMessages(rideId).then(setMessages).catch(() => {}).finally(() => setLoading(false));
  }, [rideId]);

  const handleIncomingMessage = useCallback((msg) => {
    setMessages((prev) => {
      if (prev.some(m => m.id === msg.id)) return prev;
      return [...prev, msg];
    });
  }, []);

  useEffect(() => {
    if (!rideId) return;
    joinRideRoom?.(rideId);
    if (socket) socket.on(events.chatMessage(rideId), handleIncomingMessage);
    return () => {
      leaveRideRoom?.(rideId);
      if (socket) socket.off(events.chatMessage(rideId));
    };
  }, [rideId, socket, events, joinRideRoom, leaveRideRoom, handleIncomingMessage]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    setSending(true);
    try {
      const msg = await sendMessage(rideId, input.trim());
      setMessages((prev) => {
        if (prev.some(m => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
      setInput('');
      inputRef.current?.focus();
    } catch (err) {
      toast.error(err.message || 'Failed to send message');
    } finally { setSending(false); }
  };

  const initials = (name) => name?.split(' ').map((p) => p[0]).slice(0, 2).join('') || '?';

  return (
    <div className="max-w-2xl mx-auto flex flex-col" style={{ height: 'calc(100vh - 100px)' }}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-4 shrink-0">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-xl hover:bg-neutral-100 text-neutral-600 transition-colors"
          aria-label="Go back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: 'var(--gradient-primary)' }}
        >
          <MessageSquare className="w-4.5 h-4.5 text-white" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-neutral-900">Ride Chat</h2>
          <p className="text-xs text-neutral-500 flex items-center gap-1">
            <Circle className="w-2 h-2 fill-accent text-accent" />
            Active
          </p>
        </div>
      </div>

      {/* Messages area */}
      <div className="card flex-1 flex flex-col overflow-hidden">
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="w-6 h-6 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
            </div>
          ) : messages.length === 0 ? (
            <EmptyState
              icon={MessageSquare}
              title="No messages yet"
              message="Say hello to your ride companions!"
            />
          ) : (
            messages.map((msg, idx) => {
              const isMe = msg.senderId === user?.id;
              const showAvatar = !isMe && (idx === 0 || messages[idx - 1]?.senderId !== msg.senderId);
              return (
                <div key={msg.id} className={`flex items-end gap-2 animate-fade-up ${isMe ? 'justify-end' : 'justify-start'}`}>
                  {!isMe && (
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0 mb-0.5 ${showAvatar ? 'visible' : 'invisible'}`}
                      style={{ background: 'var(--gradient-primary)' }}>
                      {initials(msg.sender?.name || msg.senderId)}
                    </div>
                  )}
                  <div className={`max-w-[72%] group`}>
                    {!isMe && showAvatar && (
                      <p className="text-[10px] text-neutral-400 font-medium mb-1 px-1">
                        {msg.sender?.name || 'Rider'}
                      </p>
                    )}
                    <div
                      className={`px-4 py-2.5 rounded-2xl ${
                        isMe
                          ? 'rounded-br-sm text-white'
                          : 'rounded-bl-sm bg-neutral-100 text-neutral-900'
                      }`}
                      style={isMe ? { background: 'var(--gradient-primary)' } : {}}
                    >
                      <p className="text-sm leading-relaxed">{msg.message}</p>
                    </div>
                    <p className={`text-[10px] mt-1 px-1 opacity-0 group-hover:opacity-100 transition-opacity ${isMe ? 'text-right text-neutral-400' : 'text-neutral-400'}`}>
                      {timeAgo(msg.sentAt)}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Input */}
        <form onSubmit={handleSend} className="p-3 border-t border-neutral-100 flex gap-2 shrink-0">
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            className="input flex-1"
            disabled={sending}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(e); } }}
          />
          <button
            type="submit"
            disabled={sending || !input.trim()}
            className="btn-primary shrink-0 px-3.5"
            aria-label="Send message"
          >
            {sending
              ? <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              : <Send className="w-4 h-4" />
            }
          </button>
        </form>
      </div>
    </div>
  );
}

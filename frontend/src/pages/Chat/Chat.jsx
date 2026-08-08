import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Send, ArrowLeft, MessageSquare } from 'lucide-react';
import { getChatMessages, sendMessage } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { timeAgo } from '../../lib/utils';
import { Spinner, EmptyState } from '../../components';

export default function Chat() {
  const { rideId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { socket, events, joinRideRoom, leaveRideRoom } = useSocket();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    getChatMessages(rideId).then(setMessages).catch(() => {}).finally(() => setLoading(false));
  }, [rideId]);

  // Socket listener for incoming chat messages — structured so the real
  // backend just needs to emit and this handler fires without changes.
  const handleIncomingMessage = useCallback((msg) => {
    setMessages((prev) => [...prev, msg]);
  }, []);

  useEffect(() => {
    if (!rideId) return;
    joinRideRoom?.(rideId);
    if (socket) {
      socket.on(events.chatMessage(rideId), handleIncomingMessage);
    }
    return () => {
      leaveRideRoom?.(rideId);
      if (socket) socket.off(events.chatMessage(rideId));
    };
  }, [rideId, socket, events, joinRideRoom, leaveRideRoom, handleIncomingMessage]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    setSending(true);
    try {
      const msg = await sendMessage(rideId, input.trim());
      setMessages((prev) => [...prev, msg]);
      setInput('');
    } catch (err) {
      alert(err.message || 'Failed to send message');
    } finally { setSending(false); }
  };

  if (loading) return <Spinner label="Loading messages..." />;

  return (
    <div className="max-w-2xl mx-auto">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-neutral-600 hover:text-neutral-900 mb-4">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>
      <div className="card flex flex-col" style={{ height: 'calc(100vh - 180px)' }}>
        <div className="px-5 py-4 border-b border-neutral-200 flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-neutral-900">Ride Chat</h3>
        </div>
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.length === 0 ? (
            <EmptyState icon={MessageSquare} title="No messages yet" message="Start the conversation with your ride companions." />
          ) : (
            messages.map((msg) => {
              const isMe = msg.senderId === user?.id;
              return (
                <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[75%] rounded-lg px-4 py-2.5 ${isMe ? 'bg-primary text-white' : 'bg-neutral-100 text-neutral-900'}`}>
                    <p className="text-sm">{msg.message}</p>
                    <p className={`text-xs mt-1 ${isMe ? 'text-primary-200' : 'text-neutral-400'}`}>{timeAgo(msg.sentAt)}</p>
                  </div>
                </div>
              );
            })
          )}
        </div>
        <form onSubmit={handleSend} className="p-3 border-t border-neutral-200 flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            className="input flex-1"
            disabled={sending}
          />
          <button type="submit" disabled={sending || !input.trim()} className="btn-primary shrink-0">
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}

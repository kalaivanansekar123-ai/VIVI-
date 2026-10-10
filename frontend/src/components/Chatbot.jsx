import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { formatRupee } from '../utils/format';
import { MessageCircle, X, Send, ShoppingBag, Package, CreditCard, RotateCcw, Headphones } from 'lucide-react';

const WELCOME_MESSAGE = 'Hi! Welcome to ViviMart. How can I help you?';

const QUICK_REPLIES = [
  { key: 'browse', label: 'Browse Products', icon: ShoppingBag },
  { key: 'track', label: 'Track My Order', icon: Package },
  { key: 'payment', label: 'Payment Help', icon: CreditCard },
  { key: 'returns', label: 'Returns & Refunds', icon: RotateCcw },
  { key: 'contact', label: 'Contact Support', icon: Headphones },
];

const ORDER_STATUS_LABELS = {
  PLACED: 'Order Placed',
  CONFIRMED: 'Confirmed',
  PACKED: 'Packed',
  OUT_FOR_DELIVERY: 'Out for Delivery',
  DELIVERED: 'Delivered',
};

const STATIC_REPLIES = {
  greeting: 'Hello! Welcome to ViviMart. I can help you browse products, track your order, or answer questions about payments, returns, and support. How can I assist you today?',
  payment: 'ViviMart supports Cash on Delivery and a demo (mock) Net Banking flow at checkout. Please note that this project uses a mocked payment experience, so no real money is charged.',
  returns: 'We are happy to help with returns and refunds. Please contact our support team with your Order ID and we will guide you through the return and refund process.',
  contact: 'You can contact ViviMart support at support@vivimart.com. We usually respond within 24 hours.',
  cart: 'You can add products to your cart from any product card, then review and check out from the Cart page. Your cart is linked to your ViviMart account.',
  shipping: 'Delivery is free on orders above \u20B9499. For smaller orders, a small delivery fee is added at checkout.',
  fallback: 'I am here to help! Tap one of the options below, or ask me about products, orders, payments, returns, or contacting support.',
};

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function matchIntent(text) {
  const t = text.toLowerCase();
  if (/\b(hi|hello|hey|namaste|good\s*(morning|afternoon|evening)|greetings)\b/.test(t)) return 'greeting';
  if (/\b(product|browse|shop|buy|catalog|catalogue|price|search|what do you sell)\b/.test(t)) return 'browse';
  if (/\b(order|order\s*id|track|ship|shipping\s*status|delivery\s*status|status\s*of)\b/.test(t)) return 'track';
  if (/\b(return|returns|refund|refunds|replace|cancel|exchange|money\s*back)\b/.test(t)) return 'returns';
  if (/\b(pay|payment|upi|net\s*bank|credit|debit|card|cash\s*on\s*delivery|cod)\b/.test(t)) return 'payment';
  if (/\b(contact|support|human|agent|call|email|reach|reached|help\s*desk)\b/.test(t)) return 'contact';
  if (/\b(cart|basket|add\s*to\s*cart|saved\s*for\s*later)\b/.test(t)) return 'cart';
  if (/\b(shipping|delivery\s*charge|delivery\s*fee|shipping\s*fee|delivery\s*cost)\b/.test(t)) return 'shipping';
  return 'fallback';
}

const Chatbot = () => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([{ id: 0, from: 'bot', text: WELCOME_MESSAGE }]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const listRef = useRef(null);
  const idRef = useRef(1);

  useEffect(() => {
    if (open && listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [open, messages, busy]);

  const addUserMessage = (text) => {
    setMessages((prev) => [...prev, { id: idRef.current++, from: 'user', text }]);
  };

  const addBotMessage = (content) => {
    setMessages((prev) => [...prev, { id: idRef.current++, from: 'bot', ...content }]);
  };

  const handleBrowse = async () => {
    try {
      const res = await api.get('/products', { params: { sort: 'rating' } });
      const list = Array.isArray(res.data) ? res.data : (res.data.products || []);
      addBotMessage({
        text: 'Here are some popular products you can explore:',
        products: list.slice(0, 4),
        link: { to: '/products', label: 'See all products' },
      });
    } catch (err) {
      addBotMessage({ text: 'Sorry, I could not load the products right now. Please try again in a moment.' });
    }
  };

  const handleTrack = async () => {
    if (!user) {
      addBotMessage({ text: 'You need to be logged in to track your order.', link: { to: '/login', label: 'Go to Login' } });
      return;
    }
    try {
      const res = await api.get('/orders');
      const orders = res.data.orders || [];
      if (orders.length === 0) {
        addBotMessage({ text: 'You do not have any orders yet. Browse our products and place your first order with us!' });
      } else {
        const latest = orders[0];
        addBotMessage({
          text: 'Here is your most recent order:',
          order: { id: latest.id, status: latest.status },
          link: { to: '/orders', label: 'View all orders' },
        });
      }
    } catch (err) {
      addBotMessage({ text: 'Sorry, I could not fetch your orders right now. Please try again later.' });
    }
  };

  const respond = async (text) => {
    const intent = matchIntent(text);
    if (intent === 'browse') {
      await handleBrowse();
      return;
    }
    if (intent === 'track') {
      await handleTrack();
      return;
    }
    await delay(500);
    addBotMessage({ text: STATIC_REPLIES[intent] || STATIC_REPLIES.fallback });
  };

  const handleQuickReply = async (reply) => {
    if (busy) return;
    addUserMessage(reply.label);
    setBusy(true);
    await respond(reply.key === 'browse' ? 'browse products' : reply.label.toLowerCase());
    setBusy(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || busy) return;
    addUserMessage(text);
    setInput('');
    setBusy(true);
    await respond(text);
    setBusy(false);
  };

  return (
    <>
      {open && (
        <div className="fixed bottom-24 right-3 md:right-6 z-50 flex flex-col w-[calc(100vw-1.5rem)] max-w-sm h-[560px] max-h-[75vh] bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200">
          <header className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-3 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-full bg-white/20 flex items-center justify-center">
                <MessageCircle size={18} />
              </div>
              <div>
                <p className="font-semibold text-sm leading-tight">ViviMart Assistant</p>
                <p className="text-[11px] text-indigo-100 flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-green-400 inline-block" />
                  Online
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="p-1.5 rounded-full hover:bg-white/20 text-white"
              aria-label="Close chat"
            >
              <X size={18} />
            </button>
          </header>

          <div ref={listRef} className="flex-1 overflow-y-auto bg-gray-50 px-4 py-4 space-y-3">
            {messages.map((m) => (
              <MessageBubble key={m.id} message={m} onNavigate={() => setOpen(false)} />
            ))}
            {busy && <TypingBubble />}
          </div>

          <div className="px-3 py-2 border-t border-gray-100 bg-white shrink-0">
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
              {QUICK_REPLIES.map((reply) => {
                const Icon = reply.icon;
                return (
                  <button
                    key={reply.key}
                    type="button"
                    onClick={() => handleQuickReply(reply)}
                    disabled={busy}
                    className="whitespace-nowrap shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-indigo-200 bg-indigo-50 text-indigo-700 text-xs font-medium hover:bg-indigo-100 disabled:opacity-50"
                  >
                    <Icon size={14} />
                    <span>{reply.label}</span>
                  </button>
                );
              })}
            </div>
            <form onSubmit={handleSubmit} className="flex items-center gap-2 mt-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                aria-label="Chat message"
              />
              <button
                type="submit"
                disabled={busy || !input.trim()}
                className="h-9 w-9 rounded-full bg-indigo-600 text-white flex items-center justify-center hover:bg-indigo-700 transition disabled:opacity-50"
                aria-label="Send message"
              >
                <Send size={16} />
              </button>
            </form>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? 'Close chat' : 'Open chat'}
        className={`fixed right-4 bottom-20 md:bottom-6 z-40 h-14 w-14 rounded-full shadow-lg flex items-center justify-center text-white transition-transform hover:scale-105 ${
          open ? 'bg-rose-500' : 'bg-gradient-to-r from-indigo-600 to-purple-600'
        }`}
      >
        {open ? <X size={24} /> : <MessageCircle size={26} />}
      </button>
    </>
  );
};

const TypingBubble = () => (
  <div className="flex justify-start">
    <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
      <div className="flex gap-1">
        <span className="h-2 w-2 rounded-full bg-gray-400 animate-bounce" />
        <span className="h-2 w-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0.15s' }} />
        <span className="h-2 w-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0.3s' }} />
      </div>
    </div>
  </div>
);

const MessageBubble = ({ message, onNavigate }) => {
  if (message.from === 'user') {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] bg-indigo-600 text-white text-sm px-3 py-2 rounded-2xl rounded-br-sm">
          {message.text}
        </div>
      </div>
    );
  }

  const statusLabel = message.order ? (ORDER_STATUS_LABELS[message.order.status] || message.order.status) : null;

  return (
    <div className="flex justify-start">
      <div className="max-w-[85%] bg-white border border-gray-200 text-slate-800 text-sm px-3 py-2.5 rounded-2xl rounded-bl-sm shadow-sm space-y-2">
        {message.text && <p>{message.text}</p>}

        {message.products && message.products.length > 0 && (
          <ul className="divide-y divide-gray-100">
            {message.products.map((p) => (
              <li key={p.id} className="py-1.5">
                <Link to={`/products/${p.id}`} onClick={onNavigate} className="flex items-center justify-between gap-2 hover:text-indigo-600">
                  <span className="line-clamp-1">{p.name}</span>
                  <span className="text-indigo-600 font-medium whitespace-nowrap">{formatRupee(p.price)}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}

        {message.order && (
          <div className="rounded-lg border border-indigo-100 bg-indigo-50 p-2.5">
            <p className="font-medium text-slate-800">Order #{message.order.id}</p>
            <p className="text-xs text-indigo-700 mt-1 flex items-center gap-1">
              <Package size={13} />
              {statusLabel}
            </p>
          </div>
        )}

        {message.link && (
          <Link to={message.link.to} onClick={onNavigate} className="inline-block text-xs font-medium text-indigo-600 hover:underline">
            {message.link.label} &rarr;
          </Link>
        )}
      </div>
    </div>
  );
};

export default Chatbot;
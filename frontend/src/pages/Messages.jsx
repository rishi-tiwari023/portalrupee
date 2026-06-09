import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useSocket } from '../context/SocketContext';
import api from '../api/axios';
import { 
  MessageSquare, 
  Search, 
  RefreshCcw, 
  ShieldCheck, 
  ShieldAlert,
  ArrowUpRight, 
  Clock, 
  Send, 
  HelpCircle,
  AlertCircle,
  Lock,
  UserCheck
} from 'lucide-react';

const Messages = () => {
  const { user } = useSelector((state) => state.auth);
  const { socket, isConnected } = useSocket();

  // Rooms and listing state
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Selected conversation state
  const [selectedContact, setSelectedContact] = useState(null);
  const [isVerifyingPermission, setIsVerifyingPermission] = useState(false);
  const [activeRoomId, setActiveRoomId] = useState(null);
  const [socketError, setSocketError] = useState(null);

  // Chat specific state
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [remoteTyping, setRemoteTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Fetch transacted contacts (chat rooms)
  const fetchRooms = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/chats/rooms');
      if (response.data && response.data.status === 'success') {
        setRooms(response.data.data.rooms || []);
      } else {
        throw new Error('Failed to retrieve chat rooms');
      }
    } catch (err) {
      console.error('Error fetching chat rooms:', err);
      setError(err.response?.data?.message || 'Could not load your transacted contacts.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  // Hook into Socket.io when a contact is selected
  useEffect(() => {
    if (!selectedContact) {
      setActiveRoomId(null);
      setSocketError(null);
      return;
    }

    const joinChatRoom = () => {
      setIsVerifyingPermission(true);
      setSocketError(null);
      setActiveRoomId(null);

      if (!socket) {
        setIsVerifyingPermission(false);
        setSocketError('Messaging server is currently unreachable. Reconnecting...');
        return;
      }

      // Emit join_chat event to check transaction-based permission and join room
      socket.emit('join_chat', { targetUserId: selectedContact.user._id }, async (response) => {
        setIsVerifyingPermission(false);
        if (response.status === 'success') {
          setActiveRoomId(response.roomId);
          console.log(`Successfully connected to chat tunnel: ${response.roomId}`);
          
          // Fetch previous messages
          try {
            const historyRes = await api.get(`/chats/${selectedContact.user._id}/messages?limit=100`);
            if (historyRes.data?.status === 'success') {
              setChatMessages(historyRes.data.data.messages.reverse());
            }
          } catch (err) {
            console.error('Failed to fetch chat history:', err);
          }
        } else {
          setSocketError(response.message || 'You do not have permission to message this user.');
        }
      });
    };

    joinChatRoom();

  }, [selectedContact, socket, isConnected]);

  // Socket listeners for real-time events
  useEffect(() => {
    if (!socket || !activeRoomId) return;

    const handleReceiveMessage = (message) => {
      setChatMessages((prev) => [...prev, message]);
    };

    const handleTyping = ({ userId }) => {
      if (userId === selectedContact?.user?._id) setRemoteTyping(true);
    };

    const handleStopTyping = ({ userId }) => {
      if (userId === selectedContact?.user?._id) setRemoteTyping(false);
    };

    socket.on('receive_message', handleReceiveMessage);
    socket.on('typing', handleTyping);
    socket.on('stop_typing', handleStopTyping);

    return () => {
      socket.off('receive_message', handleReceiveMessage);
      socket.off('typing', handleTyping);
      socket.off('stop_typing', handleStopTyping);
    };
  }, [socket, activeRoomId, selectedContact]);

  // Auto-scroll
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages, remoteTyping]);

  // Handlers
  const handleInputChange = (e) => {
    setNewMessage(e.target.value);
    if (socket && activeRoomId) {
      socket.emit('typing', { roomId: activeRoomId });
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit('stop_typing', { roomId: activeRoomId });
      }, 1500);
    }
  };

  const handleSendMessage = (e) => {
    e?.preventDefault();
    if (!newMessage.trim() || !socket || !activeRoomId) return;

    const content = newMessage.trim();
    setNewMessage('');
    
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    socket.emit('stop_typing', { roomId: activeRoomId });

    socket.emit('send_message', {
      targetUserId: selectedContact.user._id,
      content
    });
  };

  // Filter contacts by search term
  const filteredRooms = rooms.filter((room) => {
    const fullName = `${room.user.firstName} ${room.user.lastName}`.toLowerCase();
    const email = room.user.email.toLowerCase();
    const query = searchTerm.toLowerCase();
    return fullName.includes(query) || email.includes(query);
  });

  // Helper to get initials
  const getInitials = (firstName = '', lastName = '') => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  };

  return (
    <div className="w-full h-[calc(100vh-10rem)] lg:h-[calc(100vh-12rem)] flex flex-col lg:flex-row gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* 1. Conversations Sidebar (Left Panel) */}
      <div className="w-full lg:w-96 flex flex-col bg-white border border-slate-100 shadow-xl shadow-slate-100/40 rounded-[2.5rem] p-6 h-full min-h-[400px]">
        {/* Header & Refresh */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-100">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Conversations</h2>
          </div>
          <button
            onClick={fetchRooms}
            disabled={loading}
            className="p-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-400 hover:text-indigo-600 hover:border-indigo-100 active:scale-95 transition-all"
            title="Refresh contacts"
          >
            <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Filter Input */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Filter transacted users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-slate-100/50 focus:bg-white border border-transparent focus:border-indigo-200 outline-none rounded-2xl text-sm font-medium text-slate-700 placeholder:text-slate-400 shadow-inner focus:shadow-lg focus:shadow-indigo-500/5 transition-all duration-300"
          />
        </div>

        {/* Contacts List */}
        <div className="flex-1 overflow-y-auto no-scrollbar space-y-3">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <div className="w-8 h-8 border-3 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
              <p className="text-xs font-bold text-slate-400">Loading transacted users...</p>
            </div>
          ) : error ? (
            <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          ) : filteredRooms.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center py-12 px-4 bg-slate-50/50 rounded-3xl border border-dashed border-slate-200">
              <Lock className="w-10 h-10 text-slate-300 mb-3" />
              <h4 className="text-sm font-black text-slate-700 mb-1">No Contacts Available</h4>
              <p className="text-slate-500 text-[11px] font-medium leading-relaxed max-w-[200px]">
                Messaging is only allowed with users you have actively transacted with.
              </p>
            </div>
          ) : (
            filteredRooms.map((room) => {
              const isSelected = selectedContact?.user?._id === room.user._id;
              return (
                <div
                  key={room.user._id}
                  onClick={() => setSelectedContact(room)}
                  className={`
                    flex items-center justify-between p-3.5 rounded-2xl cursor-pointer border transition-all duration-200 active:scale-[0.98] group
                    ${isSelected
                      ? 'bg-indigo-50/80 border-indigo-200 shadow-sm ring-4 ring-indigo-500/5'
                      : 'bg-white border-transparent hover:bg-slate-50 hover:border-slate-100'
                    }
                  `}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    {/* Avatar with initials */}
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-cyan-500 p-[2px] shadow-sm transform group-hover:scale-105 transition-transform flex-shrink-0">
                      <div className="w-full h-full rounded-[14px] bg-white flex items-center justify-center text-indigo-700 font-extrabold text-sm">
                        {getInitials(room.user.firstName, room.user.lastName)}
                      </div>
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className={`text-sm truncate font-bold ${isSelected ? 'text-indigo-900' : 'text-slate-800'}`}>
                          {room.user.firstName} {room.user.lastName}
                        </p>
                        <span className="text-[9px] font-black uppercase bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">
                          {room.user.role}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1 truncate">
                        Last txn: <span className="font-extrabold text-slate-500">₹{room.lastTransaction.amount}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-0.5">
                      <Clock className="w-3 h-3" />
                      {new Date(room.lastTransaction.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Security Footer */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-2.5">
          <ShieldCheck className="w-5 h-5 text-indigo-600 flex-shrink-0" />
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
            PortalRupee Safe Guard Active
          </span>
        </div>
      </div>

      {/* 2. Chat Workspace (Right Panel) */}
      <div className="flex-1 flex flex-col bg-white border border-slate-100 shadow-xl shadow-slate-100/40 rounded-[2.5rem] overflow-hidden h-full">
        
        {!selectedContact ? (
          /* Empty Workspace State */
          <div className="flex-grow flex flex-col items-center justify-center p-8 text-center relative">
            {/* Decorative background grid blur */}
            <div className="absolute inset-0 bg-radial-gradient from-indigo-50/50 to-transparent pointer-events-none opacity-40 blur-xl" />

            <div className="relative z-10 max-w-md flex flex-col items-center">
              <div className="w-20 h-20 bg-indigo-50 rounded-[2rem] border border-indigo-100 flex items-center justify-center mb-6 shadow-inner animate-pulse">
                <Lock className="w-10 h-10 text-indigo-600" />
              </div>
              <h3 className="text-2xl font-black text-slate-800 tracking-tight mb-3">Secure Communication Workspace</h3>
              <p className="text-slate-500 text-sm font-medium leading-relaxed mb-6">
                To guarantee account security, PortalRupee enforces **Permission-Based Messaging**. Direct messages are enabled exclusively between accounts with successful transaction history.
              </p>
              <div className="bg-indigo-50/50 border border-indigo-100/50 rounded-2xl p-4 flex items-start gap-3 text-left">
                <HelpCircle className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h5 className="text-xs font-black text-indigo-950 uppercase tracking-wide mb-1">How it works:</h5>
                  <p className="text-slate-600 text-xs font-medium leading-relaxed">
                    Once a successful funds transfer occurs between you and another customer, cashier, or manager, a communication tunnel is automatically unlocked.
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Active Contact State */
          <div className="flex-grow flex flex-col h-full overflow-hidden">
            {/* Chat Header */}
            <div className="px-8 py-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/20">
              <div className="flex items-center gap-4">
                {/* Contact Initials Avatar */}
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-cyan-500 p-[2px]">
                  <div className="w-full h-full rounded-[14px] bg-white flex items-center justify-center text-indigo-700 font-extrabold text-sm">
                    {getInitials(selectedContact.user.firstName, selectedContact.user.lastName)}
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2.5">
                    <h4 className="text-base font-extrabold text-slate-900">
                      {selectedContact.user.firstName} {selectedContact.user.lastName}
                    </h4>
                    <span className="text-[10px] font-black uppercase bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full border border-indigo-100">
                      {selectedContact.user.role}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 font-medium">{selectedContact.user.email}</p>
                </div>
              </div>

              {/* Status Indicator */}
              <div className="flex items-center gap-3">
                {isVerifyingPermission ? (
                  <div className="flex items-center gap-2 px-4 py-1.5 bg-amber-50 text-amber-700 border border-amber-100 rounded-full text-xs font-black uppercase tracking-wider">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
                    <span>Verifying...</span>
                  </div>
                ) : socketError ? (
                  <div className="flex items-center gap-2 px-4 py-1.5 bg-rose-50 text-rose-700 border border-rose-100 rounded-full text-xs font-black uppercase tracking-wider">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>Access Denied</span>
                  </div>
                ) : activeRoomId ? (
                  <div className="flex items-center gap-2 px-4 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full text-xs font-black uppercase tracking-wider">
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>Secure Link Active</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 px-4 py-1.5 bg-slate-50 text-slate-600 border border-slate-200 rounded-full text-xs font-black uppercase tracking-wider">
                    <span>Offline</span>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Transaction Info Reference */}
            <div className="px-8 py-3 bg-indigo-50/30 border-b border-indigo-50/50 flex items-center justify-between">
              <div className="flex items-center gap-2 text-indigo-900 font-medium text-xs">
                <ArrowUpRight className="w-4 h-4 text-indigo-600" />
                <span>Transaction Context: Successful TRANSFER</span>
              </div>
              <span className="text-xs font-black text-indigo-700">
                Amount: ₹{selectedContact.lastTransaction.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>

            {/* Message Pane Area */}
            <div className="flex-1 p-6 overflow-y-auto bg-slate-50/30 flex flex-col gap-4">
              {isVerifyingPermission ? (
                <div className="flex-1 flex flex-col items-center justify-center gap-4">
                  <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
                  <p className="text-sm font-bold text-slate-400">Negotiating cryptographic keys...</p>
                </div>
              ) : socketError ? (
                <div className="flex-1 flex flex-col items-center justify-center max-w-sm mx-auto text-center">
                  <div className="w-16 h-16 bg-rose-50 rounded-2xl border border-rose-100 text-rose-600 flex items-center justify-center mb-4 shadow-sm">
                    <ShieldAlert className="w-8 h-8" />
                  </div>
                  <h4 className="text-base font-black text-slate-800 mb-2">Messaging Access Blocked</h4>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed">
                    {socketError}
                  </p>
                </div>
              ) : activeRoomId ? (
                <>
                  <div className="flex flex-col items-center py-6 mb-4">
                    <ShieldCheck className="w-8 h-8 text-emerald-500 mb-2" />
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider">End-to-End Encrypted Tunnel Established</p>
                  </div>
                  
                  {chatMessages.map((msg, index) => {
                    const isOwn = msg.sender === user?._id;
                    return (
                      <div key={msg._id || index} className={`flex ${isOwn ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                        <div className={`max-w-[75%] rounded-2xl px-5 py-3 ${
                          isOwn 
                            ? 'bg-gradient-to-br from-indigo-600 to-indigo-700 text-white shadow-md shadow-indigo-200 rounded-tr-sm' 
                            : 'bg-white border border-slate-100 text-slate-800 shadow-sm rounded-tl-sm'
                        }`}>
                          <p className="text-sm font-medium leading-relaxed break-words">{msg.content}</p>
                          <div className={`text-[9px] font-bold mt-1.5 flex justify-end ${isOwn ? 'text-indigo-200' : 'text-slate-400'}`}>
                            {new Date(msg.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  
                  {remoteTyping && (
                    <div className="flex justify-start animate-in fade-in duration-300">
                      <div className="bg-white border border-slate-100 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1 shadow-sm">
                        <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </>
              ) : null}
            </div>

            {/* Chat Input Footer */}
            {activeRoomId && !isVerifyingPermission && !socketError && (
              <div className="p-5 border-t border-slate-100 bg-white">
                <form onSubmit={handleSendMessage} className="flex gap-3 items-center bg-slate-50 px-2 py-2 rounded-2xl border border-slate-200 focus-within:border-indigo-300 focus-within:ring-4 focus-within:ring-indigo-50 transition-all">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={handleInputChange}
                    placeholder="Type your secure message..."
                    className="flex-1 bg-transparent border-none outline-none text-sm font-medium text-slate-800 placeholder:text-slate-400 px-3 py-1.5"
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim()}
                    className="p-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 active:scale-95 disabled:opacity-50 disabled:active:scale-100 transition-all shadow-md shadow-indigo-200 disabled:shadow-none flex items-center justify-center"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            )}

          </div>
        )}

      </div>

    </div>
  );
};

export default Messages;

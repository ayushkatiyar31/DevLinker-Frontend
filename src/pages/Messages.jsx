import { useEffect, useMemo, useRef, useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { CodeBlock } from "@/components/ui/code-block";
import { Send, ArrowLeft, Phone, Video, MoreVertical, Image, Smile, Search, Crown, Code } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { getChatWithUser, listChats, sendMessageToUser } from "@/services/chatService";
import { io } from "socket.io-client";
import { getBackendOrigin } from "@/lib/apiClient";

export default function Messages() {
  const { profile } = useAuth();
  const currentUserId = profile?.id;
  const [searchParams] = useSearchParams();
  const targetUserIdFromQuery = searchParams.get("userId");

  const LAST_READ_STORAGE_KEY = "devlinker:lastReadByUserId";

  const [chats, setChats] = useState([]);
  const [loadingChats, setLoadingChats] = useState(true);
  const [loadingThread, setLoadingThread] = useState(false);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messageInput, setMessageInput] = useState("");
  const [isCodeMode, setIsCodeMode] = useState(false);
  const [codeLanguage, setCodeLanguage] = useState("typescript");
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [lastReadByUserId, setLastReadByUserId] = useState(() => {
    try {
      const raw = localStorage.getItem(LAST_READ_STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : {};
      return parsed && typeof parsed === "object" ? parsed : {};
    } catch {
      return {};
    }
  });

  const messagesEndRef = useRef(null);
  const unreadFetchInFlightRef = useRef(new Set());

  const socketRef = useRef(null);
  const joinedTargetIdsRef = useRef(new Set());
  const [socketConnected, setSocketConnected] = useState(false);

  const scrollToBottom = (behavior = "auto") => {
    if (!messagesEndRef.current) return;
    messagesEndRef.current.scrollIntoView({ behavior, block: "end" });
  };

  const splitName = (fullName) => {
    const parts = String(fullName || "").trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return { firstName: "", lastName: "" };
    return { firstName: parts[0], lastName: parts.slice(1).join(" ") };
  };

  const ensureJoinedRoom = (targetUserId) => {
    const socket = socketRef.current;
    const target = String(targetUserId || "");
    if (!socket || !socketConnected) return;
    if (!currentUserId || !target) return;
    if (joinedTargetIdsRef.current.has(target)) return;

    const { firstName } = splitName(profile?.name);
    socket.emit("joinChat", {
      firstName: firstName || "User",
      userId: String(currentUserId),
      targetUserId: target,
    });
    joinedTargetIdsRef.current.add(target);
  };

  const totalUnread = useMemo(
    () => chats.reduce((sum, chat) => sum + (chat.unreadCount || 0), 0),
    [chats]
  );

  const normalizedSearch = useMemo(() => String(searchQuery || "").trim().toLowerCase(), [searchQuery]);

  const filteredChats = useMemo(() => {
    if (!normalizedSearch) return chats;

    return chats.filter((chat) => {
      const name = String(chat?.profile?.name || "").toLowerCase();
      const role = String(chat?.profile?.role || "").toLowerCase();
      const last = String(chat?.lastMessage || "").toLowerCase();
      return name.includes(normalizedSearch) || role.includes(normalizedSearch) || last.includes(normalizedSearch);
    });
  }, [chats, normalizedSearch]);

  const mapUserToProfile = (u) => {
    if (!u) return null;
    return {
      id: u._id,
      name: u.fullName,
      avatar_url: u.photoUrl,
      role: u.role,
      is_premium: Boolean(u.isPremium),
    };
  };

  const mapChatListItem = (item) => {
    const p = mapUserToProfile(item.targetUser);
    return {
      id: item.id,
      profile: p,
      lastMessage: item.lastMessage || "",
      lastMessageSenderId: item.lastMessageSenderId ? String(item.lastMessageSenderId) : null,
      lastMessageTime: item.lastMessageTime || new Date().toISOString(),
      unreadCount: 0,
      messages: [],
    };
  };

  const mapChatThread = (chatDoc) => {
    const other = (chatDoc?.participants || []).find(
      (p) => String(p?._id) !== String(currentUserId)
    );

    const messages = (chatDoc?.messages || []).map((m, idx) => {
      const sender = m?.senderId;
      const senderId = typeof sender === "string" ? sender : sender?._id;
      return {
        id: m?._id || `msg-${idx}`,
        senderId: String(senderId),
        content: m?.text ?? "",
        timestamp: m?.createdAt ?? new Date().toISOString(),
      };
    });

    const last = messages.length > 0 ? messages[messages.length - 1] : null;
    const profileData = mapUserToProfile(other);

    return {
      id: chatDoc?._id,
      profile: profileData,
      lastMessage: last?.content || "",
      lastMessageSenderId: last?.senderId ? String(last.senderId) : null,
      lastMessageTime: last?.timestamp || chatDoc?.updatedAt || chatDoc?.createdAt,
      unreadCount: 0,
      messages,
    };
  };

  const persistLastRead = (next) => {
    try {
      localStorage.setItem(LAST_READ_STORAGE_KEY, JSON.stringify(next));
    } catch {
      // ignore
    }
  };

  const markChatAsRead = (targetUserId, newestTimestamp) => {
    if (!targetUserId) return;
    const when = newestTimestamp ? new Date(newestTimestamp).toISOString() : new Date().toISOString();
    setLastReadByUserId((prev) => {
      const next = { ...prev, [String(targetUserId)]: when };
      persistLastRead(next);
      return next;
    });
  };

  const getUnreadCountFromMessages = (messages, lastReadAt) => {
    if (!Array.isArray(messages) || messages.length === 0) return 0;
    const lastReadMs = lastReadAt ? new Date(lastReadAt).getTime() : 0;
    return messages.reduce((count, m) => {
      const ts = m?.timestamp ? new Date(m.timestamp).getTime() : 0;
      const isIncoming = String(m?.senderId) !== String(currentUserId);
      if (isIncoming && ts > lastReadMs) return count + 1;
      return count;
    }, 0);
  };

  const fetchUnreadCountForUser = async (targetUserId, lastReadAt) => {
    const key = String(targetUserId || "");
    if (!key) return;
    if (unreadFetchInFlightRef.current.has(key)) return;
    unreadFetchInFlightRef.current.add(key);

    try {
      const chatDoc = await getChatWithUser(targetUserId);
      const mapped = mapChatThread(chatDoc);
      const unread = getUnreadCountFromMessages(mapped.messages, lastReadAt);

      setChats((prev) =>
        prev.map((c) =>
          String(c.profile?.id) === key
            ? {
                ...c,
                // keep list view info from polling, but cache messages for accurate counts
                messages: mapped.messages,
                unreadCount: unread,
              }
            : c
        )
      );
    } catch {
      // ignore background failures
    } finally {
      unreadFetchInFlightRef.current.delete(key);
    }
  };

  const refreshChats = async ({ showToasts = false, background = false } = {}) => {
    if (!background) setLoadingChats(true);
    try {
      const data = await listChats();
      const incoming = Array.isArray(data)
        ? data.map(mapChatListItem).filter((c) => c.profile?.id)
        : [];

      setChats((prev) => {
        const prevByUserId = new Map(prev.map((c) => [String(c.profile?.id || ""), c]));
        const next = incoming.map((c) => {
          const key = String(c.profile?.id || "");
          const prevItem = prevByUserId.get(key);
          const prevTime = prevItem?.lastMessageTime ? new Date(prevItem.lastMessageTime).getTime() : 0;
          const nextTime = c.lastMessageTime ? new Date(c.lastMessageTime).getTime() : 0;
          const hasNew = nextTime > prevTime;

          const isIncomingFromOther =
            c.lastMessageSenderId && String(c.lastMessageSenderId) !== String(currentUserId);
          const isCurrentlyOpen =
            selectedChat?.profile?.id && String(selectedChat.profile.id) === key;

          const lastReadAt = lastReadByUserId?.[key] || null;
          const cachedMessages = prevItem?.messages;

          let nextUnread = prevItem?.unreadCount || 0;

          if (isCurrentlyOpen) {
            nextUnread = 0;
          } else if (Array.isArray(cachedMessages) && cachedMessages.length > 0) {
            // exact count from cached thread
            nextUnread = getUnreadCountFromMessages(cachedMessages, lastReadAt);
          } else if (hasNew && isIncomingFromOther) {
            // We don't have the thread locally; fetch it in background to compute exact count.
            // Set a minimum indicator immediately so user sees something.
            nextUnread = Math.max(nextUnread, 1);
            fetchUnreadCountForUser(key, lastReadAt);
          }

          if (showToasts && hasNew && isIncomingFromOther && !isCurrentlyOpen) {
            toast(`${c.profile?.name || "New message"}: ${c.lastMessage || ""}`);
          }

          return {
            ...prevItem,
            ...c,
            unreadCount: nextUnread,
            messages: prevItem?.messages || [],
          };
        });

        // Sort newest first
        next.sort((a, b) => {
          const ta = a.lastMessageTime ? new Date(a.lastMessageTime).getTime() : 0;
          const tb = b.lastMessageTime ? new Date(b.lastMessageTime).getTime() : 0;
          return tb - ta;
        });

        return next;
      });
    } catch (err) {
      toast.error(err?.message || "Failed to load chats");
      if (!background) setChats([]);
    } finally {
      if (!background) setLoadingChats(false);
    }
  };

  const openChatWithUser = async (targetUserId) => {
    if (!targetUserId) return;
    setLoadingThread(true);
    try {
      const chatDoc = await getChatWithUser(targetUserId);
      const mapped = mapChatThread(chatDoc);
      setSelectedChat(mapped);

      // Mark as read up to newest message timestamp
      const newestTs = mapped?.messages?.length
        ? mapped.messages[mapped.messages.length - 1]?.timestamp
        : new Date().toISOString();
      markChatAsRead(String(targetUserId), newestTs);

      setChats((prev) => {
        const existingIndex = prev.findIndex((c) => String(c.profile?.id) === String(targetUserId));
        if (existingIndex >= 0) {
          const next = [...prev];
          next[existingIndex] = {
            ...next[existingIndex],
            id: mapped.id,
            profile: mapped.profile,
            lastMessage: mapped.lastMessage,
            lastMessageSenderId: mapped.lastMessageSenderId,
            lastMessageTime: mapped.lastMessageTime,
            messages: mapped.messages,
            unreadCount: 0,
          };
          next.sort((a, b) => {
            const ta = a.lastMessageTime ? new Date(a.lastMessageTime).getTime() : 0;
            const tb = b.lastMessageTime ? new Date(b.lastMessageTime).getTime() : 0;
            return tb - ta;
          });
          return next;
        }
        const next = [mapped, ...prev];
        next.sort((a, b) => {
          const ta = a.lastMessageTime ? new Date(a.lastMessageTime).getTime() : 0;
          const tb = b.lastMessageTime ? new Date(b.lastMessageTime).getTime() : 0;
          return tb - ta;
        });
        return next;
      });
    } catch (err) {
      toast.error(err?.message || "Failed to open chat");
    } finally {
      setLoadingThread(false);
    }
  };

  useEffect(() => {
    if (!currentUserId) return;
    refreshChats({ background: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUserId]);

  // Socket.IO real-time updates
  useEffect(() => {
    if (!currentUserId) return;

    const backendOrigin = getBackendOrigin();
    const socket = io(backendOrigin, {
      withCredentials: true,
      transports: ["websocket", "polling"],
    });

    socketRef.current = socket;
    joinedTargetIdsRef.current = new Set();

    const onConnect = () => setSocketConnected(true);
    const onDisconnect = () => setSocketConnected(false);

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    socket.on("messageReceived", (payload) => {
      const senderId = String(payload?.senderId || "");
      const targetUserId = String(payload?.targetUserId || "");
      const msg = payload?.message;
      const text = msg?.text ?? "";
      const createdAt = msg?.createdAt ?? new Date().toISOString();

      if (!senderId || !targetUserId) return;

      // Avoid duplicating our own optimistic messages in this tab.
      if (senderId === String(currentUserId)) return;

      const otherUserId = senderId === String(currentUserId) ? targetUserId : senderId;

      const incomingMessage = {
        id: msg?._id || `msg-${Date.now()}`,
        senderId: senderId,
        content: text,
        timestamp: createdAt,
      };

      // If the chat is currently open, append to thread and mark read.
      const isOpen = String(selectedChat?.profile?.id || "") === String(otherUserId);
      if (isOpen) {
        setSelectedChat((prev) => {
          if (!prev) return prev;
          const exists = prev.messages?.some((m) => String(m.id) === String(incomingMessage.id));
          if (exists) return prev;
          return { ...prev, messages: [...prev.messages, incomingMessage] };
        });
        markChatAsRead(String(otherUserId), createdAt);
      }

      // Update chat list preview + unread count
      setChats((prev) => {
        const next = prev.map((chat) => {
          if (String(chat.profile?.id) !== String(otherUserId)) return chat;
          const nextUnread = isOpen ? 0 : (chat.unreadCount || 0) + 1;
          return {
            ...chat,
            lastMessage: text,
            lastMessageSenderId: senderId,
            lastMessageTime: createdAt,
            unreadCount: nextUnread,
            messages: isOpen ? (chat.messages || []) : (chat.messages || []),
          };
        });

        // If chat not found in list yet (edge case), fall back to refresh via polling/HTTP.
        return next.sort((a, b) => {
          const ta = a.lastMessageTime ? new Date(a.lastMessageTime).getTime() : 0;
          const tb = b.lastMessageTime ? new Date(b.lastMessageTime).getTime() : 0;
          return tb - ta;
        });
      });

      if (!isOpen) {
        toast(`${payload?.message?.text ? "New message" : "New message"}: ${text}`);
      }
    });

    return () => {
      try {
        socket.off("connect", onConnect);
        socket.off("disconnect", onDisconnect);
        socket.off("messageReceived");
        socket.disconnect();
      } catch {
        // ignore
      }
      socketRef.current = null;
      setSocketConnected(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUserId]);

  // Join rooms for every chat so list updates in real-time.
  useEffect(() => {
    if (!socketConnected) return;
    if (!Array.isArray(chats)) return;
    for (const c of chats) {
      if (c?.profile?.id) ensureJoinedRoom(c.profile.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socketConnected, chats]);

  // Ensure we join the currently open chat room too.
  useEffect(() => {
    if (!socketConnected) return;
    const target = selectedChat?.profile?.id;
    if (target) ensureJoinedRoom(target);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socketConnected, selectedChat?.profile?.id]);

  // Polling fallback (disabled when Socket.IO is connected)
  useEffect(() => {
    if (!currentUserId) return;
    if (socketConnected) return;
    const id = setInterval(() => {
      refreshChats({ showToasts: true, background: true });
    }, 5000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUserId, selectedChat?.profile?.id, socketConnected]);

  useEffect(() => {
    if (!currentUserId) return;
    if (!targetUserIdFromQuery) return;
    openChatWithUser(targetUserIdFromQuery);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUserId, targetUserIdFromQuery]);

  // Auto-scroll to the most recent message when chat opens or updates
  useEffect(() => {
    if (!selectedChat) return;
    // Wait for DOM paint before scrolling
    const id = requestAnimationFrame(() => scrollToBottom("auto"));
    return () => cancelAnimationFrame(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedChat?.id, selectedChat?.messages?.length]);

  const formatListTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));

    if (hours < 1) return "Just now";
    if (hours < 24)
      return new Intl.DateTimeFormat("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }).format(date);
    if (hours < 48) return "Yesterday";
    return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(date);
  };

  const formatMessageDateTime = (dateString) => {
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return "";
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(date);
  };

  const parseCodeBlock = (content) => {
    const codeMatch = content.match(/```(\w+)?\n([\s\S]*?)```/);
    if (codeMatch) {
      return {
        isCode: true,
        language: codeMatch[1] || "typescript",
        code: codeMatch[2].trim(),
      };
    }
    return { isCode: false, language: "", code: "" };
  };

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedChat?.profile?.id) return;

    const content = isCodeMode
      ? `\`\`\`${codeLanguage}\n${messageInput}\n\`\`\``
      : messageInput;

    // optimistic update
    const optimistic = {
      id: `msg-${Date.now()}`,
      senderId: String(currentUserId),
      content,
      timestamp: new Date().toISOString(),
    };

    setSelectedChat((prev) => (prev ? { ...prev, messages: [...prev.messages, optimistic] } : prev));
    setChats((prev) =>
      prev
        .map((chat) =>
          String(chat.profile?.id) === String(selectedChat.profile.id)
            ? {
                ...chat,
                lastMessage: isCodeMode ? "Sent a code snippet" : messageInput,
                lastMessageSenderId: String(currentUserId),
                lastMessageTime: optimistic.timestamp,
              }
            : chat
        )
        .sort((a, b) => {
          const ta = a.lastMessageTime ? new Date(a.lastMessageTime).getTime() : 0;
          const tb = b.lastMessageTime ? new Date(b.lastMessageTime).getTime() : 0;
          return tb - ta;
        })
    );

    setMessageInput("");
    setIsCodeMode(false);

    try {
      const result = await sendMessageToUser(selectedChat.profile.id, content);
      const saved = result?.message;
      if (!saved) return;

      const savedMessage = {
        id: saved._id || optimistic.id,
        senderId: String(saved.senderId),
        content: saved.text,
        timestamp: saved.createdAt || optimistic.timestamp,
      };

      setSelectedChat((prev) => {
        if (!prev) return prev;
        // replace the last optimistic message with the saved one
        const nextMessages = [...prev.messages];
        nextMessages[nextMessages.length - 1] = savedMessage;
        return { ...prev, messages: nextMessages };
      });

      setChats((prev) =>
        prev
          .map((chat) =>
            String(chat.profile?.id) === String(selectedChat.profile.id)
              ? {
                  ...chat,
                  lastMessage: isCodeMode ? "Sent a code snippet" : saved.text,
                  lastMessageSenderId: String(currentUserId),
                  lastMessageTime: saved.createdAt || optimistic.timestamp,
                }
              : chat
          )
          .sort((a, b) => {
            const ta = a.lastMessageTime ? new Date(a.lastMessageTime).getTime() : 0;
            const tb = b.lastMessageTime ? new Date(b.lastMessageTime).getTime() : 0;
            return tb - ta;
          })
      );
    } catch (err) {
      toast.error(err?.message || "Failed to send message");
    }
  };

  const handleSelectChat = (chat) => {
    if (chat?.profile?.id) {
      openChatWithUser(chat.profile.id);
    } else {
      setSelectedChat(chat);
    }
    setChats((prev) => prev.map((c) => (c.id === chat.id ? { ...c, unreadCount: 0 } : c)));
  };

  if (!selectedChat) {
    return (
      <MainLayout>
        <div className="max-w-2xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold">Messages</h1>
              <p className="text-muted-foreground">
                {totalUnread > 0 ? `${totalUnread} unread messages` : "All caught up!"}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setShowSearch((v) => !v);
                if (showSearch) setSearchQuery("");
              }}
              aria-label="Search messages"
            >
              <Search className="w-5 h-5" />
            </Button>
          </div>

          {showSearch && (
            <div className="mb-4">
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, role, or message…"
                className="h-11"
              />
            </div>
          )}
          
          <div className="space-y-2">
            {loadingChats ? (
              <div className="text-center py-12 glass rounded-2xl">
                <p className="text-muted-foreground">Loading messages…</p>
              </div>
            ) : filteredChats.map((chat) => (
              <div
                key={chat.id}
                onClick={() => handleSelectChat(chat)}
                className={cn(
                  "p-4 rounded-2xl glass cursor-pointer hover-lift transition-all",
                  chat.unreadCount > 0 && "border-l-4 border-primary"
                )}
              >
                <div className="flex items-center gap-4">
                  <div className="relative">
                    {chat.profile?.id ? (
                      <Link to={`/profile/${chat.profile.id}`} onClick={(e) => e.stopPropagation()}>
                        <img 
                          src={chat.profile.avatar_url} 
                          alt={chat.profile.name}
                          className="w-14 h-14 rounded-xl object-cover ring-2 ring-border"
                        />
                      </Link>
                    ) : (
                      <img 
                        src={chat.profile.avatar_url} 
                        alt={chat.profile.name}
                        className="w-14 h-14 rounded-xl object-cover ring-2 ring-border"
                      />
                    )}
                    {chat.profile.is_premium && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full gradient-primary flex items-center justify-center">
                        <Crown className="w-3 h-3 text-primary-foreground" />
                      </div>
                    )}
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-green-500 border-2 border-background" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className={cn("font-semibold truncate", chat.unreadCount > 0 && "text-primary")}>
                        {chat.profile.name}
                      </h3>
                      <span className="text-xs text-muted-foreground shrink-0">
                        {formatListTime(chat.lastMessageTime)}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">{chat.profile.role}</p>
                    <p className={cn(
                      "text-sm truncate mt-1",
                      chat.unreadCount > 0 ? "font-medium" : "text-muted-foreground"
                    )}>
                      {chat.lastMessage}
                    </p>
                  </div>
                  {chat.unreadCount > 0 && (
                    <Badge className="gradient-primary text-primary-foreground shrink-0">
                      {chat.unreadCount}
                    </Badge>
                  )}
                </div>
              </div>
            ))}
            
            {!loadingChats && filteredChats.length === 0 && (
              <div className="text-center py-12 glass rounded-2xl">
                <p className="text-muted-foreground">
                  {normalizedSearch ? "No matching chats" : "No messages yet"}
                </p>
                {!normalizedSearch && (
                  <p className="text-sm text-muted-foreground mt-2">Match with developers to start chatting</p>
                )}
              </div>
            )}
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto h-[calc(100vh-8rem)] flex flex-col">
        {/* Chat Header */}
        <div className="p-4 border-b border-border glass rounded-t-2xl">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => setSelectedChat(null)}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="relative">
              {selectedChat.profile?.id ? (
                <Link to={`/profile/${selectedChat.profile.id}`}>
                  <img 
                    src={selectedChat.profile.avatar_url} 
                    alt={selectedChat.profile.name}
                    className="w-10 h-10 rounded-xl object-cover"
                  />
                </Link>
              ) : (
                <img 
                  src={selectedChat.profile.avatar_url} 
                  alt={selectedChat.profile.name}
                  className="w-10 h-10 rounded-xl object-cover"
                />
              )}
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-500 border-2 border-background" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold">{selectedChat.profile.name}</h3>
              <p className="text-xs text-green-500">Online</p>
            </div>
            <Button variant="ghost" size="icon"><Phone className="w-5 h-5" /></Button>
            <Button variant="ghost" size="icon"><Video className="w-5 h-5" /></Button>
            <Button variant="ghost" size="icon"><MoreVertical className="w-5 h-5" /></Button>
          </div>
        </div>
        
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {selectedChat.messages.map((message) => {
            const isOwn = String(message.senderId) === String(currentUserId);
            const codeInfo = parseCodeBlock(message.content);
            
            return (
              <div key={message.id} className={cn("flex", isOwn ? "justify-end" : "justify-start")}>
                <div className={cn(
                  "max-w-[85%]",
                  !codeInfo.isCode && "px-4 py-3 rounded-2xl",
                  !codeInfo.isCode && isOwn 
                    ? "gradient-primary text-primary-foreground rounded-br-md" 
                    : !codeInfo.isCode && "glass rounded-bl-md"
                )}>
                  {codeInfo.isCode ? (
                    <div className="rounded-2xl overflow-hidden">
                      <CodeBlock code={codeInfo.code} language={codeInfo.language} />
                    </div>
                  ) : (
                    <p className="text-sm">{message.content}</p>
                  )}
                  <p className={cn(
                    "text-xs mt-1",
                    codeInfo.isCode ? "text-muted-foreground px-2 pb-2" : (isOwn ? "text-primary-foreground/70" : "text-muted-foreground")
                  )}>
                    {formatMessageDateTime(message.timestamp)}
                  </p>
                </div>
              </div>
            );
          })}

          <div ref={messagesEndRef} />

          {loadingThread && (
            <div className="text-center py-3">
              <p className="text-xs text-muted-foreground">Loading conversation…</p>
            </div>
          )}
        </div>
        
        {/* Code Mode Indicator */}
        {isCodeMode && (
          <div className="px-4 py-2 bg-gray-900 border-t border-gray-700 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Code className="w-4 h-4 text-primary" />
              <span className="text-sm text-muted-foreground">Code mode</span>
              <select 
                value={codeLanguage}
                onChange={(e) => setCodeLanguage(e.target.value)}
                className="bg-gray-800 text-sm rounded px-2 py-1 border border-gray-700"
              >
                <option value="typescript">TypeScript</option>
                <option value="javascript">JavaScript</option>
                <option value="python">Python</option>
                <option value="go">Go</option>
                <option value="rust">Rust</option>
                <option value="sql">SQL</option>
              </select>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setIsCodeMode(false)}>
              Cancel
            </Button>
          </div>
        )}
        
        {/* Message Input */}
        <div className="p-4 border-t border-border glass rounded-b-2xl">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon"><Image className="w-5 h-5" /></Button>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setIsCodeMode(!isCodeMode)}
              className={cn(isCodeMode && "text-primary bg-primary/10")}
            >
              <Code className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon"><Smile className="w-5 h-5" /></Button>
            {isCodeMode ? (
              <textarea 
                placeholder="Paste your code here..." 
                value={messageInput} 
                onChange={(e) => setMessageInput(e.target.value)}
                className="flex-1 h-20 bg-gray-900 rounded-lg p-2 font-mono text-sm resize-none border border-gray-700 focus:border-primary focus:outline-none"
              />
            ) : (
              <Input 
                placeholder="Type a message..." 
                value={messageInput} 
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSendMessage()}
                className="flex-1 h-11" 
              />
            )}
            <Button 
              size="icon" 
              className="gradient-primary" 
              disabled={!messageInput.trim()}
              onClick={handleSendMessage}
            >
              <Send className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

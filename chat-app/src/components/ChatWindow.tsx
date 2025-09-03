import { Home, MessageSquare, Smile, Video, Info, Menu, Search, X } from "lucide-react";
import type { User, Conversation, Message } from "../pages/ChatPage";
import { useState } from "react";
import type { KeyboardEvent } from "react";
import EmojiPicker from "./EmojiPicker";
import "./ChatWindow.css";

type ChatWindowProps = {
  user: User | null;
  conversation: Conversation | null;
  messages: Message[];
  goBack: () => void;
  sendMessage: (conversationId: string, text: string) => void;
  onToggleSidebar?: () => void;
};

export default function ChatWindow({
  user,
  conversation,
  messages,
  goBack,
  sendMessage,
  onToggleSidebar,
}: ChatWindowProps) {
  const [input, setInput] = useState("");
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  if (!user) {
    return (
      <div className="chatwindow empty">
        <div className="empty-header">
          <button className="menu-btn" onClick={onToggleSidebar}>
            <Menu size={24} />
          </button>
        </div>
        <div className="empty-state">
          <MessageSquare size={64} className="empty-icon" />
          <h2>Welcome to Chat</h2>
          <p>Select a conversation from the left to start messaging</p>
        </div>
      </div>
    );
  }

  const fullname = `${user.name} ${user.lastname}`;

  const handleSend = () => {
    if (!input.trim() || !conversation) return;
    sendMessage(conversation.id, input.trim());
    setInput("");
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSend();
  };

  const handleEmojiSelect = (emoji: string) => {
    setInput(prev => prev + emoji);
  };

  const toggleEmojiPicker = () => {
    setIsEmojiPickerOpen(!isEmojiPickerOpen);
  };

  const toggleSearch = () => {
    setIsSearchOpen(!isSearchOpen);
    if (!isSearchOpen) {
      setSearchQuery("");
    }
  };

  const filteredMessages = searchQuery.trim() 
    ? messages.filter(message => 
        message.text.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : messages;

  return (
    <div className="chatwindow">
      <div className="chatwindowheader">
        <div className="header-left">
          <button className="menu-btn" onClick={onToggleSidebar}>
            <Menu size={24} />
          </button>
          <div className="user-info">
            <img src={user.profilepic} alt={fullname} className="header-pic" />
            <div className="fullname">
              <p>{fullname}</p>
              <p style={user.checked ? { color: "green" } : { color: "black" }}>
                {user.checked ? "Online" : "Offline"}
              </p>
            </div>
          </div>
        </div>

        <div className="header-icons">
          <button className="search-btn" onClick={toggleSearch} title="Search Messages">
            <Search size={20} className="icon" />
          </button>
          <Video size={30} className="icon videocamera" />
          <Info size={30} className="icon" />
        </div>
      </div>

      {isSearchOpen && (
        <div className="search-bar">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search messages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoFocus
          />
          <button onClick={toggleSearch}>
            <X size={16} />
          </button>
        </div>
      )}

      <div className="chatmessages">
        {filteredMessages.length === 0 && searchQuery.trim() !== "" ? (
          <div className="no-messages">
            <p>No messages found matching "{searchQuery}"</p>
          </div>
        ) : (
          filteredMessages.map((msg) => {
          const isSent = msg.senderId === user.id ? false : true;
          return (
            <div
              key={msg.id}
              className={`message-row ${isSent ? "sent" : "received"}`}
            >
              {!isSent && (
                <img
                  src={user.profilepic}
                  alt={fullname}
                  className="msg-icon"
                />
              )}
              <div className="message-bubble">
                <p className="msg-text">{msg.text}</p>
                <span className="msg-time">
                  {msg.timestamp.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>
          );
        })
        )}
      </div>

      <div className="messageinput">
        <div className="emojibutton" onClick={toggleEmojiPicker}>
          <Smile size={20} color="#27ae60" />
        </div>
        <button className="homebtn" onClick={goBack}>
          <Home size={20} color="#27ae60" />
        </button>
        <input
          type="text"
          placeholder="Type a message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyPress}
        />
        <button className="sendButton" onClick={handleSend}>
          Send Message
        </button>
        <EmojiPicker
          isOpen={isEmojiPickerOpen}
          onClose={() => setIsEmojiPickerOpen(false)}
          onEmojiSelect={handleEmojiSelect}
        />
      </div>
    </div>
  );
}

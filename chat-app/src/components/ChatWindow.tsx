import { Home, MessageSquare } from "lucide-react";
import "./ChatWindow.css";
import type { User } from "../pages/ChatPage";

type ChatWindowProps = {
  user: User | null;
  goBack: () => void;
};

export default function ChatWindow({ user, goBack }: ChatWindowProps) {
  if (!user) {
    return (
      <div className="chatwindow empty">
        <div className="empty-state">
          <MessageSquare size={64} className="empty-icon" />
          <h2>Welcome to Chat</h2>
          <p>Select a conversation from the left to start messaging</p>
        </div>
      </div>
    );
  }

  const fullname = `${user.name} ${user.lastname}`;

  return (
    <div className="chatwindow">
      <div className="chatwindowheader">
        <img src={user.profilepic} alt={fullname} />
        <div className="fullname">
          <p>{fullname}</p>
          <p style={user.checked ? { color: "green" } : { color: "black" }}>
            {user.checked ? "Online" : "Offline"}
          </p>
        </div>
      </div>

      <div className="chatmessages">{/* messages will go here */}</div>

      <div className="messageinput">
        <button className="homebtn" onClick={goBack}>
          <Home size={16} />
        </button>
        <input type="text" placeholder="Type a message..." />
        <button>Send</button>
      </div>
    </div>
  );
}

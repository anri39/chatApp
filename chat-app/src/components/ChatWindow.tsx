import { Home, MessageSquare, Smile, Video, Info } from "lucide-react";
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
        <div className="user-info">
          <img src={user.profilepic} alt={fullname} />
          <div className="fullname">
            <p>{fullname}</p>
            <p style={user.checked ? { color: "green" } : { color: "black" }}>
              {user.checked ? "Online" : "Offline"}
            </p>
          </div>
        </div>

        <div className="header-icons">
          <Video size={25} className="icon videocamera" />
          <Info size={25} className="icon" />
        </div>
      </div>

      <div className="chatmessages">{/* messages will go here */}</div>

      <div className="messageinput">
        <div className="emojibutton">
          <Smile size={20} color="#27ae60" />
        </div>
        <button className="homebtn" onClick={goBack}>
          <Home size={20} color="#27ae60" />
        </button>
        <input type="text" placeholder="Type a message..." />
        <button className="sendButton">Send Message</button>
      </div>
    </div>
  );
}

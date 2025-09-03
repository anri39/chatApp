import UserRow from "./UserRow";
import "./UsersList.css";
import { Search, Menu } from "lucide-react";
import type { User, Conversation } from "../pages/ChatPage";

type UsersListProps = {
  users: User[];
  onSelectUser: (user: User) => void;
  loading?: boolean;
  setUserNull: () => void;
  conversations: Conversation[];
  onToggleSidebar?: () => void;
};

export default function UsersList({
  users,
  onSelectUser,
  loading,
  setUserNull,
  conversations,
  onToggleSidebar,
}: UsersListProps) {
  const renderUserRows = () => {
    if (loading) {
      return [1, 2, 3].map((i) => (
        <div className="userrow placeholder" key={i}>
          <div className="profilePic placeholder-pic"></div>
          <div className="user-info">
            <div className="placeholder-line short"></div>
            <div className="placeholder-line long"></div>
          </div>
        </div>
      ));
    }

    if (users?.length > 0) {
      return users.map((user) => {
        const fullName = `${user.name} ${user.lastname}`;
        const userConversation = conversations.find((conv) => {
          return conv.participants.includes(user.id);
        });
        const lastMessage =
          userConversation?.lastMessage || "no messages found";
        const formattedTimestamp = userConversation?.timestamp
          ? userConversation.timestamp.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })
          : "—";
        return (
          <UserRow
            key={user.id}
            fullName={fullName}
            message={lastMessage}
            timestamp={formattedTimestamp}
            checked={userConversation?.checked ?? false}
            profilePic={user.profilepic}
            onClick={() => onSelectUser(user)}
          />
        );
      });
    }

    return <p className="no-users">No users found</p>;
  };

  return (
    <div className="userslist">
      <div className="titlecontainer">
        <button className="mobile-menu-btn" onClick={onToggleSidebar}>
          <Menu size={24} />
        </button>
        <h1
          className="userslist-title"
          onClick={setUserNull}
          style={{ cursor: "pointer" }}
        >
          Messages
        </h1>
      </div>

      <div className="searchcontainer">
        <Search size={16} />
        <input type="text" placeholder="Search" />
      </div>

      <div className="users">{renderUserRows()}</div>
    </div>
  );
}

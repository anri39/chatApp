import UserRow from "./UserRow";
import "./UsersList.css";
import { Search } from "lucide-react";
import type { User } from "../pages/ChatPage";

type UsersListProps = {
  users: User[];
  onSelectUser: (user: User) => void;
  loading?: boolean;
};

export default function UsersList({
  users,
  onSelectUser,
  loading,
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
        const formattedLastSeen = user.lastseen
          ? user.lastseen.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })
          : "—";
        return (
          <UserRow
            key={user.id}
            fullName={fullName}
            message="Last message..."
            timestamp={formattedLastSeen}
            checked={user.checked}
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
      <h1 className="userslist-title">Messages</h1>

      <div className="searchcontainer">
        <Search size={16} />
        <input type="text" placeholder="Search" />
      </div>

      <div className="users">{renderUserRows()}</div>
    </div>
  );
}

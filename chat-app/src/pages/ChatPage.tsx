import "./ChatPage.css";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase/firebase";
import { useEffect, useState } from "react";
import UsersList from "../components/UsersList";
import ChatWindow from "../components/ChatWindow";

export type User = {
  id: string;
  name: string;
  lastname: string;
  lastseen: Date | null;
  profilepic: string;
  checked: boolean;
};

export async function fetchAllUsers() {
  const usersCollection = collection(db, "users");
  const snapshot = await getDocs(usersCollection);
  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      name: data.name || "",
      lastname: data.lastname || "",
      lastseen: data.lastseen ? data.lastseen.toDate() : null,
      profilepic: data.profilepic || "",
      checked: data.checked ?? false,
    };
  });
}

export default function Chatpage() {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [loadingUsers, setLoadingUsers] = useState<boolean>(false);

  useEffect(() => {
    const loadUsers = async () => {
      setLoadingUsers(true);
      try {
        const allUsers = await fetchAllUsers();
        setUsers(allUsers);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoadingUsers(false);
      }
    };
    loadUsers();
  }, []);

  return (
    <div className="chatpage">
      <div className={`userswrapper ${selectedUser ? "hidden" : ""}`}>
        <UsersList
          users={users}
          onSelectUser={setSelectedUser}
          loading={loadingUsers}
          setUserNull={() => {
            setSelectedUser(null);
          }}
        />
      </div>
      <div className="chatwrapper">
        <ChatWindow user={selectedUser} goBack={() => setSelectedUser(null)} />
      </div>
    </div>
  );
}

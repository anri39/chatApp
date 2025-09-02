import "./ChatPage.css";
import {
  collection,
  getDocs,
  addDoc,
  serverTimestamp,
  doc,
  updateDoc,
  getDoc,
} from "firebase/firestore";
import { db } from "../firebase/firebase";
import { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import UsersList from "../components/UsersList";
import ChatWindow from "../components/ChatWindow";
import Sidebar from "../components/Sidebar";

export type User = {
  id: string;
  name: string;
  lastname: string;
  lastseen: Date | null;
  profilepic: string;
  checked: boolean;
};

export type Conversation = {
  id: string;
  lastMessage: string;
  timestamp: Date;
  participants: string[];
  senderId: string;
  checked: boolean;
};

export type Message = {
  id: string;
  senderId: string;
  text: string;
  timestamp: Date;
  checked: boolean;
};

export async function fetchAllUsers() {
  const usersCollection = collection(db, "users");
  const snapshot = await getDocs(usersCollection);
  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      name: data.firstname || "",
      lastname: data.lastname || "",
      lastseen: data.lastseen ? data.lastseen.toDate() : null,
      profilepic: data.profilepic || "",
      checked: data.checked ?? false,
    };
  });
}

export async function fetchConversations(userId: string) {
  const conversationsRef = collection(db, "conversations");
  const snapshot = await getDocs(conversationsRef);
  return snapshot.docs
    .map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        lastMessage: data.lastMessage || "",
        timestamp: data.timestamp?.toDate() || new Date(),
        participants: data.participants || [],
        senderId: data.senderId || "",
        checked: data.checked ?? false,
      };
    })
    .filter((conv) => conv.participants.includes(userId));
}

export async function fetchMessages(conversationId: string) {
  const messagesRef = collection(
    db,
    "conversations",
    conversationId,
    "messages"
  );
  const snapshot = await getDocs(messagesRef);
  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      senderId: data.senderId,
      text: data.text,
      timestamp: data.timestamp?.toDate() || new Date(),
      checked: data.checked ?? false,
    } as Message;
  });
}

export default function ChatPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState<boolean>(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedConv, setSelectedConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentUserProfilePic, setCurrentUserProfilePic] = useState<string>("");
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(window.innerWidth >= 768);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const auth = getAuth();

  // Listen for authentication state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUserId(user?.uid || null);
    });
    return unsubscribe;
  }, [auth]);

  // Fetch current user's profile picture
  useEffect(() => {
    const loadCurrentUser = async () => {
      if (!currentUserId) return;
      try {
        const userDoc = await getDoc(doc(db, "users", currentUserId));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setCurrentUserProfilePic(userData.profilepic || "");
        }
      } catch (error) {
        console.error("Error fetching current user:", error);
      }
    };
    loadCurrentUser();
  }, [currentUserId]);

  useEffect(() => {
    const loadUsers = async () => {
      // Don't load users if user is not authenticated
      if (!currentUserId) {
        setUsers([]);
        setLoadingUsers(false);
        return;
      }
      
      setLoadingUsers(true);
      try {
        const allUsers = await fetchAllUsers();
        // Filter out current user from the list
        const filteredUsers = allUsers.filter(user => user.id !== currentUserId);
        setUsers(filteredUsers);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoadingUsers(false);
      }
    };
    loadUsers();
  }, [currentUserId]);

  useEffect(() => {
    if (!currentUserId) return;
    const loadConversations = async () => {
      try {
        const convs = await fetchConversations(currentUserId);
        setConversations(convs);
      } catch (error) {
        console.error("Error fetching conversations:", error);
      }
    };
    loadConversations();
  }, [currentUserId]);

  useEffect(() => {
    if (!selectedConv) return;
    const loadMessages = async () => {
      const msgs = await fetchMessages(selectedConv.id);
      setMessages(msgs);
    };
    loadMessages();
  }, [selectedConv]);

  async function handleSelectUser(user: User) {
    // Prevent users from messaging themselves
    if (user.id === currentUserId) {
      console.log("Cannot message yourself");
      return;
    }
    
    setSelectedUser(user);
    let conv = conversations.find((c) => c.participants.includes(user.id));
    if (!conv && currentUserId) {
      const docRef = await addDoc(collection(db, "conversations"), {
        participants: [currentUserId, user.id],
        lastMessage: "",
        senderId: currentUserId,
        checked: false,
        timestamp: serverTimestamp(),
      });
      conv = {
        id: docRef.id,
        participants: [currentUserId, user.id],
        lastMessage: "",
        senderId: currentUserId,
        checked: false,
        timestamp: new Date(),
      };
      setConversations((prev) => [...prev, conv!]);
    }
    setSelectedConv(conv || null);
  }

  async function handleSendMessage(conversationId: string, text: string) {
    if (!selectedConv || !currentUserId) return;

    const newMessage: Message = {
      id: crypto.randomUUID(),
      senderId: currentUserId,
      text,
      timestamp: new Date(),
      checked: false,
    };

    const messagesRef = collection(
      db,
      "conversations",
      conversationId,
      "messages"
    );
    await addDoc(messagesRef, { ...newMessage, timestamp: serverTimestamp() });

    setMessages((prev) => [...prev, newMessage]);

    const convRef = doc(db, "conversations", conversationId);
    await updateDoc(convRef, {
      lastMessage: text,
      timestamp: serverTimestamp(),
      senderId: currentUserId,
    });

    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === conversationId
          ? {
              ...conv,
              lastMessage: text,
              timestamp: new Date(),
              senderId: currentUserId,
            }
          : conv
      )
    );
  }

  function handleGoBack() {
    setSelectedUser(null);
    setSelectedConv(null);
    setMessages([]);
  }

  function handleToggleSidebar() {
    setIsSidebarOpen(!isSidebarOpen);
  }

  return (
    <div className="chatpage">
      <Sidebar 
        currentUserProfilePic={currentUserProfilePic} 
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      <div className={`userswrapper ${selectedUser ? "hidden" : ""}`}>
        <UsersList
          users={users}
          conversations={conversations}
          onSelectUser={handleSelectUser}
          loading={loadingUsers}
          setUserNull={handleGoBack}
          onToggleSidebar={handleToggleSidebar}
        />
      </div>
      <div className="chatwrapper">
        <ChatWindow
          user={selectedUser}
          conversation={selectedConv}
          messages={messages}
          goBack={handleGoBack}
          sendMessage={handleSendMessage}
          onToggleSidebar={handleToggleSidebar}
        />
      </div>
    </div>
  );
}

import "./ChatPage.css";
import {
  collection,
  getDocs,
  addDoc,
  serverTimestamp,
  doc,
  updateDoc,
  getDoc,
  onSnapshot,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "../firebase/firebase";
import { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import UsersList from "../components/UsersList";
import ChatWindow from "../components/ChatWindow";
import Sidebar from "../components/Sidebar";
import UserMenu from "../components/UserMenu";

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
  const [isUserMenuOpen, setIsUserMenuOpen] = useState<boolean>(false);
  const [currentUserData, setCurrentUserData] = useState<{
    id: string;
    firstname: string;
    lastname: string;
    profilepic: string;
  } | null>(null);

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
      if (!currentUserId) {
        setCurrentUserProfilePic("");
        setCurrentUserData(null);
        return;
      }
      try {
        const userDoc = await getDoc(doc(db, "users", currentUserId));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setCurrentUserProfilePic(userData.profilepic || "");
          setCurrentUserData({
            id: currentUserId,
            firstname: userData.firstname || "",
            lastname: userData.lastname || "",
            profilepic: userData.profilepic || "",
          });
        }
      } catch (error) {
        console.error("Error fetching current user:", error);
      }
    };
    loadCurrentUser();
  }, [currentUserId]);

  useEffect(() => {
    if (!currentUserId) {
      setUsers([]);
      setLoadingUsers(false);
      return;
    }

    const updateOnlineStatus = async (isOnline: boolean) => {
      const userRef = doc(db, "users", currentUserId);
      await updateDoc(userRef, {
        checked: isOnline,
        lastseen: serverTimestamp(),
      });
    };

    updateOnlineStatus(true);

    const handleBeforeUnload = () => updateOnlineStatus(false);
    const handleVisibilityChange = () => {
      updateOnlineStatus(!document.hidden);
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    const usersRef = collection(db, "users");
    const unsubscribe = onSnapshot(usersRef, (snapshot) => {
      const allUsers = snapshot.docs.map((doc) => {
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
      const filteredUsers = allUsers.filter(user => user.id !== currentUserId);
      setUsers(filteredUsers);
      setLoadingUsers(false);
    });

    return () => {
      unsubscribe();
      updateOnlineStatus(false);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [currentUserId]);

  useEffect(() => {
    if (!currentUserId) return;
    
    const conversationsRef = collection(db, "conversations");
    const unsubscribe = onSnapshot(conversationsRef, (snapshot) => {
      const convs = snapshot.docs
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
        .filter((conv) => conv.participants.includes(currentUserId))
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
      setConversations([...convs]);
    }, (error) => {
      console.error("Conversations listener error:", error);
    });

    return () => unsubscribe();
  }, [currentUserId]);

  useEffect(() => {
    if (!selectedConv || !currentUserId) return;
    
    const messagesRef = collection(db, "conversations", selectedConv.id, "messages");
    const q = query(messagesRef, orderBy("timestamp", "asc"));
    
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const msgs = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          senderId: data.senderId,
          text: data.text,
          timestamp: data.timestamp?.toDate() || new Date(),
          checked: data.checked ?? false,
        } as Message;
      });
      setMessages(msgs);

      const unreadMessages = snapshot.docs.filter((doc) => {
        const data = doc.data();
        return data.senderId !== currentUserId && !data.checked;
      });

      for (const messageDoc of unreadMessages) {
        const messageRef = doc(db, "conversations", selectedConv.id, "messages", messageDoc.id);
        await updateDoc(messageRef, { checked: true });
      }
    });

    return () => unsubscribe();
  }, [selectedConv, currentUserId]);

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

    const messagesRef = collection(
      db,
      "conversations",
      conversationId,
      "messages"
    );
    await addDoc(messagesRef, {
      senderId: currentUserId,
      text,
      timestamp: serverTimestamp(),
      checked: false,
    });

    const convRef = doc(db, "conversations", conversationId);
    await updateDoc(convRef, {
      lastMessage: text,
      timestamp: serverTimestamp(),
      senderId: currentUserId,
    });
  }

  function handleGoBack() {
    setSelectedUser(null);
    setSelectedConv(null);
    setMessages([]);
  }

  function handleToggleSidebar() {
    setIsSidebarOpen(!isSidebarOpen);
  }

  function handleOpenUserMenu() {
    setIsUserMenuOpen(true);
  }

  function handleCloseUserMenu() {
    setIsUserMenuOpen(false);
  }

  return (
    <div className="chatpage">
      <Sidebar 
        currentUserProfilePic={currentUserProfilePic} 
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onOpenUserMenu={handleOpenUserMenu}
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
      <UserMenu
        isOpen={isUserMenuOpen}
        onClose={handleCloseUserMenu}
        currentUser={currentUserData}
      />
    </div>
  );
}

import { useState, useEffect } from "react";
import type { User as FirebaseUser } from "firebase/auth";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase/firebase";
import "./AuthWrapper.css";
import LoginBox from "./LoginBox";
import RegisterBox from "./RegisterBox";

export default function AuthWrapper() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  if (loading) return null;
  if (user) return null;

  return (
    <div className="authcontainer">
      {mode === "login" && <LoginBox setMode={setMode} mode={mode} />}
      {mode === "register" && <RegisterBox setMode={setMode} mode={mode} />}
    </div>
  );
}

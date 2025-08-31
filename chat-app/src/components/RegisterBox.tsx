import "./RegisterBox.css";
import type { LoginBoxProps } from "./LoginBox";
import { useState } from "react";
import { User, UserPlus, Mail, Lock } from "lucide-react";
import { auth, db } from "../firebase/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

export default function RegisterBox({ setMode, mode }: LoginBoxProps) {
  const [name, setName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    // check if the inputs are filled
    if (!name.trim() || !lastName.trim() || !email.trim() || !password.trim()) {
      setError("All fields need to be filled.");
      setLoading(false);
      return;
    }
    // check if password is smaller than 6
    if (password.length < 6) {
      setError("Password needs to be 6 or more letters");
      setLoading(false);
      return;
    }
    setError(null);

    try {
      // try to register account and send info to DB
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      await setDoc(doc(db, "users", user.uid), {
        firstname: name,
        lastname: lastName,
        email: email,
        lastseen: serverTimestamp(),
        profilepic:
          "https://static.vecteezy.com/system/resources/thumbnails/009/292/244/small_2x/default-avatar-icon-of-social-media-user-vector.jpg",
        checked: false,
      });
    } catch (error: any) {
      // firebase error codes
      if (error.code === "auth/email-already-in-use") {
        setError("This email is already registered.");
      } else if (error.code === "auth/invalid-email") {
        setError("The email address is not valid.");
      } else if (error.code === "auth/weak-password") {
        setError("The password is too weak.");
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
      // finally set  loading to false
    }
  };

  return (
    <div className="authcontainer">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h1>Create Account</h1>
        <div className="selection">
          <p
            className={mode === "login" ? "active" : ""}
            onClick={() => setMode("login")}
          >
            Login
          </p>
          <p
            className={mode === "register" ? "active" : ""}
            onClick={() => setMode("register")}
          >
            Register
          </p>
        </div>
        <div className="inputs">
          <div className="name-row">
            <div className="input-group">
              <User size={20} />
              <input
                type="text"
                placeholder="First Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="input-group">
              <UserPlus size={20} />
              <input
                type="text"
                placeholder="Last Name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>
          </div>

          <div className="input-group">
            <Mail size={20} />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="input-group">
            <Lock size={20} />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && (
            <p style={{ color: "red", fontSize: "13px", marginTop: "5px" }}>
              {error}
            </p>
          )}
        </div>

        <button type="submit" className="submit-btn" disabled={loading}>
          {loading ? "Creating Account..." : "Create Account"}
        </button>

        <div className="separator">
          <span>OR LOGIN WITH</span>
        </div>

        <div className="social-buttons">
          <button type="button" className="google-btn">
            Sign in with Google
          </button>
          <button type="button" className="github-btn">
            Sign in with GitHub
          </button>
        </div>
      </form>
    </div>
  );
}

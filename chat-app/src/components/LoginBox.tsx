import "./RegisterBox.css";
import { Mail, Lock } from "lucide-react";
import { auth } from "../firebase/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useState } from "react";

// exported type used in registerBox.tsx too
export type LoginBoxProps = {
  setMode: (mode: "login" | "register") => void;
  mode: "login" | "register";
};

export default function LoginBox({ setMode, mode }: LoginBoxProps) {
  // states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<null | string>(null);
  const [loading, setLoading] = useState(false);

  // handle login function thats async
  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    // small validation before firebaseErrors
    if (!email.trim() || !password.trim()) {
      setError("All inputs must be filled.");
      setLoading(false);
      return;
    }

    // try to sign in if not catch errors and display
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setError(null);
    } catch (err: any) {
      if (err.code === "auth/user-not-found") {
        setError("No account found with this email.");
      } else if (err.code === "auth/wrong-password") {
        setError("Incorrect password.");
      } else {
        setError("Something went wrong. Try again.");
      }
    } finally {
      setLoading(false);
      // set loading to false finally
    }
  };

  return (
    <div className="authcontainer">
      <form className="auth-form" onSubmit={handleLogin}>
        <h1>Login</h1>
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
          {loading ? "Logging in..." : "Login"}
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

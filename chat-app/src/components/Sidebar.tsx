import { LogOut, Settings, Moon, Sun } from "lucide-react";
import { auth } from "../firebase/firebase";
import { signOut } from "firebase/auth";
import { useState, useEffect } from "react";
import "./Sidebar.css";

type SidebarProps = {
  currentUserProfilePic?: string;
  isOpen?: boolean;
  onClose?: () => void;
  onOpenUserMenu?: () => void;
};

export default function Sidebar({ currentUserProfilePic, isOpen = false, onClose, onOpenUserMenu }: SidebarProps) {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
    if (isDarkMode) {
      document.documentElement.classList.add('dark-mode');
    } else {
      document.documentElement.classList.remove('dark-mode');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      // Refresh the page after successful logout
      window.location.reload();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && <div className="sidebar-backdrop" onClick={onClose} />}
      
      <div className={`sidebar ${isOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-top">
          <div className="profile-section">
            <img
              src={currentUserProfilePic || "https://static.vecteezy.com/system/resources/thumbnails/009/292/244/small_2x/default-avatar-icon-of-social-media-user-vector.jpg"}
              alt="Profile"
              className="sidebar-profile-pic"
            />
          </div>
        </div>

        <div className="sidebar-bottom">
          <button className="dark-mode-toggle" onClick={toggleDarkMode} title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}>
            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button className="settings-btn" onClick={onOpenUserMenu} title="Settings">
            <Settings size={20} />
          </button>
          <button className="logout-btn" onClick={handleLogout} title="Logout">
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </>
  );
}

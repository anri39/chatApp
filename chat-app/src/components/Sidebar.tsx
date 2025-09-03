import { LogOut, Settings } from "lucide-react";
import { auth } from "../firebase/firebase";
import { signOut } from "firebase/auth";
import "./Sidebar.css";

type SidebarProps = {
  currentUserProfilePic?: string;
  isOpen?: boolean;
  onClose?: () => void;
  onOpenUserMenu?: () => void;
};

export default function Sidebar({ currentUserProfilePic, isOpen = false, onClose, onOpenUserMenu }: SidebarProps) {
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

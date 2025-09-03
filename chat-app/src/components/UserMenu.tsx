import { useState, useEffect } from "react";
import { X, User, Camera } from "lucide-react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase/firebase";
import "./UserMenu.css";

type UserMenuProps = {
  isOpen: boolean;
  onClose: () => void;
  currentUser: {
    id: string;
    firstname: string;
    lastname: string;
    profilepic: string;
  } | null;
};

export default function UserMenu({ isOpen, onClose, currentUser }: UserMenuProps) {
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [profilePic, setProfilePic] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setFirstname(currentUser.firstname || "");
      setLastname(currentUser.lastname || "");
      setProfilePic(currentUser.profilepic || "");
    }
  }, [currentUser]);

  const handleSaveChanges = async () => {
    if (!currentUser) return;
    
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const userRef = doc(db, "users", currentUser.id);
      await updateDoc(userRef, {
        firstname: firstname.trim(),
        lastname: lastname.trim(),
        profilepic: profilePic.trim(),
      });
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError("Failed to save changes. Please try again.");
      console.error("Error updating user:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="user-menu-backdrop" onClick={onClose} />
      <div className="user-menu">
        <div className="user-menu-header">
          <h2>Edit Profile</h2>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="user-menu-content">
          <div className="profile-pic-section">
            <img 
              src={profilePic || "https://static.vecteezy.com/system/resources/thumbnails/009/292/244/small_2x/default-avatar-icon-of-social-media-user-vector.jpg"} 
              alt="Profile" 
              className="menu-profile-pic"
            />
            <Camera size={16} className="camera-icon" />
          </div>

          <div className="form-section">
            <div className="input-group">
              <label htmlFor="firstname">First Name</label>
              <div className="input-wrapper">
                <User size={16} />
                <input
                  id="firstname"
                  type="text"
                  value={firstname}
                  onChange={(e) => setFirstname(e.target.value)}
                  placeholder="Enter first name"
                />
              </div>
            </div>

            <div className="input-group">
              <label htmlFor="lastname">Last Name</label>
              <div className="input-wrapper">
                <User size={16} />
                <input
                  id="lastname"
                  type="text"
                  value={lastname}
                  onChange={(e) => setLastname(e.target.value)}
                  placeholder="Enter last name"
                />
              </div>
            </div>

            <div className="input-group">
              <label htmlFor="profilepic">Profile Picture URL</label>
              <div className="input-wrapper">
                <Camera size={16} />
                <input
                  id="profilepic"
                  type="url"
                  value={profilePic}
                  onChange={(e) => setProfilePic(e.target.value)}
                  placeholder="Enter image URL"
                />
              </div>
            </div>

            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            {success && (
              <div className="success-message">
                Profile updated successfully!
              </div>
            )}

            <button 
              className="save-btn" 
              onClick={handleSaveChanges}
              disabled={loading}
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
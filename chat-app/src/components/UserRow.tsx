import "./UserRow.css";
import { Check, CheckCheck } from "lucide-react";

type UserRowProps = {
  profilePic: string;
  fullName: string;
  message: string;
  timestamp: string;
  checked: boolean;
  onClick: () => void;
};

export default function UserRow({
  profilePic,
  fullName,
  message,
  timestamp,
  checked,
  onClick,
}: UserRowProps) {
  return (
    <div className="userrowcontainer" onClick={onClick}>
      <img src={profilePic} alt={profilePic} className="profilePic" />
      <div className="nameandmessage">
        <h1>{fullName}</h1>
        <p>{message}</p>
      </div>
      <div className="timestamp">
        <p>{timestamp}</p>
        {checked ? (
          <CheckCheck size={16} color="#25D366" />
        ) : (
          <Check size={16} color="#999" />
        )}
      </div>
    </div>
  );
}

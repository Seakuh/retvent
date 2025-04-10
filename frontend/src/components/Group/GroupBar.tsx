import { MessageSquareIcon } from "lucide-react";
import "./GroupBar.css";
export const GroupBar = () => {
  return (
    <div className="group-bar-container">
      <div className="group-bar-left">
        <input type="text" placeholder="Search" className="group-bar-input" />
      </div>
      <div className="group-bar-right">
        <MessageSquareIcon className="group-bar-icon h-5 w-5" />
      </div>
    </div>
  );
};

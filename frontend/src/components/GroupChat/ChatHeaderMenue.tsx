import { Calendar, LogOut, Settings, Trash2, UserPlus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./ChatHeaderMenue.css";
import { useChat } from "./chatProvider";
export const ChatHeaderMenu = () => {
  const { currentGroupId, currentEventId } = useChat();
  console.log("currentGroupId", currentGroupId);
  console.log("currentEventId", currentEventId);
  const navigate = useNavigate();

  const handleGroupSettings = () => {
    console.log("Group Settings");
  };

  const handleAddMember = () => {
    console.log("Add Member");
  };

  const handleSearch = () => {
    console.log("Search");
  };

  const handleViewEvent = () => {
    console.log("View Event");
    navigate(`/event/${currentEventId}`);
  };

  const handleLeaveGroup = () => {
    console.log("Leave Group");
  };

  const handleDeleteGroup = () => {
    console.log("Delete Group");
  };

  return (
    <div className="menu-container">
      <div className="menu-items">
        <button className="menu-item" onClick={handleGroupSettings}>
          <Settings />
          <span>Group Settings</span>
        </button>

        <button className="menu-item" onClick={handleAddMember}>
          <UserPlus />
          <span>Add Member</span>
        </button>
        {/* 
        <button className="menu-item" onClick={handleSearch}>
          <Search />
          <span>Search</span>
        </button> */}

        <button className="menu-item" onClick={handleViewEvent}>
          <Calendar />
          <span>View Event</span>
        </button>

        <hr className="menu-divider" />

        <button
          className="menu-item menu-item-warning"
          onClick={handleLeaveGroup}
        >
          <LogOut />
          <span>Leave Group</span>
        </button>

        <button
          className="menu-item menu-item-danger"
          onClick={handleDeleteGroup}
        >
          <Trash2 />
          <span>Delete Group</span>
        </button>
      </div>
    </div>
  );
};

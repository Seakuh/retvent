import { Calendar, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./ChatHeaderMenue.css";
import { useChat } from "./chatProvider";
import { leaveGroup } from "./service";
export const ChatHeaderMenu = () => {
  const { currentGroupId, currentEventId } = useChat();
  const navigate = useNavigate();

  const handleGroupSettings = () => {};

  const handleViewEvent = () => {
    navigate(`/event/${currentEventId}`);
  };

  const handleLeaveGroup = () => {
    if (currentGroupId) {
      leaveGroup(currentGroupId);
      navigate(-1);
    }
  };

  return (
    <div className="menu-container">
      <div className="menu-items">
        {/* <button className="menu-item" onClick={handleGroupSettings}>
          <Settings />
          <span>Group Settings</span>
        </button> */}

        {/* <button className="menu-item" onClick={handleAddMember}>
          <UserPlus />
          <span>Add Member</span>
        </button> */}
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

        {/* <button
          className="menu-item menu-item-danger"
          onClick={handleDeleteGroup}
        >
          <Trash2 />
          <span>Delete Group</span>
        </button> */}
      </div>
    </div>
  );
};

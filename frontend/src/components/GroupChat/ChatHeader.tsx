import { ChevronLeft, MoreVertical } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Group } from "../../utils";
import { ChatHeaderMenu } from "./ChatHeaderMenue";
export const ChatHeader = ({ group }: { group: Group }) => {
  const navigate = useNavigate();
  const [isChatHeaderMenuOpen, setIsChatHeaderMenuOpen] = useState(false);
  const handleBack = () => {
    navigate(-1);
  };

  const handleMore = () => {
    setIsChatHeaderMenuOpen(!isChatHeaderMenuOpen);
  };

  return (
    <div className="chat-header">
      {isChatHeaderMenuOpen && <ChatHeaderMenu />}
      <button onClick={handleBack} className="back-button-group-header">
        <ChevronLeft className="h-6 w-6" />
      </button>
      <div className="chat-header-name">{group.name}</div>
      {/* <div
          className="search-bar"
          onClick={() => {
            searchMessages();
          }}
        >
          <Search className="h-6 w-6" />
        </div> */}
      <div className="more" onClick={handleMore}>
        <MoreVertical className="h-6 w-6" />
      </div>
    </div>
  );
};

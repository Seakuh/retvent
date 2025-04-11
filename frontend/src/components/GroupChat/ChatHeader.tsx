import { ChevronLeft, MoreVertical } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Group } from "../../utils";

export const ChatHeader = ({ group }: { group: Group }) => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="chat-header">
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
      <div className="more">
        <MoreVertical className="h-6 w-6" />
      </div>
    </div>
  );
};

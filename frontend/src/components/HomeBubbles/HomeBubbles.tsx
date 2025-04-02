import {
  LucideCalendar,
  LucideHeart,
  LucideMapPin,
  LucideUser,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./HomeBubbles.css";
interface Bubble {
  id: string;
  title: string;
  route: string;
  icon: React.ElementType;
}

const BUBBLES: Bubble[] = [
  //   {
  //     id: "upload",
  //     title: "Upload",
  //     route: "/admin/events/create",
  //     icon: LucideUpload,
  //   },
  //   {
  //     id: "create-event",
  //     title: "Create",
  //     route: "/admin/events/create",
  //     icon: LucidePlus,
  //   },
  { id: "liked", title: "Likes", route: "/liked", icon: LucideHeart },
  {
    id: "locations",
    title: "Locations",
    route: "/locations",
    icon: LucideMapPin,
  },
  { id: "profile", title: "Profile", route: "/me", icon: LucideUser },
  {
    id: "my-events",
    title: "My Events",
    route: "/admin/events",
    icon: LucideCalendar,
  },
];

export const HomeBubbles = () => {
  const navigate = useNavigate();
  return (
    <div className="home-bubbles-container">
      {BUBBLES.map((bubble) => (
        <div
          className="home-bubble"
          key={bubble.id}
          onClick={() => navigate(bubble.route)}
        >
          <div className="home-bubble-icon">
            <bubble.icon />
          </div>
          <div className="home-bubble-title">{bubble.title}</div>
        </div>
      ))}
    </div>
  );
};

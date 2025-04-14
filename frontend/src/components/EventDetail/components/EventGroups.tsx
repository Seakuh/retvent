import { Bed, Car, HeartHandshake, Palette, Plus, Shirt } from "lucide-react";
import { Event } from "../../../utils";
import "./EventGroups.css";
export const EventGroups = ({ event }: { event: Event }) => {
  const joinGroup = (group: string) => {
    console.log("joinGroup", group);
  };

  return (
    <div className="event-groups-container">
      <h2>Groups</h2>
      <ul className="event-groups-community-list">
        <li
          className="event-groups-community-item"
          onClick={() => joinGroup("helper")}
        >
          <HeartHandshake size={20} />
          <h3>Helper</h3>
        </li>
        <li
          className="event-groups-community-item"
          onClick={() => joinGroup("driver")}
        >
          <Car size={20} />
          <h3>Driver</h3>
        </li>
        <li
          className="event-groups-community-item"
          onClick={() => joinGroup("artist")}
        >
          <Palette size={20} />
          <h3>Artist</h3>
        </li>
        <li
          className="event-groups-community-item"
          onClick={() => joinGroup("artist")}
        >
          <Bed size={20} />
          <h3>Sleep</h3>
        </li>
        <li className="event-groups-community-item">
          <Shirt size={20} />
          <h3>Lost & Found</h3>
        </li>
        <li className="event-groups-community-item">
          <Plus size={20} />
          <h3>Create</h3>
        </li>
      </ul>
    </div>
  );
};

import GuestComponent from "./GuestComponent";
import { OwnerComponent } from "./OwnerComponent";

export const HostView = ({ eventId }: { eventId: string }) => {
  return (
    <div className="host-view">
      <OwnerComponent />
      <GuestComponent eventId={eventId} />
    </div>
  );
};

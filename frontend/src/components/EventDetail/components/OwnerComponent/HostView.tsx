import GuestComponent from "./GuestComponent";

export const HostView = ({ eventId }: { eventId: string }) => {
  return (
    <div className="host-view">
      {/* <OwnerComponent /> */}
      <GuestComponent eventId={eventId} />
    </div>
  );
};

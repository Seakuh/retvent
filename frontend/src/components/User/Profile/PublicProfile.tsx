import { ChevronLeft, ShieldHalf } from "lucide-react";
import { useNavigate } from "react-router-dom";
export const PublicProfile = () => {
  const navigate = useNavigate();
  const handleBack = () => {
    navigate("/");
  };
  return (
    <div>
      {" "}
      <div className="h-screen w-screen">
        <button className="back-button" onClick={handleBack}>
          <ChevronLeft className="h-5 w-5" />{" "}
        </button>

        <div className="flex flex-col items-center justify-center min-h-[80vh] p-4">
          <ShieldHalf className="w-20 h-20 text-white mx-auto  mb-4 mt-20" />

          <h1 className="text-center text-white text-xl font-bold mt-6">
            This contribution was uploaded public by the community.
            <br />
            <br />
            <p>
              If you want to upload your own events, <br />
              please login and upload your own events.
            </p>
          </h1>
          <a
            href="https://event-scanner.com"
            className="flex mt-2 justify-center"
          >
            <img
              src="/logo.png"
              alt="Event-Scanner"
              className="w-16 h-16 border border-[var(--color-neon-blue)] mt-20 rounded-xl"
            />
          </a>
          <div className="flex text-white mt-8 text-center max-w-[550px] mx-auto">
            <p className="text-white text-sm text-center mt-4 max-w-[550px] mx-auto">
              Event-Scanner is an open platform where users can publish content.
              The operators are not responsible for third-party posts. If you
              come across any illegal or offensive content, please report it via{" "}
              <a href="mailto:info@event-scanner.com" className="underline">
                info@event-scanner.com
              </a>
              . We carefully review every report and will remove content that
              violates our policies. Comments may be posted anonymously but must
              follow our{" "}
              <a href="/comment-guidelines" className="underline">
                Comment Guidelines
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

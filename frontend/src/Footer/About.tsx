import { ChevronLeft, LucideInfo } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const About = () => {
  const navigate = useNavigate();
  return (
    <div>
      <button onClick={() => navigate(-1)} className="back-button">
        <ChevronLeft className="h-5 w-5" />{" "}
      </button>
      About
      <a href="https://event-scanner.com">
        <img
          src="/logo.png"
          alt="Event-Scanner"
          className="mt-40   w-40  h-40 mx-auto "
        />
      </a>
      <div className=" p-40 text-center text-white leading-relaxed p-6 break-words">
        <LucideInfo className="w-20 h-20 text-white mx-auto  mb-4" />
        <p>
          Event-Scanner is a platform that allows you to find and discover
          events in your area. Exchange your favorite events with your friends
          and discover new events. The community is for everyone to discuss and
          share their thoughts about events.
        </p>
        <p>
          It is a project that is currently operated by a private individual in
          the early stages of development.
        </p>
        <p>
          If you have any questions or feedback, please contact us at{" "}
          <a href="mailto:info@event-scanner.com">info@event-scanner.com</a>.
        </p>
        <p>
          If you want to support the project, you can donate to the project.
          <a href="https://event-scanner.com">Donate</a>.
        </p>
      </div>
    </div>
  );
};

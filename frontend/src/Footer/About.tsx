import {
  BadgeHelp,
  ChevronLeft,
  HeartHandshake,
  LucideInfo,
  NotebookPen,
  Upload,
} from "lucide-react";
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
          className="w-40 h-40 mx-auto border border-[var(--color-neon-blue)] rounded-xl"
        />
      </a>
      <h1 className="section-title text-center mt-4">Event-Scanner</h1>
      <div className="text-left text-white leading-relaxed p-6 break-words">
        <section>
          <LucideInfo className="w-20 h-20 text-white mx-auto  mb-4" />
          <br />

          <p>
            Event-Scanner is a platform that allows you to find and discover
            events in your area. Exchange your favorite events with your friends
            and discover new events. The community is for everyone to discuss
            and share their thoughts about events.
          </p>
          <p>
            It is a project that is currently operated by a private individual
            in the early stages of development.
          </p>
        </section>
        <section>
          <Upload className="w-20 h-20 text-white mx-auto mt-5  mb-4" />
          <br />

          <p>By uploading events to the platform, users can:</p>
          <br />

          <ul>
            <li>
              <strong>Organize themselves</strong> – Manage your events and keep
              track of upcoming ones.
            </li>
            <li>
              <strong>Form groups</strong> – Invite other users to experience
              events together, either privately or in public groups.
            </li>
            <li>
              <strong>Exchange contacts</strong> – Connect with other event
              attendees, artists, or organizers and share information.
            </li>
            <li>
              <strong>Participate in events</strong> – Browse through a variety
              of events and sign up for those that interest you.
            </li>
            <li>
              <strong>Save events in your calendar</strong> – Easily integrate
              events into your personal calendar to ensure you never miss out.
            </li>
            <li>
              <strong>Follow artists</strong> – Stay up-to-date with the latest
              events and activities from your favorite artists.
            </li>
            <li>
              <strong>Store important information</strong> – Save key details
              about events or artists that you may want to revisit later.
            </li>
          </ul>
        </section>

        <section>
          <br />
          <NotebookPen className="w-20 h-20 text-white mx-auto  mb-4 mt-4" />
          <p>Manage your event experiences easily</p>
          <p>
            With the easy-to-use EventScanner platform, you can not only share
            your own events but also benefit from a large community. Create and
            share event scans, plan your next events, and experience a new way
            of event participation!
          </p>
        </section>
        <section>
          <p>
            <BadgeHelp className="w-20 h-20 text-white mx-auto  mb-4 mt-4" />
            <br />
            If you have any questions or feedback, please contact us at{" "}
            <a href="mailto:info@event-scanner.com">info@event-scanner.com</a>.
          </p>
        </section>
        <section>
          <HeartHandshake className="w-20 h-20 text-red-500 mx-auto mb-4 mt-4" />
          <h2 className="text-red-500">
            Support and Contribute to the Project
          </h2>
          <br />
          <p>
            If you'd like to help and support the project, you can easily upload
            events, leave comments, like posts, and contribute to filling the
            website with life. As a community, we grow together and create an
            even more vibrant and engaging platform for everyone.
          </p>
        </section>
      </div>
    </div>
  );
};

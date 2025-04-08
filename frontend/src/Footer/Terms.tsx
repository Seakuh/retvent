import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
export const Terms = () => {
  const navigate = useNavigate();
  return (
    <div className="mt-20 terms-container max-w-3xl mx-auto p-6 text-sm leading-relaxed text-white">
      <button
        onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
          e.preventDefault();
          navigate(-1);
        }}
        className="back-button"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <h1 className="text-2xl font-bold mb-6">
        Terms of Use for the EventScanner Platform
      </h1>
      <p>
        <em>Status: March 2025</em>
      </p>

      <hr className="my-4" />

      <h2 className="font-semibold text-lg mt-6">1. Scope</h2>
      <p>
        These Terms of Use apply to all users of the "EventScanner" platform
        (hereinafter referred to as "Platform"), operated by [Your Name or
        Company Name]. By using the Platform, users agree to these Terms.
      </p>

      <h2 className="font-semibold text-lg mt-6">2. Description of Services</h2>
      <p>
        The Platform allows users to discover events, upload event-related
        content (e.g., flyers or posters), and engage in discussions. Verified
        event organizers can officially submit events and provide ticket links.
        Content is either user-generated ("Community Events") or submitted by
        organizers.
      </p>

      <h2 className="font-semibold text-lg mt-6">
        3. Registration & User Account
      </h2>
      <p>
        Some features of the Platform require registration. Users are required
        to provide accurate and complete information. Creating multiple accounts
        or providing false information is prohibited.
      </p>

      <h2 className="font-semibold text-lg mt-6">4. User Content & Rights</h2>
      <p>
        Users may only upload content they are authorized to share or that they
        use with permission from the rights holder. By uploading content, users
        confirm:
      </p>
      <ul className="list-disc pl-6">
        <li>They are authorized to publish the content,</li>
        <li>They do not infringe any third-party rights,</li>
        <li>
          They release the Platform from any liability resulting from the
          uploaded content.
        </li>
      </ul>

      <h2 className="font-semibold text-lg mt-6">
        5. Community Content & Discussion
      </h2>
      <p>
        The Platform serves as a space for public cultural discourse. Users may
        comment on posts, share their impressions, and discuss events.
        User-generated content is marked accordingly.
      </p>

      <h2 className="font-semibold text-lg mt-6">
        6. Official Organizer Submissions
      </h2>
      <p>
        Verified organizers may officially list events and link to ticket sales.
        They are fully responsible for the accuracy and legality of their
        submissions.
      </p>

      <h2 className="font-semibold text-lg mt-6">7. Rights to Content</h2>
      <p>
        By uploading content, users grant the Platform a simple, non-exclusive,
        worldwide, and time-unlimited right to display, store, and publish the
        content as part of the Platform. Any further use requires user consent.
      </p>

      <h2 className="font-semibold text-lg mt-6">
        8. Reporting & Content Removal
      </h2>
      <p>
        Rights holders or other affected parties may report content that
        violates applicable laws or their rights. The Platform will review and,
        if necessary, promptly remove such content.
      </p>

      <h2 className="font-semibold text-lg mt-6">9. Liability</h2>
      <p>
        The Platform is not liable for content uploaded by users or organizers.
        The Platform is not the organizer of the listed events and assumes no
        responsibility for their execution or quality. The Platform is only
        liable in cases of intent or gross negligence.
      </p>

      <h2 className="font-semibold text-lg mt-6">10. Changes to the Terms</h2>
      <p>
        The Platform reserves the right to modify these Terms at any time.
        Changes will be announced in a timely manner on the Platform. Continued
        use of the Platform signifies acceptance of the updated Terms.
      </p>

      <h2 className="font-semibold text-lg mt-6">11. Final Provisions</h2>
      <p>
        The law of the Federal Republic of Germany applies. The place of
        jurisdiction, insofar as legally permissible, is the registered office
        of the Platform operator. If individual provisions of these Terms are
        invalid, the remaining provisions shall remain effective. The Platform
        is not responsible for the content of external websites. Clicking such
        links is at the user’s own risk.
      </p>
    </div>
  );
};

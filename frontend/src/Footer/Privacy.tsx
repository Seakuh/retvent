import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const Privacy = () => {
  const navigate = useNavigate();
  return (
    <div className="mt-20 max-w-3xl mx-auto p-6 text-sm text-white leading-relaxed">
      <button
        onClick={() => {
          if (window.history.length > 1) {
            navigate(-1);
          } else {
            navigate("/");
          }
        }}
        className="back-button"
      >
        <ChevronLeft className="h-5 w-5" />{" "}
      </button>
      <h1 className="text-2xl font-bold mb-6">Privacy Policy</h1>

      <p className="mb-4">
        The EventScanner platform is committed to protecting your personal data
        in accordance with the General Data Protection Regulation (GDPR) and the
        German Federal Data Protection Act (BDSG).
      </p>

      <h2 className="text-lg font-semibold mt-6">1. Data Collection</h2>
      <p>
        We only collect and process data that is necessary for the use of our
        platform. This includes:
      </p>
      <ul className="list-disc pl-6 mt-2">
        <li>Login and account data (email, username, etc.)</li>
        <li>
          Uploaded content and metadata (e.g., timestamp, location if consented)
        </li>
        <li>Technical data (e.g., browser type, device, access time)</li>
      </ul>

      <h2 className="text-lg font-semibold mt-6">2. Data Usage</h2>
      <p>
        Your data is used to operate and improve the platform, especially to:
      </p>
      <ul className="list-disc pl-6 mt-2">
        <li>Authenticate users</li>
        <li>Display and manage content</li>
        <li>Maintain system security and performance</li>
      </ul>

      <h2 className="text-lg font-semibold mt-6">3. Data Sharing</h2>
      <p>
        We do <strong>not</strong> share your personal data with third parties
        unless legally required to do so or if you explicitly consent.
      </p>

      <h2 className="text-lg font-semibold mt-6">4. Cookies & Tracking</h2>
      <p>
        EventScanner only uses technically necessary cookies. We do not use
        tracking or analytics tools for advertising purposes.
      </p>

      <h2 className="text-lg font-semibold mt-6">5. Hosting & Security</h2>
      <p>
        The platform is hosted in GDPR-compliant environments located within the
        EU. Regular security updates and data backups are performed.
      </p>

      <h2 className="text-lg font-semibold mt-6">6. Your Rights</h2>
      <p>You have the right to:</p>
      <ul className="list-disc pl-6 mt-2">
        <li>Access your stored data</li>
        <li>Request correction or deletion</li>
        <li>Withdraw consent at any time</li>
        <li>File a complaint with a supervisory authority</li>
      </ul>

      <h2 className="text-lg font-semibold mt-6">7. Contact</h2>
      <p>
        For privacy-related inquiries, please contact us at: <br />
        <strong>[info@event-scanner.com]</strong>
      </p>
    </div>
  );
};

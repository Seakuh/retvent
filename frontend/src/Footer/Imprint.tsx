import { useNavigate } from "react-router-dom";

export const Imprint = () => {
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
        ← Back
      </button>
      <h1 className="text-2xl font-bold mb-6">Legal Disclosure (Imprint)</h1>

      <p className="mb-4">Information in accordance with Section 5 TMG:</p>
      <p>
        <strong>Event-Scanner (Project in Development)</strong>
        <br />
        <br />
        This project is currently operated by a private individual in the early
        stages of development.
        <br />
        In accordance with §5 TMG, full contact information will be provided
        upon project launch.
        <br />
        <br />
        Email:{" "}
        <a
          href="mailto:info@event-scanner.com"
          className="underline text-white"
        >
          info@event-scanner.com
        </a>
        <br />
        Responsible for content under Section 55(2) RStV: The operator can be
        reached via the above email.
      </p>

      <hr className="my-6 border-white/20" />

      <p>
        This legal disclosure complies with the requirements of German law (§5
        TMG and §55 RStV). If you have questions or concerns regarding legal
        responsibility, please contact us via email.
      </p>
    </div>
  );
};

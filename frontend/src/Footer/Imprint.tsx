export const Imprint = () => {
  return (
    <div className="max-w-3xl mx-auto p-6 text-sm text-white leading-relaxed">
      <h1 className="text-2xl font-bold mb-6">Legal Disclosure (Imprint)</h1>

      <p className="mb-4">Information in accordance with Section 5 TMG:</p>
      <p>
        <strong>Event-Scanner</strong>
        <br />
        [Berlin, Germany]
        <br />
        Email:{" "}
        <a
          href="mailto:info@event-scanner.com"
          className="underline text-white"
        >
          info@event-scanner.com
        </a>
        <br />
        Responsible for content under Section 55(2) RStV: [Name]
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

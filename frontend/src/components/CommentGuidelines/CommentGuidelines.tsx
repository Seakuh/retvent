import { ChevronLeft, ShieldCheck } from "lucide-react";
import React from "react";
import { useNavigate } from "react-router-dom";
import "./CommentGuidelines.css";

const CommentGuidelines: React.FC = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="comment-guidelines-container">
      <button className="back-button" onClick={handleBack}>
        <ChevronLeft className="h-5 w-5" />{" "}
      </button>

      <div className="comment-guidelines-header">
        <ShieldCheck size={32} className="comment-guidelines-icon" />
        <h2>Comment Guidelines</h2>
      </div>
      <p className="comment-guidelines-intro">
        Welcome to Event-Scanner! We aim to foster a respectful and open
        environment. By posting a comment, you agree to the following rules:
      </p>
      <ul className="comment-guidelines-list">
        <li>
          ✅ Be respectful – no hate speech, threats, or personal attacks.
        </li>
        <li>✅ Stay on topic and avoid spam or unsolicited promotions.</li>
        <li>✅ Do not share illegal, offensive, or discriminatory content.</li>
        <li>
          ✅ Anonymous comments are allowed, but abuse will not be tolerated.
        </li>
        <li>
          ✅ Report any violations to{" "}
          <a
            className="underline cursor-pointer"
            href="mailto:info@event-scanner.com"
          >
            info@event-scanner.com
          </a>
          .
        </li>
      </ul>
      <p className="comment-guidelines-footer">
        We reserve the right to remove comments that violate these rules without
        prior notice.
      </p>
    </div>
  );
};

export default CommentGuidelines;

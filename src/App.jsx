import { useState } from "react";
import emailjs from "@emailjs/browser";

const PRIMARY_USER_EMAIL = "kanhaiya.jha125390@marwadiuniversity.ac.in";

const initialForm = {
  name: "",
  email: "",
  rating: 0,
  feedback: "",
  type: "Gamer",
  consent: false,
};

export default function App() {
  const [formData, setFormData] = useState(initialForm);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState({ type: "", text: "" });

  const emailServiceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
  const emailOwnerTemplateId = import.meta.env.VITE_EMAILJS_OWNER_TEMPLATE_ID;
  const emailUserTemplateId = import.meta.env.VITE_EMAILJS_USER_TEMPLATE_ID;
  const emailPublicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

  const handleChange = (e) => {
    const { name, type, value, checked } = e.target;
    const nextValue = type === "checkbox" ? checked : value;
    setFormData((prev) => ({ ...prev, [name]: nextValue }));
  };

  const setRating = (value) => {
    setFormData((prev) => ({ ...prev, rating: value }));
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required.";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required.";
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email.";
    }

    if (!formData.rating) {
      newErrors.rating = "Please select a rating.";
    }

    const feedbackLength = formData.feedback.trim().length;
    if (feedbackLength < 10) {
      newErrors.feedback = "Feedback must be at least 10 characters.";
    } else if (feedbackLength > 500) {
      newErrors.feedback = "Feedback cannot exceed 500 characters.";
    }

    if (!formData.consent) {
      newErrors.consent = "Please agree before submitting.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const sendFeedbackEmail = async (
    userTargetEmail,
    userTargetName,
    templateId,
    recipientType
  ) => {
    const safeRecipient = userTargetEmail.trim();

    const templateParams = {
      to_name: userTargetName,
      from_name: formData.name,
      user_email: formData.email,
      rating: formData.rating,
      user_type: formData.type,
      feedback: formData.feedback,
      submitted_at: new Date().toLocaleString(),
    };

    if (recipientType === "owner") {
      templateParams.mail = safeRecipient;
    } else {
      templateParams.to_email = safeRecipient;
      templateParams.email = safeRecipient;
      templateParams.to = safeRecipient;
      templateParams.recipient_email = safeRecipient;
    }

    return emailjs.send(emailServiceId, templateId, templateParams, {
      publicKey: emailPublicKey,
    });
  };

  const formatEmailError = (err) => {
    const status = err?.status ? `status ${err.status}` : "";
    const text = err?.text || err?.message || "unknown error";
    return `${text}${status ? ` (${status})` : ""}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    if (!emailServiceId || !emailOwnerTemplateId || !emailUserTemplateId || !emailPublicKey) {
      setSubmitMessage({
        type: "error",
        text: "Email setup missing. Add EmailJS keys in .env.local before submitting.",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmitMessage({ type: "", text: "" });

      const sendResult = await Promise.allSettled([
        sendFeedbackEmail(
          PRIMARY_USER_EMAIL,
          "Kanhaiya Kumar Jha",
          emailOwnerTemplateId,
          "owner"
        ),
        sendFeedbackEmail(
          formData.email,
          formData.name,
          emailUserTemplateId,
          "user"
        ),
      ]);

      const failedResults = sendResult.filter(
        (result) => result.status === "rejected"
      );

      if (!failedResults.length) {
        setSubmitMessage({
          type: "success",
          text: "Thank you! Feedback confirmed. Email confirmation sent to you.",
        });
      } else if (failedResults.length === 1) {
        const failedReason = formatEmailError(failedResults[0].reason);
        setSubmitMessage({
          type: "error",
          text: `One email delivered, one failed: ${failedReason}`,
        });
      } else {
        const failedReason = formatEmailError(failedResults[0].reason);
        setSubmitMessage({
          type: "error",
          text: `Both emails failed: ${failedReason}`,
        });
      }

      setFormData(initialForm);
      setHoveredStar(0);
      setErrors({});
    } catch (error) {
      console.error("Email send failed:", error);
      setSubmitMessage({
        type: "error",
        text: "Unable to send emails right now. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData(initialForm);
    setHoveredStar(0);
    setErrors({});
    setSubmitMessage({ type: "", text: "" });
  };

  return (
    <main className="page-shell">
      <section className="glow" aria-hidden="true" />
      <article className="feedback-card">
        <p className="kicker">Experience</p>
        <h1>Feedback Form</h1>
        <p className="subtitle">
          Help us improve your Self. Your input powers our next
          update.
        </p>

        <form onSubmit={handleSubmit} noValidate>
          <label htmlFor="name">Name</label>
          <input
            id="name"
            type="text"
            name="name"
            placeholder="Enter your name"
            value={formData.name}
            onChange={handleChange}
          />
          {errors.name ? <p className="error-text">{errors.name}</p> : null}

          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            name="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleChange}
          />
          {errors.email ? <p className="error-text">{errors.email}</p> : null}

          <fieldset>
            <legend>Rating (1-5)</legend>
            <div className="star-row">
              {[1, 2, 3, 4, 5].map((value) => {
                const isActive = (hoveredStar || formData.rating) >= value;

                return (
                  <button
                    key={value}
                    type="button"
                    className={`star-btn ${isActive ? "active" : ""}`}
                    onClick={() => setRating(value)}
                    onMouseEnter={() => setHoveredStar(value)}
                    onMouseLeave={() => setHoveredStar(0)}
                    aria-label={`Rate ${value}`}
                  >
                    ★
                  </button>
                );
              })}
            </div>
          </fieldset>
          {errors.rating ? <p className="error-text">{errors.rating}</p> : null}

          <label htmlFor="feedback">Feedback (10-500 characters)</label>
          <textarea
            id="feedback"
            name="feedback"
            placeholder="Tell us what worked and what should improve..."
            value={formData.feedback}
            onChange={handleChange}
            maxLength={500}
          />
          <p className="char-count">{formData.feedback.length} / 500</p>
          {errors.feedback ? (
            <p className="error-text">{errors.feedback}</p>
          ) : null}

          <label htmlFor="type">Type</label>
          <select
            id="type"
            name="type"
            value={formData.type}
            onChange={handleChange}
          >
            <option value="Gamer">Gamer</option>
            <option value="Student">Student</option>
            <option value="Average Guy">Average Guy</option>
          </select>

          <label className="consent-row" htmlFor="consent">
            <input
              id="consent"
              type="checkbox"
              name="consent"
              checked={formData.consent}
              onChange={handleChange}
            />
            I agree to submit my feedback.
          </label>
          {errors.consent ? (
            <p className="error-text">{errors.consent}</p>
          ) : null}

          <div className="actions">
            <button className="submit-btn" type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Sending..." : "Submit"}
            </button>
            <button className="clear-btn" type="button" onClick={handleReset}>
              Clear
            </button>
          </div>

          {submitMessage.text ? (
            <p className={`submit-message ${submitMessage.type}`}>
              {submitMessage.text}
            </p>
          ) : null}
        </form>
      </article>
    </main>
  );
}
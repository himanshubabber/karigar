import React, { useState } from "react";
import { FaStar } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Feedback = ({ serviceRequestId, onSubmit }) => {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async () => {
    if (!rating) {
      alert("Please select a rating before submitting.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await axios.post("/api/v1/worker/rate", {
        serviceRequestId,
        rating,
      });

      alert("Thanks for your feedback!");
      if (onSubmit) onSubmit();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit feedback");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex flex-column align-items-center mt-5">
      <h3 className="mb-4">Rate Your Experience</h3>

      <div className="d-flex mb-3">
        {[...Array(5)].map((_, index) => {
          const starValue = index + 1;
          return (
            <label key={index}>
              <input
                type="radio"
                name="rating"
                value={starValue}
                onClick={() => setRating(starValue)}
                style={{ display: "none" }}
              />
              <FaStar
                size={40}
                color={starValue <= (hover || rating) ? "#ffc107" : "#e4e5e9"}
                style={{ cursor: "pointer", transition: "color 200ms" }}
                onMouseEnter={() => setHover(starValue)}
                onMouseLeave={() => setHover(null)}
              />
            </label>
          );
        })}
      </div>

      {error && <p className="text-danger">{error}</p>}

      <button
        className="btn btn-primary px-4 py-2"
        onClick={handleSubmit}
        disabled={loading}
      >
        {loading ? "Submitting..." : "Submit Feedback"}
      </button>
    </div>
  );
};

export default Feedback;

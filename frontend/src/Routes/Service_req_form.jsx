import React, { useState } from "react";


const categories = [
  "plumber", "electrician", "carpenter", "painter",
  "tv", "fridge", "ac", "washing machine", "laptop"
];

const Service_req_form = () => {
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [audioNoteUrl, setAudioNoteUrl] = useState(null);
  const [location, setLocation] = useState(null);
  const [locationText, setLocationText] = useState("");

  const handleUseLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = {
            type: "Point",
            coordinates: [pos.coords.longitude, pos.coords.latitude]
          };
          setLocation(coords);
          setLocationText(
            `Lat: ${pos.coords.latitude.toFixed(4)}, Long: ${pos.coords.longitude.toFixed(4)}`
          );
        },
        () => {
          alert("Failed to retrieve location.");
        }
      );
    } else {
      alert("Geolocation not supported.");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!category || !location) {
      alert("Please fill in all required fields.");
      return;
    }

    const requestData = {
      category,
      description,
      audioNoteUrl: audioNoteUrl?.name || "",
      customerLocation: location
    };

    console.log("Submitted:", requestData);
    alert("Request submitted! Check console.");
  };

  return (
    <div
      className="d-flex justify-content-center align-items-center vh-100"
      style={{
        backgroundImage: `url('../public/landing_page.png')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat"
      }}
    >
      <div
        className="card shadow-lg p-4"
        style={{
          width: "36rem",
          borderRadius: "15px",
          backgroundColor: "rgba(255, 255, 255, 0.95)"
        }}
      >
        <h3 className="text-center fw-bold mb-3 text-primary">Request a Service</h3>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label fw-semibold">Category *</label>
            <select
              className="form-select"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">-- Choose a service --</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold">Describe the Issue</label>
            <textarea
              className="form-control"
              rows="3"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Briefly describe the issue"
            />
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold">Upload Audio Note (optional)</label>
            <input
              type="file"
              accept="audio/*"
              className="form-control"
              onChange={(e) => setAudioNoteUrl(e.target.files[0])}
            />
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold">Location *</label>
            <button
              type="button"
              className="btn btn-outline-success mb-2"
              onClick={handleUseLocation}
            >
              Use Current Location
            </button>
            {locationText && (
              <div className="text-muted small">{locationText}</div>
            )}
          </div>

          <button type="submit" className="btn btn-primary w-100">
            Submit Request
          </button>
        </form>
      </div>
    </div>
  );
};

export default Service_req_form;

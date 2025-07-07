import React from "react";
import Request from "./Request";

const sampleRequests = [
  {
    _id: "1",
    category: "plumber",
    orderStatus: "searching",
    jobStatus: "pending",
    description: "Kitchen tap leaking",
    paymentStatus: "pending",
    createdAt: Date.now(),
    customer: { fullName: "Aman Verma" },
    audioNoteUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    customerLocation: { coordinates: [77.1025, 28.7041] },
  },
  {
    _id: "2",
    category: "ac",
    orderStatus: "connected",
    jobStatus: "pending",
    description: "AC not working",
    paymentStatus: "paid",
    createdAt: Date.now() - 500000,
    customer: { fullName: "Sneha Patel" },
    customerLocation: { coordinates: [72.8777, 19.076] },
    audioNoteUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
  },
];

const handleAccept = (id) => {
  console.log("Accepted request ID:", id);
};

const Requests = () => {
  return (
    <div className="container mt-4">
      <h3 className="mb-4">Service Requests</h3>
      {sampleRequests.map((req) => (
        <Request key={req._id} request={req} onAccept={handleAccept} />
      ))}
    </div>
  );
};

export default Requests;

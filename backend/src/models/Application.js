const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema({
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Job",
    required: true,
  },
  candidate: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "reviewed", "shortlisted", "accepted", "rejected"],
    default: "pending",
  },
  coverLetter: {
    type: String,
    required: true,
  },
  resume: {
    type: String,
    required: true,
    validate: {
      validator: function (v) {
        return v.startsWith("/uploads/resumes/");
      },
      message: "Resume path must start with /uploads/resumes/",
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update the updatedAt timestamp before saving
applicationSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model("Application", applicationSchema);

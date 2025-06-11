const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Job title is required"],
      trim: true,
    },
    company: {
      type: String,
      required: [true, "Company name is required"],
      trim: true,
    },
    location: {
      type: String,
      required: [true, "Job location is required"],
      trim: true,
    },
    type: {
      type: String,
      required: [true, "Job type is required"],
      enum: ["full-time", "part-time", "contract", "internship"],
    },
    description: {
      type: String,
      required: [true, "Job description is required"],
    },
    requirements: {
      type: [String],
      required: [true, "Job requirements are required"],
    },
    salary: {
      min: {
        type: Number,
        required: false,
      },
      max: {
        type: Number,
        required: false,
      },
      currency: {
        type: String,
        enum: ["USD", "EUR", "GBP", "INR"],
        default: "USD",
      },
    },
    employer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "closed"],
      default: "active",
    },
    applications: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Application",
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Job", jobSchema);

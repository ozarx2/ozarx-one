const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const auth = require("../middleware/auth");
const Application = require("../models/Application");
const Job = require("../models/Job");
const upload = require("../middleware/upload");
const path = require("path");
const fs = require("fs");

// @route   GET api/applications
// @desc    Get all applications for a user
// @access  Private
router.get("/", auth, async (req, res) => {
  try {
    const applications = await Application.find({ candidate: req.user.id })
      .populate("job", "title company location")
      .sort({ createdAt: -1 });
    res.json(applications);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route   GET api/applications/job/:jobId
// @desc    Get all applications for a specific job
// @access  Private (Employer)
router.get("/job/:jobId", auth, async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId);

    if (!job) {
      return res.status(404).json({ msg: "Job not found" });
    }

    // Check if user is the employer
    if (job.employer.toString() !== req.user.id) {
      return res.status(401).json({ msg: "Not authorized" });
    }

    const applications = await Application.find({ job: req.params.jobId })
      .populate("candidate", "name email")
      .sort({ createdAt: -1 });

    res.json(applications);
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "Job not found" });
    }
    res.status(500).send("Server Error");
  }
});

// @route   POST api/applications
// @desc    Submit a job application
// @access  Private (Candidate)
router.post(
  "/",
  [
    auth,
    upload.single("resume"),
    [
      check("job", "Job ID is required").not().isEmpty(),
      check("coverLetter", "Cover letter is required").not().isEmpty(),
    ],
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      if (!req.file) {
        return res.status(400).json({ msg: "Resume file is required" });
      }

      const job = await Job.findById(req.body.job);

      if (!job) {
        // Clean up uploaded file if job not found
        if (req.file) {
          fs.unlinkSync(req.file.path);
        }
        return res.status(404).json({ msg: "Job not found" });
      }

      if (job.status !== "active") {
        // Clean up uploaded file if job is not active
        if (req.file) {
          fs.unlinkSync(req.file.path);
        }
        return res.status(400).json({ msg: "This job is no longer accepting applications" });
      }

      // Check if user has already applied
      const existingApplication = await Application.findOne({
        job: req.body.job,
        candidate: req.user.id,
      });

      if (existingApplication) {
        // Clean up uploaded file if application already exists
        if (req.file) {
          fs.unlinkSync(req.file.path);
        }
        return res.status(400).json({ msg: "You have already applied for this job" });
      }

      // Create the application with the resume path
      const resumePath = `/uploads/resumes/${req.file.filename}`;
      const newApplication = new Application({
        job: req.body.job,
        candidate: req.user.id,
        resume: resumePath,
        coverLetter: req.body.coverLetter,
      });

      const application = await newApplication.save();

      // Add application to job's applications array
      job.applications.push(application._id);
      await job.save();

      res.json(application);
    } catch (err) {
      console.error("Application submission error:", err);

      // Clean up uploaded file if there's an error
      if (req.file) {
        try {
          fs.unlinkSync(req.file.path);
        } catch (unlinkErr) {
          console.error("Error cleaning up file:", unlinkErr);
        }
      }

      if (err.name === "ValidationError") {
        return res.status(400).json({
          success: false,
          msg: "Validation error",
          errors: Object.values(err.errors).map((e) => e.message),
        });
      }

      if (err.kind === "ObjectId") {
        return res.status(404).json({ msg: "Job not found" });
      }

      res.status(500).json({
        success: false,
        msg: "Error submitting application",
        error: err.message,
      });
    }
  }
);

// @route   PUT api/applications/:id
// @desc    Update application status
// @access  Private (Employer)
router.put("/:id", auth, async (req, res) => {
  try {
    const application = await Application.findById(req.params.id).populate("job");

    if (!application) {
      return res.status(404).json({ msg: "Application not found" });
    }

    // Check if user is the employer
    if (application.job.employer.toString() !== req.user.id) {
      return res.status(401).json({ msg: "Not authorized" });
    }

    const updatedApplication = await Application.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          status: req.body.status,
          notes: req.body.notes,
        },
      },
      { new: true }
    );

    res.json(updatedApplication);
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "Application not found" });
    }
    res.status(500).send("Server Error");
  }
});

// @route   PATCH api/applications/:id
// @desc    Update application status
// @access  Private (Employer)
router.patch("/:id", auth, async (req, res) => {
  try {
    console.log("Updating application status:", {
      applicationId: req.params.id,
      newStatus: req.body.status,
      userId: req.user.id,
    });

    const application = await Application.findById(req.params.id);

    if (!application) {
      console.log("Application not found:", req.params.id);
      return res.status(404).json({ msg: "Application not found" });
    }

    // Get the job to check if the user is the employer
    const job = await Job.findById(application.job);

    if (!job) {
      console.log("Job not found for application:", application.job);
      return res.status(404).json({ msg: "Job not found" });
    }

    // Check if the user is the employer who posted the job
    if (job.employer.toString() !== req.user.id) {
      console.log("Unauthorized access attempt:", {
        jobEmployer: job.employer.toString(),
        userId: req.user.id,
      });
      return res.status(403).json({ msg: "Not authorized to update this application" });
    }

    // Validate the status
    const validStatuses = ["pending", "reviewed", "shortlisted", "rejected", "accepted"];
    if (!validStatuses.includes(req.body.status)) {
      console.log("Invalid status provided:", req.body.status);
      return res.status(400).json({ msg: "Invalid status provided" });
    }

    // Update the application status
    application.status = req.body.status;
    await application.save();

    console.log("Application status updated successfully:", {
      applicationId: application._id,
      newStatus: application.status,
    });

    res.json(application);
  } catch (err) {
    console.error("Error updating application status:", err);
    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "Application not found" });
    }
    res.status(500).json({ msg: "Server error" });
  }
});

// @route   DELETE api/applications/:id
// @desc    Delete an application
// @access  Private (Employer)
router.delete("/:id", auth, async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({ msg: "Application not found" });
    }

    // Check if user is the employer
    if (application.job.employer.toString() !== req.user.id) {
      return res.status(401).json({ msg: "Not authorized" });
    }

    // Delete the resume file
    const filePath = path.join(__dirname, "..", application.resume);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await application.remove();

    // Remove application from job's applications array
    const job = await Job.findById(application.job);
    job.applications = job.applications.filter((applicationId) => applicationId.toString() !== req.params.id);
    await job.save();

    res.json({ msg: "Application removed" });
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "Application not found" });
    }
    res.status(500).send("Server Error");
  }
});

module.exports = router;

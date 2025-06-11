const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const auth = require("../middleware/auth");
const Job = require("../models/Job");
const User = require("../models/User");
const Application = require("../models/Application");
const axios = require("axios");

// @route   POST api/jobs
// @desc    Create a job posting
// @access  Private (Employer only)
router.post(
  "/",
  [
    auth,
    [
      check("title", "Title is required").not().isEmpty(),
      check("company", "Company name is required").not().isEmpty(),
      check("location", "Location is required").not().isEmpty(),
      check("type", "Job type is required").isIn(["Full-time", "Part-time", "Contract", "Internship"]),
      check("description", "Description is required").not().isEmpty(),
      check("requirements", "Requirements are required").isArray({ min: 1 }),
      check("salary", "Salary information is required").not().isEmpty(),
    ],
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array().map((err) => ({
            field: err.param,
            message: err.msg,
          })),
        });
      }

      // Check if user is an employer
      const user = await User.findById(req.user.id);
      if (user.role !== "employer") {
        return res.status(403).json({
          success: false,
          message: "Only employers can create job postings",
        });
      }

      const { title, company, location, type, description, requirements, salary } = req.body;

      const newJob = new Job({
        title,
        company,
        location,
        type,
        description,
        requirements,
        salary,
        employer: req.user.id,
      });

      const job = await newJob.save();

      res.status(201).json({
        success: true,
        message: "Job posting created successfully",
        job,
      });
    } catch (err) {
      console.error("Error creating job:", err.message);
      res.status(500).json({
        success: false,
        message: "Server error while creating job posting",
      });
    }
  }
);

// @route   GET api/jobs
// @desc    Get all jobs
// @access  Public
router.get("/", async (req, res) => {
  try {
    const jobs = await Job.find({ status: "active" })
      .sort({ createdAt: -1 })
      .populate("employer", "name email company");

    res.json({
      success: true,
      message: "Jobs retrieved successfully",
      jobs,
    });
  } catch (err) {
    console.error("Error fetching jobs:", err.message);
    res.status(500).json({
      success: false,
      message: "Server error while fetching jobs",
    });
  }
});

// @route   GET api/jobs/employer
// @desc    Get all jobs posted by the employer
// @access  Private (Employer only)
router.get("/employer", auth, async (req, res) => {
  try {
    const jobs = await Job.find({ employer: req.user.id }).sort({ createdAt: -1 }).populate("applications");

    res.json({
      success: true,
      message: "Employer jobs retrieved successfully",
      jobs,
    });
  } catch (err) {
    console.error("Error fetching employer jobs:", err.message);
    res.status(500).json({
      success: false,
      message: "Server error while fetching employer jobs",
    });
  }
});

// @route   GET api/jobs/:id
// @desc    Get job by ID
// @access  Public
router.get("/:id", async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate("employer", "name email company").populate("applications");

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    res.json({
      success: true,
      message: "Job retrieved successfully",
      job,
    });
  } catch (err) {
    console.error("Error fetching job:", err.message);
    if (err.kind === "ObjectId") {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }
    res.status(500).json({
      success: false,
      message: "Server error while fetching job",
    });
  }
});

// @route   GET api/jobs/:id/applications
// @desc    Get all applications for a specific job
// @access  Private (Employer)
router.get("/:id/applications", auth, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ msg: "Job not found" });
    }

    // Check if the user is the employer who posted the job
    if (job.employer.toString() !== req.user.id) {
      return res.status(403).json({ msg: "Not authorized to view these applications" });
    }

    const applications = await Application.find({ job: req.params.id })
      .populate("candidate", "name email phone")
      .sort({ createdAt: -1 });

    res.json(applications);
  } catch (err) {
    console.error(err);
    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "Job not found" });
    }
    res.status(500).json({ msg: "Server error" });
  }
});

// @route   PUT api/jobs/:id
// @desc    Update a job posting
// @access  Private (Employer only)
router.put(
  "/:id",
  [
    auth,
    [
      check("title", "Title is required").not().isEmpty(),
      check("company", "Company is required").not().isEmpty(),
      check("location", "Location is required").not().isEmpty(),
      check("type", "Type is required").not().isEmpty(),
      check("description", "Description is required").not().isEmpty(),
      check("requirements", "Requirements are required").isArray(),
    ],
  ],
  async (req, res) => {
    try {
      console.log("Update job request received:", {
        jobId: req.params.id,
        userId: req.user.id,
        body: req.body,
      });

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        console.log("Validation errors:", errors.array());
        return res.status(400).json({ errors: errors.array() });
      }

      const job = await Job.findById(req.params.id);
      if (!job) {
        console.log("Job not found:", req.params.id);
        return res.status(404).json({ message: "Job not found" });
      }

      // Check if user is the employer who posted the job
      if (job.employer.toString() !== req.user.id) {
        console.log("Unauthorized access attempt:", {
          jobOwner: job.employer.toString(),
          requestingUser: req.user.id,
        });
        return res.status(403).json({ message: "Not authorized" });
      }

      const { title, company, location, type, description, requirements, salary } = req.body;

      // Validate salary object if provided
      if (salary) {
        if (salary.min && isNaN(salary.min)) {
          return res.status(400).json({ message: "Invalid minimum salary" });
        }
        if (salary.max && isNaN(salary.max)) {
          return res.status(400).json({ message: "Invalid maximum salary" });
        }
        if (salary.currency && typeof salary.currency !== "string") {
          return res.status(400).json({ message: "Invalid currency" });
        }
      }

      // Update job fields
      const updateData = {
        title,
        company,
        location,
        type,
        description,
        requirements,
        salary,
        updatedAt: Date.now(),
      };

      console.log("Updating job with data:", updateData);

      const updatedJob = await Job.findByIdAndUpdate(
        req.params.id,
        { $set: updateData },
        {
          new: true,
          runValidators: true,
          context: "query",
        }
      );

      if (!updatedJob) {
        console.log("Job update failed - job not found after update");
        return res.status(404).json({ message: "Job not found" });
      }

      console.log("Job updated successfully:", updatedJob._id);
      res.json({ job: updatedJob });
    } catch (err) {
      console.error("Error updating job:", {
        error: err.message,
        stack: err.stack,
        jobId: req.params.id,
      });

      if (err.name === "ValidationError") {
        return res.status(400).json({
          message: "Validation error",
          errors: Object.values(err.errors).map((e) => e.message),
        });
      }

      res.status(500).json({
        message: "Server error while updating job",
        error: process.env.NODE_ENV === "development" ? err.message : undefined,
      });
    }
  }
);

// @route   DELETE api/jobs/:id
// @desc    Delete a job posting
// @access  Private (Employer only)
router.delete("/:id", auth, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    // Check if user is the employer who created the job
    if (job.employer.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this job posting",
      });
    }

    await job.remove();

    res.json({
      success: true,
      message: "Job posting deleted successfully",
    });
  } catch (err) {
    console.error("Error deleting job:", err.message);
    if (err.kind === "ObjectId") {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }
    res.status(500).json({
      success: false,
      message: "Server error while deleting job posting",
    });
  }
});

// @route   GET api/jobs/linkedin
// @desc    Get LinkedIn job listings
// @access  Public
router.get("/linkedin", async (req, res) => {
  try {
    // LinkedIn API configuration
    const LINKEDIN_API_KEY = process.env.LINKEDIN_API_KEY;
    const LINKEDIN_API_URL = "https://api.linkedin.com/v2/jobs";

    if (!LINKEDIN_API_KEY) {
      return res.status(500).json({
        success: false,
        message: "LinkedIn API key not configured",
      });
    }

    // Make request to LinkedIn API
    const response = await axios.get(LINKEDIN_API_URL, {
      headers: {
        Authorization: `Bearer ${LINKEDIN_API_KEY}`,
        "Content-Type": "application/json",
      },
      params: {
        keywords: req.query.keywords || "",
        location: req.query.location || "",
        start: 0,
        count: 10,
      },
    });

    // Transform LinkedIn response to match our format
    const jobs = response.data.elements.map((job) => ({
      id: job.id,
      title: job.title,
      company: job.company.name,
      location: job.location.name,
      type: job.employmentStatus,
      salary: job.salary
        ? {
            min: job.salary.min,
            max: job.salary.max,
            currency: job.salary.currency,
          }
        : undefined,
      description: job.description,
      requirements: job.requirements || [],
      applyUrl: job.applyUrl,
    }));

    res.json({
      success: true,
      message: "LinkedIn jobs retrieved successfully",
      jobs,
    });
  } catch (err) {
    console.error("Error fetching LinkedIn jobs:", err.message);
    res.status(500).json({
      success: false,
      message: "Server error while fetching LinkedIn jobs",
    });
  }
});

module.exports = router;

const Company = require("../models/Company");
const ActivityLog = require("../models/ActivityLog");

/* ===============================
    GET ALL COMPANIES
================================ */
exports.getAllCompanies = async (req, res) => {
  try {
    const companies = await Company.find().sort({ createdAt: -1 });
    res.json(companies);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch companies" });
  }
};

/* ===============================
    ADD COMPANY
================================ */
exports.createCompany = async (req, res) => {
  try {
    // ✅ Destructuring strictly matching your Model fields
    const { name, logo, website, courses, location } = req.body;

    const adminEmail = req.user?.email || "Unknown Admin";
    const adminId = req.user?.id;

    const exists = await Company.findOne({ name });
    if (exists) return res.status(400).json({ message: "Company already exists" });

    const company = await Company.create({
      name,
      logo: logo || "", // Fallback empty string for frontend initials logic
      website: website || "",
      courses: courses || [],
      location: location || "",
      status: "Active",
      updatedBy: adminId
    });

    await ActivityLog.create({
      adminId,
      adminEmail,
      adminName: req.user?.name,
      type: "COMPANY",
      action: "ADD_COMPANY",
      details: `Added new partner: ${name} with logo data asset.`
    });

    res.status(201).json({
      message: "Company added successfully",
      company
    });

  } catch (err) {
    res.status(500).json({ message: "Failed to create company" });
  }
};

/* ===============================
    UPDATE COMPANY (Logo & Status Sync)
================================ */
exports.updateCompany = async (req, res) => {
  try {
    const { id } = req.params;

    const adminEmail = req.user?.email || "Unknown Admin";
    const adminId = req.user?.id;

    const oldCompany = await Company.findById(id);
    if (!oldCompany)
      return res.status(404).json({ message: "Company not found" });

    const updateData = {
      ...req.body,
      updatedBy: adminId
    };

    const company = await Company.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    let message = `Updated details for: ${company.name}`;

    if (req.body.status && oldCompany.status !== req.body.status) {
      message = `Engagement Status of ${company.name} changed to ${req.body.status}`;
    }

    await ActivityLog.create({
      adminId,
      adminEmail,
      adminName: req.user?.name,
      type: "COMPANY",
      action: "UPDATE_COMPANY",
      details: message
    });

    res.json({
      message,
      company
    });

  } catch (err) {
    res.status(500).json({ message: "Failed to update company" });
  }
};

/* ===============================
    DELETE DISABLED
================================ */
exports.deleteCompany = async (req, res) => {
  return res.status(403).json({
    message: "Company deletion is strictly disabled. Toggle status instead."
  });
};
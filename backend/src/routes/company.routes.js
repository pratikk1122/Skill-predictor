const express = require("express");
const router = express.Router();

const {
  getAllCompanies,
  createCompany,
  updateCompany,
  deleteCompany
} = require("../controllers/company.controller");


/* ===============================
    GET ALL
================================ */
router.get("/", getAllCompanies);


/* ===============================
    CREATE
================================ */
router.post("/", createCompany);


/* ===============================
    UPDATE (FULL DETAILS)
================================ */
router.put("/:id", updateCompany);


/* ===============================
    STATUS TOGGLE (PROFESSIONAL)
    Only Active / Inactive change
================================ */
router.patch("/:id/status", updateCompany);


/* ===============================
    DELETE (DISABLED - Requirement)
================================ */
router.delete("/:id", deleteCompany);


module.exports = router;

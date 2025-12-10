const express = require("express");
const router = express.Router();

router.get("/dashboard", (req, res) => {
  res.render("admin/admin_dashboard", { title: "Admin Panel" });
});

module.exports = router;

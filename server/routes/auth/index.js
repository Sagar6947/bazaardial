const express = require("express");
const router = express.Router();

router.use("/", require("./register"));
router.use("/", require("./testOtp"));
router.use("/", require("./login"));
router.use("/", require("./verify"));
router.use("/", require("./password"));
+router.use("/", require("./username")); // 👈 add this line

module.exports = router;

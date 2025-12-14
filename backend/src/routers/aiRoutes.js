const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const aiCtrl = require("../controllers/aiController");

router.post("/generate", auth, aiCtrl.generateContent);
router.get("/models", aiCtrl.listModels); // Debug endpoint to check available models

module.exports = router;

const express = require("express");
const axios = require("axios");

const app = express();

// 🔥 Apify API (تحتاج توكن من حسابك)
const APIFY_TOKEN = process.env.APIFY_TOKEN;

app.get("/status", async (req, res) => {
  const caseId = req.query.case;

  if (!caseId) {
    return res.json({ error: "missing_case" });
  }

  try {
    const response = await axios.post(
      `https://api.apify.com/v2/acts/username~uscis-scraper/run-sync-get-dataset-items?token=${APIFY_TOKEN}`,
      {
        caseNumber: caseId
      }
    );

    const data = response.data?.[0];

    res.json({
      case_id: caseId,
      status: data?.status || "UNKNOWN",
      description: data?.description || "",
      source: "Apify",
      checked_at: new Date().toISOString()
    });

  } catch (e) {
    res.json({
      error: "failed",
      message: e.message
    });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log("API running on port", port);
});

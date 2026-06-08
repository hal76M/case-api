const express = require("express");
const axios = require("axios");

const app = express();

async function getStatus(caseId) {
  const url = `https://egov.uscis.gov/casestatus/mycasestatus.do?appReceiptNum=${caseId}`;

  const res = await axios.get(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120",
      "Accept": "text/html,application/xhtml+xml",
      "Referer": "https://egov.uscis.gov/"
    },
    timeout: 15000
  });

  const status = res.data.match(/<h1>(.*?)<\/h1>/)?.[1] || "UNKNOWN";
  const desc = res.data.match(/<p class="text-center">(.*?)<\/p>/s)?.[1] || "";

  return { status, description: desc };
}

app.get("/status", async (req, res) => {
  const caseId = req.query.case;

  if (!caseId) {
    return res.json({ error: "missing_case" });
  }

  try {
    const data = await getStatus(caseId);

    res.json({
      case_id: caseId,
      source: "USCIS",
      status: data.status,
      description: data.description,
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

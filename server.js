import express from "express";
import axios from "axios";

const app = express();

async function fetchStatus(caseId) {
  try {
    const res = await axios.get(
      "https://egov.uscis.gov/casestatus/mycasestatus.do",
      {
        params: {
          appReceiptNum: caseId
        },
        timeout: 15000,
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/125.0 Safari/537.36"
        }
      }
    );

    console.log("===== USCIS RESPONSE START =====");
    console.log(String(res.data).substring(0, 5000));
    console.log("===== USCIS RESPONSE END =====");

    return {
      debug: true
    };
  } catch (e) {
    console.log("ERROR:", e.message);

    return {
      error: e.message
    };
  }
}

app.get("/", (req, res) => {
  res.json({
    status: "API running"
  });
});

app.get("/status", async (req, res) => {
  const caseId = req.query.case;

  if (!caseId) {
    return res.json({
      error: "missing_case"
    });
  }

  const result = await fetchStatus(caseId);

  res.json({
    case_id: caseId,
    result
  });
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`API running on port ${port}`);
});

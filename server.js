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
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0 Safari/537.36",
          "Accept":
            "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.9",
          "Referer":
            "https://egov.uscis.gov/casestatus/landing.do"
        }
      }
    );

    const html = String(res.data);

    console.log("===== USCIS RESPONSE START =====");
    console.log(html.substring(0, 5000));
    console.log("===== USCIS RESPONSE END =====");

    const titleMatch = html.match(/<h1[^>]*>(.*?)<\/h1>/is);
    const bodyMatch = html.match(/<p[^>]*>(.*?)<\/p>/is);

    const status = titleMatch
      ? titleMatch[1].replace(/<[^>]+>/g, "").trim()
      : null;

    const details = bodyMatch
      ? bodyMatch[1].replace(/<[^>]+>/g, "").trim()
      : null;

    return {
      status,
      details
    };
  } catch (e) {
    console.log("===== USCIS ERROR =====");
    console.log("MESSAGE:", e.message);
    console.log("STATUS:", e.response?.status);

    if (e.response?.data) {
      console.log(
        String(e.response.data).substring(0, 5000)
      );
    }

    console.log("===== END ERROR =====");

    return {
      error: e.message,
      status: e.response?.status || null
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

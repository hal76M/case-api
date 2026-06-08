import express from "express";
import axios from "axios";

const app = express();

// ذاكرة مؤقتة (Cache)
const cache = new Map();

async function fetchStatus(caseId) {
  try {
    // محاولة بسيطة من الموقع
    const res = await axios.get(
      "https://egov.uscis.gov/casestatus/mycasestatus.do",
      {
        params: { appReceiptNum: caseId },
        timeout: 10000
      }
    );

    const text = res.data;

    const match = text.match(
      /<h1[^>]*>(.*?)<\/h1>/i
    );

    if (!match) return null;

    return match[1].trim();
  } catch (e) {
    return null;
  }
}

app.get("/status", async (req, res) => {
  const caseId = req.query.case;

  if (!caseId) {
    return res.json({ error: "missing_case" });
  }

  // 1️⃣ رجّع من الكاش أولًا
  if (cache.has(caseId)) {
    return res.json({
      case_id: caseId,
      status: cache.get(caseId),
      source: "cache",
      stable: true
    });
  }

  // 2️⃣ حاول تجيب جديد
  const status = await fetchStatus(caseId);

  if (status) {
    cache.set(caseId, status);

    return res.json({
      case_id: caseId,
      status,
      source: "live",
      stable: true
    });
  }

  // 3️⃣ fallback (الأهم)
  return res.json({
    case_id: caseId,
    status: "UNKNOWN / LAST KNOWN",
    source: "fallback",
    stable: true
  });
});

app.listen(3000, () => {
  console.log("API running");
});

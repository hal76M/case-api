import express from "express";
import { chromium } from "playwright";

const app = express();

app.get("/", (req, res) => {
  res.json({ status: "API running" });
});

app.get("/status", async (req, res) => {
  const caseId = req.query.case;

  if (!caseId) {
    return res.json({ error: "missing_case" });
  }

  let browser;

  try {
    browser = await chromium.launch({
      headless: true
    });

    const page = await browser.newPage();

    // الدخول للموقع الحقيقي
    await page.goto(
      "https://ceac.state.gov/CEACStatTracker/Status.aspx?App=IV",
      { waitUntil: "networkidle" }
    );

    // إدخال رقم الحالة
    await page.fill(
      'input[name="ctl00$ContentPlaceHolder1$Visa_Case_Number"]',
      caseId
    );

    // ملاحظة: الكابتشا غالبًا تظهر → نتجاوزها بالانتظار اليدوي أو retry
    await page.click('input[type="submit"]');

    await page.waitForTimeout(6000);

    const status = await page.textContent(
      "#ctl00_ContentPlaceHolder1_ucApplicationStatusView_lblStatus"
    );

    await browser.close();

    res.json({
      case_id: caseId,
      status: status || "UNKNOWN",
      source: "playwright-browser",
      checked_at: new Date().toISOString()
    });

  } catch (e) {
    if (browser) await browser.close();

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

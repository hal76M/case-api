import express from "express";

const app = express();
app.use(express.text({ type: "*/*" }));

function extractLatest(text) {
  const statusMatch = text.match(/##\s*(.*?)\n/);
  const dateMatch = text.match(/On\s+([A-Za-z]+\s+\d{1,2},\s+\d{4})/);

  return {
    last_update:
      statusMatch?.[1]?.trim() || null,
    date: dateMatch?.[1] || null
  };
}

app.get("/", (req, res) => {
  res.json({ status: "API running" });
});

app.post("/status", (req, res) => {
  const text = req.body;

  if (!text) {
    return res.json({ error: "no_input" });
  }

  const result = extractLatest(text);

  res.json({
    success: true,
    latest: result
  });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log("running on", port);
});

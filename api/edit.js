import fetch from "node-fetch";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  const { oldValue, newValue } = req.body;

  if (!oldValue || !newValue) {
    return res.status(400).json({ success: false, message: "Invalid data" });
  }

  try {
    const resp = await fetch(
      `https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: process.env.ADMIN_ID,
          text: `✏️ ویرایش آیتم\nقدیم: ${oldValue}\nجدید: ${newValue}`
        })
      }
    );

    if (resp.ok) {
      res.status(200).json({ success: true });
    } else {
      res.status(500).json({ success: false, message: "Telegram API error" });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
}

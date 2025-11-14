// api/message.js
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }

  // Vercel এ JSON body parse হয়ে আসে
  const data = req.body || {};
  const sender = data.sender || "Friend";
  const message = data.message || "";

  // -------------------------------
  // এখানে তোমার auto-reply message গুলো রাখো
  // -------------------------------
  const replies = [
    `🔥𝗦𝗢𝗖𝗜𝗔𝗟 𝗠𝗘𝗗𝗜𝗔 𝗔𝗚𝗘𝗡𝗖𝗬

🎆𝟴𝟬% 𝗢𝗙𝗙

♻️𝗦𝗨𝗕𝗦𝗖𝗥𝗜𝗕𝗘 & 𝗙𝗢𝗟𝗟𝗢𝗪𝗘𝗥𝗦

🛒𝗙𝗥𝗘𝗘 & 𝗙𝗥𝗘𝗘 & 𝗙𝗥𝗘𝗘

💯 𝗪𝗢𝗥𝗞𝗜𝗡𝗚 𝗪𝗘𝗕𝗦𝗜𝗧𝗘

𝗟𝗜𝗡𝗞:- ➡️➡️ https://subscribe-followers-buy-web.edgeone.app/

⚠️𝗙𝗥𝗘𝗘 𝗦𝗨𝗕𝗦𝗖𝗥𝗜𝗕𝗘 & 𝗙𝗢𝗟𝗟𝗢𝗪𝗘𝗥𝗦

⬆️𝗧𝗵𝗮𝗻𝗸𝘀⬆️`
  ];

  // -------------------------------
  // 5 second wait before reply
  // -------------------------------
  await new Promise((resolve) => setTimeout(resolve, 5000));

  // -------------------------------
  // Random reply choose (within 2 seconds wait)
  // -------------------------------
  const waitTime = Math.floor(Math.random() * 2000); // 0–2000ms random delay
  await new Promise((resolve) => setTimeout(resolve, waitTime));

  const randomReply = replies[Math.floor(Math.random() * replies.length)];

  // -------------------------------
  // Send selected reply
  // -------------------------------
  res.status(200).json({ reply: randomReply });
}

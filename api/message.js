// api/message.js
export default function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }

  // Vercel এ JSON body parse হয়ে আসে
  const data = req.body || {};
  const sender = data.sender || "Friend";
  const message = data.message || "";

  // -------------------------------
  // এখানে তোমার auto-reply message দিন
  // (তুমি চাইলে এটাকে কাস্টমাইজ করতে পারবে)
  // -------------------------------
  const replyText = `🔥𝗦𝗢𝗖𝗜𝗔𝗟 𝗠𝗘𝗗𝗜𝗔 𝗔𝗚𝗘𝗡𝗖𝗬\n\n🎆𝟴𝟬% 𝗢𝗙𝗙\n\n♻️𝗦𝗨𝗕𝗦𝗖𝗥𝗜𝗕𝗘 & 𝗙𝗢𝗟𝗟𝗢𝗪𝗘𝗥𝗦\n\n🛒𝗙𝗥𝗘𝗘 & 𝗙𝗥𝗘𝗘 & 𝗙𝗥𝗘𝗘\n\n💯 𝗪𝗢𝗥𝗞𝗜𝗡𝗚 𝗪𝗘𝗕𝗦𝗜𝗧𝗘\n\n𝗟𝗜𝗡𝗞:- ➡️➡️ https://subscribe-followers-buy-web.edgeone.app/\n\n⚠️𝗙𝗥𝗘𝗘 𝗦𝗨𝗕𝗦𝗖𝗥𝗜𝗕𝗘 & 𝗙𝗥𝗘𝗡𝗗𝗦\n\n⬆️Thanks⬆️`;

  // Respond with JSON that AutoResponder expects.
  // নিশ্চিত হয়ে নাও যে তোমার AutoReply অ্যাপ JSON এর "reply" key পড়ে reply পাঠায়।
  res.status(200).json({ reply: replyText });
}

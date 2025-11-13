// server.js
// Node.js + Express persistent server approach
// Run on a single persistent host (VPS / Railway / Render). NOT reliable on Vercel serverless.

const express = require("express");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());

// ---- Configurable reply text ----
const AUTO_REPLY_TEXT = `🔥𝗦𝗢𝗖𝗜𝗔𝗟 𝗠𝗘𝗗𝗜𝗔 𝗔𝗚𝗘𝗡𝗖𝗬\n\n🎆𝟴𝟬% 𝗢𝗙𝗙\n\n♻️𝗦𝗨𝗕𝗦𝗖𝗥𝗜𝗕𝗘 & 𝗙𝗢𝗟𝗟𝗢𝗪𝗘𝗥𝗦\n\n🛒𝗙𝗥𝗘𝗘 & 𝗙𝗥𝗘𝗘 & 𝗙𝗥𝗘𝗘\n\n💯 𝗪𝗢𝗥𝗞𝗜𝗡𝗚 𝗪𝗘𝗕𝗦𝗜𝗧𝗘\n\n𝗟𝗜𝗡𝗞:- ➡️➡️ https://subscribe-followers-buy-web.edgeone.app/\n\n⚠️𝗙𝗥𝗘𝗘 𝗦𝗨𝗕𝗦𝗖𝗥𝗜𝗕𝗘 & 𝗙𝗥𝗘𝗡𝗗𝗦\n\n⬆️Thanks⬆️`;
// ----------------------------------

// State (in-memory) — works only while this process is alive
let windowOpen = false;            // 2s grouping window open/close
let windowMessages = [];           // store incoming messages during window
let replyScheduled = false;        // is a reply scheduled to be sent?
let scheduledTimer = null;         // timer id for 5s delay
let windowTimer = null;            // timer id for 2s window

// Helper: schedule sending reply for the chosen message
function scheduleReplyFor(msg, resToReply) {
  // If a reply already scheduled, do not schedule another
  if (replyScheduled) return;

  replyScheduled = true;

  // send after 5 seconds
  scheduledTimer = setTimeout(() => {
    // respond (HTTP) if we are holding a response object
    // If resToReply is provided (we kept the HTTP request open), reply with the JSON
    try {
      if (resToReply && !resToReply.headersSent) {
        resToReply.status(200).json({ reply: AUTO_REPLY_TEXT });
      }
    } catch (e) {
      // ignore
      console.error("Failed to respond to held request:", e);
    }

    // reset state
    replyScheduled = false;
    scheduledTimer = null;
    windowMessages = [];
  }, 5000);
}

// Endpoint - client (AutoReply app) POSTs here and expects JSON { reply: "..." } sometimes
app.post("/api/message", (req, res) => {
  const data = req.body || {};
  const incoming = {
    sender: data.sender || data.from || "unknown",
    message: data.message || data.text || "",
    receivedAt: Date.now(),
    resRef: null
  };

  // If window not open -> open it and start 2s window timer.
  if (!windowOpen) {
    windowOpen = true;
    windowMessages = [incoming];

    // We will collect messages for 2 seconds. After 2s pick one (latest).
    windowTimer = setTimeout(() => {
      windowOpen = false;
      windowTimer = null;

      // pick the last message in the window
      const chosen = windowMessages[windowMessages.length - 1];

      // Strategy: we will reply to the request that belongs to the chosen message if we still have it.
      // If the chosen message's request hasn't been held, we will still send reply by responding immediately
      // to whoever we can (we return 204 for others).
      // For simplicity, we'll hold the chosen message's HTTP response if that request is still active.
      // But Express will have given us 'res' for the current request only. To support holding, we attach resRef when eligible.

      // If the chosen message already has a stored resRef (we saved it), use it; else if current request
      // is the last one, hold it by saving its res on chosen, otherwise reply later by not using resRef.
      // Implementation detail: when each request arrives, we check if it's the chosen later.

      // If chosen has a response reference (resRef), schedule reply for that response
      if (chosen.resRef) {
        scheduleReplyFor(chosen, chosen.resRef);
      } else {
        // No held response to reply to (maybe clients didn't wait). Still schedule reply (no http reply)
        scheduleReplyFor(chosen, null);
      }

      // For any other messages in the window, respond immediately with 204 (no reply)
      windowMessages.forEach((m) => {
        if (m !== chosen && m.resRef && !m.resRef.headersSent) {
          m.resRef.status(204).send(); // no reply
        }
      });

    }, 2000);

    // For the current request, attempt to hold the response until we know whether this request is the chosen one.
    // We'll save res in the message record and only reply later for the chosen one.
    incoming.resRef = res;

    // Save updated message
    windowMessages[0] = incoming;

    // Note: we DON'T immediately send response. We keep it open to possibly reply after 5s.
    // But to avoid very long open connections from many clients, we'll set a safety timeout to close after 10s.
    res.setTimeout(10000, () => {
      try { if (!res.headersSent) res.status(204).send(); } catch(e) {}
    });
  } else {
    // Window open: just append the incoming message to windowMessages
    incoming.resRef = res;
    windowMessages.push(incoming);

    // We will not immediately respond here; the windowTimer will choose the last message
    // to reply. But to avoid many long-open requests, set safety timeout for this res as well.
    res.setTimeout(10000, () => {
      try { if (!res.headersSent) res.status(204).send(); } catch(e) {}
    });
  }
});

// For GET (status check)
app.get("/api/message", (req, res) => {
  res.json({ message: "Auto Reply Server (persistent) running ✅" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server listening on port", PORT));

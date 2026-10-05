const crypto = require("crypto");

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const secret = process.env.PAYSTACK_SECRET_KEY;

  if (!secret) {
    return res.status(500).json({
      error: "Paystack secret key is not configured"
    });
  }

  try {
    const signature = req.headers["x-paystack-signature"];
    const body = JSON.stringify(req.body || {});

    const hash = crypto
      .createHmac("sha512", secret)
      .update(body)
      .digest("hex");

    if (hash !== signature) {
      return res.status(401).json({
        error: "Invalid Paystack signature"
      });
    }

    const event = req.body;

    if (event.event === "charge.success") {
      console.log("Paystack payment successful:", event.data.reference);
    }

    return res.status(200).json({
      received: true
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: "Webhook processing failed"
    });
  }
};

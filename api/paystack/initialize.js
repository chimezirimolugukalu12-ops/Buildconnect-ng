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

  const { email, jobId } = req.body || {};

  if (!email) {
    return res.status(400).json({
      error: "Email is required"
    });
  }

  try {
    const reference =
      "BC_FEATURED_" +
      Date.now() +
      "_" +
      Math.random().toString(36).slice(2, 8);

    const response = await fetch(
      "https://api.paystack.co/transaction/initialize",
      {
        method: "POST",
        headers: {
          Authorization: "Bearer " + secret,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: email,
          amount: "500000",
          currency: "NGN",
          reference: reference,
          callback_url:
            "https://" +
            req.headers.host +
            "/api/paystack/verify",
          metadata: {
            product: "Featured Job - 7 days",
            job_id: jobId || null
          }
        })
      }
    );

    const data = await response.json();

    if (!response.ok || !data.status) {
      return res.status(502).json({
        error: data.message || "Paystack initialization failed"
      });
    }

    return res.status(200).json({
      authorization_url: data.data.authorization_url,
      reference: data.data.reference
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: "Payment initialization failed"
    });
  }
};

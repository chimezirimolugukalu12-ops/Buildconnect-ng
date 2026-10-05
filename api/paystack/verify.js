module.exports = async (req, res) => {
  if (req.method !== "GET") {
    return res.status(405).send("Method not allowed");
  }

  const secret = process.env.PAYSTACK_SECRET_KEY;

  if (!secret) {
    return res.status(500).send("Paystack secret key is not configured");
  }

  const reference = req.query && req.query.reference;

  if (!reference) {
    return res.status(400).send("Payment reference is missing");
  }

  try {
    const response = await fetch(
      "https://api.paystack.co/transaction/verify/" +
      encodeURIComponent(reference),
      {
        headers: {
          Authorization: "Bearer " + secret
        }
      }
    );

    const data = await response.json();
    const payment = data.data;

    const successful =
      response.ok &&
      data.status === true &&
      payment &&
      payment.status === "success" &&
      Number(payment.amount) === 500000 &&
      payment.currency === "NGN";

    if (successful) {
      return res.redirect(
        303,
        "/?payment=success&reference=" +
        encodeURIComponent(reference)
      );
    }

    return res.redirect(
      303,
      "/?payment=failed&reference=" +
      encodeURIComponent(reference)
    );

  } catch (error) {
    console.error(error);
    return res.status(500).send("Payment verification failed");
  }
};

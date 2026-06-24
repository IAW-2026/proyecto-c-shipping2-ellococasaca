type ReleasePaymentPayload = {
  charge_id: string;
  status: "approved" | "rejected";
};

const PAYMENTS_API_URL =
  process.env.PAYMENTS_API_URL ??
  "https://proyecto-c-payments2-ellococasaca.vercel.app";


export async function releasePayment(payload: ReleasePaymentPayload) {
  const url = `${PAYMENTS_API_URL}/api/payout`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      console.error(
        `[PAYMENTS] releasePayment fallo con status ${response.status}: ${errorText}`
      );
      return { ok: false, status: response.status };
    }

    console.log(
      `[PAYMENTS] releasePayment OK — chargeId: ${payload.charge_id}, status: ${payload.status}`
    );
    return { ok: true };
  } catch (error) {
    console.error("[PAYMENTS] releasePayment lanzo excepcion:", error);
    return { ok: false, error: String(error) };
  }
}
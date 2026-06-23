type EnableReviewPayload = {
  orderId: string;
  shipmentId: string;
  buyerId: string;
  sellerId: string;
  productIds: string[];
  deliveredAt: string;
};

type EnableReviewSuccessResponse = {
  orderId: string;
  reviewEnabled: boolean;
  message: string;
};

const FEEDBACK_API_URL =
  process.env.FEEDBACK_API_URL ??
  "https://proyecto-web-feedback-ellococasaca.vercel.app";

export async function enableReview(payload: EnableReviewPayload) {
  const url = `${FEEDBACK_API_URL}/api/reviews/enable`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      console.error(
        `[FEEDBACK] enableReview falló con status ${response.status}: ${errorText}`
      );
      return { ok: false, status: response.status };
    }

    const data = (await response.json()) as EnableReviewSuccessResponse;
    console.log(
      `[FEEDBACK] enableReview OK — orderId: ${data.orderId}, reviewEnabled: ${data.reviewEnabled}`
    );
    return { ok: true, data };
  } catch (error) {
    console.error("[FEEDBACK] enableReview lanzó excepción:", error);
    return { ok: false, error: String(error) };
  }
}
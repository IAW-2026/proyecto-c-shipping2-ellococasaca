const SELLER_API_URL =
  process.env.SELLER_API_URL ??
  "https://proyecto-c-seller-ellococasaca.vercel.app";

type NotifySellerArgs = {
  orderId: string;
  status: string;
};

export async function notifySellerStatus({
  orderId,
  status,
}: NotifySellerArgs) {
  try {
    const res = await fetch(`${SELLER_API_URL}/api/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });

    if (!res.ok) {
      console.error(
        `[SELLER] notifyStatus FALLÓ — orderId: ${orderId}, status: ${res.status}`
      );
      return null;
    }

    console.log(
      `[SELLER] notifyStatus OK — orderId: ${orderId}, status: ${status}`
    );
    return res.json();
  } catch (err) {
    console.error("[SELLER] Error notificando a Seller:", err);
    return null;
  }
}
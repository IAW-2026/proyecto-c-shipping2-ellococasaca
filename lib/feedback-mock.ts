// MOCK de la Feedback App (Etapa 2). En Etapa 3 se reemplaza por un fetch real
// a POST /api/reviews/enable, respetando el mismo contrato.

export interface EnableReviewPayload {
  orderId: string;
  shipmentId: string;
  buyerId: string;
  sellerId: string;
  productIds: string[];
  deliveredAt: string;
}

export async function enableReview(payload: EnableReviewPayload) {
  // Simulamos la llamada HTTP a la Feedback App
  console.log("[MOCK Feedback] POST /api/reviews/enable →", JSON.stringify(payload, null, 2));
  await new Promise((resolve) => setTimeout(resolve, 100)); // latencia simulada

  return {
    orderId: payload.orderId,
    reviewEnabled: true,
    message: "Reseña habilitada (respuesta simulada de Feedback App)",
  };
}
// Helper para validar el secret entre servicios.
export function checkInterServiceSecret(req: Request): boolean {
  const secret = req.headers.get("x-inter-service-secret");
  return secret === process.env.INTER_SERVICE_SECRET;
}
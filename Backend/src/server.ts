export type HealthResponse = {
  status: "ok";
  service: string;
  timestamp: string;
};

export function getHealthResponse(): HealthResponse {
  return {
    status: "ok",
    service: "brandbook-backend",
    timestamp: new Date().toISOString(),
  };
}

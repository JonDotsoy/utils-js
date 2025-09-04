export interface MessagePayload {
  id: string;
  data: object;
  createdAt: number;
  acknowledgedAt?: number | null;
  ttl?: null | number;
}

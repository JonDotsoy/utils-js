import type { MessagePayload } from "./dto/message-payload";
import { typeValidators } from "./type-validators";

export const parseMessage = (data: unknown): MessagePayload | null =>
  typeValidators.isMessage(data) ? data : null;

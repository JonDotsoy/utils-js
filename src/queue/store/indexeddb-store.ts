import type { Message } from '../queue.js';
import { Store } from './store.js';

export class IndexedDBStore extends Store {
    close(): Promise<void> {
        throw new Error('Method not implemented.');
    }
    addMessage(message: Message): Promise<void> {
        throw new Error('Method not implemented.');
    }
    getMessage(messageId: string): Promise<Message | null> {
        throw new Error('Method not implemented.');
    }
    acknowledgeMessage(messageId: string): Promise<void> {
        throw new Error('Method not implemented.');
    }
    deleteMessage(messageId: string): Promise<void> {
        throw new Error('Method not implemented.');
    }
    claimMessage(acknowledgeTimeoutMs: number, now: number, abort?: AbortSignal): Promise<Message | null> {
        throw new Error('Method not implemented.');
    }
    getSize(): Promise<number> {
        throw new Error('Method not implemented.');
    }
}

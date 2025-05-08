type Listener = (...args: any[]) => any
type Handler = () => Promise<any>

class SimpleEvent {
    private listeners = new Set<Listener>()

    get size() { return this.listeners.size }

    emit(...args: any[]) {
        for (const listener of this.listeners) {
            listener(...args)
        }
    }

    addListener(listener: Listener) {
        this.listeners.add(listener)
    }

    removeListener(listener: Listener) {
        this.listeners.delete(listener)
    }
}

class SimpleEventEmitters {
    events = new Map<string, SimpleEvent>()
    private getSimpleEvent(event: string) {
        return this.events.get(event)
    }
    private getSimpleEventOrCreate(event: string) {
        let simpleEvent = this.events.get(event)
        if (!simpleEvent) {
            const newSimpleEvent = new SimpleEvent()
            this.events.set(event, newSimpleEvent)
            simpleEvent = newSimpleEvent;
        }
        return simpleEvent
    }
    emit(event: string, ...args: any[]) {
        this.getSimpleEvent(event)?.emit(...args)
    }

    addListener(event: string, listener: Listener) {
        this.getSimpleEventOrCreate(event).addListener(listener)
    }

    removeListener(event: string, listener: Listener) {
        const simpleEvent = this.getSimpleEvent(event)
        simpleEvent?.removeListener(listener)
        if (simpleEvent && simpleEvent.size === 0)
            this.events.delete(event)
    }
}

export class Tasks<T = any> {
    private events = new SimpleEventEmitters()
    messages = new Set<T>()

    enqueue(message: T) {

    }
}
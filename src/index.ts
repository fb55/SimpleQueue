/**
 * A simple FIFO queue, delivering items in order.
 *
 * Paremeters:
 * `T`: Type that is pushed onto the stack.
 * `R`: Type that the passed `callback` maps to.
 */
export default class SimpleQueue<T, R = void> {
    private readonly queue: T[] = [];
    /** Stores elements that are finished. */
    private stack: {
        [index: number]:
            | [error: Error | null, result: R, element: T]
            | undefined;
    } = {};
    private working = 0;
    private lastStarted = 0;
    private finished = 0;
    public paused = false;

    /**
     * Creates a new FIFO queue.
     *
     * @param worker Method to call for each child. Args:
     * @param callback Method to call when an element was processed.
     * @param done Method to call once the stack is cleared.
     * @param concurrent Number of elements to process in parallel. Defaults to 20.
     */
    constructor(
        private readonly worker: (
            element: T,
            callback: (error: Error | null, result: R) => void
        ) => void,
        private readonly callback: (
            error: Error | null,
            result: R,
            element: T
        ) => void,
        private readonly done?: () => void,
        private readonly concurrent = 20
    ) {}

    /** Adds an element to the queue. */
    public push(props: T): void {
        this.queue.push(props);
        this.scan();
    }
    /**
     * Clears the queue (can't stop running processes).
     */
    public abort(): void {
        this.queue.length = 0;
        this.paused = true; // `cb` won't be called any more
    }

    /**
     * Pause the queue execution.
     * Will not stop already in-flight items.
     */
    public pause(): void {
        this.paused = true;
    }
    /**
     * Resume the queue execution,
     * and catch up with remaining items.
     */
    public resume(): void {
        this.paused = false;
        this.scan();
        this.checkStack();
    }

    private checkStack() {
        while (this.stack[this.finished]) {
            this.callback(...this.stack[this.finished]!);
            delete this.stack[this.finished];
            this.finished += 1;
        }
        if (this.working === 0 && this.queue.length === 0 && this.done) {
            this.done();
        }
    }

    private scan() {
        if (
            this.working === this.concurrent ||
            this.queue.length === 0 ||
            this.paused
        ) {
            return;
        }

        const element = this.queue.shift() as T;
        const index = this.lastStarted++;

        this.working++;

        this.worker(element, (err, result) => {
            this.working--;
            if (!this.paused && index === this.finished) {
                this.callback(err, result, element);
                this.finished += 1;
                this.checkStack();
            } else {
                this.stack[index] = [err, result, element];
            }

            this.scan();
        });
    }
}

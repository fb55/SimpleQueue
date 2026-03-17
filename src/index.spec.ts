import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import SimpleQueue from "./index.js";

const expectedResults = [
    { err: null, result: 1, element: 1000 },
    { err: null, result: 5, element: 5000 },
    { err: null, result: 3, element: 3000 },
    { err: null, result: 4, element: 4000 },
    { err: null, result: 8, element: 8000 },
    { err: null, result: 2, element: 2000 },
    { err: null, result: 0, element: 0 },
];

const delays = [1000, 5000, 3000, 4000, 8000, 2000, 0];

beforeEach(() => {
    vi.useFakeTimers();
});

afterEach(() => {
    vi.useRealTimers();
});

describe("SimpleQueue", () => {
    function run(
        { concurrent, takes }: { concurrent: number; takes: number },
        done: () => void,
    ) {
        const start = Date.now();
        const results: {
            err: Error | null;
            result: number;
            element: number;
        }[] = [];

        const queue = new SimpleQueue<number, number>(
            (element, callback) => {
                setTimeout(() => {
                    callback(null, element / 1000);
                }, element);
            },
            (error, result, element) => {
                results.push({ err: error, result, element });
            },
            () => {
                expect(results).toStrictEqual(expectedResults);
                expect(
                    Object.keys(
                        // @ts-expect-error This is a private property
                        queue.stack,
                    ),
                ).toHaveLength(0);
                const took = Date.now() - start;
                expect(took).toBeGreaterThanOrEqual(takes);
                // Also should not have wasted time
                expect(took).toBeLessThan(takes + 500);

                done();
            },
            concurrent,
        );

        for (const delay of delays) {
            queue.push(delay);
        }

        vi.runAllTimers();
    }

    it("should run one by one", () =>
        new Promise<void>((resolve) => {
            run(
                {
                    concurrent: 1,
                    // Should take the sum of all of the delays
                    takes: delays.reduce((a, b) => a + b),
                },
                resolve,
            );
        }));
    it("should run all together", () =>
        new Promise<void>((resolve) => {
            run(
                {
                    concurrent: Number.POSITIVE_INFINITY,
                    // Should take the maximum time of all the delays
                    takes: Math.max(...delays),
                },
                resolve,
            );
        }));
    it("should run some together", () =>
        new Promise<void>((resolve) => {
            run(
                {
                    concurrent: 4,
                    takes: 9000,
                },
                resolve,
            );
        }));
});

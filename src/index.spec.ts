import SimpleQueue from ".";

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

jest.useFakeTimers();

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
            (err, result, element) => {
                results.push({ err, result, element });
            },
            () => {
                expect(results).toStrictEqual(expectedResults);
                expect(Object.keys((queue as any).stack)).toHaveLength(0);
                const took = Date.now() - start;
                expect(took).toBeGreaterThanOrEqual(takes);
                // Also should not have wasted time
                expect(took).toBeLessThan(takes + 500);

                done();
            },
            concurrent,
        );

        delays.forEach((delay) => queue.push(delay));

        jest.advanceTimersToNextTimer(Infinity);
    }

    it("should run one by one", (done) => {
        run(
            {
                concurrent: 1,
                // Should take the sum of all of the delays
                takes: delays.reduce((a, b) => a + b),
            },
            done,
        );
    });
    it("should run all together", (done) => {
        run(
            {
                concurrent: Infinity,
                // Should take the maximum time of all the delays
                takes: Math.max(...delays),
            },
            done,
        );
    });
    it("should run some together", (done) => {
        run(
            {
                concurrent: 4,
                takes: 9000,
            },
            done,
        );
    });
});

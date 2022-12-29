# SimpleQueue

[![NPM version](http://img.shields.io/npm/v/SimpleQueue.svg?style=flat)](https://npmjs.org/package/SimpleQueue)
[![Node.js CI](https://github.com/fb55/SimpleQueue/actions/workflows/nodejs-test.yml/badge.svg)](https://github.com/fb55/SimpleQueue/actions/workflows/nodejs-test.yml)
[![Coverage](http://img.shields.io/coveralls/fb55/SimpleQueue.svg?style=flat)](https://coveralls.io/r/fb55/SimpleQueue)

A simple FIFO queue

    npm install SimpleQueue

## What is this?

There are plenty queues for node, but even those branded as FIFO (first in first out) usually destroy the order.
Eg. when mapping over an RSS feeds & doing something with all of the pages,
you need to know what element had what position - so I created this little helper.

## API

### Class: SimpleQueue\<T, R>

A simple FIFO queue, delivering items in order.

#### Type parameters

| Name | Default | Description                              |
| ---- | ------- | ---------------------------------------- |
| `T`  | -       | Type that is pushed onto the stack.      |
| `R`  | void    | Type that the passed `callback` maps to. |

### Constructors

#### constructor

\+ **new SimpleQueue**(`worker`: (element: T, callback: (error: Error \| null, result: R) => void) => void, `callback`: (error: Error \| null, result: R, element: T) => void, `done?`: undefined \| () => void, `concurrent?`: number): `SimpleQueue`

_Defined in [index.ts:16](https://github.com/fb55/SimpleQueue/blob/master/src/index.ts#L16)_

Creates a new FIFO queue.

##### Parameters:

| Name         | Type                                                                      | Default value | Description                                                |
| ------------ | ------------------------------------------------------------------------- | ------------- | ---------------------------------------------------------- |
| `worker`     | (element: T, callback: (error: Error \| null, result: R) => void) => void | -             | Method to call for each child. Args:                       |
| `callback`   | (error: Error \| null, result: R, element: T) => void                     | -             | Method to call when an element was processed.              |
| `done?`      | undefined \| () => void                                                   | -             | Method to call once the stack is cleared.                  |
| `concurrent` | number                                                                    | 20            | Number of elements to process in parallel. Defaults to 20. |

**Returns:** `SimpleQueue`

### Properties

#### paused

• **paused**: boolean = false

_Defined in [index.ts:16](https://github.com/fb55/SimpleQueue/blob/master/src/index.ts#L16)_

### Methods

#### abort

▸ **abort**(): void

_Defined in [index.ts:48](https://github.com/fb55/SimpleQueue/blob/master/src/index.ts#L48)_

Clears the queue (can't stop running processes).

**Returns:** void

---

#### pause

▸ **pause**(): void

_Defined in [index.ts:57](https://github.com/fb55/SimpleQueue/blob/master/src/index.ts#L57)_

Pause the queue execution.
Will not stop already in-flight items.

**Returns:** void

---

#### push

▸ **push**(`props`: T): void

_Defined in [index.ts:41](https://github.com/fb55/SimpleQueue/blob/master/src/index.ts#L41)_

Adds an element to the queue.

##### Parameters:

| Name    | Type |
| ------- | ---- |
| `props` | T    |

**Returns:** void

---

#### resume

▸ **resume**(): void

_Defined in [index.ts:64](https://github.com/fb55/SimpleQueue/blob/master/src/index.ts#L64)_

Resume the queue execution,
and catch up with remaining items.

**Returns:** void

## Example

```js
import SimpleQueue from "SimpleQueue";

const queue = new SimpleQueue(
    (element, callback) => {
        // Set
        setTimeout(() => callback(null, element / 1000), element);
    },
    (err, result, element) => {
        console.log(result);
    },
    () => {
        console.log("done");
    },
    4
);

queue.push(1000);
queue.push(5000);
queue.push(3000);
queue.push(4000);
queue.push(8000);
queue.push(2000);
queue.push(0);
```

Output:

    1, 5, 3, 4, 8, 2, 0, "done"

This takes 9 seconds to run.

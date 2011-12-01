#SimpleQueue
A simple FIFO queue

##What is this?

There are plenty queues for node, but even those branded as FIFO (first in first out) usually destroy the order. When parsing data like RSS feeds & fetching the pages behind the links, you need to know what element had what position - so I created this little helper (mainly to process feeds with my script [readabilitySAX](https://github.com/fb55/readabilitysax)).

##How to use

Constructor:

    new SimpleQueue(<func> worker, <func> callback[, <func> done[, <num> concurrent]])

Methods:

    queue.push(<any> element) //adds an element to the list

Methods to include:

* `worker`: The method to call for each child. Args: `element`, `callback(err, result)`
* `callback`: The method to call when an element was processed. Args: `err` and `result` (whatever the worker returned), `element` (the input)
* `done`: The method to call once the stack is cleared. Args: none

##Example

    var queue = new SimpleQueue(function(element, callback){
    	setTimeout(function(){
            callback(null, element/1e3); 
        }, element);
    }, function(err, result, element){
    	console.log(result);
    }, function(){
    	console.log("done");
    }, 4);
    
    queue.push(1e3);
    queue.push(5e3);
    queue.push(3e3);
    queue.push(4e3);
    queue.push(8e3);
    queue.push(2e3);
    queue.push(0);

Output: 

    1, 5, 3, 4, 8, 2, 0, "done"

This takes 9 seconds to run.
var SimpleQueue = require("..");

var results = [],
	started = Date.now(),
	expectedResults = [ 
  { err: null, result: 1, element: 1000 },
  { err: null, result: 5, element: 5000 },
  { err: null, result: 3, element: 3000 },
  { err: null, result: 4, element: 4000 },
  { err: null, result: 8, element: 8000 },
  { err: null, result: 2, element: 2000 },
  { err: null, result: 0, element: 0 }
];

var queue = new SimpleQueue(function(element, callback){
	setTimeout(function(){ callback(null,element/1e3); }, element);
}, function(err, result, element){
	results.push({err:err, result:result, element:element});
}, function(){
	if(JSON.stringify(expectedResults) === JSON.stringify(results)){
		console.log("passed, took", Date.now()-started);
	}
	else {
		throw Error("undexpected output, got: " + JSON.stringify(results));
	}
}, 4);

expectedResults.forEach(function(elem){
	queue.push(elem.element);
});

/*queue.push(1e3);
queue.push(5e3);
queue.push(3e3);
queue.push(4e3);
queue.push(8e3);
queue.push(2e3);
queue.push(0);*/
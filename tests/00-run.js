var SimpleQueue = require("..");

var expectedResults = [ 
  { err: null, result: 1, element: 1000 },
  { err: null, result: 5, element: 5000 },
  { err: null, result: 3, element: 3000 },
  { err: null, result: 4, element: 4000 },
  { err: null, result: 8, element: 8000 },
  { err: null, result: 2, element: 2000 },
  { err: null, result: 0, element: 0 }
];

var delays = [1e3, 5e3, 3e3, 4e3, 8e3, 2e3, 0];

function run(module){
	var start = Date.now(),
		results = [];
	
	var queue = new SimpleQueue(function(element, callback){
		setTimeout(function(){ callback(null,element/1e3); }, element);
	}, function(err, result, element){
		results.push({err:err, result:result, element:element});
	}, function(){
	
		if(JSON.stringify(expectedResults) !== JSON.stringify(results))
			throw Error("undexpected output, got: " + JSON.stringify(results));
	
		var took = Date.now() - start;
		if(took < module.takes) throw Error("didn't take enough time");
		if(took > (module.takes + 500)) throw Error("wasted time");
		
		console.log("finished", module.name, "after (ms):", took);
	}, module.concurrent);
	
	delays.forEach(queue.push.bind(queue));
};

["./01-one-by-one.js", "./02-all-together.js", "./03-some-together.js"].map(require).forEach(run);
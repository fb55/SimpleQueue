var SimpleQueue = function(worker, callback, done, concurrent){
	this._concurrent = concurrent || 20;
	this._worker = worker;
	this._callback = callback;
	this._done = done;
	this._queue = [];
	this._stack = {}; //stores elements that are finished
	this._working = 0;
	this._lastStarted = 0;
	this._finished = 0;
};

SimpleQueue.prototype.push = function(props){
	this._queue.push(props);
	this._scan();
};

SimpleQueue.prototype._scan = function(){
	if( this._working === this._concurrent || 
		this._queue.length === 0) return;

	var element = this._queue.shift(),
		index = this._lastStarted++,
		that = this;
	
	this._working++;

	this._worker(element, function(err, result){
		that._working--;
		if(index === that._finished){
			that._callback(err, result, element);
			while(that._stack[++that._finished]){
				that._callback.apply(that, that._stack[that._finished]);
				that._stack[that._finished] = null;
			}
			if(that._working === 0 && that._queue.length === 0 && that._done){
				that._done();
			}
		}
		else that._stack[index] = [err, result, element];
		
		that._scan();
	});
};

module.exports = SimpleQueue;
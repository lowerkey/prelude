/*
	js/models/graph/Graph.js
	Joshua Marshall Moore
	2/20/2013
*/

var karass = karass || {};

karass.Graph = Backbone.Model.extend({
	
	sync: Backbone.memorySync,
	
	addNode: function(node){
		var nodes = karass.createNodeCollection(this.id);
		nodes.fetch();
		
		if(!nodes.get(node.id)){
			node.set('graphId', this.id);
			nodes.add(node);
			Backbone.memorySync('update', nodes, {});
		}
		
		return this;
	},
	
	/*
	addEdge: function(source, target){
		if(!this.connected(source.id, target.id)){
			var edges = karass.createEdgeCollection(this.id);
			edges.fetch();
			
			var edge = edges.create({
				graphId: this.id,
				sourceId: source.id,
				targetId: target.id,
			});
			Backbone.memorySync('update', edges, {});
		}
		
		return this;
	},
	*/
	
	inflateEdges: function(){
	    _.each(this.edges, function(edge){
		edge.data = edge.get('data') || {};
		edge.source = this.nodes[_.indexOf(this.nodes, edge.get('sourceId'))];
		edge.target = this.nodes[_.indexOf(this.nodes, edge.get('targetid'))];
            }, this);
	    
            return this;
        },
	
	addEdge: function(edge){
	    if(!this.connected(edge.get('sourceId'), edge.get('targetId'))){
			var edges = karass.createEdgeCollection(this.id);
			edges.fetch();
			edges.add(edge);
			Backbone.memorySync('update', edges, {});
	    }
	    
	    return this;
	},
	
	connected: function(sourceId, targetId){
		var edges = karass.createEdgeCollection(this.id);
		edges.fetch();
		
		return edges.where({sourceId: sourceId, targetId: targetId}).length > 0;
	},
	
	prepare: function(){
		this.nodes = _.map(this.getNodes(), function(node){
			return node.toJSON();
		});
		
		this.nodeIds = _.map(this.nodes, function(node){
		    return node.id;
		});
		
		this.edges = _.map(this.getEdges(), function(edge){
			var e = edge;
			e.source = this.nodes[_.indexOf(this.nodeIds, edge.get('sourceId'))];
			e.target = this.nodes[_.indexOf(this.nodeIds, edge.get('targetId'))];
			return e;
		}, this);
	},
	
	nodeIdx: function(id){
	    return _.find(this.nodeIds, function(_id, idx){
			return _id === id;
	    });
	},
	
	getEdge: function(id){
		return karass.edges.get(id);
	},
	
	getNodes: function(){
		return karass.nodes.where({graphId: this.id});
	},
	
	getEdges: function(){
		return karass.edges.where({graphId: this.id});
	},
	
	removeNode: function(nodeId, beforeRemoveNode, beforeRemoveEdge){
		var graphEdges = karass.edges.where({graphId: this.id});
		_.each(graphEdges, function(edge, idx, list){
			if(edge.sourceId === nodeId || edge.targetId === nodeId){
				this.removeEdge(edge.id, beforeRemoveEdge);
			}
		}, this);
		
		var node = karass.nodes.get(nodeId);
		if(beforeRemoveNode instanceof Function){
			beforeRemoveNode(node);
		}
		
		node.destroy();
	},
	
	removeEdge: function(edgeId, beforeRemoveEdge){
		var edge = karass.edges.get(edgeId);
		if(edge && beforeRemoveEdge instanceof Function){
			beforeRemoveEdge(edge);
		}
		edge.destroy();
	}
});

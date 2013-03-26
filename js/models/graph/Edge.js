/*
	js/models/graph/Edge.js
	Joshua Marshall Moore
	2/20/2013
*/

var karass = karass || {};

karass.Edge = Backbone.Model.extend({
	
	defaults: {
		data: {},
	},
	
	initialize: function(sourceId, targetId){
		this.set('sourceId', sourceId);
		this.set('targetId', targetId);
		_.bindAll(this);
	},
	
	sync: Backbone.memorySync,
	
	getSource: function(){
		return karass.nodes.get(this.get('sourceId'));
	},
	
	getTarget: function(){
		return karass.nodes.get(this.get('targetId'));
	},
	
});

karass.createEdge = function(sourceId, targetId){
        var edge = karass.edges.create(sourceId, targetId);
	Backbone.memorySync('update', karass.edges, {});
        return edge;
};

karass.edges = new (Backbone.Collection.extend({
	model: karass.Edge,
	
	store: new MemoryStore('karass_edges'),
	
	sync: Backbone.memorySync,
	
}))();

karass.createEdgeCollection = function(id){
	return new (Backbone.Collection.extend({
		
		model: karass.Edge,
	
		store: new MemoryStore('karass_edges_' + id),
		
		sync: Backbone.memorySync,
		
	}))();
};

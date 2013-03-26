/*
	js/models/graph/Node.js
	Joshua Marshall Moore
	2/20/2013
*/

var karass = karass || {};

karass.Node = Backbone.Model.extend({
	
	getIncomingEdges: function(){
		var incoming = karass.createEdgeCollection(this.id);
		return incoming.where({targetId: this.id});
	},
	
	getOutgoingEdges: function(){
		var outgoing = karass.createEdgeCollection(this.id);
		return outgoing.where({sourceId: this.id});
	},
	
	sync: Backbone.memorySync,
        
        inflate: function(){
            //data, layout, position
            this.data = this.get('data') || {};
            
            // fetch layout
            this.layout = this.get('layout') || {};
            
            // inflate position
            var position;
            if(position = this.get('position')){
                this.position = new THREE.Vector3(position.x, position.y, position.z);
            }else{
                this.position = new THREE.Vector3();
            }
        },
        
        deflate: function(){
            // we'll get back to this if and when it's needed.
        },
	
});

karass.nodes = new (Backbone.Collection.extend({

	model: karass.Node,
	
	store: new MemoryStore('karass_nodes'),

	sync: Backbone.memorySync,
	
}))();

karass.createNode = function(attrs){
	return karass.nodes.create(attrs||{});
};

karass.createNodeCollection = function(id){
	return new (Backbone.Collection.extend({
	
		model: karass.Node,
	
		store: new MemoryStore('karass_nodes_' + id),
		
		sync: Backbone.memorySync,
	
	}))();
};

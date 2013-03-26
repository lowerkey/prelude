/**
	Thanks, @author David Piegza
	Gutted by Joshua Moore
 */

var Layout = Layout || {};

Layout.ForceDirected = function(graph, options) {
  this.options = options || {};
  
  this.attraction_multiplier = options.attraction || 5;
  this.repulsion_multiplier = options.repulsion || 0.75;
  this.max_iterations = options.iterations || 1000;
  this.graph = graph;
  this.width = options.width || 200;
  this.height = options.height || 200;
  this.finished = false;

  this.callback_positionUpdated = options.positionUpdated;
  
  this.EPSILON = 0.00001;
  this.attraction_constant;
  this.repulsion_constant;
  this.forceConstant;
  this.layout_iterations = 0;
  this.temperature = 0;
  this.graph.layout = this;
  
  // performance test
  this.mean_time = 0;
};

  /**
   * Initialize parameters used by the algorithm.
   */
Layout.ForceDirected.prototype.init = function() {
    this.graph.prepare();
    this.stop_calculating();

    this.finished = false;
    this.temperature = this.width / 10.0;
    this.forceConstant = Math.sqrt(this.height * this.width / this.graph.nodes.length);
    this.attraction_constant = this.attraction_multiplier * this.forceConstant;
    this.repulsion_constant = this.repulsion_multiplier * this.forceConstant;
};

  /**
   * Generates the force-directed layout.
   *
   * It finishes when the number of max_iterations has been reached or when
   * the temperature is nearly zero.
   */
Layout.ForceDirected.prototype.generate = function() {
  
    var nodes_length = this.graph.nodes.length;
    var edges_length = this.graph.edges.length;

    if(this.layout_iterations < this.max_iterations || this.temperature > 0.000001) {
        var start = new Date().getTime();

        // calculate repulsion
        for(var i=0; i < nodes_length; i++) {
            var node_v = this.graph.nodes[i];
            var k = 0;

            node_v.layout = node_v.layout || {};
            node_v.position = node_v.position || {};
            node_v.data = node_v.data || {};

            if(k++==0) {
                node_v.layout.offset_x = 0;
                node_v.layout.offset_y = 0;
                node_v.layout.offset_z = 0;
            }

            node_v.layout.force = 0;
            node_v.layout.tmp_pos_x = node_v.layout.tmp_pos_x || node_v.position.x;
            node_v.layout.tmp_pos_y = node_v.layout.tmp_pos_y || node_v.position.y;
            node_v.layout.tmp_pos_z = node_v.layout.tmp_pos_z || node_v.position.z;

            for(var j=i+1; j < nodes_length; j++) {
                var node_u = this.graph.nodes[j];
                if(i != j) {
                    node_u.layout = node_u.layout || {};
                    node_u.layout.tmp_pos_x = node_u.layout.tmp_pos_x || node_u.position.x;
                    node_u.layout.tmp_pos_y = node_u.layout.tmp_pos_y || node_u.position.y;
                    node_u.layout.tmp_pos_z = node_u.layout.tmp_pos_z || node_u.position.z;

                    var delta_x = node_v.layout.tmp_pos_x - node_u.layout.tmp_pos_x;
                    var delta_y = node_v.layout.tmp_pos_y - node_u.layout.tmp_pos_y;
                    var delta_z = node_v.layout.tmp_pos_z - node_u.layout.tmp_pos_z;

                    var delta_length = Math.max(this.EPSILON, Math.sqrt((delta_x * delta_x) + (delta_y * delta_y)));
                    var delta_length_z = Math.max(this.EPSILON, Math.sqrt((delta_z * delta_z) + (delta_y * delta_y)));

                    var force = (this.repulsion_constant * this.repulsion_constant) / delta_length;
                    var force_z = (this.repulsion_constant * this.repulsion_constant) / delta_length_z;

                    node_v.layout.force += force;
                    node_u.layout.force += force;

                    node_v.layout.offset_x += (delta_x / delta_length) * force;
                    node_v.layout.offset_y += (delta_y / delta_length) * force;

                    if(i==0) {
                        node_u.layout.offset_x = 0;
                        node_u.layout.offset_y = 0;
                        node_u.layout.offset_z = 0;
                    }
                    node_u.layout.offset_x -= (delta_x / delta_length) * force;
                    node_u.layout.offset_y -= (delta_y / delta_length) * force;

                    node_v.layout.offset_z += (delta_z / delta_length_z) * force_z;
                    node_u.layout.offset_z -= (delta_z / delta_length_z) * force_z;
                }
            }
        }
      
        // calculate attraction
        for(var i=0; i < edges_length; i++) {
            var edge = this.graph.edges[i];
            var delta_x = edge.source.layout.tmp_pos_x - edge.target.layout.tmp_pos_x;
            var delta_y = edge.source.layout.tmp_pos_y - edge.target.layout.tmp_pos_y;
            var delta_z = edge.source.layout.tmp_pos_z - edge.target.layout.tmp_pos_z;

            var delta_length = Math.max(this.EPSILON, Math.sqrt((delta_x * delta_x) + (delta_y * delta_y)));
            var delta_length_z = Math.max(this.EPSILON, Math.sqrt((delta_z * delta_z) + (delta_y * delta_y)));

            var force = (delta_length * delta_length) / (edge.data.force ? edge.data.force * this.attraction_constant : this.attraction_constant);
            var force_z = (delta_length_z * delta_length_z) / (edge.data.force ? edge.data.force * this.attraction_constant  : this.attraction_constant);

            edge.source.layout.force -= force;
            edge.target.layout.force += force;

            edge.source.layout.offset_x -= (delta_x / delta_length) * force;
            edge.source.layout.offset_y -= (delta_y / delta_length) * force;
            edge.source.layout.offset_z -= (delta_z / delta_length_z) * force_z;

            edge.target.layout.offset_x += (delta_x / delta_length) * force;
            edge.target.layout.offset_y += (delta_y / delta_length) * force;
            edge.target.layout.offset_z += (delta_z / delta_length_z) * force_z;
        }
          
        // calculate positions
        for(var i=0; i < nodes_length; i++) {
            var node = this.graph.nodes[i];
                            
            var delta_length = Math.max(this.EPSILON, Math.sqrt(node.layout.offset_x * node.layout.offset_x + node.layout.offset_y * node.layout.offset_y));
            var delta_length_z = Math.max(this.EPSILON, Math.sqrt(node.layout.offset_z * node.layout.offset_z + node.layout.offset_y * node.layout.offset_y));

            node.layout.tmp_pos_x += (node.layout.offset_x / delta_length) * Math.min(delta_length, this.temperature);
            node.layout.tmp_pos_y += (node.layout.offset_y / delta_length) * Math.min(delta_length, this.temperature);
            node.layout.tmp_pos_z += (node.layout.offset_z / delta_length_z) * Math.min(delta_length_z, this.temperature);

            var updated = true;
            var x = (node.position.x - node.layout.tmp_pos_x) / 10,
                y = (node.position.y - node.layout.tmp_pos_y) / 10,
                z = (node.position.z - node.layout.tmp_pos_z) / 10;
            node.position.set(x, y, z);
            node.data.draw_object.position.set(x, y, z);

            // execute callback function if positions has been updated
            if(updated && typeof callback_positionUpdated === 'function') {
                this.callback_positionUpdated(node);
            }
        }
        
        // update lines
        for(var i=0; i<edges_length; i++){
            var edge = this.graph.edges[i];
            edge.data.layout.geometry.vertices[0] = edge.source.position;
            edge.data.layout.geometry.vertices[1] = edge.target.position;
            edge.data.layout.geometry.verticesNeedUpdate = true;
        }
        
        this.temperature *= (1 - (this.layout_iterations / this.max_iterations));
        this.layout_iterations++;

        var end = new Date().getTime();
        this.mean_time += end - start;

    } else {
        if(!this.finished) {        
        console.log("Average time: " + (this.mean_time/this.layout_iterations) + " ms");
    }
        this.finished = true;
        return false;
    }
    return true;
};

  /**
   * Stops the calculation by setting the current_iterations to max_iterations.
   */
Layout.ForceDirected.prototype.stop_calculating = function() {
    layout_iterations = this.max_iterations;
};

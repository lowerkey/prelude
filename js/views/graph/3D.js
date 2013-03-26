/*
js/views/graph/3D.js
Joshua Marshall Moore
2/24/2013
 */

var karass = karass || {};

karass.ThreeDeeView = Backbone.View.extend({
		initialize : function () {
			_.bindAll(this);
		},

		render : function (options) {

			this.graph = options.graph || new karass.Graph();
			this.width = options.width || 500;
			this.height = options.height || 500;
			this.distance = options.distance || 1000;

			this.camera = new THREE.PerspectiveCamera(70, this.width / this.height, 1, 10000);
			this.camera.position.z = this.distance; // 1000

			this.scene = new THREE.Scene();
			this.scene.add(this.camera);

			// thanks: http://www.html5canvastutorials.com/webgl/html5-canvas-webgl-texture-with-three-js/
			var ambientLight = new THREE.AmbientLight(0x6ffffff);
			this.scene.add(ambientLight);

			// thanks: http://japhr.blogspot.de/2012/07/fallback-from-webgl-to-canvas-in-threejs.html
			if (window.WebGlRenderingContext || document.createElement('canvas').getContext('experimental-webgl')) {
				this.renderer = new THREE.WebGLRenderer({
						antialias : true,
						preserveDrawingBuffer : false,
					});
			} else {
				this.renderer = new THREE.CanvasRenderer();
			}
			this.renderer.setClearColorHex(0x26477D);
			this.renderer.setSize(this.width, this.height);

			this.$el.html(this.renderer.domElement);

			// fullscreen code, this is fine as long as there's only one 3d view displayed

			/*
			THREEx.FullScreen.bindKey({
				charCode : 'f'.charCodeAt(0)
			});
			*/
			THREEx.WindowResize(this.$el, this.camera);

			// fly controls!!!
			this.clock = new THREE.Clock();
			this.controls = new THREE.FlyControls( this.camera, this.renderer.domElement );

			// selecting objects
			this.selectedObject = null;
			this.projector = new THREE.Projector();
			$(this.renderer.domElement).click(this.selectObject);
			
			this._createGraphLayout();
			this.graph.prepare();
			_.each(this.graph.nodes, function (node) {
				node.inflate();
			});
			this.graph.inflateEdges();
			this._animate();

			return this;
		},
		
		selectObject: function(e){
			e.preventDefault();
			var vector = new THREE.Vector3( (e.pageX / $(this.renderer.domElement).width()) * 2 - 1, 
											- (e.pageY / $(this.renderer.domElement).height()) * 2 + 1, 
											1 );
			this.projector.unprojectVector( vector, this.camera );
			var raycaster = new THREE.Raycaster( this.camera.position, vector.sub(this.camera.position).normalize() );
			var intersects = raycaster.intersectObjects( this.scene.children );
			
			if(intersects.length > 0){
				console.log('found something');
				if(this.selectedObject != intersects[0].object){
					if(this.selectedObject){
						this.selectedObject.material.emissive.setHex( this.selectedObject.currentHex );
					}
					
					this.selectedObject = intersects[0].object;
					this.selectedObject.currentHex = this.selectedObject.material.emissive.getHex();
					this.selectedObject.material.emissive.setHex(0xff0000);
				}
			}else{
				if(this.selectedObject){
					this.selectedObject.material.emissive.setHex(this.selectedObject.currentHex);
				}
				
				this.selectedObject = null;
			}
		},

		_drawCube : function () {
			geometry = new THREE.CubeGeometry(25, 25, 25);

			/*
			material = new THREE.MeshBasicMaterial({
			color: 0x1E90FF, // blue
			wireframe: true,
			opacity: 0.5
			});
			 */
			material = new THREE.MeshLambertMaterial({
					map : THREE.ImageUtils.loadTexture('img/photo.jpg'),
				});

			mesh = new THREE.Mesh(geometry, material);

			var pos = this._randomPosition();
			mesh.position.x = pos.x;
			mesh.position.y = pos.y;
			mesh.position.z = pos.z;

			this.scene.add(mesh);
			return mesh;
		},

		_drawLine : function (sourcePos, targetPos) {
			var geometry = new THREE.Geometry();
			geometry.vertices[0] = sourcePos;
			geometry.vertices[1] = targetPos;
			geometry.dynamic = true;

			var material = new THREE.LineBasicMaterial({
					color : 0xBBBBBB,
				});

			var line = new THREE.Line(geometry, material);

			this.scene.add(line);
			return line;
		},

		newNode : function () {
			var node = karass.createNode();
			var data = {};
			data.draw_object = this._drawCube();
			node.set('data', data);
			node.set('position', data.draw_object.position.clone());
			this.graph.addNode(node);
			this.graph.layout.init();

			return node.id;
		},

		newEdge : function (sourceId, targetId) {
			var edge = karass.createEdge(sourceId, targetId);
			this.graph.addEdge(edge);

			edge.data = {};

			var sourceIdx = _.indexOf(this.graph.nodeIds, sourceId);
			var targetIdx = _.indexOf(this.graph.nodeIds, targetId);
			edge.data.layout = this._drawLine(
					this.graph.nodes[sourceIdx].position,
					this.graph.nodes[targetIdx].position);

			this.graph.layout.init();

			return edge.id;
		},

		_createGraphLayout : function () {
			this.graph.layout = new Layout.ForceDirected(this.graph, {
					width : this.width,
					height : this.height,
					iterations : 10000,
					attraction : 5,
					repulsion : 0.65 // 0.65
				});
			this.graph.layout.init();
		},

		_animate : function () {
			var animate = this._animate;
			requestAnimationFrame(animate);

			if (!this.graph.layout.finished) {
				this.graph.layout.generate();
			}
			
			var delta = this.clock.getDelta();
			this.controls.update(delta * 100);

			this.renderer.render(this.scene, this.camera);
		},

		_randomPosition : function () {
			return {
				x : (Math.random() * this.width * 2) - this.width,
				y : (Math.random() * this.height * 2) - this.height,
				z : (Math.random() * Math.abs(this.camera.position.z * 2) - Math.abs(this.camera.position.z))
			};
		}
	});

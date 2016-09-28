(function(){

    window.MG = window.MG || {};
    MG.preview = MG.preview || {};
    var ns = MG.preview;

    MG.preview.Preview = function(options) {
        this.init(options);
    }

    MG.preview.Preview.prototype = ({
        container: undefined,
        camera: undefined,
        scene: undefined,
        renderer: undefined,

        lon: 0,
        lat:0,
        phi:0,
        distance: 500,
        theta: 500,

        geometry: undefined,
        material: undefined,
        mesh: undefined,

        icons: undefined,

        atlas: undefined,

        backgroundUrl: '',

        backgroundLoader: undefined,

        background: {
            failure: false,
            loaded: false,
            material: undefined,
            texture: undefined,
            width: undefined,
            height: undefined,
            mesh: undefined
        },

        init: function(options){

            MG.preview.instance = this;

            this.backgroundLoader = new THREE.ImageLoader();

            var self = this, i;

            this.container = options.container;

            this.camera = new THREE.PerspectiveCamera(75, this.container.innerWidth() / this.container.innerHeight(), 0.1, 100);
            this.camera.target = new THREE.Vector3( 0, 0, 0 );

            this.scene = new THREE.Scene();

            this.background.material = new THREE.MeshBasicMaterial( { } );
            this.background.material.depthWrite = false;
            this.background.material.depthTest = false;

            this.icons = [];
            for (i = 0; i < 10; i++) {
                this.icons.push(this.generateIcon(i));
            }

            this.renderer = new THREE.WebGLRenderer();
            this.renderer.setPixelRatio( window.devicePixelRatio );
            this.renderer.setSize( this.container.innerWidth(), this.container.innerHeight() );
            this.container.append( this.renderer.domElement );

            $(window).resize(function() {
                self.onWindowResize();
            });

            var el = $(this.renderer.domElement);

            el.on('mousedown', function(event){self.onDocumentMouseDown(event)});
            el.on('mousemove', function(event){self.onDocumentMouseMove(event)});
            el.on('mouseup', function(event){self.onDocumentMouseUp(event)});

            this.atlas = {
                'eye': this._getAtlasTexture(58),
                'dot': this._getAtlasTexture(51),
                'exit': this._getAtlasTexture(57),
                'stop': this._getAtlasTexture(56),
                'up': this._getAtlasTexture(12),
                'down': this._getAtlasTexture(14),
                'left': this._getAtlasTexture(15),
                'right': this._getAtlasTexture(13),
                'previous': this._getAtlasTexture(24),
                'next': this._getAtlasTexture(23)
            };
        },
        _getAtlasTexture: function(index) {
            var texture = new THREE.TextureLoader().load('/static/images/atlas/atlas_' + index + '.png');
            texture.wrapS = THREE.ClampToEdgeWrapping;
            texture.wrapT = THREE.ClampToEdgeWrapping;
            texture.needsUpdate = true;
            return texture;
        },
        generateIcon: function(index){
            var geometry = new THREE.PlaneGeometry(1, 1);
            var material = new THREE.MeshBasicMaterial( {/*color: 0xffff00, */side: THREE.FrontSide} ); // FrontSide || DoubleSide
            material.depthWrite = false;
            material.depthTest = false;
            material.transparent = true;
            var plane = new THREE.Mesh( geometry, material );
            plane.rotation.x = Math.PI / 2;
            plane.rotation.y = Math.PI;
            plane.rotation.z = Math.PI / 2;

            var obj1 = new THREE.Object3D();
            obj1.visible = false;
            var obj2 = new THREE.Object3D();
            obj1.add(obj2);
            obj2.add(plane);

            obj1.renderOrder = index + 1;
            obj2.renderOrder = index + 1;
            plane.renderOrder = index + 1;

            this.scene.add(obj1);

            return [obj1, obj2, plane];
        },
        update: function() {
            this.lat = Math.max( - 85, Math.min( 85, this.lat) );
            this.phi = THREE.Math.degToRad( 90 - this.lat);
            this.theta = THREE.Math.degToRad(this.lon);

            this.camera.target.x = this.distance * Math.sin(this.phi) * Math.cos(this.theta);
            this.camera.target.y = this.distance * Math.cos(this.phi);
            this.camera.target.z = this.distance * Math.sin(this.phi) * Math.sin(this.theta);

            this.camera.lookAt( this.camera.target );

            this.renderer.render( this.scene, this.camera );
        },
        onWindowResize: function() {
            this.camera.aspect = this.container.innerWidth() / this.container.innerHeight();
            this.camera.updateProjectionMatrix();

            this.renderer.setSize( this.container.innerWidth(), this.container.innerHeight() );
        },
        prep: function(room) {
            this.lon = 0;
            this.lat = 0;
            this.phi = 0;
        },
        points: function(room, point) {
            var i;

            for (i = 0; i < 10; i++) {
                this.icons[i][0].visible = false;
            }

            if (!room) {
                return;
            }

            if (!point) {
                for (i = 0; i < 10; i++) {
                    this.point(i < room.points.length ? room.points[i] : undefined, i);
                }
            } else {
                this.point(point, 0);
            }
        },
        point: function(point, index) {
            var icon = this.icons[index];
            if (point) {
                icon[2].material.map = this.atlas[point.icon || 'dot'];
                if (point.type == 'rot') {
                    // Update point 0
                    icon[0].visible = true;

                    //icon[0].rotation.x = 0;
                    icon[0].rotation.y = THREE.Math.degToRad(-((point.yaw || 0) - 0));
                    icon[0].rotation.z = THREE.Math.degToRad((((point.pitch || 0) - 0)) + 90);

                    icon[1].position.y = -(point.depth || 1.5);

                } else {
                    icon[0].visible = false;
                }
            } else {
              icon[0].visible = false;
          }
        },
        radians: function(degrees) {
          return degrees * Math.PI / 180;
        },
        changeBackground: function(room, backgroundUrl) {
            if (backgroundUrl && backgroundUrl != this.backgroundUrl) {
                var self = this;

                this.backgroundUrl = backgroundUrl;

                if (this.background.mesh) {
                    this.scene.remove(this.background.mesh);
                    this.background.mesh.geometry.dispose();
                    this.background.mesh.material = undefined;
                    this.background.mesh = undefined;
                }

                this.background.failure = false;
                this.background.loaded = false;
                this.background.width = -1;
                this.background.height = -1;

                this.backgroundLoader.load(backgroundUrl, function(image){
                    var texture = new THREE.Texture(image);
                    texture.wrapS = THREE.ClampToEdgeWrapping;
                    texture.wrapT = THREE.ClampToEdgeWrapping;
                    texture.needsUpdate = true;

                    self.background.texture = texture;
                    self.background.material.map = texture;
                    self.background.width = image.width;
                    self.background.height = image.height;
                    self.background.loaded = true;

                    var geometry;
                    switch (room.playback) {
                        case '2d': {
                            geometry = MVRS.geom.instances.Plane.gen({}, 1.0, 1.0);
                        } break;
                        default: {
                            geometry = new THREE.SphereBufferGeometry( 1.5, 20, 20 );
                            geometry.scale( - 1, 1, 1 );
                        } break;
                    }
                    self.background.mesh = new THREE.Mesh(geometry, self.background.material );
                    self.scene.add(self.background.mesh);

                    self.lon = 0;
                    self.lat = 0;
                    self.phi = 0;

                    var yaw = 180;

                    self.background.mesh.rotation.x = 0;
                    self.background.mesh.rotation.y = 0;
                    self.background.mesh.rotation.z = 0;

                    if (room) {
                        if (room.world && room.world.yaw) {
                            yaw = 180 + (room.world.yaw - 0);
                            console.log(yaw);
                            self.background.mesh.rotation.x = 0;

                            self.background.mesh.rotation.z = 0;
                        } else {
                            self.background.mesh.rotation.x = 0;
                            self.background.mesh.rotation.z = 0;
                        }
                    }

                    self.background.mesh.rotation.y = THREE.Math.degToRad(yaw);


                }, function() {}, function() {
                    self.background.loaded = false;
                });


            }
        },
        onDocumentMouseDown: function( event ) {
            event.preventDefault();

            this.isUserInteracting = true;

            this.onPointerDownPointerX = event.clientX;
            this.onPointerDownPointerY = event.clientY;

            this.onPointerDownLon = this.lon;
            this.onPointerDownLat = this.lat;
        },
        onDocumentMouseMove: function( event ) {
            if ( this.isUserInteracting === true ) {
                this.lon = ( this.onPointerDownPointerX - event.clientX ) * 0.1 + this.onPointerDownLon;
                this.lat = ( event.clientY - this.onPointerDownPointerY ) * 0.1 + this.onPointerDownLat;
            }
            this.update();
        },
        onDocumentMouseUp: function( event ) {
            this.isUserInteracting = false;
        }
    });

}());
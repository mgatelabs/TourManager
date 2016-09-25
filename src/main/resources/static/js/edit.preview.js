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

        backgroundUrl: '',

        init: function(options){

            MG.preview.instance = this;

            var self = this, i;

            this.container = options.container;

            this.camera = new THREE.PerspectiveCamera(75, this.container.innerWidth() / this.container.innerHeight(), 0.1, 100);
            this.camera.target = new THREE.Vector3( 0, 0, 0 );

            this.scene = new THREE.Scene();

            this.geometry = new THREE.SphereBufferGeometry( 1.5, 20, 20 );
            this.geometry.scale( - 1, 1, 1 );
            this.material   = new THREE.MeshBasicMaterial( { map: undefined } );
            this.material.depthWrite = false;
            this.material.depthTest = false;
            this.mesh = new THREE.Mesh( this.geometry, this.material );
            //this.mesh.visible = false;
            this.scene.add( this.mesh );

            this.icons = [];
            for (i = 0; i < 10; i++) {
                this.icons.push(this.generateIcon(i));
            }

            this.renderer = new THREE.WebGLRenderer();
            this.renderer.setPixelRatio( window.devicePixelRatio );
            this.renderer.setSize( this.container.innerWidth(), this.container.innerHeight() );
            this.container.append( this.renderer.domElement );

            $(window).resize(function(){
                self.onWindowResize();
            });

            var el = $(this.renderer.domElement);

            el.on('mousedown', function(event){self.onDocumentMouseDown(event)});
            el.on('mousemove', function(event){self.onDocumentMouseMove(event)});
            el.on('mouseup', function(event){self.onDocumentMouseUp(event)});

        },
        generateIcon: function(index){

            var geometry = new THREE.PlaneGeometry(1, 1);
            //var geometry = new THREE.ConeGeometry(1, 1, 32 );
            //var geometry = new THREE.BoxGeometry(1, 1, 5);
            var material = new THREE.MeshBasicMaterial( {color: 0xffff00, side: THREE.DoubleSide} ); // FrontSide
            material.depthWrite = false;
            material.depthTest = false;
            material.transparent = true;
            var plane = new THREE.Mesh( geometry, material );
            plane.rotation.x = Math.PI / 2;

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
            if (room) {
                if (room.yaw) {
                    this.mesh.rotation.x = 0;
                    this.mesh.rotation.y = this.radians(-room.yaw - 0);
                    this.mesh.rotation.z = 0;
                } else {
                    this.mesh.rotation.x = 0;
                    this.mesh.rotation.y = 0;
                    this.mesh.rotation.z = 0;
                }
            }
        },
        point: function(point) {
            var icon = this.icons[0];
            if (point) {
                if (point.type == 'rot') {
                    // Update point 0
                    icon[0].visible = true;

                    //icon[0].rotation.x = 0;
                    icon[0].rotation.y = this.radians(-((point.yaw || 0) - 0));
                    icon[0].rotation.z = this.radians((((point.pitch || 0) - 0)) + 90);

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
        changeBackground: function(backgroundUrl) {
            if (backgroundUrl && backgroundUrl != this.backgroundUrl) {
                this.backgroundUrl = backgroundUrl;

                var texture = new THREE.TextureLoader().load(backgroundUrl);
                texture.wrapS = THREE.ClampToEdgeWrapping;
                texture.wrapT = THREE.ClampToEdgeWrapping;
                texture.needsUpdate = true;


                this.material.map = texture;
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
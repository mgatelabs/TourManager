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

        backgroundUrl: '',

        init: function(options){

            MG.preview.instance = this;

            var self = this;

            this.container = options.container;

            this.camera = new THREE.PerspectiveCamera(75, this.container.innerWidth() / this.container.innerHeight(), 0.1, 100);
            this.camera.target = new THREE.Vector3( 0, 0, 0 );

            this.scene = new THREE.Scene();

            this.geometry = new THREE.SphereBufferGeometry( 1.5, 20, 20 );
            this.geometry.scale( - 1, 1, 1 );
            this.material   = new THREE.MeshBasicMaterial( { map: undefined } );
            this.mesh = new THREE.Mesh( this.geometry, this.material );
            this.scene.add( this.mesh );

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
        changeBackground: function(backgroundUrl) {
            if (backgroundUrl != this.backgroundUrl) {
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
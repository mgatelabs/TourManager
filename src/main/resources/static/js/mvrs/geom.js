(function(){

    window.MVRS = window.MVRS || {};
    MVRS.geom = MVRS.geom || {};

    /**
     * Base Definition
     */

    MVRS.geom.Base = function() {
        this.init();
    }

    MVRS.geom.Base.prototype = {

        defaults: undefined,

        init: function() {

        },

        merge: function(options) {
            var results = {}, i, item, data;
            for (i = 0; i < this.defaults.length; i++) {
                item = this.defaults[i];
                data = options[item.key];
                if (options.hasOwnProperty(item.key)) {
                    results[item.key] = data;
                } else {
                    results[item.key] = item.value;
                }
            }
            return results;
        },

        gen: function(options, widthRatio, heightRatio) {

        }
    };

    /**
     * Plane Definition
     */

    MVRS.geom.Plane = function() {
        MVRS.geom.Base.call(this);
    }

    MVRS.geom.Plane.prototype = Object.create(MVRS.geom.Base.prototype);

    MVRS.geom.Plane.prototype.init =  function() {
        this.defaults = [];
        this.defaults.push({key:'di', name:'Distance', value: 25});
        this.defaults.push({key:'offx', name:'Offset X', value: 0});
        this.defaults.push({key:'offy', name:'Offset Y', value: 0});
        this.defaults.push({key:'wi', name:'Width', value: 50});
        this.defaults.push({key:'he', name:'Height', value: 50});
        this.defaults.push({key:'sc', name:'Scale', value: 1.0});

        this.defaults.push({key:'maw', name:'Max Adapt Width', value: 1.0});
        this.defaults.push({key:'mah', name:'Max Adapt Height', value: 1.0});
    },

    MVRS.geom.Plane.prototype.gen = function(options, widthRatio, heightRatio) {
        if (options.maw) {
            widthRatio = options.maw - 0.0;
        }
        if (options.mah) {
            heightRatio = options.mah - 0.0;
        }
        options = this.merge(options);

        var geom = new THREE.Geometry(), distance = options.di - 0, distancex = options.offx - 0, distancey = options.offy - 0, width = options.wi - 0, height = options.he - 0, scale = options.sc - 0, halfWidth, halfHeight;

        halfWidth = ((width * widthRatio) / 2.0) * scale;
        halfHeight = ((height * heightRatio) / 2.0) * scale;

        self.generatedDepth = distance;

        // Z, Y, X

        geom.vertices.push(new THREE.Vector3(distance, -halfHeight + distancey, -halfWidth + distancex));
        geom.vertices.push(new THREE.Vector3(distance, -halfHeight + distancey,  halfWidth + distancex));
        geom.vertices.push(new THREE.Vector3(distance,  halfHeight + distancey, -halfWidth + distancex));
        geom.vertices.push(new THREE.Vector3(distance,  halfHeight + distancey,  halfWidth + distancex));

        geom.faces.push(new THREE.Face3(0,1,2));
        geom.faces.push(new THREE.Face3(3,2,1));

        geom.faceVertexUvs[0].push([new THREE.Vector2(0, 0), new THREE.Vector2(1, 0), new THREE.Vector2(0, 1)]);

        geom.faceVertexUvs[0].push([new THREE.Vector2(1, 1), new THREE.Vector2(0, 1), new THREE.Vector2(1, 0)]);

        return geom;
    }

    // Shared Geometry Instances

    MVRS.geom.instances = {
        Plane: new MVRS.geom.Plane()
    }

}());
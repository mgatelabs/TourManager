(function(){

    window.MG = window.MG || {};
    MG.edit = MG.edit || {};
    var ns = MG.edit;

    ns.presets = {
        Plane: [{
          name: 'Distance',
          key: 'di',
          type: 'I',
          min: 10,
          max: 100,
          def: 25
        }, {
          name: 'Offset X',
          key: 'offx',
          type: 'F',
          min: -25,
          max: 25,
          def: 0,
          step: 0.5
        }, {
          name: 'Offset Y',
          key: 'offy',
          type: 'F',
          min: -25,
          max: 25,
          def: 0,
          step: 0.5
        }, {
          name: 'Width',
          key: 'wi',
          type: 'I',
          min: 10,
          max: 100,
          def: 50
        }, {
          name: 'Height',
          key: 'he',
          type: 'I',
          min: 10,
          max: 100,
          def: 50
        }, {
          name: 'Scale',
          key: 'sc',
          type: 'F',
          min: 1,
          max: 10,
          def: 1,
          step: 0.25
        }, {
           name: 'Max Adapt Width',
           key: 'maw',
           type: 'F',
           min: 0.10,
           max: 1.00,
           def: 1.0,
           step: 0.01
         }, {
            name: 'Max Adapt Height',
            key: 'mah',
            type: 'F',
            min: 0.10,
            max: 1.00,
            def: 1.0,
            step: 0.01
          }],
        // Skip these for now, will implement later
        Curved: [

        ],
        Sphere: [{
            name: 'Vertical Columns',
            key: 'cols',
            type: 'I',
            min: 8,
            max: 64,
            def: 48
          }, {
            name: 'Horizontal Rows',
            key: 'rows',
            type: 'I',
            min: 8,
            max: 64,
            def: 48
          }, {
            name: 'Width',
            key: 'wi',
            type: 'F',
            min: 10,
            max: 100,
            def: 10
          }, {
            name: 'Height',
            key: 'he',
            type: 'F',
            min: 10,
            max: 100,
            def: 10
          }, {
            name: 'Depth',
            key: 'de',
            type: 'F',
            min: 10,
            max: 100,
            def: 10
          }
        ],
        Dome: [

        ]
    };

    ns.currentRoom = {};
    ns.currentRoomIndex = -1;
    ns.currentPoint = {};
    ns.currentPointIndex = -1;
    ns.currentPreset = {};
    ns.roomMap = {};
    ns.presetMap = {};

    ns.newRoomBtn = undefined,

    ns.start = function(tourId) {

        // Info
        ns.tourName = $('#tourName');

        ns.tourName.change(function(){
            ns.definition.json.display = $(this).val();
        });

        $('#save').click(function(){
            ns.save();
        });

        // Room List
        ns.roomBody = $('#roomTable tbody');

        // Media List
        ns.mediaBody = $('#mediaTable tbody');

        ns.roomBody.on('click', 'tr td button[mode]', function(){
            var ref = $(this), index = ref.attr('index') - 0, mode = ref.attr('mode');
            switch (mode) {
                case 'EDIT': {
                    ns.selectRoom(index);
                    $('#tabList a[href="#roomEditor"]').tab('show');
                } break;
                case 'UP': {
                    ns.moveRoom(index);
                    ns.updateRoomList();
                } break;
                case 'DOWN': {
                    ns.moveRoom(index + 1);
                    ns.updateRoomList();
                } break;
                case 'DELETE': {
                    if (confirm('Delete room, are you sure?')) {
                        ns.deleteRoom(index);
                        ns.updateRoomList();
                    }
                } break;
            }
        });

        // Room Editor
        ns.roomId = $('#roomId').prop('disabled', true);
        ns.roomName = $('#roomName').prop('disabled', true);
        ns.roomPreview = $('#roomPreview').prop('disabled', true);
        ns.roomContent = $('#roomContent').prop('disabled', true);
        ns.roomPlaybackType = $('#roomPlaybackType').prop('disabled', true);
        ns.roomRotation = $('#roomRotation').prop('disabled', true);

        ns.roomName.change(function(){
            if (ns.currentRoom) {
                ns.currentRoom.title = $(this).val();
            }
        });

        ns.roomPreview.change(function(){
            if (ns.currentRoom) {
                ns.currentRoom.preview = $(this).val();
            }
        });

        ns.roomContent.change(function(){
            if (ns.currentRoom) {
                ns.currentRoom.content = $(this).val();
            }
        });

        ns.roomPlaybackType.change(function(){
            if (ns.currentRoom) {
                ns.currentRoom.playback = $(this).val();
            }
        });

        ns.roomRotation.change(function(){
            if (ns.currentRoom) {
                if (!ns.currentRoom.world) {
                    ns.currentRoom.world = {};
                }
                ns.currentRoom.world.yaw = $(this).val();
                MG.preview.instance.updateRoomOrientation(ns.currentRoom);
            }
        });

        ns.newRoomBtn = $('#newRoom').click(function(){
            var roomId = prompt("New room identifier:");
            if (roomId) {
                for (i = 0; i < ns.index.json.rooms.length; i++) {
                    item = ns.index.json.rooms[i];
                    if (item.id == roomId) {
                        alert('Room with matching identifier already exists');
                        return;
                    }
                }
                ns.deSelectRoom();

                ns.index.json.rooms.push({"id":roomId, "title":roomId, "content":"","points":[], "world":{}});

                ns.updateRoomList();
                ns.updatePointToList()

                ns.selectRoom(ns.index.json.rooms.length - 1);
            }
        });



        // Point List
        ns.pointBody = $('#pointTable tbody');

        ns.pointBody.on('click', 'tr td button[mode]', function(){
            var ref = $(this), index = ref.attr('index') - 0, mode = ref.attr('mode');
            switch (mode) {
                case 'EDIT': {
                    ns.selectPoint(index);
                    MG.preview.pointUpdate();
                } break;
                case 'UP': {
                    ns.movePoint(index);
                    ns.updatePointList();
                } break;
                case 'DOWN': {
                    ns.movePoint(index + 1);
                    ns.updatePointList();
                } break;
                case 'DELETE': {
                    if (confirm('Delete point, are you sure?')) {
                        ns.deletePoint(index);
                        ns.updatePointList();
                    }
                } break;
            }
        });

        $('#newPoint').click(function(){
            if (!ns.currentRoom) {
                alert('Please select a room first');
                return;
            } else if (ns.currentRoom.points.length >= 20) {
                alert('Maximum point limit reached.  A room may only have 20 points.');
                return;
            }
            ns.deSelectPoint();
            ns.currentRoom.points.push({title:'Untitled', type:'rot', action:'noop', icon:'dot', recenter:'false',});
            ns.updatePointList();
            ns.selectPoint(ns.currentRoom.points.length - 1);
            MG.preview.pointUpdate();
        });

        $('#previewPoints').click(function(){
            if (!ns.currentRoom) {
                alert('Please select a room first');
                return;
            }
            ns.deSelectPoint();
            $('#tabList a[href="#pointEditor"]').tab('show');
        });

        // Point Editor
        ns.pointTitle = $('#pointTitle').prop('disabled', true);
        ns.pointType = $('#pointType').prop('disabled', true);
        ns.pointIcon = $('#pointIcon').prop('disabled', true);
        ns.pointAction = $('#pointAction').prop('disabled', true);
        ns.pointSize = $('#pointSize').prop('disabled', true);
        ns.pointTo = $('#pointTo').prop('disabled', true);
        ns.pointContent = $('#pointContent').prop('disabled', true);
        ns.pointPreset = $('#pointPreset').prop('disabled', true);
        ns.pointFlow = $('#pointFlow').prop('disabled', true);
        ns.pointRecenter = $('#pointRecenter').prop('disabled', true);
        ns.pointTimer = $('#pointTimer').prop('disabled', true);

        ns.pointRotY = $('#pointRotY').prop('disabled', true);
        ns.pointRotP = $('#pointRotP').prop('disabled', true);
        ns.pointRotD = $('#pointRotD').prop('disabled', true);

        ns.pointX = $('#pointX').prop('disabled', true);
        ns.pointY = $('#pointY').prop('disabled', true);
        ns.pointZ = $('#pointZ').prop('disabled', true);
        ns.pointXrot = $('#pointXrot').prop('disabled', true);
        ns.pointYrot = $('#pointYrot').prop('disabled', true);
        ns.pointZrot = $('#pointZrot').prop('disabled', true);

        ns.pointTitle.change(function(){
            if (ns.currentPoint) {
                ns.currentPoint.title = $(this).val();
                ns.pointUpdated();
            }
        });

        ns.pointType.change(function(){
            if (ns.currentPoint) {
                ns.currentPoint.type = $(this).val();
                ns.pointUpdated();
                ns.updatePointDisplay();
            }
        });

        ns.pointIcon.change(function(){
            if (ns.currentPoint) {
                ns.currentPoint.icon = $(this).val();
                ns.pointUpdated();
            }
        });

        ns.pointAction.change(function(){
            if (ns.currentPoint) {
                ns.currentPoint.action = $(this).val();
                ns.pointUpdated();
                ns.updatePointDisplay();
            }
        });

        ns.pointSize.change(function(){
            if (ns.currentPoint) {
                ns.currentPoint.size = $(this).val();
                ns.pointUpdated();
            }
        });

        ns.pointTo.change(function(){
            if (ns.currentPoint) {
                ns.currentPoint.to = $(this).val();
                ns.pointUpdated();
            }
        });

        ns.pointContent.change(function(){
            if (ns.currentPoint) {
                ns.currentPoint.content = $(this).val();
            }
        });

        ns.pointPreset.change(function(){
            if (ns.currentPoint) {
                ns.currentPoint.preset = $(this).val();
            }
        });

        ns.pointFlow.change(function(){
            if (ns.currentPoint) {
                ns.currentPoint.flow = $(this).val();
            }
        });

        ns.pointRecenter.change(function(){
            if (ns.currentPoint) {
                ns.currentPoint.recenter = $(this).val();
                ns.pointUpdated();
            }
        });

        ns.pointTimer.change(function(){
            if (ns.currentPoint) {
                ns.currentPoint.timer = $(this).val();
            }
        });

        // Rotate

        ns.pointRotY.change(function(){
            if (ns.currentPoint) {
                ns.currentPoint.yaw = $(this).val();
                ns.pointUpdated();
            }
        });

        ns.pointRotP.change(function(){
            if (ns.currentPoint) {
                ns.currentPoint.pitch = $(this).val();
                ns.pointUpdated();
            }
        });

        ns.pointRotD.change(function(){
            if (ns.currentPoint) {
                ns.currentPoint.depth = $(this).val();
                ns.pointUpdated();
            }
        });

        // Point

        ns.pointX.change(function(){
            if (ns.currentPoint) {
                ns.currentPoint.x = $(this).val();
                ns.pointUpdated();
            }
        });

        ns.pointY.change(function(){
            if (ns.currentPoint) {
                ns.currentPoint.y = $(this).val();
                ns.pointUpdated();
            }
        });

        ns.pointZ.change(function(){
            if (ns.currentPoint) {
                ns.currentPoint.z = $(this).val();
                ns.pointUpdated();
            }
        });

        ns.pointXrot.change(function(){
            if (ns.currentPoint) {
                ns.currentPoint.xrot = $(this).val();
                ns.pointUpdated();
            }
        });

        ns.pointYrot.change(function(){
            if (ns.currentPoint) {
                ns.currentPoint.yrot = $(this).val();
                ns.pointUpdated();
            }
        });

        ns.pointZrot.change(function(){
            if (ns.currentPoint) {
                ns.currentPoint.zrot = $(this).val();
                ns.pointUpdated();
            }
        });

        ns.tourId = tourId;

        // anchors
        ns.listBody = $('#listTable tbody');

        // Preset List

        // Point List
        ns.presetBody = $('#presetTable tbody');

        ns.presetBody.on('click', 'tr td button[mode]', function(){
            var ref = $(this), index = ref.attr('index') - 0, mode = ref.attr('mode'), dat;
            switch (mode) {
                case 'EDIT': {
                    ns.selectPreset(index);
                } break;
                case 'UP': {
                    ns.movePreset(index);
                    ns.updatePresetList();
                } break;
                case 'DOWN': {
                    ns.movePreset(index + 1);
                    ns.updatePresetList();
                } break;
                case 'DELETE': {
                    if (confirm('Delete preset, are you sure?')) {
                        ns.deletePreset(index);
                        ns.updatePresetList();
                    }
                } break;
                case 'COPY': {
                    var presetId = prompt("Preset identifier:");
                    if (presetId) {
                        for (i = 0; i < ns.index.json.presets.length; i++) {
                            item = ns.index.json.presets[i];
                            if (item.name == presetId) {
                                alert('Preset with matching identifier already exists');
                                return;
                            }
                        }
                        ns.deSelectRoom();
                        ns.deSelectPoint();
                        ns.deSelectPreset();

                        dat = $.extend(true, {}, ns.index.json.presets[index], {name: presetId});

                        ns.index.json.presets.push(dat);

                        ns.updatePresetList();
                        ns.updatePresetToList();
                        ns.selectPreset(ns.index.json.presets.length - 1);
                    }
                } break;
            }
        });

        $('#newPreset').click(function(){

            var presetId = prompt("New preset identifier:");
            if (presetId) {
                for (i = 0; i < ns.index.json.presets.length; i++) {
                    item = ns.index.json.presets[i];
                    if (item.name == presetId) {
                        alert('Preset with matching identifier already exists');
                        return;
                    }
                }
                ns.deSelectRoom();
                ns.deSelectPoint();
                ns.deSelectPreset();

                ns.index.json.presets.push({name: presetId, proj:'Plane', mode:'2d', fill:'adapt', ipd:'std', flip:'off', filter: 'off', settings: {}});

                ns.updatePresetList();
                ns.updatePresetToList();
                ns.selectPreset(ns.index.json.presets.length - 1);
            }
        });

        $('#previousRoom').click(function(){
            if (ns.currentRoom) {
                var newIndex = ns.currentRoomIndex - 1;
                if (newIndex > 0) {
                    ns.selectRoom(newIndex);
                    MG.preview.pointUpdate();
                }
            }
        });

        $('#nextRoom').click(function(){
            if (ns.currentRoom) {
                var newIndex = ns.currentRoomIndex + 1;
                if (newIndex < ns.index.json.rooms.length) {
                    ns.selectRoom(newIndex);
                    MG.preview.pointUpdate();
                }
            }
        });

        // Preset Editor
        ns.presetId = $('#presetId').prop('disabled', true);
        ns.presetProj = $('#presetProj').prop('disabled', true);
        ns.presetMode = $('#presetMode').prop('disabled', true);
        ns.presetFill = $('#presetFill').prop('disabled', true);
        ns.presetIpd = $('#presetIpd').prop('disabled', true);
        ns.presetFlip = $('#presetFlip').prop('disabled', true);
        ns.presetFilter = $('#presetFilter').prop('disabled', true);

        ns.presetProj.change(function(){
            if (ns.currentPreset) {
                ns.currentPreset.proj = $(this).val();
                ns.currentPreset.settings = {};

                var i, proj, item;
                proj = ns.presets[ns.currentPreset.proj] || [];
                for (i = 0; i < proj.length; i++) {
                    item = proj[i];
                    ns.currentPreset.settings[item.key] = item.def - 0;
                }

                ns.updatePresetList();
                ns.updatePresetAttributes();
            }
        });

        ns.presetMode.change(function(){
            if (ns.currentPreset) {
                ns.currentPreset.mode = $(this).val();
            }
        });

        ns.presetFill.change(function(){
            if (ns.currentPreset) {
                ns.currentPreset.fill = $(this).val();
            }
        });

        ns.presetIpd.change(function(){
            if (ns.currentPreset) {
                ns.currentPreset.ipd = $(this).val();
            }
        });

        ns.presetFlip.change(function(){
            if (ns.currentPreset) {
                ns.currentPreset.flip = $(this).val();
            }
        });

        ns.presetFilter.change(function(){
            if (ns.currentPreset) {
                ns.currentPreset.filter = $(this).val();
            }
        });

        $('#presetAttributes').on('change', 'input', function(){
            if (ns.currentPreset) {
            var ele = $(this), key = ele.attr('key');
                if (key) {
                    ns.currentPreset.settings[key] = ele.val();
                }
            }
        })

        //

        // load
        ns.load();
    };

    /**
     * IO
     */

    ns.readTourItem = function(data, baseData) {
        if (data.json) {
            var j = JSON.parse(data.json);
            data.json = $.extend(true, {}, baseData.json, j);
        } else {
            return $.extend(true, {}, baseData, data);
        }
        return data;
    };

    ns.load = function() {

        ns.definition = {};
        ns.index = {};
        ns.media = [];

        var rnd = new Date().getTime();
        MG.common.beforeHandler();
        $.getJSON( '/rest/resource/' + ns.tourId + '/info', {
            time: rnd
        }).done(function(data){
            ns.listBody.empty();
            var item, tr, td, i = 0, link;
            if (data.code == 'OK') {

                ns.definition = ns.readTourItem(data.definition, {name:'Undefined', preview:false, json: {display:'Untitled'}});

                ns.index = ns.readTourItem(data.index, ({
                    name:'Undefined',
                    preview:false,
                    json: {
                        version:{major:1, minor:0},
                        tool:'tourman',
                        title:'Untitled',
                        rooms: [],
                        presets: []
                    }
                }));

                if (data.items) {
                    for (i = 0; i < data.items.length; i++) {
                        ns.media.push(ns.readTourItem(data.items[i], {json:{"playbackType" : 4, "type" : 2, "display" : "Untitled", "position" : 0, "rememberPosition" : 0}}));
                    }
                }
            } else {
                MG.common.errorHandler(data);
            }
            ns.refresh();
        });
    };

    ns.verify = function() {
        var result = {errors:[]};



        return result;
    }

    ns.save = function() {
        var verifyResults = ns.verify();
        if (verifyResults.errors && verifyResults.errors.length > 0) {
            // Error handler
        } else {
            // Go
            MG.common.beforeHandler();
            $.post( "/rest/resource/" + ns.tourId + '/info', {info: JSON.stringify(ns.index.json)}, function( data ) {
              if (data.code == 'OK') {
                // Created, switch to edit
                MG.common.beforeHandler();


              } else {
                MG.common.errorHandler(data);
              }
            });
        }
    },

    ns.refresh = function(){
        var i, item, tr, td;

        ns.tourName.val(ns.definition.json.display);

        ns.updateRoomList();

        ns.updateMediaList();

        ns.updateRoomContentList();

        ns.updatePointToList();

        // Presets

        ns.updatePresetList();

        ns.updatePresetToList();
    }

    /**
     * Room Operations
     */

    ns.updateRoomList = function() {
        var i, item, tr, td, link;
        ns.roomBody.empty();
        for (i = 0; i < ns.index.json.rooms.length; i++) {
            item = ns.index.json.rooms[i];
            tr = $('<tr></tr>').appendTo(ns.roomBody);
            tr.attr('room', i);
            if (i == ns.currentRoomIndex) {
                tr.addClass('selected');
            }
            $('<td></td>').text(item.title + ' (' + item.id + ')').appendTo(tr);
            $('<td></td>').text(item.content).appendTo(tr);
            td = $('<td></td>').appendTo(tr);

            link = $('<button type="button" style="margin-right:4px;" class="btn btn-default btn-xs"><span class="glyphicon glyphicon-pencil" aria-hidden="true"></span></button>').attr('index', i).attr('mode', 'EDIT').appendTo(td);


            link = $('<button type="button" style="margin-right:4px;" class="btn btn-default btn-xs"><span class="glyphicon glyphicon-triangle-top" aria-hidden="true"></span></button>').attr('index', i).attr('mode', 'skip').appendTo(td);
            if (i > 0) {
                link.attr('mode', 'UP');
            } else {
                link.prop('disabled', true);
            }

            link = $('<button type="button" style="margin-right:4px;" class="btn btn-default btn-xs"><span class="glyphicon glyphicon-triangle-bottom" aria-hidden="true"></span></button>').attr('index', i).attr('mode', 'skip').appendTo(td);
            if (i < ns.index.json.rooms.length - 1) {
                link.attr('mode', 'DOWN');
            } else {
                link.prop('disabled', true);
            }

            link = $('<button type="button" style="margin-right:4px;" class="btn btn-default btn-xs"><span class="glyphicon glyphicon-trash" aria-hidden="true"></span></button>').attr('index', i).attr('mode', 'DELETE').appendTo(td);
        }
    };

    ns.updateRoomContentList = function() {
        var i, item, option;
        // Room Content
        ns.roomContent.empty();
        for (i = 0; i < ns.media.length; i++) {
            item = ns.media[i];
            option = $('<option></option>').appendTo(ns.roomContent);
            option.text(item.json.display || item.name);
            option.attr('value',item.name);
        }
        // Room Preview
        ns.roomPreview.empty();
        $('<option value="">None</option>').appendTo(ns.roomPreview);
        for (i = 0; i < ns.media.length; i++) {
            item = ns.media[i];
            option = $('<option></option>').appendTo(ns.roomPreview);
            option.text(item.json.display || item.name);
            option.attr('value',item.name);
        }
        // Point Content
        ns.pointContent.empty();
        $('<option value="">None</option>').appendTo(ns.pointContent);
        for (i = 0; i < ns.media.length; i++) {
            item = ns.media[i];
            option = $('<option></option>').appendTo(ns.pointContent);
            option.text(item.json.display || item.name);
            option.attr('value',item.name);
        }
    };

    ns.selectRoom = function(roomIndex){

        ns.currentRoomIndex = roomIndex;

        ns.currentRoom = ns.index.json.rooms[roomIndex];

        ns.roomBody.find('tr[room]').removeClass('selected').filter('[room='+roomIndex+']').addClass('selected');

        ns.deSelectPoint();

        $('#pointEditLink').addClass('disabled');

        // Integrity
        if (!ns.currentRoom.world) {
            ns.currentRoom.world = {};
        }

        ns.roomId.val(ns.currentRoom.id);
        ns.roomName.prop('disabled', false).val(ns.currentRoom.title);
        ns.roomPreview.prop('disabled', false).val(ns.currentRoom.preview || '');
        ns.roomContent.prop('disabled', false).val(ns.currentRoom.content);
        ns.roomPlaybackType.prop('disabled', false).val(ns.currentRoom.playback || '360');
        ns.roomRotation.prop('disabled', false).val(ns.currentRoom.world.yaw || '0');

        ns.updatePointList();
    };

    ns.deSelectRoom = function(){

        ns.currentRoomIndex = -1;

        ns.roomBody.find('tr[room]').removeClass('selected');

        ns.currentRoom = undefined;

        ns.deSelectPoint();

        $('#pointEditLink').addClass('disabled');

        ns.roomId.val('');
        ns.roomName.prop('disabled', true).val('');
        ns.roomPreview.prop('disabled', true).val([]);
        ns.roomContent.prop('disabled', true).val([]);
        ns.roomPlaybackType.prop('disabled', true).val('360');
        ns.roomRotation.prop('disabled', true).val('0');
    };

    ns.moveRoom = function(roomIndex) {
        ns.deSelectRoom();
        var toRemove = ns.index.json.rooms.splice(roomIndex, 1)[0];
        ns.index.json.rooms.splice(roomIndex - 1, 0, toRemove);
    };

    ns.deleteRoom = function(roomIndex) {
        ns.deSelectRoom();
        ns.index.json.rooms.splice(roomIndex, 1)[0];
    };

    /**
     * Point Operations
     */

    ns.updatePointList = function() {
        var i, item, tr, td, link;
        ns.pointBody.empty();

        if (!ns.currentRoom || !ns.currentRoom.points) return;

        for (i = 0; i < ns.currentRoom.points.length; i++) {
            item = ns.currentRoom.points[i];
            tr = $('<tr></tr>').appendTo(ns.pointBody);
            tr.attr('point', i);
            if (i == ns.currentPointIndex) {
                tr.addClass('selected');
            }

            // Title
            $('<td></td>').text(item.title).appendTo(tr);

            // Type
            td = $('<td></td>').appendTo(tr);
            switch (item.type) {
                case 'rot': {
                    td.text('Rotation (Y:'+(item.yaw || 0)+',P:'+(item.pitch || 0)+',D:'+(item.depth || 1.5)+',S:'+(item.size || 1.0)+')');
                } break;
                case 'point': {
                    td.text('Point');
                } break;
                case 'action': {
                    td.text('Action');
                } break;
            }

            // Action
            td = $('<td></td>').appendTo(tr);
            switch (item.action) {
                case 'nav': {
                    td.text('Navigate To ' + (ns.roomMap[item.to] || 'Unknown') + ' (' + (item.to || 'Undefined') + ')');
                } break;
                case 'stop': {
                    td.text('Stop Tour');
                } break;
                case 'exit': {
                    td.text('Exit VR');
                } break;
                case 'play': {
                    td.text('Play (' + (item.content || 'Unknown') + ')');
                } break;
            }

            // Options
            td = $('<td></td>').appendTo(tr);

            link = $('<button type="button" style="margin-right:4px;" class="btn btn-default btn-xs"><span class="glyphicon glyphicon-pencil" aria-hidden="true"></span></button>').attr('index', i).attr('mode', 'EDIT').appendTo(td);

            link = $('<button type="button" style="margin-right:4px;" class="btn btn-default btn-xs"><span class="glyphicon glyphicon-triangle-top" aria-hidden="true"></span></button>').attr('index', i).attr('mode', 'skip').appendTo(td);
            if (i > 0) {
                link.attr('mode', 'UP');
            } else {
                link.prop('disabled', true);
            }

            link = $('<button type="button" style="margin-right:4px;" class="btn btn-default btn-xs"><span class="glyphicon glyphicon-triangle-bottom" aria-hidden="true"></span></button>').attr('index', i).attr('mode', 'skip').appendTo(td);
            if (i < ns.currentRoom.points.length - 1) {
                link.attr('mode', 'DOWN');
            } else {
                link.prop('disabled', true);
            }

            link = $('<button type="button" style="margin-right:4px;" class="btn btn-default btn-xs"><span class="glyphicon glyphicon-trash" aria-hidden="true"></span></button>').attr('index', i).attr('mode', 'DELETE').appendTo(td);
        }
    };

    ns.updatePointToList = function() {

        ns.roomMap = {};

        var i, item, option;
        ns.pointTo.empty();
        option = $('<option></option>').appendTo(ns.pointTo);
        option.attr('value','');
        for (i = 0; i < ns.index.json.rooms.length; i++) {
            item = ns.index.json.rooms[i];
            option = $('<option></option>').appendTo(ns.pointTo);
            option.text(item.title);
            option.attr('value',item.id);
            ns.roomMap[item.id] = item.title;
        }
    };

    ns.selectPoint = function(pointIndex){

        ns.currentPointIndex = pointIndex;

        ns.currentPoint = ns.currentRoom.points[pointIndex];

        //ns.pointBody.find('tr[point]').removeClass('selected').filter('[point='+pointIndex+']').addClass('selected');

        $('#pointEditLink').removeClass('disabled');

        ns.pointTitle.prop('disabled', false).val(ns.currentPoint.title || 'Undefined');
        ns.pointType.prop('disabled', false).val(ns.currentPoint.type || 'rot');
        ns.pointIcon.prop('disabled', false).val(ns.currentPoint.icon || 'dot');
        ns.pointAction.prop('disabled', false).val(ns.currentPoint.action || 'noop');
        ns.pointSize.prop('disabled', false).val(ns.currentPoint.size || 1.0);
        ns.pointTo.prop('disabled', false).val(ns.currentPoint.to || '');
        ns.pointContent.prop('disabled', false).val(ns.currentPoint.content || '');
        ns.pointPreset.prop('disabled', false).val(ns.currentPoint.preset || '');
        ns.pointFlow.prop('disabled', false).val(ns.currentPoint.flow || 'stop');
        ns.pointRecenter.prop('disabled', false).val(ns.currentPoint.recenter || 'false');
        ns.pointTimer.prop('disabled', false).val(ns.currentPoint.timer || '');

        ns.pointRotY.prop('disabled', false).val(ns.currentPoint.yaw || 0);
        ns.pointRotP.prop('disabled', false).val(ns.currentPoint.pitch || 0);
        ns.pointRotD.prop('disabled', false).val(ns.currentPoint.depth || 1.5);

        ns.pointX.prop('disabled', false).val(ns.currentPoint.x || 0);
        ns.pointY.prop('disabled', false).val(ns.currentPoint.y || 0);
        ns.pointZ.prop('disabled', false).val(ns.currentPoint.z || 0);

        ns.pointXrot.prop('disabled', false).val(ns.currentPoint.xrot || 0);
        ns.pointYrot.prop('disabled', false).val(ns.currentPoint.yrot || 0);
        ns.pointZrot.prop('disabled', false).val(ns.currentPoint.zrot || 0);

        ns.updatePointDisplay();

        ns.updatePointList();
    };

    ns.deSelectPoint = function(){

        ns.currentPointIndex = -1;

        ns.pointBody.find('tr[point]').removeClass('selected');

        ns.currentPoint = undefined;

        $('#pointEditLink').addClass('disabled');

        ns.pointTitle.prop('disabled', true).val('');
        ns.pointType.prop('disabled', true).val('rot');
        ns.pointIcon.prop('disabled', true).val('dot');
        ns.pointAction.prop('disabled', true).val('noop');
        ns.pointSize.prop('disabled', true).val(1.0);
        ns.pointTo.prop('disabled', true).val('');
        ns.pointContent.prop('disabled', true).val('');
        ns.pointPreset.prop('disabled', true).val('');
        ns.pointFlow.prop('disabled', true).val('stop');
        ns.pointRecenter.prop('disabled', true).val('false');
        ns.pointTimer.prop('disabled', true).val('');

        ns.pointRotY.prop('disabled', true).val(0);
        ns.pointRotP.prop('disabled', true).val(0);
        ns.pointRotD.prop('disabled', true).val(1.5);

        ns.pointX.prop('disabled', true).val(0);
        ns.pointY.prop('disabled', true).val(0);
        ns.pointZ.prop('disabled', true).val(0);

        ns.pointXrot.prop('disabled', true).val(0);
        ns.pointYrot.prop('disabled', true).val(0);
        ns.pointZrot.prop('disabled', true).val(0);
    };

    ns.updatePointDisplay = function () {

        ns.pointTo.prop('disabled', ns.pointAction.val() != 'nav');
        ns.pointContent.prop('disabled', ns.pointAction.val() != 'play');
        ns.pointPreset.prop('disabled', ns.pointAction.val() != 'play');

        var rotMode = ns.pointType.val();

        if (rotMode == 'rot') {
            $('.rot-based').show();
            $('.point-based').hide();
        } else if (rotMode == 'point') {
            $('.rot-based').hide();
            $('.point-based').show();
        } else if (rotMode == 'action') {
            $('.rot-based').show();
            $('.point-based').hide();
        }
    }

    ns.movePoint = function(pointIndex) {

        ns.deSelectPoint();

        var toRemove = ns.currentRoom.points.splice(pointIndex, 1)[0];

        ns.currentRoom.points.splice(pointIndex - 1, 0, toRemove);
    };

    ns.deletePoint = function(pointIndex) {
        ns.deSelectPoint();
        ns.currentRoom.points.splice(pointIndex, 1)[0];
    };

    ns.pointUpdated = function() {
        MG.preview.instance.points(MG.edit.currentRoom, MG.edit.currentPoint);
        MG.preview.instance.update();
    }

    /**
     * Preset Operations
     */

    ns.updatePresetList = function() {
        var i, item, tr, td, link;
        ns.presetBody.empty();
        for (i = 0; i < ns.index.json.presets.length; i++) {
            item = ns.index.json.presets[i];
            tr = $('<tr></tr>').appendTo(ns.presetBody);
            $('<td></td>').text(item.name).appendTo(tr);
            $('<td></td>').text(item.proj).appendTo(tr);
            td = $('<td></td>').appendTo(tr);

            link = $('<button type="button" style="margin-right:4px;" class="btn btn-default btn-xs"><span class="glyphicon glyphicon-pencil" aria-hidden="true"></span></button>').attr('index', i).attr('mode', 'EDIT').appendTo(td);


            link = $('<button type="button" style="margin-right:4px;" class="btn btn-default btn-xs"><span class="glyphicon glyphicon-triangle-top" aria-hidden="true"></span></button>').attr('index', i).attr('mode', 'skip').appendTo(td);
            if (i > 0) {
                link.attr('mode', 'UP');
            } else {
                link.prop('disabled', true);
            }

            link = $('<button type="button" style="margin-right:4px;" class="btn btn-default btn-xs"><span class="glyphicon glyphicon-triangle-bottom" aria-hidden="true"></span></button>').attr('index', i).attr('mode', 'skip').appendTo(td);
            if (i < ns.index.json.rooms.length - 1) {
                link.attr('mode', 'DOWN');
            } else {
                link.prop('disabled', true);
            }

            link = $('<button type="button" style="margin-right:4px;" class="btn btn-default btn-xs" title="Delete"><span class="glyphicon glyphicon-trash" aria-hidden="true"></span></button>').attr('index', i).attr('mode', 'DELETE').appendTo(td);

            link = $('<button type="button" style="margin-right:4px;" class="btn btn-default btn-xs" title="Copy"><span class="glyphicon glyphicon-copy" aria-hidden="true"></span></button>').attr('index', i).attr('mode', 'COPY').appendTo(td);
        }
    };

    ns.selectPreset = function(presetIndex){

        ns.currentPreset = ns.index.json.presets[presetIndex];

        //ns.deSelectPoint();

        //$('#pointEditLink').addClass('disabled');

        // Integrity
        if (!ns.currentPreset.settings) {
            ns.currentPreset.settings = {};
        }

        ns.presetId.val(ns.currentPreset.name);
        ns.presetProj.prop('disabled', false).val(ns.currentPreset.proj || 'Plane');
        ns.presetMode.prop('disabled', false).val(ns.currentPreset.mode || '2d');
        ns.presetFill.prop('disabled', false).val(ns.currentPreset.fill || 'adapt');
        ns.presetIpd.prop('disabled', false).val(ns.currentPreset.ipd || 'std');
        ns.presetFlip.prop('disabled', false).val(ns.currentPreset.flip || 'off');
        ns.presetFilter.prop('disabled', false).val(ns.currentPreset.filter || 'off');

        ns.updatePresetAttributes();
    };

    ns.findPreset = function(presetId) {
        var i, p;

        for (i = 0; i < ns.index.json.presets.length; i++) {
            p = ns.index.json.presets[i];
            if (p.name == presetId) {
                return p;
            }
        }
        return {};
    },

    ns.deSelectPreset = function(){

        ns.currentPreset = undefined;

        //ns.deSelectPoint();

        //$('#pointEditLink').addClass('disabled');

        ns.presetId.val('');
        ns.presetProj.prop('disabled', true).val('Plane');
        ns.presetMode.prop('disabled', true).val('2d');
        ns.presetFill.prop('disabled', true).val('adapt');
        ns.presetIpd.prop('disabled', true).val('std');
        ns.presetFlip.prop('disabled', true).val('off');
        ns.presetFilter.prop('disabled', true).val('off');

        ns.updatePresetAttributes();
    };

    ns.movePreset = function(presetIndex) {
        ns.deSelectPreset();
        var toRemove = ns.index.json.presets.splice(presetIndex, 1)[0];
        ns.index.json.presets.splice(presetIndex - 1, 0, toRemove);
    };

    ns.deletePreset = function(presetIndex) {
        ns.deSelectPreset();
        ns.index.json.presets.splice(presetIndex, 1)[0];
    };

    ns.updatePresetToList = function() {

        ns.presetMap = {};

        var i, item, option;
        ns.pointPreset.empty();
        option = $('<option></option>').appendTo(ns.pointTo);
        option.attr('value','');
        for (i = 0; i < ns.index.json.presets.length; i++) {
            item = ns.index.json.presets[i];
            option = $('<option></option>').appendTo(ns.pointPreset);
            option.text(item.name + ' - ' + item.proj);
            option.attr('value',item.name);
            ns.presetMap[item.id] = i;
        }
    };

    ns.updatePresetAttributes = function(){

        var presetAttributes = $('#presetAttributes').empty(), fg, i, lab, inp, item, attributes;

        if (ns.currentPreset) {

            attributes = ns.presets[ns.currentPreset.proj || 'Plane'];

            for (i = 0; i < attributes.length; i++) {
                item = attributes[i];
                fg = $('<div class="form-group preset-based"></div>').appendTo(presetAttributes);
                lab = $('<label></label>').attr('for', 'preset_' + item.key ).text(item.name).appendTo(fg);
                inp = $('<input type="number" class="form-control presetBased"/>').attr('id', 'preset_' + item.key).attr('key', item.key).attr('min', item.min).attr('max', item.max).val(ns.currentPreset.settings[item.key] || item.def).attr('step', item.step || 1).appendTo(fg);
            }

        }
    }

    /**
     * Media Operations
     */

    ns.updateMediaList = function() {
        var i, item, tr, td, link;
        ns.mediaBody.empty();
        for (i = 0; i < ns.media.length; i++) {
            item = ns.media[i];
            tr = $('<tr></tr>').appendTo(ns.mediaBody);
            $('<td></td>').text(item.name).appendTo(tr);
            $('<td></td>').text(item.json.display || 'Untitled').appendTo(tr);
            $('<td></td>').text(item.preview).appendTo(tr);
            td = $('<td></td>').appendTo(tr);

        }
    };

    /**
     * Utility Operations
     */

    ns.getBackgroundUrl = function(){
        if (ns.currentRoom && ns.currentRoom.content) {
            return "/rest/resource/" + ns.tourId + '/' + ns.currentRoom.content;
        }
        return "";
    }

}());
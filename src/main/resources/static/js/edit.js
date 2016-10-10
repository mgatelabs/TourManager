(function(){

    window.MG = window.MG || {};
    MG.edit = MG.edit || {};
    var ns = MG.edit;

    ns.currentRoom = {};
    ns.currentPoint = {};
    ns.roomMap = {};

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
        ns.roomContent = $('#roomContent').prop('disabled', true);
        ns.roomPlaybackType = $('#roomPlaybackType').prop('disabled', true);
        ns.roomRotation = $('#roomRotation').prop('disabled', true);

        ns.roomName.change(function(){
            if (ns.currentRoom) {
                ns.currentRoom.title = $(this).val();
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
                    $('#tabList a[href="#pointEditor"]').tab('show');
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
            } else if (ns.currentRoom.points.length >= 10) {
                alert('Maximum point limit reached.  A room may only have 10 points.');
                return;
            }
            ns.deSelectPoint();
            ns.currentRoom.points.push({title:'Untitled', type:'rot', action:'stop', icon:'dot', recenter:'false',});
            ns.updatePointList();
            ns.selectPoint(ns.currentRoom.points.length - 1);
            $('#tabList a[href="#pointEditor"]').tab('show');
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

        ns.pointRecenter.change(function(){
            if (ns.currentPoint) {
                ns.currentPoint.recenter = $(this).val();
                ns.pointUpdated();
            }
        });

        ns.pointTimer.change(function(){
            if (ns.currentPoint) {
                ns.currentPoint.timer = $(this).val();
                //ns.pointUpdated();
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
                        rooms: []
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
            $('<td></td>').text(item.title + ' (' + item.id + ')').appendTo(tr);
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
        ns.roomContent.empty();
        for (i = 0; i < ns.media.length; i++) {
            item = ns.media[i];
            option = $('<option></option>').appendTo(ns.roomContent);
            option.text(item.json.display || item.name);
            option.attr('value',item.name);
        }
    };

    ns.selectRoom = function(roomIndex){

        ns.currentRoom = ns.index.json.rooms[roomIndex];

        ns.deSelectPoint();

        $('#pointEditLink').addClass('disabled');

        // Integrity
        if (!ns.currentRoom.world) {
            ns.currentRoom.world = {};
        }

        ns.roomId.val(ns.currentRoom.id);
        ns.roomName.prop('disabled', false).val(ns.currentRoom.title);
        ns.roomContent.prop('disabled', false).val(ns.currentRoom.content);
        ns.roomPlaybackType.prop('disabled', false).val(ns.currentRoom.playback || '360');
        ns.roomRotation.prop('disabled', false).val(ns.currentRoom.world.yaw || '0');

        ns.updatePointList();
    };

    ns.deSelectRoom = function(){

        ns.currentRoom = undefined;

        //ns.newRoomBtn.prop('disabled', true);

        ns.deSelectPoint();

        $('#pointEditLink').addClass('disabled');

        ns.roomId.val('');
        ns.roomName.prop('disabled', true).val('');
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

        ns.currentPoint = ns.currentRoom.points[pointIndex];

        $('#pointEditLink').removeClass('disabled');

        ns.pointTitle.prop('disabled', false).val(ns.currentPoint.title || 'Undefined');
        ns.pointType.prop('disabled', false).val(ns.currentPoint.type || 'rot');
        ns.pointIcon.prop('disabled', false).val(ns.currentPoint.icon || 'dot');
        ns.pointAction.prop('disabled', false).val(ns.currentPoint.action || 'nav');
        ns.pointSize.prop('disabled', false).val(ns.currentPoint.size || 1.0);
        ns.pointTo.prop('disabled', false).val(ns.currentPoint.to || '');
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
    };

    ns.deSelectPoint = function(){

        ns.currentPoint = undefined;

        $('#pointEditLink').addClass('disabled');

        ns.pointTitle.prop('disabled', true).val('');
        ns.pointType.prop('disabled', true).val('rot');
        ns.pointIcon.prop('disabled', true).val('dot');
        ns.pointAction.prop('disabled', true).val('nav');
        ns.pointSize.prop('disabled', true).val(1.0);
        ns.pointTo.prop('disabled', true).val('');
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


        var rotMode = ns.pointType.val() == 'rot';

        if (rotMode) {
            $('.rot-based').show();
            $('.point-based').hide();
        } else {
            $('.rot-based').hide();
            $('.point-based').show();
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
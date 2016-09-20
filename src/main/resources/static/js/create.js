(function(){

    window.MG = window.MG || {};
    MG.create = MG.create || {};
    var ns = MG.create;

    ns.save = function(){
        // Check the Identifier

        var identifier = $.trim($('#tourId').val()) || '', title = $.trim($('#tourTitle').val() || '');

        if (identifier.match(/^[a-z0-9-_]+$/g)) {
            if (title) {

                $.post( "/rest/resource/tour/create", {tourTitle: title, tourIdentifier: identifier}, function( data ) {
                  if (data.code == 'OK') {
                    // Created, switch to edit
                    window.location = '/edit/' + identifier + ".tour/"
                  } else {
                    // Exceptions
                  }
                });


            } else {
                alert('Please specify a tour title.');
            }
        } else {
            alert('Invalid Tour Identifier, please only use the characters 0-9, a-z - or _.');
        }
    };

    ns.clear = function(){
        $('#tourTitle').val('');
        $('#tourId').val('');
    };

}());
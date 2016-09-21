(function(){

    window.MG = window.MG || {};
    MG.common = MG.common || {};
    var ns = MG.common;

    ns.beforeHandler = function() {
        $('#errors').empty();
    };

    ns.errorHandler = function(restResponse) {
        var i, errors = $('#errors').empty();
        if (restResponse.messages) {
            errors.show();
            for (i = 0; i < restResponse.messages.length; i++) {
                errors.append($('<span></span>').text(restResponse.messages[i]));
            }
        } else {
            errors.hide();
        }
    };

}());
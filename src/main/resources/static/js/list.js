(function(){

    window.MG = window.MG || {};
    MG.list = MG.list || {};
    var ns = MG.list;

    ns.start = function() {
        // anchors
        ns.listBody = $('#listTable tbody');
        // load
        ns.load();

        ns.listBody.on('click', 'tr td button[mode]', function(){
            var ref = $(this), index = ref.attr('index') - 0, mode = ref.attr('mode');
            switch (mode) {
                case 'EDIT': {
                    var href = ref.attr('href');
                    window.location = href;
                } break;
            }
        });
    };

    ns.load = function() {
        $.getJSON( '/rest/tours/list', {
            time: new Date().getTime()
        }).done(function(data){
            ns.listBody.empty();
            var item, tr, td, i = 0, link, rnd = new Date().getTime();
            if (data.code == 'OK') {
                for (i = 0; i < data.items.length; i++) {
                    item = data.items[i];
                    tr = $('<tr></tr>').appendTo( ns.listBody);
                    $('<td></td>').text(item.name + ' (' + item.identifier + ')').appendTo(tr);
                    td = $('<td></td>').appendTo(tr);

                    link = $('<button type="button" style="margin-right:4px;" class="btn btn-default btn-xs"><span class="glyphicon glyphicon-pencil" aria-hidden="true"></span></button>').attr('index', i).attr('mode', 'EDIT').appendTo(td);
                    link.attr('href', '/edit/' + item.identifier + '/?time=' + rnd);
                }
            }
        });
    };


    $(function(){
        ns.start();
    });

}());
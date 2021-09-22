$(document).ready(function(){
    var element = $('meta[name="active-menu"]').attr('content');
    $('#' + element).addClass('active');
    $('#add-button').click(function() {
        $('.form-control').val('');
        $(".selectpicker").selectpicker("refresh");
        if ($('#myModalLabel').html() == 'Add New Product Profile') {
            $('.product_index').html($('#product_profile_id').val());
            $('#new-no').prop('checked', true);
            $('.hidden-label').css('display', 'none');
            $('.hidden-div').css('display', 'none');
        }
    })

    $("#bookkeeper-table").DataTable();
    $("#element-table").DataTable({
        "ordering": false
    });

    $('ul.dropdown-menu [data-toggle=dropdown]').on('click', function(event) {
        // Avoid following the href location when clicking
        event.preventDefault(); 
        // Avoid having the menu to close when clicking
        event.stopPropagation(); 
        // If a menu is already open we close it
        $('ul.dropdown-menu [data-toggle=dropdown]').parent().removeClass('open');
        // opening the one you clicked on
        $(this).parent().addClass('open');
    
        var menu = $(this).parent().find("ul");
        var menupos = menu.offset();
      
        if ((menupos.left + menu.width()) + 30 > $(window).width()) {
            var newpos = - menu.width();      
        } else {
            var newpos = $(this).parent().width();
        }
        menu.css({ left:newpos });
        menu.css('margin-top', '-25px');
        menu.css('font-size', '15px');
    });
});
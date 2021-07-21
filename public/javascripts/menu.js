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
});
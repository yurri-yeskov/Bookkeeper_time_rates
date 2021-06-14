$(document).ready(function(){
    var element = $('meta[name="active-menu"]').attr('content');
    $('#' + element).addClass('active');
    $('#add-button').click(function() {
        $('.form-control').val('');
        $(".selectpicker").selectpicker("refresh");
    })

    $("#bookkeeper-table").DataTable();
    $("#element-table").DataTable();
});
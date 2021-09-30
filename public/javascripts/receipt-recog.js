$(document).ready(function(){
    resize();
});
window.onresize = resize;

function resize() {
    var h = $('#imagePanel').height() - 75;
    $('#previewImage').css('height', h + 'px');
    $('#resultViewer').css('height', h + 'px');
}
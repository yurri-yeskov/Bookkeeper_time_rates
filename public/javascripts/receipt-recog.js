$(document).ready(function(){
    var h = $('#imagePanel').height() - 75;
    $('#previewImage').css('height', h + 'px');
    $('#resultViewer').css('height', h + 'px');
});

function resize() {
    console.log("tyesfsdfasdfadsf");
}
  
window.onresize = resize;
$(document).ready(function(){
    resize();
    loadImage();
});
window.onresize = resize;

function resize() {
    var h = $('#imagePanel').height() - 75;
    $('#previewImage').css('height', h + 'px');
    $('#resultViewer').css('height', h + 'px');
}

function loadImage() {
    $('#imagePath').bind('input keyup', function(){
      var $this = $(this);
      var delay = 1000; // 1 seconds delay after last input
  
      $('#previewImage').attr('src','./images/no-image.png');
  
      clearTimeout($this.data('timer'));
      $this.data('timer', setTimeout(function(){
        $this.removeData('timer');
        
        $('#previewImage').attr('src', $('#imagePath').val());
      }, delay));
    });
  }
$(document).ready(function(){
    resize();
    loadImage();
});
window.onresize = resize;

function resize() {
    var h = $('#imagePanel').height() - 75;
    var lh = $('#imagePanel').height() - 365;
    $('#previewImage').css('height', h + 'px');
    $('#resultViewer').css('height', h + 'px');
    $('.loader').css('margin-top', lh + 'px');
}

function loadImage() {
    $('#imagePath').bind('input keyup', function(){
      var $this = $(this);
      var delay = 500; // 0.5 seconds delay after last input
      var image_path = $('#imagePath').val();
      var path_split = image_path.split('.');
  
      if (path_split[path_split.length - 1] != 'pdf' && path_split[path_split.length - 1] != 'PDF')
        $('#previewImage').attr('src','./images/no-image.png');
      else {
        $('#previewImage').attr('src','./images/pdf-file.png');
        clearTimeout($this.data('timer'));
        return;
      }
  
      clearTimeout($this.data('timer'));
      $this.data('timer', setTimeout(function(){
        $this.removeData('timer');
        $('#previewImage').attr('src', image_path);
      }, delay));
    });
}

function startRecognition() {
    var image_path = $('#imagePath').val();

    $.ajax({
        type: "post",
        url: 'get_recog_result',
        data: {
            image_path: image_path
        },
        dataType: "json",
        success: function(data) {
            // alert success
            console.log("asdf");
        }
    });
}



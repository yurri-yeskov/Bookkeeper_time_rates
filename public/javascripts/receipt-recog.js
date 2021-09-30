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

    $('#resultViewer').css('display', 'none');
    $('.resultarea').css('display', 'none');
    $('.loader').css('display', 'block');

    $.ajax({
        type: "post",
        url: 'get_recog_result',
        data: {
            image_path: image_path
        },
        dataType: "json",
        success: function(data) {
            // alert success
            $('#resultViewer').css('display', 'block');
            $('.resultarea').css('display', 'inline-block');
            $('.loader').css('display', 'none');
            result_arr = data.data;
            var result_str = ""
            for (var i = 0; i < result_arr.length; i++) {
                var page_num = i + 1;
                result_str = result_arr + "///////" + " PAGE " + page_num + "///////\n";
                var lines = result_arr[i].TextOverlay.Lines;
                for (var j = 0; j < lines.length; j++) {
                    var words = lines[j].Words;
                    for (var k = 0; k < words.length; k++) {
                        var word_text = words[k].WordText;
                        result_str = result_str + word_text + " ";
                        //////command/////
                    }
                    result_str = result_str + "\n";
                }
            }
            $('#resultViewer').val(result_str);
            console.log(result_str);
        }
    });
}



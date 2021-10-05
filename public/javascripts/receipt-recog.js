$(document).ready(function(){
    resize();
    loadImage();
});
window.onresize = resize;

function resize() {
    var h = $('#imagePanel').height() - 75;
    var mt = $('#imagePanel').height() / 2 - $('.loader').height() / 2;
    $('#previewImage').css('height', h + 'px');
    $('#resultViewer').css('height', h + 'px');
    $('.loader').css('margin-top', mt + 'px');
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

    if (image_path == '') {
        alert('Please paste url to source file!');
        return;
    }

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
            $('#resultViewer').css('display', 'inline-block');
            $('.resultarea').css('display', 'block');
            $('.loader').css('display', 'none');
            result_arr = data.data;
            var result_str = "";
            for (var i = 0; i < result_arr.length; i++) {
                var page_num = i + 1;
                result_str = result_str + "///////" + " PAGE " + page_num + " ///////\n";
                var lines = result_arr[i].TextOverlay.Lines;
                for (var j = 0; j < lines.length; j++) {
                    var words = lines[j].Words;
                    for (var k = 0; k < words.length; k++) {
                        var word_text = words[k].WordText;
                        result_str = result_str + word_text + " ";
                        // result_str = "<strong>" + result_str + "</strong>";
                        //////command/////
                    }
                    result_str = result_str + "\n";
                }
            }
            if (result_str == '') result_str = "Not exist file or Error";
            $('#resultViewer').html(result_str);
            // console.log(result_str);
        },
        error: function(e) {
            $('#resultViewer').css('display', 'inline-block');
            $('.resultarea').css('display', 'block');
            $('.loader').css('display', 'none');
            // console.log(e);
            $('#resultViewer').html(e.responseText);
        }
    });
}



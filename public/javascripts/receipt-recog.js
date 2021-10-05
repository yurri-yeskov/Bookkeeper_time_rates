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
    $('#imagePath').bind('input keyup', function() {
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
    var date_str = $('#input-date').val();
    var amount_str = $('#input-amount').val();
    var word_str = $('#input-wordstring').val();

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
            image_path: image_path,
            date_str: date_str,
            amount_str: amount_str,
            word_str: word_str
        },
        dataType: "json",
        success: function(data) {
            // alert success
            $('#resultViewer').css('display', 'inline-block');
            $('.resultarea').css('display', 'block');
            $('.loader').css('display', 'none');
            result_arr = data.data;
            var result_str = "";
            var words_index = 0;
            for (var i = 0; i < result_arr.length; i++) {
                var page_num = i + 1;
                result_str = result_str + "///////" + " PAGE " + page_num + " ///////\n";
                var lines = result_arr[i].TextOverlay.Lines;
                for (var j = 0; j < lines.length; j++) {
                    var words = lines[j].Words;
                    for (var k = 0; k < words.length; k++) {
                        var word_text = words[k].WordText;
                        if (data.words_indexs.includes(words_index))
                            result_str = result_str + "<strong>" + word_text + "</strong> ";
                        else
                            result_str = result_str + word_text + " ";
                        words_index++;
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

function convertString(phrase) {

    var returnString = phrase.toLowerCase();
    //Convert Characters
    returnString = returnString.replace(/ö/g, 'o');
    returnString = returnString.replace(/ø/g, 'o');
    returnString = returnString.replace(/ç/g, 'c');
    returnString = returnString.replace(/ş/g, 's');
    returnString = returnString.replace(/ı/g, 'i');
    returnString = returnString.replace(/ğ/g, 'g');
    returnString = returnString.replace(/ü/g, 'u');  
    returnString = returnString.replace(/å/g, 'a');  
    returnString = returnString.replace(/ă/g, 'a');  

    return returnString;
}


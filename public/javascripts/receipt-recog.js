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

// function loadImage() {
//     $('#imagePath').bind('input keyup', function(){
//       var $this = $(this);
//       var delay = 500; // 0.5 seconds delay after last input
//       var img_base_url = "https://login.ebogholderen.dk/lib/GetFile.php?filename="
  
//       $('#previewImage').attr('src','./images/no-image.png');
  
//       clearTimeout($this.data('timer'));
//       $this.data('timer', setTimeout(function(){
//         $this.removeData('timer');
        
//         $('#previewImage').attr('src', img_base_url + $('#imagePath').val());
//       }, delay));
//     });
// }


document.getElementById('imagePath').onchange = function (evt) {
    var tgt = evt.target || window.event.srcElement,
        files = tgt.files;

    // FileReader support
    if (FileReader && files && files.length) {
        var fr = new FileReader();
        fr.onload = function () {
            document.getElementById('previewImage').src = fr.result;
        }
        fr.readAsDataURL(files[0]);
    }

    // Not supported
    else {
        // fallback -- perhaps submit the input to an iframe and temporarily store
        // them on the server until the user's session ends.
        $('#previewImage').attr('src','./images/no-image.png');
    }
}



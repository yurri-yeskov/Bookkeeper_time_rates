$(document).ready(function(){
    resize();
    loadImage();

    $('#input-date').datepicker({
        format: "yyyy-mm-dd",
        todayHighlight: true,
        clearBtn: true
    });
});
window.onresize = resize;

function resize() {
    var h = $('#imagePanel').height() - 75;
    var mt = $('#imagePanel').height() / 2 - $('.loader').height() / 2;
    $('#previewImage').css('height', h + 'px');
    $('#resultViewer').css('height', h + 'px');
    $('.loader').css('margin-top', mt + 'px');
}

function isValidDate(dateString)
{
  if (!dateString) return true;

  // First check for the pattern
  if(!/^\d{1,4}\-\d{1,2}\-\d{2}$/.test(dateString)) 
    return false;

  // Parse the date parts to integers
  var parts = dateString.split("-");
  var day = parseInt(parts[2], 10);
  var month = parseInt(parts[1], 10);
  var year = parseInt(parts[0], 10);

  // Check the ranges of month and year
  if(year < 1000 || year > 3000 || month == 0 || month > 12)
    return false;

  var monthLength = [ 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31 ];

  // Adjust for leap years
  if(year % 400 == 0 || (year % 100 != 0 && year % 4 == 0))
    monthLength[1] = 29;

  // Check the range of the day
  return day > 0 && day <= monthLength[month - 1];
};

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
    if (!isValidDate(date_str)) {
        alert("The value is not a valid date!");
        $('#input-date').focus();
        return;
    }
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
                        if (data.amount_indexes.includes(words_index))
                            result_str = result_str + "<strong class='highlight_amount'>" + word_text + "</strong> ";
                        else if (data.str_indexes.includes(words_index))
                            result_str = result_str + "<strong class='highlight_string'>" + word_text + "</strong> ";
                        else if (data.date_indexes.includes(words_index))
                            result_str = result_str + "<strong class='highlight_date'>" + word_text + "</strong> ";
                        else
                            result_str = result_str + word_text + " ";
                        words_index++;
                    }
                    result_str = result_str + "\n";
                }
                if (data.amount_indexes.length <= 0)
                    alert("Can't find the amount matching. Please enter the other value."); 
                if (data.date_indexes.length <= 0)
                    alert("Can't find the date matching. Please enter the other value.");
                if (data.str_indexes.length <= 0)
                    alert("Can't find the Wordstring matching. Please enter the other value.");
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

function showDownloadPDFModal() {
    alert("Download PDF!!!");
    var doc = new jsPDF('l', 'mm', 'a2')

    doc.setFontSize(18)
    doc.text('With content', 14, 22)
    doc.setFontSize(11)
    doc.setTextColor(100)

    // jsPDF 1.4+ uses getWidth, <1.4 uses .width
    // var pageSize = doc.internal.pageSize
    // var pageWidth = pageSize.width ? pageSize.width : pageSize.getWidth()
    // var text = doc.splitTextToSize(faker.lorem.sentence(45), pageWidth - 35, {})
    doc.text("text", 14, 30)

    doc.autoTable({
        head: headRows(),
        body: bodyRows(400),
        startY: 50,
        showHead: 'firstPage',
    })

    doc.save("test.pdf");

    // doc.text(text, 14, doc.lastAutoTable.finalY + 10)
}

function headRows() {
    return [
      { cutomer_id: 'Customer ID', email: 'Email', 
      first: "12-01",
      second: "12-02",
      third: "12-03",
      fourth: "12-04",
      fifth: "12-05",
      sixth: "12-06",
      seventh: "12-07",
      eighth: "12-08",
      ninth: "12-09",
      tenth: "12-10",
      eleventh: "12-11",
      twelfth: "12-12",
      thirteenth: "12-13",
      fourteenth: "12-14",
      fifteenth: "12-15", 
      sixteenth: "12-16", 
      seventeenth: "12-17", 
      eighteenth: "12-18", 
      ninteenth: "12-19", 
      twentieth: "12-20", 
      twentyfirst: "12-21", 
      twentysecond: "12-22", 
      twentythird: "12-23", 
      twentyfourth: "12-24", 
      twentyfifth: "12-25", 
      twentysixth: "12-26", 
      twentyseventh: "12-27", 
      twentyeighth: "12-28", 
      twentyninth: "12-29", 
      thirtieth: "12-30", 
      thirtyfirst: "12-31" }
    ]
}

function bodyRows(rowCount) {
    rowCount = rowCount || 10
    var body = []
    for (var j = 1; j <= rowCount; j++) {
      body.push({
        cutomer_id: "12345678",
        email: "testtest@gmail.com",
        first: "20.00",
        second: "12.02",
        third: "12.03",
        fourth: "12.04",
        fifth: "12.05",
        sixth: "12.06",
        seventh: "12.07",
        eighth: "12.08",
        ninth: "12.09",
        tenth: "12.10",
        eleventh: "12.11",
        twelfth: "12.12",
        thirteenth: "12.13",
        fourteenth: "12.14",
        fifteenth: "12.15", 
        sixteenth: "12.16", 
        seventeenth: "12.17",
        eighteenth: "12.18", 
        ninteenth: "12.19", 
        twentieth: "12.20", 
        twentyfirst: "12.21",
        twentysecond: "12.22",
        twentythird: "12.23",
        twentyfourth: "12.24",
        twentyfifth: "12.25",
        twentysixth: "12.26",
        twentyseventh: "12.27",
        twentyeighth: "12.28",
        twentyninth: "12.29",
        thirtieth: "12.30", 
        thirtyfirst: "12.31" 
      })
    }
    return body
  }
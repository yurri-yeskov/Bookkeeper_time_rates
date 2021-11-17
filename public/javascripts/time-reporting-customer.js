$(document).ready(function(){
  $('.selectpicker').val('');
  $(".selectpicker").selectpicker("refresh");
});

function submitReportTime() {

  if ($('#customer-id').html() == 'N/A' || $('#customer-id').html() == '') {
    alert('Please select other Customer ID.');
    return;
  }
  if ($('#bookkeeper-name').html() == 'N/A' ||
      $('#company-name').html() == 'N/A' ||
      $('#email-addr').html() == 'N/A') {
    alert('Please select other Customer ID.');
    return;
  }
  
  var return_task = $("#input-task").val();
  var return_period = $('#input-period').val();

  if (return_task == null) {
    alert('Please fill all fields.');
    return;
  }
  if (return_period == null) {
    alert('Please fill all fields.');
    return;
  }
  if ($('#input-time').val() == '') {
    alert('Please fill all fields.');
    return;
  }
  var note_str = '';
  if ($('#input-note').val() != '') {
    note_str = $('#input-note').val().replace(/[\r\n\x0B\x0C\u0085\u2028\u2029]+/g,"\n");
  }

  if(confirm('Are you sure you want to')) {
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = today.getFullYear();

    var today_str = yyyy + "-" + mm + "-" + dd;
    var cur_time = today_str + " " + today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    $.ajax({
      type: "post",
      url: base_url + "/set_report_time",
      data: {
        customer_id: $('#customer-id').html(),
        // bookkeeper_name: $('#bookkeeper-name').html(),
        user_token: getSelToken(),
        company_name: $('#company-name').html(),
        primary_email: $('#email-addr').html(),
        task_type: return_task,
        period: return_period,
        time_spent: $('#input-time').val(),
        time_note: note_str, 
        today: today_str,
        month: mm,
        cur_time: cur_time,
        year: $('#delivery-year').val()
      },
      dataType: "json",
      success: function(data) {
        if (data.data == 'token_expired') {
          window.location.replace(data.other_link);
          return;
        }
        $('#save-button').prop('disabled', true);
        setTimeout(function(){
          // alert("success! You need to redirect other link");
          // window.history.back();
          window.open('','_self').close();
        }, 1000); 
      }
    });
  }
}

function getSelToken() {
  return $('input[name="user_token"]').val();
}
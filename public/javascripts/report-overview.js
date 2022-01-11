var time_entry_table;
$(document).ready(function(){

  time_entry_table = $("#time-entry-table").DataTable({
    "scrollCollapse": true,
    "ScrollInfinite": true,
    "ordering": true,
    "scrollX": false,
    "scrollY": "36vh",
    "paging": true,
    "pageLength": 100,
    "lengthMenu": [[25, 50, 100, -1], [25, 50, 100, "All"]],
    "processing": true,
    "serverSide": true,
    "order": [[ 1, 'asc' ]],
      
    drawCallback: function(){
      $('#custom-table-info').html($('#time-entry-table_info').html());
      
      Tipped.create('.link-btn', function(e) {
        var content_str = 
          "<a href='javascript:;' onclick='showEditAModal(this);' name = '" + e.id + "' class= 'close-tooltip'>Edit Reported Time</a><br><br>" +
          "<a href='javascript:;' onclick='showAuditModal(this);' name= '" + e.id + "' class='close-tooltip'>Audit log for Customer</a><br><br>" +
          "<a>Kundebemærkninger</a>"
        return {
          content: content_str
        };
      },
        
      {
        showOn: 'click',
        hideOn: 'click',
        hideOnClickOutside: true,
        skin:'light',
        position: 'right',
        size: 'large'
      });

      if ($('#input-bookkeeper').val().length > 0) 
        $('#time-entry tr td:nth-child(5)').css("background-color", "#d1d0d0");

      if ($('#input-task').val().length > 0) 
        $('#time-entry tr td:nth-child(6)').css("background-color", "#d1d0d0");

      if ($('#input-period').val().length > 0) 
        $('#time-entry tr td:nth-child(7)').css("background-color", "#d1d0d0");

      if ($('#input-deleted').val() != null && $('#input-deleted').val() != 'show_all') 
        $('#time-entry tr td:nth-child(10)').css("background-color", "#d1d0d0");

      if ($('#input-note').val() != null && $('#input-note').val() != 'show_all') 
        $('#time-entry tr td:nth-child(11)').css("background-color", "#d1d0d0");
    },
    "ajax": {
      url: base_url + '/get_all_time_entry',
      type: "post",
      data: function(d){
        d.extra_search = getExtraSearch();
      },
      dataType: "json"
    },
    "columns": [
      {data:'id', render: renderSelect},
      { data: 'customer_id' },      // Customer ID
      { data: 'email_address' },    // Email Address
      { data: 'company_name' },     // Company Name
      { data: 'bookkeeper_name' },  // Bookkeeper Name
      { data: 'bookkeeper_name' },  // Reporter Name
      { data: 'task_type' },        // Primary Task Type
      { data: 'period' },           // Delivery Period
      { data: 'delivery_year' },    // Delivery Year
      { data: 'time_spent' },       // Time Spent
      { data: 'deleted', render: renderCheck },
      { data: 'note' },             // Note
      { data: 'sel_month'}
    ],
    "columnDefs":[

      {
        "targets": [ 11 ],
        "visible": false
      },

      {
        "targets": [0],
        "searchable": false,
        "orderable": false
      }
    ]
  });

  selectRows();

  $('#time-entry-table_info').css('display', 'none');
  $('#custom-table-info').css('display', 'block');
  $('#custom-table-info').html($('#time-entry-table_info').html());

  $('<div class="pull-right" style="max-height: 50px; margin:5px;"><button type="button" class="btn btn-default sbm-button">Submit</button></div>').appendTo($('.dropdown-menu.open')); 
  extraShearchSubmit();

  $.ajax({
    type: "get",
    url: base_url + "/get_bookkeeper_name_list",
    data: {},
    dataType: "json",
    success: function(data) {
      for (var i = 0; i < data.data.length; i++) {
        $('#input-bookkeeper').append('<option value="' + data.data[i].bookkeeper_name + '">' + data.data[i].bookkeeper_name + '</option>');    
      }
      $("#input-bookkeeper").selectpicker("refresh");
    }
  });

  // $("#input-year").on('keyup', submitsWithYear);

  getTotalTimes($('#input-year').val());

  $('.input-daterange').datepicker({
    format: "dd-mm-yyyy",
    todayBtn: true,
    todayHighlight: true,
    clearBtn: true
  });

  $('.sigle_selection').on('change', function(e){
    time_entry_table.ajax.reload();
  });
});

function getSelToken() {
  return $('input[name="user_token"]').val();
}

function getTotalTimes(sel_year) {
  
  $.ajax({
    type: "post",
    url: base_url + "/get_total_times",
    data: {
      sel_year: sel_year,
      user_token: getSelToken()
    },
    dataType: "json",
    success: function(data) {

      if (data.data == 'token_expired') {
        window.location.replace(data.other_link);
        return;
      }
    
      var total_time = parseFloat(data.data[0].january_time) + parseFloat(data.data[0].february_time) + 
                        parseFloat(data.data[0].march_time) + parseFloat(data.data[0].april_time) + 
                        parseFloat(data.data[0].may_time) + parseFloat(data.data[0].june_time) + 
                        parseFloat(data.data[0].july_time) + parseFloat(data.data[0].august_time) + 
                        parseFloat(data.data[0].september_time) + parseFloat(data.data[0].october_time) + 
                        parseFloat(data.data[0].november_time) + parseFloat(data.data[0].december_time); 
      total_time = total_time.toFixed(2);

      var content_str = "<td>" + data.data[0].january_time +"</td>" + "<td>" + data.data[0].february_time +"</td>" +
                        "<td>" + data.data[0].march_time +"</td>" + "<td>" + data.data[0].april_time +"</td>" + 
                        "<td>" + data.data[0].may_time +"</td>" + "<td>" + data.data[0].june_time +"</td>" + 
                        "<td>" + data.data[0].july_time +"</td>" + "<td>" + data.data[0].august_time +"</td>" + 
                        "<td>" + data.data[0].september_time +"</td>" + "<td>" + data.data[0].october_time +"</td>" + 
                        "<td>" + data.data[0].november_time +"</td>" + "<td>" + data.data[0].december_time +"</td>" + 
                        "<td>" + total_time +"</td>";

      $('.total-times').html('');
      $('.total-times').html(content_str);
    }
  }); 
}

function getExtraSearch() {
  var extra_arr = {};

  $('#time-entry tr td').css("background-color", "");

  var s_bookkeeper_arr = $('#input-bookkeeper').val();
  if (s_bookkeeper_arr.length > 0) {
    $('#input-bookkeeper').selectpicker('setStyle', 'btn-info', 'add');
    extra_arr["s_bookkeeper_arr"] = s_bookkeeper_arr;
  } else $('#input-bookkeeper').selectpicker('setStyle', 'btn-info', 'remove');

  var s_deleted_val = $('#input-deleted').val();
  if (s_deleted_val != null && s_deleted_val != 'show_all') {
    $('#input-deleted').selectpicker('setStyle', 'btn-info', 'add');
    extra_arr["s_deleted_val"] = s_deleted_val;
  } else $('#input-deleted').selectpicker('setStyle', 'btn-info', 'remove');

  var s_task_arr = $('#input-task').val();
  if (s_task_arr.length > 0) {
    $('#input-task').selectpicker('setStyle', 'btn-info', 'add');
    extra_arr["s_task_arr"] = s_task_arr;
  } else $('#input-task').selectpicker('setStyle', 'btn-info', 'remove');
  
  var s_period_arr = $('#input-period').val();
  if (s_period_arr.length > 0) {
    $('#input-period').selectpicker('setStyle', 'btn-info', 'add');
    extra_arr["s_period_arr"] = s_period_arr;
  } else $('#input-period').selectpicker('setStyle', 'btn-info', 'remove');
  
  var s_note_val = $('#input-note').val();
  if (s_note_val != null && s_note_val != 'show_all') {
    $('#input-note').selectpicker('setStyle', 'btn-info', 'add');
    extra_arr["s_note_val"] = s_note_val;
  } else $('#input-note').selectpicker('setStyle', 'btn-info', 'remove');

  var start_date = $('#start-date').val();
  if (start_date != '') {
    $('#start-date').css('color', 'white');
    $('#start-date').css('background-color', '#5bc0de');
    extra_arr["s_start_date_val"] = start_date;
  } else {
    $('#start-date').css('color', '#555');
    $('#start-date').css('background-color', 'white');
  }

  var end_date = $('#end-date').val();
  if (end_date != '') {
    $('#end-date').css('color', 'white');
    $('#end-date').css('background-color', '#5bc0de');
    extra_arr["s_end_date_val"] = end_date;
  } else {
    $('#end-date').css('color', '#555');
    $('#end-date').css('background-color', 'white');
  }

  return JSON.stringify(extra_arr);
}

function isValidDate(dateString) {
  if (!dateString) return true;

  // First check for the pattern
  if(!/^\d{2}\-\d{2}\-\d{4}$/.test(dateString)) 
    return false;

  // Parse the date parts to integers
  var parts = dateString.split("-");
  var day = parseInt(parts[0], 10);
  var month = parseInt(parts[1], 10);
  var year = parseInt(parts[2], 10);

  // Check the ranges of month and year
  if(year < 1900 || year > 2100 || month == 0 || month > 12)
    return false;

  var monthLength = [ 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31 ];

  // Adjust for leap years
  if(year % 400 == 0 || (year % 100 != 0 && year % 4 == 0))
    monthLength[1] = 29;

  // Check the range of the day
  return day > 0 && day <= monthLength[month - 1];
};

function extraShearchSubmit() {
  $('.sbm-button').on( 'click', function () {
    var start_date = $('#start-date').val();
    if (!isValidDate(start_date)) {
      alert("The value is not a valid date!");
      $('#start-date').focus();
      return;
    }
    var end_date = $('#end-date').val();
    if (!isValidDate(end_date)) {
      alert("The value is not a valid date!");
      $('#end-date').focus();
      return;
    }

    time_entry_table.ajax.reload();
  });
}

function showEditAModal(e) {
  $('.form-control').val('');
  $(".selectpicker").selectpicker("refresh");
  $('.current_id').val(e.name);
  var cur_row = $('#time-entry').find('#' + e.name).parents('tr');
  var cur_row_data = time_entry_table.row(cur_row).data();
  $('.customer-id').html(cur_row_data.customer_id);
  $('.bookkeeper-name').html(cur_row_data.bookkeeper_name);
  $('.company-name').html(cur_row_data.company_name);
  $('.email-addr').html(cur_row_data.email_address);
  $('.current_month').val(cur_row_data.sel_month);
  if (cur_row_data.deleted) $('#del-btn').prop('disabled', true);
  else $('#del-btn').prop('disabled', false);

  var task_list = {
    "Almindelig kontering": "1",
    "Årsafslutningspakke - Selskaber 1. År": "2",
    "Årsafslutningspakke - Selskaber eksisterende kunde": "3",
    "Årsafslutningspakke - Enkeltmands 1. År": "4",
    "Årsafslutningspakke - Enkeltmands eksisterende kunde": "5",
    "VSO - beregning ny kunde" : "6",
    "VSO - beregning eksisterende kunde": "7",
    "Samtale/Rådgivning af kunde": "8",
    "Intern kommunikation og møder": "9",
    "Primo ny kunde": "10",
    "Primo eksisterende": "11",
    "kundeCatchup/kontering": "12"
  }
  $('#input-mtask').val(task_list[cur_row_data.task_type]);
  $('#hidden-mtask').val(task_list[cur_row_data.task_type]);
  $('#input-mperiod').val(cur_row_data.period);
  $('#hidden-mperiod').val(cur_row_data.period);
  $('#input-mdelivery-year').val(cur_row_data.delivery_year);
  $('#hidden-myear').val(cur_row_data.delivery_year);
  $('#input-mtime').val(cur_row_data.time_spent);
  $('#hidden-mtime').val(cur_row_data.time_spent);
  $('#input-mnote').val(cur_row_data.note);
  $('#hidden-mnote').val(cur_row_data.note);

  $(".selectpicker").selectpicker("refresh");

  $('#editAModal').modal();
}

function showAuditModal(e) {

  var cur_row = $('#time-entry').find('#' + e.name).parents('tr');
  var cur_row_data = time_entry_table.row(cur_row).data();

  var customer_id = cur_row_data.customer_id;

  $('#auditModal').modal();
  $('.loader').css('display', 'block');
  $('#audit-time-frm').css('display', 'none');
  $('.atable-body').html('');

  $.ajax({
    type: "post",
    url: base_url + "/get_audit_log",
    data: {
      customer_id: customer_id,
      sel_year: $('#input-year').val(),
    },
    dataType: "json",
    success: function(data) {
      setTimeout(function(){
        $('.loader').css('display', 'none');
        $('#audit-time-frm').css('display', 'block');
      }, 500);
      
      for (var i = 0; i < data.data.length; i++) {
        if (data.data[i].old_value == null) data.data[i].old_value = '';
        var r_data = {
          id: data.data[i].id,
          customer_id: data.data[i].customer_id,
          bookkeeper_name: data.data[i].bookkeeper_name,
          company_name: data.data[i].company_name,
          email_addr: data.data[i].email_address,
          delivery_year: data.data[i].delivery_year,
          column: data.data[i].chg_column,
          old_value: data.data[i].old_value,
          new_value: data.data[i].new_value,
          change_date: data.data[i].change_date_str
        }

        appendTagAuditContent(data.data[i].sel_month, r_data);
      }
    }
  });
}

function appendTagAuditContent(month_name, data) {

  var content_str = 
          '<tr id="atr_' + data.id + '">' +
            '<td>' + data.customer_id + '</td>' +
            '<td>' + data.bookkeeper_name + '</td>' +
            '<td>' + data.bookkeeper_name + '</td>' +
            '<td>' + data.company_name + '</td>' +
            '<td>' + data.email_addr + '</td>' +
            '<td>' + data.delivery_year + '</td>' +
            '<td>' + data.column + '</td>' +
            '<td>' + data.old_value + '</td>' +
            '<td>' + data.new_value + '</td>' +
            '<td>' + data.change_date + '</td>' +
          '</tr>';

  $('#a_' + month_name).append(content_str);
}

function selectRows() {

  $('#time-entry-table tbody').on( 'click', 'tr', function () {
      
      if ( $(this).hasClass('selected') ) {
          // $(this).removeClass('selected');
      }
      else {
          time_entry_table.$('tr.selected').removeClass('selected');
          $(this).addClass('selected');
      }
  });
}

// function getSelYear() {
//   return $('#input-year').val();
// }

// function submitsWithYear(e) {
//   if (e.key === 'Enter' || e.keyCode === 13) {
//     time_entry_table.ajax.reload();
//     getTotalTimes($('#input-year').val());
//     $('.delivery-year').html($('#input-year').val());
//   }
// }

function renderSelect(data, type, full, meta) {
  var select_str = "<button class='btn btn-default link-btn' id='" + data +"' style='font-size: 12px; padding: 3px 12px;'>Links</button>"
  return select_str;
}

function renderCheck(data, type, full, meta) {
  var select_str;
  if (data == true)
    select_str = '<i class="fas fa-check-square fa-lg" aria-hidden="true" style="color: #5bc0de"></i>';
  else if (data == false)
    select_str = '<i class="far fa-square fa-lg" aria-hidden="true" style="color: #5bc0de"></i>';
  return select_str;
}

function updateAReportTime() {

  var today = new Date();
  var dd = String(today.getDate()).padStart(2, '0');
  var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
  var yyyy = today.getFullYear();

  today = yyyy + "-" + mm + "-" + dd + " " + today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
  var change_data = {
    task_type: null,
    period: null,
    time_spent: null,
    note: null,
    delivery_year: null,
    id: $('.current_id').val(),
    month: $('.current_month').val(),
    today: today
  }

  var sel_task = $('#input-mtask').val();
  if (sel_task == null) {
    alert('Please fill all fields.');
    return;
  }
  var task_list = {
    "1": "Almindelig kontering",
    "2": "Årsafslutningspakke - Selskaber 1. År",
    "3": "Årsafslutningspakke - Selskaber eksisterende kunde",
    "4": "Årsafslutningspakke - Enkeltmands 1. År",
    "5": "Årsafslutningspakke - Enkeltmands eksisterende kunde",
    "6": "VSO - beregning ny kunde",
    "7": "VSO - beregning eksisterende kunde",
    "8": "Samtale/Rådgivning af kunde",
    "9": "Intern kommunikation og møder",
    "10": "Primo ny kunde",
    "11": "Primo eksisterende",
    "12": "kundeCatchup/kontering"
  }
  if (sel_task != $('#hidden-mtask').val()) {
    change_data.task_type = task_list[sel_task];
  }

  var sel_period = $('#input-mperiod').val();
  if (sel_period == null) {
    alert('Please fill all fields.');
    return;
  }
  if (sel_period != $('#hidden-mperiod').val()) {
    change_data.period = sel_period;
  }
  
  var sel_time = $('#input-mtime').val();
  if (sel_time == '') {
    alert('Please fill all fields.');
    return;
  }
  if (parseFloat(sel_time) != parseFloat($('#hidden-mtime').val())) {
    change_data.time_spent = sel_time;
  }

  var sel_myear = $('#input-mdelivery-year').val();
  if (sel_myear == '') {
    alert('Please fill all fields.');
    return;
  }
  if (parseFloat(sel_myear) < 1900 || parseFloat(sel_myear) > 3000) {
    alert('Please fill all fields correctly.');
    return;
  }
  if (parseFloat(sel_myear) != parseFloat($('#hidden-myear').val())) {
    change_data.delivery_year = sel_myear;
  }
  
  var sel_note = $('#input-mnote').val().replace(/[\r\n\x0B\x0C\u0085\u2028\u2029]+/g,"\n");
  if (sel_note == '') {
    alert('Please fill all fields.');
    return;
  }
  if (sel_note != $('#hidden-mnote').val()) {
    change_data.note = sel_note;
  }
  
  if (change_data.delivery_year == null && change_data.task_type == null && change_data.period == null && change_data.time_spent == null && change_data.note == null) {
    alert("No Data to update!");
    return;
  }
  
  if(confirm('Are you sure you want to')){
    
    $.ajax({
      type: "post",
      url: base_url + "/update_areport_time",
      data: change_data,
      dataType: "json",
      success: function(data) {
        setTimeout(function() {
          location.reload();
          getTotalTimes($('#input-year').val());
        }, 1000);
      }
    });
  }
}

function deleteAReportTime() {
  
  if(confirm('Are you sure you want to')){
    
    $.ajax({
      type: "post",
      url: base_url + "/delete_areport_time",
      data: {
        id : $('.current_id').val()
      },
      dataType: "json",
      success: function(data) {
        setTimeout(function() {
          location.reload();
          getTotalTimes($('#input-year').val());
        }, 1000);
      }
    });
  }
}
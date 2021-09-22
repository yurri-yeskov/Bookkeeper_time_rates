var leverance_oversigt_table;

$(document).ready(function(){

    leverance_oversigt_table = $("#leverance-oversigt-table").DataTable({
        "scrollCollapse": true,
        "ScrollInfinite": true,
        "ordering": true,
        "scrollX": true,
        "scrollY": "48vh",
        "paging": true,
        "pageLength": 100,
        "lengthMenu": [[25, 50, 100, -1], [25, 50, 100, "All"]],
        "processing": true,
        "serverSide": true,
        
        drawCallback: function(){
          $('#custom-table-info').html($('#leverance-oversigt-table_info').html());
          $('#leverance-oversigt tr td:nth-child(11)').css('background-color', '#e975a0'); // delete
          // $('#leverance-oversigt tr td:nth-child(15)').css('background-color', '#e975a0'); // delete
          // $('#leverance-oversigt tr td:nth-child(17)').css('background-color', '#e975a0'); // delete
          // $('#leverance-oversigt tr td:nth-child(19)').css('background-color', '#e975a0'); // delete
          // $('#leverance-oversigt tr td:nth-child(21)').css('background-color', '#e975a0'); // delete
          // $('#leverance-oversigt tr td:nth-child(23)').css('background-color', '#e975a0'); // delete
          $('#leverance-oversigt tr td:nth-child(24)').css('background-color', '#e975a0'); // delete
          $('#leverance-oversigt tr td:nth-child(25)').css('background-color', '#e975a0'); // delete
          // $('#leverance-oversigt tr td:nth-child(27)').css('background-color', '#e975a0'); // delete
          // $('#leverance-oversigt tr td:nth-child(29)').css('background-color', '#e975a0'); // delete
          $('#leverance-oversigt tr td:nth-child(32)').css('background-color', '#e975a0'); // delete

          if ($('#input-bookkeeper').val().length > 0) 
            $('#leverance-oversigt tr td:nth-child(3)').css("background-color", "#d1d0d0");

          if ($('#input-package').val().length > 0) 
            $('#leverance-oversigt tr td:nth-child(8)').css("background-color", "#d1d0d0");

          // if ($('#input-paid').val().length > 0) 
          //   $('#leverance-oversigt tr td:nth-child(8)').css("background-color", "#d1d0d0");
        
          if ($('#input-company-type').val().length > 0)
            $('#leverance-oversigt tr td:nth-child(4)').css("background-color", "#d1d0d0");
        
          if ($('#input-moms').val().length > 0) 
            $('#leverance-oversigt tr td:nth-child(5)').css("background-color", "#d1d0d0");
        
          if ($('#input-reporting').val().length > 0) 
            $('#leverance-oversigt tr td:nth-child(6)').css("background-color", "#d1d0d0");
        
          // if ($('#input-used-time').val().length > 0) 
          //   $('#leverance-oversigt tr td:nth-child(8)').css("background-color", "#d1d0d0");

        },
        
        "paging": true,
        "ajax": {
            url: base_url + '/get_customerinfo_with_year',
            type: "post",
            // data: {
            //     this_year: $('#input-year').val()
            // },
            data: function(d){
              d.this_year = getSelYear();
              d.extra_search = getExtraSearch();
            },
            dataType: "json"
        },
        "columns": [
            { data: 'customer_id' },              // Customer ID
            { data: 'primary_email' },            // Email Address
            { data: 'year_end_accountant' },      // Bookkeeper ID
            { data: 'company_type' },             // Company Type
            { data: 'vat_period' },               // Moms
            { data: 'reporting_period' },         // Reporting
            { data: 'no_longer_customer_from' },  // Stoppet
            { data: 'package_list' },             // Package
            { data: 'max_receipts' },             // Receipts Paid For
            { data: 'receipts_used' },            // Receipts Used
            { data: 'receipts_used' },            // Customer Has Paid    // to change
            { data: 'first_end_year' },           // First End Of Year
            { data: 'new_customer' },             // New Customer
            { data: 'q13' },                      // Q1 Estimated Time
            { data: 'q1_used' },                  // Q1 Used Time         
            { data: 'q24' },                      // Q2 Estimated Time
            { data: 'q2_used' },                  // Q2 Used Time         
            { data: 'q13' },                      // Q3 Estimated Time
            { data: 'q3_used' },                  // Q3 Used Time         
            { data: 'q24' },                      // Q4 Estimated Time
            { data: 'q4_used' },                  // Q4 Used Time         
            { data: 'y_est' },                    // Year End Estimated Time
            { data: 'y_used' },                   // Year End Used Time   
            { data: 't_est' },                    // Extra Time Agreed    // to change
            { data: 't_est' },                    // Extra Time Used      // to change
            { data: 't_est' },                    // Total Time Estimated
            { data: 't_used' },                   // Total Time Used    
            { data: 'tc_est' },                   // Total Cost Estimated
            { data: 'tc_used' },                   // Total Cost Used      // to change
            { data: 't_inv' },                    // Total Invoiced Price
            { data: 'effic' },                    // Expected Efficiency
            { data: 'effic' },                    // Delivery Efficiency  // to change 
        ],
        "columnDefs":[
          {
            // "searchable": false,
            // "orderable": false,
            // "targets": 0
          }
        ]
    });

    selectRows();
    
    $('#leverance-oversigt-table_info').css('display', 'none');
    $('#custom-table-info').css('display', 'block');
    $('#custom-table-info').html($('#leverance-oversigt-table_info').html());

    $('<div class="pull-right" style="max-height: 50px; margin:5px;"><button type="button" class="btn btn-default sbm-button">Submit</button></div>').appendTo($('.dropdown-menu.open')); 
    extraShearchSubmit();
    $.ajax({
      type: "get",
      url: base_url + "/get_bookkeeper_list",
      data: {},
      dataType: "json",
      success: function(data) {
        for (var i = 0; i < data.data.length; i++) {
          $('#input-bookkeeper').append('<option value="' + data.data[i].worker_initials + '">' + data.data[i].worker_initials + '</option>');    
        }
        $("#input-bookkeeper").selectpicker("refresh");
      }
    });
    
    $.ajax({
      type: "get",
      url: base_url + "/get_package_list",
      data: {},
      dataType: "json",
      success: function(data) {
        for (var i = 0; i < data.data.length; i ++) {
          if (data.data[i].short_name != undefined && data.data[i].short_name != null && data.data[i].short_name != '')
            $('#input-package').append('<option value="' + data.data[i].short_name + '">'+data.data[i].short_name+'</option>');
        }
        $("#input-package").selectpicker("refresh");
      }
    });

    $.ajax({
      type: "get",
      url: base_url + "/get_company_list",
      data: {},
      dataType: "json",
      success: function(data) {
        let enum_range_str = data.data[0].enum_range.replace('{', '');
        enum_range_str = enum_range_str.replace('}', '');
        enum_range_str = enum_range_str.replace(/['"]+/g, '');
        let enum_range_arr = enum_range_str.split(",");
        enum_range_arr.sort();

        for (var i = 0; i < enum_range_arr.length; i ++) 
          $('#input-company-type').append('<option value="' + enum_range_arr[i] + '">'+enum_range_arr[i]+'</option>');
        $("#input-company-type").selectpicker("refresh");
      }
    });

    $("#input-year").on('keyup', submitsWithYear);
});

function selectRows() {
  $('#leverance-oversigt-table tbody').on( 'click', 'tr', function () {
      
      if ( $(this).hasClass('selected') ) {
          // $(this).removeClass('selected');
      }
      else {
          leverance_oversigt_table.$('tr.selected').removeClass('selected');
          $(this).addClass('selected');
      }
  });
}

function extraShearchSubmit() {
  $('.sbm-button').on( 'click', function () {
    leverance_oversigt_table.ajax.reload();
  });
}

function getSelYear() {
  return $('#input-year').val();
}

function getExtraSearch() {
  var extra_arr = {};

  $('#leverance-oversigt tr td').css("background-color", "");

  var s_bookkeeper_arr = $('#input-bookkeeper').val();
  if (s_bookkeeper_arr.length > 0) {
    $('#input-bookkeeper').selectpicker('setStyle', 'btn-info', 'add');
    extra_arr["s_bookkeeper_arr"] = s_bookkeeper_arr;
  } else $('#input-bookkeeper').selectpicker('setStyle', 'btn-info', 'remove');

  var s_package_arr = $('#input-package').val();
  if (s_package_arr.length > 0) {
    $('#input-package').selectpicker('setStyle', 'btn-info', 'add');
    extra_arr["s_package_arr"] = s_package_arr;
  } else $('#input-package').selectpicker('setStyle', 'btn-info', 'remove');

  var s_paid_arr = $('#input-paid').val();
  if (s_paid_arr.length > 0) {
    $('#input-paid').selectpicker('setStyle', 'btn-info', 'add');
    extra_arr["s_paid_arr"] = s_paid_arr;
  } else $('#input-paid').selectpicker('setStyle', 'btn-info', 'remove');

  var s_company_arr = $('#input-company-type').val();
  if (s_company_arr.length > 0) {
    $('#input-company-type').selectpicker('setStyle', 'btn-info', 'add');
    extra_arr["s_company_arr"] = s_company_arr;
  } else $('#input-company-type').selectpicker('setStyle', 'btn-info', 'remove');

  var s_moms_arr = $('#input-moms').val();
  if (s_moms_arr.length > 0) {
    $('#input-moms').selectpicker('setStyle', 'btn-info', 'add');
    extra_arr["s_moms_arr"] = s_moms_arr;
  } else $('#input-moms').selectpicker('setStyle', 'btn-info', 'remove');

  var s_reporting_arr = $('#input-reporting').val();
  if (s_reporting_arr.length > 0) {
    $('#input-reporting').selectpicker('setStyle', 'btn-info', 'add');
    extra_arr["s_reporting_arr"] = s_reporting_arr;
  } else $('#input-reporting').selectpicker('setStyle', 'btn-info', 'remove');

  var s_time_arr = $('#input-used-time').val();
  if (s_time_arr.length > 0) {
    $('#input-used-time').selectpicker('setStyle', 'btn-info', 'add');
    extra_arr["s_time_arr"] = s_time_arr;
  } else $('#input-used-time').selectpicker('setStyle', 'btn-info', 'remove');
  
  return JSON.stringify(extra_arr);
}

function submitsWithYear(e) {
  if (e.key === 'Enter' || e.keyCode === 13) 
    leverance_oversigt_table.ajax.reload();
}
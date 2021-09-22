var is_get_time_elements = false, 
is_get_packages = false,
is_get_company_types = false;

$(document).ready(function(){
    
    getTimeElements();
    getPackages();
    getCompanyTypes();

    getProductProfilePackage();
    getProductProfileCompanyType();
    getProductProfileTimeElement();

    var myInterval = setInterval(function () {
        if (is_get_time_elements && is_get_packages && is_get_company_types){
            $('form').css('display', 'block');
            $('.loader').css('display', 'none');
            clearInterval(myInterval);
        }
    }, 1000);

    $("#input-customer").on('keyup', calcTimeSubmits);
    $("#input-year").on('keyup', calcTimeSubmits);
});

function ajaxSubmits(url, data) {
    $.ajax({
        type: "post",
        url: url,
        data: data,
        dataType: "json",
        success: function(data) {
            // alert success
        }
    });
} 

function submitProductProfile() {

    let return_packages = $("#input-package").val();
    let return_companytypes = $('#input-company').val();
    let return_new_elements = $("#input-new-elements").val();
    let return_exist_elements = $("#input-exist-elements").val();

    var use_a = $('input[name=check-customer]:checked', '#product-profile-frm').val();

    if (return_packages.length <= 0) {
        alert('Please fill all fields.');
        return;
    }

    if (return_companytypes.length <= 0) {
        alert('Please fill all fields.');
        return;
    }
    if (return_exist_elements.length <= 0) {
        alert('Please fill all fields.');
        return;
    }
    if (use_a == 'TRUE') {
        if (return_new_elements.length <= 0) {
        alert('Please fill all fields.');
        return;
        }
    }

    if ($('#input-note').val() == '') {
        alert('Please fill all fields.');
        return;
    }
    var note_str = $('#input-note').val().replace(/[\r\n\x0B\x0C\u0085\u2028\u2029]+/g,"\n");

    if(confirm('Are you sure you want to')){
        $('#basicModal').hide();
        if ($('.product_index').html() == $('#product_profile_id').val()) { // INSERT
            $.ajax({
                type: "post",
                url: "/set_product_profile",
                data: {
                    // package_ids: JSON.stringify(return_packages),
                    use_a: use_a,
                    product_note: note_str,
                    product_profile_id: $('#product_profile_id').val()
                },
                dataType: "json",
                success: function(data) {
                    ajaxSubmits('/set_product_profile_package', {product_profile_id: data.product_profile.id, package_ids: JSON.stringify(return_packages)});
                    ajaxSubmits('/set_product_profile_companytype', {product_profile_id: data.product_profile.id, company_types: JSON.stringify(return_companytypes)});
                    ajaxSubmits('/set_product_profile_timeelement', {product_profile_id: data.product_profile.id, element_ids: JSON.stringify(return_exist_elements), new_customer:"FALSE"});
            
                    if (use_a == 'TRUE')
                        ajaxSubmits('/set_product_profile_timeelement', {product_profile_id: data.product_profile.id, element_ids: JSON.stringify(return_new_elements), new_customer:"TRUE"});
                    setTimeout(function(){
                        location.reload(); 
                    }, 1000); 
                }
            });
        } else { // UPDATE
            $.ajax({
                type: "post",
                url: "/update_product_profile",
                data: {
                    // package_ids: JSON.stringify(return_packages),
                    use_a: use_a,
                    product_note: note_str,
                    product_profile_id: $('.product_index').html()
                },
                dataType: "json",
                success: function(data) {
                    ajaxSubmits('/update_product_profile_package', {product_profile_id: data.product_profile.id, package_ids: JSON.stringify(return_packages)});
                    ajaxSubmits('/update_product_profile_companytype', {product_profile_id: data.product_profile.id, company_types: JSON.stringify(return_companytypes)});
                    ajaxSubmits('/update_product_profile_timeelement', {product_profile_id: data.product_profile.id, element_ids: JSON.stringify(return_exist_elements), new_customer:"FALSE"});
            
                    if (use_a == 'TRUE')
                        ajaxSubmits('/update_product_profile_timeelement', {product_profile_id: data.product_profile.id, element_ids: JSON.stringify(return_new_elements), new_customer:"TRUE"});
                    setTimeout(function(){
                        location.reload(); 
                    }, 1000); 
                }
            });
        }
    }
}

function getTimeElements() {
    $.ajax({
        type: "get",
        url: "/get_time_elements",
        data: {},
        dataType: "json",
        success: function(data) {
            for (var i = 0; i < data.data.length; i ++) {
                $('#input-new-elements').append('<option value="' + data.data[i].id + '" data-subtext="(' + data.data[i].element_id + ')">'+data.data[i].element_name+'</option>');  
                $('#input-exist-elements').append('<option value="' + data.data[i].id +'" data-subtext="(' + data.data[i].element_id + ')">'+data.data[i].element_name+'</option>'); 
            }

            is_get_time_elements = true;
        }
    });
}

function getPackages() {
    $.ajax({
        type: "get",
        url: "/get_packages",
        data: {},
        dataType: "json",
        success: function(data) {
            for (var i = 0; i < data.data.length; i ++) {
                if (data.data[i].short_name != undefined && data.data[i].short_name != null && data.data[i].short_name != '')
                    $('#input-package').append('<option value="' + data.data[i].short_name + '">'+data.data[i].short_name+'</option>');
            }
            is_get_packages = true;
        }
    });
}

function getCompanyTypes() {
    $.ajax({
        type: "get",
        url: "/get_company_types",
        data: {},
        dataType: "json",
        success: function(data) {
            let enum_range_str = data.data[0].enum_range.replace('{', '');
            enum_range_str = enum_range_str.replace('}', '');
            enum_range_str = enum_range_str.replace(/['"]+/g, '');
            let enum_range_arr = enum_range_str.split(",");
            enum_range_arr.sort();

            for (var i = 0; i < enum_range_arr.length; i ++) {
                $('#input-company').append('<option value="' + enum_range_arr[i] + '">'+enum_range_arr[i]+'</option>');
            }
            is_get_company_types = true;
        }
    });
}

function getProductProfilePackage() {
    $.ajax({
        type: "get",
        url: "/get_product_profile_package",
        data: {},
        dataType: "json",
        success: function(data) {
            for (var i = 0; i < data.data.length; i++) {
                var tr_id = '#' + data.data[i].id;
                if ($('#product-profile-table').find(tr_id).find('.package-plain').html() != '')
                    $('#product-profile-table').find(tr_id).find('.package-plain').append(", " + data.data[i].package_id);
                else 
                    $('#product-profile-table').find(tr_id).find('.package-plain').append(data.data[i].package_id);
            }
        }
    });
}

function getProductProfileCompanyType() {
    $.ajax({
        type: "get",
        url: "/get_product_profile_company_type",
        data: {},
        dataType: "json",
        success: function(data) {
        
            for (var i = 0; i < data.data.length; i++) {
                var tr_id = '#' + data.data[i].id;
                if ($('#product-profile-table').find(tr_id).find('.company-plain').html() != '')
                    $('#product-profile-table').find(tr_id).find('.company-plain').append(", " + data.data[i].company_type);
                else
                    $('#product-profile-table').find(tr_id).find('.company-plain').append(data.data[i].company_type);
            }
        }
    }); 
}

function getProductProfileTimeElement() {
    $.ajax({
        type: "get",
        url: "/get_product_profile_time_element",
        data: {},
        dataType: "json",
        success: function(data) {
            var is_yes_begin = true; var is_no_begin = true;
            var pre_tr_id = [];
            for (var i = 0; i < data.data.length; i++) {
                var tr_id = '#' + data.data[i].id;
                if (!pre_tr_id.includes(tr_id)){
                    pre_tr_id[pre_tr_id.length] = tr_id;
                    is_yes_begin = true; is_no_begin = true;
                }

                if (!data.data[i].use_a) {
                    $('#product-profile-table').find(tr_id).find('.ele-inc-plain').find('.ele-label-yes').html('Use A: No');
                    $('#product-profile-table').find(tr_id).find('.ele-inc-plain').find('.ele-label-sub-no').html('Existing_customer (A=False):');
                    $('#product-profile-table').find(tr_id).find('.ele-inc-plain').find('.ele-label-sub-yes').css('display', 'none');
                    $('#product-profile-table').find(tr_id).find('.ele-inc-plain').find('.ele-label-yes-content').css('display', 'none');
                } else {
                    $('#product-profile-table').find(tr_id).find('.ele-inc-plain').find('.ele-label-yes').html('Use A: Yes');
                    $('#product-profile-table').find(tr_id).find('.ele-inc-plain').find('.ele-label-sub-yes').html('New_customer (A=True):');
                    $('#product-profile-table').find(tr_id).find('.ele-inc-plain').find('.ele-label-sub-no').html('Existing_customer (A=False):');
                }

                if (data.data[i].new_customer) {

                    if (is_yes_begin) {
                        $('#product-profile-table').find(tr_id).find('.ele-inc-plain').find('.ele-label-yes-content').append(data.data[i].element_id);
                        $('#product-profile-table').find(tr_id).find('.ele-inc-plain').find('.ele-label-yes-content-id').append(data.data[i].ele_id);
                        is_yes_begin = false;
                    } else {
                        $('#product-profile-table').find(tr_id).find('.ele-inc-plain').find('.ele-label-yes-content').append("+" + data.data[i].element_id);
                        $('#product-profile-table').find(tr_id).find('.ele-inc-plain').find('.ele-label-yes-content-id').append("+" + data.data[i].ele_id);
                    }
                } else {
                    if (is_no_begin) {
                        $('#product-profile-table').find(tr_id).find('.ele-inc-plain').find('.ele-label-no-content').append(data.data[i].element_id);
                        $('#product-profile-table').find(tr_id).find('.ele-inc-plain').find('.ele-label-no-content-id').append(data.data[i].ele_id);
                        is_no_begin = false;
                    } else {
                        $('#product-profile-table').find(tr_id).find('.ele-inc-plain').find('.ele-label-no-content').append("+" + data.data[i].element_id);
                        $('#product-profile-table').find(tr_id).find('.ele-inc-plain').find('.ele-label-no-content-id').append("+" + data.data[i].ele_id);
                    }
                }
            }
        }
    });
}

function calcTimeSubmits(e) {
    if (e.key === 'Enter' || e.keyCode === 13) {
        $.ajax({
            type: "post",
            url: "/get_customerinfo",
            data: {
                customer_id: $("#input-customer").val(),
                sel_year: $('#input-year').val()
            },
            dataType: "json",
            success: function(data) {
            
                if (data.data.length <= 0) {
                    alert("No Product Profile matched!");
                    $('#calculation-value').html("N/A");
                    $('#company-name').html("N/A");
                    $('.time-calc-class').css('display', 'none');
                    return;
                }
  
                $('#company-name').html(data.data[0].name);
                // console.log("asdf", data.data[0].name);
                $.ajax({
                    type: "post",
                    url: "/calculate_time",
                    data: {
                        customer_info: JSON.stringify(data.data),
                        new_customer: data.new_customer
                    },
                    dataType: "json",
                    success: function(data) {
                        if (data.product_profile_nid == 'NONEE') {
                            $('#calculation-value').html("N/A");
                            $('.time-calc-class').css('display', 'none');
                            alert("No product profile matched!");
                            return;
                        }
                        alert("Your request completed!");
                        $('.time-calc-class').css('display', 'none');
                        var product_profile_nid_str = " (" + data.product_profile_nid[0];
                        var product_tr_id = "#" + data.product_profile_nid[0].substring(1);
                        $('#product-content').find(product_tr_id).css('display', 'contents');
                        for (var i = 1; i <data.product_profile_nid.length; i++) {
                            product_profile_nid_str = product_profile_nid_str + "," + data.product_profile_nid[i];
                            var product_tr_id = "#" + data.product_profile_nid[i].substring(1);
                            $('#product-content').find(product_tr_id).css('display', 'contents');
                        }
                        
                        product_profile_nid_str = product_profile_nid_str + ")";
                        $('#calculation-value').html("" + data.calc_val + product_profile_nid_str);
                    }
                });
            }
        });
    }
}
const dbConfig = require("../config/db.config");
const {Client} = require('pg');
const moment = require('moment');  

const client = new Client ({
    user: dbConfig.USER,
    host: dbConfig.HOST,
    database: dbConfig.DB_NAME,
    password: dbConfig.PASSWORD,
    port: dbConfig.DB_PORT,
});

// const client = new Client({
//   user: "z_new_user",
//   host: "replica-of-live2.cas2tln5cone.us-east-1.rds.amazonaws.com",
//   database: "dama86dd4g3vj6",
//   password: "MJ4MXjmK4TSK",
//   port: 5732
// });

client.connect();
exports.getCurrentYear = (req, res) => {
    
  let this_year = new Date();
  this_year = this_year.getFullYear();

  res.render('time-overview', {page:'Bookkeeper Time Overview', menuId:'time-overview', this_year: this_year});
};

exports.findCustomerInfoWithYear = (req, res) => {

  if (!req.body.this_year) {
    console.log("Oops!");
    res.redirect("/");
    return;
  }

  let service_from = req.body.this_year + "-01-01";
  let service_until = req.body.this_year + "-12-31";
  let extra_search = JSON.parse(req.body.extra_search);
  let extra_search_str = "";
  if (extra_search["s_bookkeeper_arr"]) {
    extra_search_str = extra_search_str + " AND vv.year_end_accountant = ANY(ARRAY['" + extra_search["s_bookkeeper_arr"][0] + "'";
    for (let i = 1; i < extra_search["s_bookkeeper_arr"].length; i++) {
      extra_search_str = extra_search_str + ", '" + extra_search["s_bookkeeper_arr"][i] + "'";
    }
    extra_search_str = extra_search_str + "])";
  }

  if (extra_search["s_package_arr"]) {
    extra_search_str = extra_search_str + " AND (vv.package_list ILIKE '%" + extra_search["s_package_arr"][0] + "%'";
    for (let i = 1; i < extra_search["s_package_arr"].length; i++) {
      extra_search_str = extra_search_str + " OR vv.package_list ILIKE '%" + extra_search["s_package_arr"][i] + "%'";
    }
    extra_search_str = extra_search_str + ")";
  }

  if (extra_search["s_paid_arr"]) {
    // Phase 3
  }

  if (extra_search["s_company_arr"]) {
    extra_search_str = extra_search_str + " AND vv.company_type::TEXT = ANY(ARRAY['" + extra_search["s_company_arr"][0] + "'";
    for (let i = 1; i < extra_search["s_company_arr"].length; i++) {
      extra_search_str = extra_search_str + ", '" + extra_search["s_company_arr"][i] + "'";
    }
    extra_search_str = extra_search_str + "])";
  }

  if (extra_search["s_moms_arr"]) {

    extra_search_str = extra_search_str + " AND vv.vat_period::TEXT = ANY(ARRAY['" + extra_search["s_moms_arr"][0] + "'";
    for (let i = 1; i < extra_search["s_moms_arr"].length; i++) {
      extra_search_str = extra_search_str + ", '" + extra_search["s_moms_arr"][i] + "'";
    }
    if (extra_search["s_moms_arr"].includes("N/A")) {
      extra_search_str = extra_search_str + ", 'n/a', NULL";
    }
    extra_search_str = extra_search_str + "])";
  }

  if (extra_search["s_reporting_arr"]) {
    extra_search_str = extra_search_str + " AND vv.reporting_period::TEXT = ANY(ARRAY['" + extra_search["s_reporting_arr"][0] + "'";
    for (let i = 1; i < extra_search["s_reporting_arr"].length; i++) {
      extra_search_str = extra_search_str + ", '" + extra_search["s_reporting_arr"][i] + "'";
    }
    if (extra_search["s_reporting_arr"].includes("N/A")) {
      extra_search_str = extra_search_str + ", 'n/a', NULL";
    }
    extra_search_str = extra_search_str + "])";
  }

  if (extra_search["s_time_arr"]) {
    // Phase 3
  }

  if (extra_search_str != "") {
    extra_search_str = extra_search_str.substring(4, extra_search_str.length);
    extra_search_str = "WHERE (" + extra_search_str + ") ";
  }

  let recordsTotal = 0;
  let recordsFiltered = 0;

  let init_query = "CALL set_customer_info_into_temp('" + service_from + "', '" + service_until + "');"
  let query_count = "SELECT COUNT(*) FROM temp_customer_info;";

  let order_list = {
       'customer_id': 1, 'package_list': 2, 'max_receipts': 3, 'primary_email': 4, 'company_type': 5, 'vat_period': 6, 'reporting_period': 7,
       'no_longer_customer_from': 8, 'year_end_accountant': 9, 'service_from': 10, 'service_until': 11, 'first_end_year': 12, 
       'new_customer': 13, 'receipts_used': 15, 'q13': 16, 'q24': 17, 'y_est': 18, 't_est': 19, 'tc_est': 20, 't_inv': 21, 'effic': 22};

  let o_index = 'customer_id';
  let o_dir = 'asc';
  if (req.body['order[0][column]']) {
    o_index = 'columns[' + req.body['order[0][column]'] + '][data]';
    o_index = req.body[o_index];
    o_dir = req.body['order[0][dir]'];
  }

  let order_by = " ORDER BY " + order_list[o_index] + " " + o_dir + " ";

  let searchStr = req.body["search[value]"];
  if(req.body["search[value]"])  {
    searchStr = "vv.customer_id::TEXT ILIKE '%" + searchStr + "%' OR vv.primary_email ILIKE '%" + searchStr + 
                "%' OR vv.year_end_accountant ILIKE '%" + searchStr + "%' OR vv.company_type::TEXT ILIKE '%" + searchStr + 
                "%' OR vv.vat_period::TEXT ILIKE '%" + searchStr + "%' OR vv.reporting_period::TEXT ILIKE '%" + searchStr + 
                "%' OR vv.no_longer_customer_from::TEXT ILIKE '%" + searchStr + "%' OR vv.package_list ILIKE '%" + searchStr + 
                "%' OR vv.max_receipts::TEXT ILIKE '%" + searchStr + "%' OR vv.first_end_year::TEXT ILIKE '%" + searchStr +
                "%' OR vv.new_customer::TEXT ILIKE '%" + searchStr + "%' OR est[1]::TEXT ILIKE '%" + searchStr +
                "%' OR est[2]::TEXT ILIKE '%" + searchStr + "%' OR est[3]::TEXT ILIKE '%" + searchStr + 
                "%' OR est[4]::TEXT ILIKE '%" + searchStr + "%' OR est[5]::TEXT ILIKE '%" + searchStr +
                "%' OR est[6]::TEXT ILIKE '%" + searchStr + "%' OR est[7]::TEXT ILIKE '%" + searchStr + 
                "%' OR est[8]::TEXT ILIKE '%" + searchStr +"%' ";
  } else searchStr = "";

  if (searchStr != "") {
    if (extra_search_str != "") {
      searchStr = " AND (" + searchStr + ") ";
    } else {
      searchStr = " WHERE (" + searchStr +") ";
    }
  }

  // change based on Search//
let query_search_count = "SELECT COUNT(*) FROM (SELECT bb.*, calc_estvals(bb.customer_id, bb.max_receipts, bb.vat_period, bb.reporting_period, bb.new_customer::BOOLEAN, bb.service_from, bb.company_type, bb.package_list, bb.year_end_accountant) as est " + 
                        "FROM " + 
                        "(SELECT public.temp_customer_info.*, " +
                        "MIN(public.customer_payments.service_from) as first_end_year, " +
                        "(CASE WHEN extract(year from temp_customer_info.service_from) = extract(year from MIN(public.customer_payments.service_from)) THEN 'True' ELSE 'False' END) as new_customer " +
                        "FROM public.temp_customer_info " + 
                        "JOIN public.customer_payments ON public.temp_customer_info.customer_id = public.customer_payments.customer_id " + 
                        "GROUP BY (public.temp_customer_info.customer_id, temp_customer_info.service_from, temp_customer_info.package_list, temp_customer_info.max_receipts, temp_customer_info.primary_email, temp_customer_info.company_type, temp_customer_info.vat_period, temp_customer_info.reporting_period, temp_customer_info.no_longer_customer_from, temp_customer_info.year_end_accountant, temp_customer_info.service_until) ) bb " +
                        "LEFT JOIN (SELECT public.temp_customer_info.customer_id " +
                        "FROM public.temp_customer_info " +
                        "JOIN public.customer_payments ON public.temp_customer_info.customer_id = public.customer_payments.customer_id " +
                        "GROUP BY (public.temp_customer_info.customer_id, temp_customer_info.service_from, temp_customer_info.package_list, temp_customer_info.max_receipts, temp_customer_info.primary_email, temp_customer_info.company_type, temp_customer_info.vat_period, temp_customer_info.reporting_period, temp_customer_info.no_longer_customer_from, temp_customer_info.year_end_accountant, temp_customer_info.service_until) ) aa " +
                        "ON bb.customer_id = aa.customer_id) as vv " + extra_search_str + searchStr + ";";
  
  // add offset and limit//
  let query_str = "SELECT vv.*, est[1] as receipts_used, est[2] as q13, est[3] as q24, est[4] as y_est, est[5] as t_est, est[6] as tc_est, est[7] as t_inv, est[8] as effic FROM (SELECT bb.*, calc_estvals(bb.customer_id, bb.max_receipts, bb.vat_period, bb.reporting_period, bb.new_customer::BOOLEAN, bb.service_from, bb.company_type, bb.package_list, bb.year_end_accountant) as est " + 
              "FROM " + 
              "(SELECT public.temp_customer_info.*, " +
              "MIN(public.customer_payments.service_from) as first_end_year, " +
              "(CASE WHEN extract(year from temp_customer_info.service_from) = extract(year from MIN(public.customer_payments.service_from)) THEN 'True' ELSE 'False' END) as new_customer " +
              "FROM public.temp_customer_info " + 
              "JOIN public.customer_payments ON public.temp_customer_info.customer_id = public.customer_payments.customer_id " + 
              "GROUP BY (public.temp_customer_info.customer_id, temp_customer_info.service_from, temp_customer_info.package_list, temp_customer_info.max_receipts, temp_customer_info.primary_email, temp_customer_info.company_type, temp_customer_info.vat_period, temp_customer_info.reporting_period, temp_customer_info.no_longer_customer_from, temp_customer_info.year_end_accountant, temp_customer_info.service_until) ) bb " +
              "LEFT JOIN (SELECT public.temp_customer_info.customer_id " +
              "FROM public.temp_customer_info " +
              "JOIN public.customer_payments ON public.temp_customer_info.customer_id = public.customer_payments.customer_id " +
              "GROUP BY (public.temp_customer_info.customer_id, temp_customer_info.service_from, temp_customer_info.package_list, temp_customer_info.max_receipts, temp_customer_info.primary_email, temp_customer_info.company_type, temp_customer_info.vat_period, temp_customer_info.reporting_period, temp_customer_info.no_longer_customer_from, temp_customer_info.year_end_accountant, temp_customer_info.service_until) ) aa " +
              "ON bb.customer_id = aa.customer_id) as vv " + extra_search_str + searchStr + order_by;
  
  if (req.body.length != -1)
    query_str = query_str + " LIMIT " + req.body.length + " OFFSET " + req.body.start + ";";

  client.query(init_query, function() {
    client.query(query_count, function(err, result) {
      recordsTotal = result.rows[0].count;
      // calc recordsFiltered
      client.query(query_search_count, function(err, result) {
        recordsFiltered = result.rows[0].count;
        client.query(query_str, function(err, result) {
          if (err) {
            console.log(err);
            res.status(400).send(err);
          }

          for (var i = 0; i < result.rows.length; i++) {
            
            if (result.rows[i].no_longer_customer_from != null) 
              result.rows[i].no_longer_customer_from = moment(result.rows[i].no_longer_customer_from).format("YYYY-MM-DD");
            else result.rows[i].no_longer_customer_from = '';
            if (result.rows[i].first_end_year != null) 
              result.rows[i].first_end_year = moment(result.rows[i].first_end_year).format("YYYY-MM-DD");
            else result.rows[i].first_end_year = '';

            result.rows[i].receipts_used = parseInt(result.rows[i].receipts_used);
          }
          
          var data = JSON.stringify({
            "draw": req.body.draw,
            "recordsFiltered": recordsFiltered,
            "recordsTotal": recordsTotal,
            "data": result.rows,
            "this_year": req.body.this_year
          });
          res.send(data);
        });
      });
    });
  });
};

exports.findBookkeepers = (req, res) => {
    
  let query_str = "SELECT worker_initials, price_per_hour FROM task_manager.freelancers" + 
  " LEFT JOIN task_manager.freelancer_roles ON task_manager.freelancers.worker_initials = task_manager.freelancer_roles.freelancer_short_name" + 
  " WHERE task_manager.freelancer_roles.role_name = 'bookkeeper' ORDER BY worker_initials;"
      
  client.query(query_str, function (err, result) {
      if (err) {
          console.log(err);
          res.status(400).send(err);
      }
      res.send({ data: result.rows });
  });
};

exports.findPackages = (req, res) => {
    
  client.query('SELECT id, short_name FROM public.products WHERE short_name IS NOT NULL ORDER BY short_name;', function (err, result) {
    
      if (err) {
          console.log(err);
          res.status(400).send(err);
      }
      res.send({ data: result.rows});
  });
};

exports.findCompanyTypes = (req, res) => {
    
  client.query('SELECT enum_range(NULL::public.company_type_enum);', function (err, result) {
    
      if (err) {
          console.log(err);
          res.status(400).send(err);
      }
      res.send({ data: result.rows});
  });
};
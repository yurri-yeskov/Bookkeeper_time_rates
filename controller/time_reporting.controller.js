const dbConfig = require("../config/db.config");
const linkConfig = require("../config/links.config");
const auth = require("../controller/auth.controller");
const moment = require('moment');
const {Client} = require('pg');

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
const admin_emails = auth.adminEmails();

exports.getCurrentYear = (req, res) => {

  if (!req.body.user_token) {
    console.log("Oops!");
    res.redirect(linkConfig.OTHER_LINK);
    return;
  }
  const token_data = auth.tokenVeryfy(req.body.user_token);
  if (!token_data) {
      console.log("Token expired");
      res.redirect(linkConfig.OTHER_LINK + "logout");
      return;
  }

  const my_email = token_data.username;
  let acl_level = admin_emails.includes(my_email) ? 1 : 0;
  let acl_query_str = "SELECT interface_name FROM interfaces.acl WHERE user_email='" + my_email + "';";
  let acl_array = [];
  client.query(acl_query_str, function(err, result) {
    if (result.rows.length > 0) {
      for (let i=0; i<result.rows.length; i++) {
        acl_array[i] = result.rows[i].interface_name;
      }
    }

    let this_year = new Date();
    this_year = this_year.getFullYear();
    let month_index = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    let month_list = [
      "January", "February", "March",     "April",   "May",      "June",
      "July",    "August",   "September", "October", "November", "December"
    ];
    res.render('time-reporting', {
        page:'Bookkeeper Time Reporting', 
        menuId:'time-reporting', 
        this_year: this_year, 
        month_index: month_index,
        month_list: month_list,
        other_link:linkConfig.OTHER_LINK,
        my_email: my_email,
        acl_level: acl_level,
        acl_array: acl_array,
        user_token: req.body.user_token
    });
  });
};

exports.getDayCustomerInfo = (req, res) => {

  if (!req.body.sel_start_date || !req.body.sel_end_date) {
    console.log("Oops!");
    res.redirect("/");
    return;
  }

  if (!req.body.user_token) {
    console.log("Oops! You need to log in again");
    res.redirect(linkConfig.OTHER_LINK);
    return;
  }
  const token_data = auth.tokenVeryfy(req.body.user_token);
  if (!token_data) {
    console.log("Token expired");
    // res.redirect(linkConfig.OTHER_LINK); ///////////////Ajax
    res.send({ other_link: linkConfig.OTHER_LINK + "logout", data: "token_expired" });
    return;
  }

  const my_email = token_data.username;
  let acl_level = admin_emails.includes(my_email) ? 1 : 0;
  let start_date = moment(req.body.sel_start_date, 'DD-MM-YYYY').format('YYYY-MM-DD');
  let end_date = moment(req.body.sel_end_date, 'DD-MM-YYYY').format('YYYY-MM-DD');

  let pre_query_str = "SELECT TRIM(CONCAT(first_name, ' ', last_name)) AS bookkeeper_name, COALESCE(price_per_hour, 0.00) as hourly FROM task_manager.freelancers WHERE email='" + my_email + "'";
  client.query(pre_query_str, function(err, result) {
    if (err) {
      console.log(err);
      res.status(400).send(err);  
    }
    let bookkeeper_full_name = "N/A"; let price_per_hour = 0.00;
    if (acl_level == 1) bookkeeper_full_name = "Admin";
    else if (result.rows.length > 0) {
      bookkeeper_full_name = result.rows[0].bookkeeper_name;
      price_per_hour = result.rows[0].hourly;
    }

    let query_str = "SELECT (COALESCE(january_spent, 0.00) + COALESCE(february_spent, 0.00) + COALESCE(march_spent, 0.00) + " +
                  "COALESCE(april_spent, 0.00) + COALESCE(may_spent, 0.00) + COALESCE(june_spent, 0.00) + " +
                  "COALESCE(july_spent, 0.00) + COALESCE(august_spent, 0.00) + COALESCE(september_spent, 0.00) + " +
                  "COALESCE(october_spent, 0.00) + COALESCE(november_spent, 0.00) + COALESCE(december_spent, 0.00)) as time_spent, reg_date, " +
                  "customer_id, email_address, company_name, bookkeeper_name, task_type, period, delivery_year, note " + 
                  "FROM task_manager.time_entries WHERE bookkeeper_name='" + bookkeeper_full_name + "' AND " +
                  "deleted = false AND reg_date >= '" + start_date + "'::date AND reg_date <= '" + end_date + "'::date " + 
                  "ORDER BY reg_date ASC";
  
    client.query(query_str, function(err, result) {
      if (err) {
        console.log(err);
        res.status(400).send(err);  
      }
      let time_spent = 0.00;
      for (let i = 0; i < result.rows.length; i++) {
        time_spent += parseFloat(result.rows[i].time_spent);
        result.rows[i].reg_date = moment(result.rows[i].reg_date).format("DD-MM-YYYY HH:mm:ss");
      }
      // time_spent = (time_spent / 60).toFixed(2);
      // time_spent = time_spent / 60.00;
      let arr_time_spt = result.rows;

      let cost_spent = time_spent / 60.00 * parseFloat(price_per_hour);
      cost_spent = cost_spent.toFixed(2);
      time_spent = (time_spent / 60).toFixed(2);
      res.send({ data: arr_time_spt, time_spent:time_spent, cost_spent:cost_spent });
    });
  });
};

exports.findCustomerInfoWithYear = (req, res) => {

  if (!req.body.this_year) {
    console.log("Oops!");
    res.redirect("/");
    return;
  }

  if (!req.body.user_token) {
    console.log("Oops! You need to log in again");
    res.redirect(linkConfig.OTHER_LINK);
    return;
  }
  const token_data = auth.tokenVeryfy(req.body.user_token);
  if (!token_data) {
    console.log("Token expired");
    // res.redirect(linkConfig.OTHER_LINK); ////////////////////Ajax
    var data = JSON.stringify({
      "draw": 0,
      "recordsFiltered": 0,
      "recordsTotal": 0,
      "data": [],
      "this_year": req.body.this_year
    });
    res.send(data);
    return;
  }

  const my_email = token_data.username;
  let pre_query_str = "SELECT TRIM(CONCAT(first_name, ' ', last_name)) AS bookkeeper_name, COALESCE(price_per_hour, 0.00) as hourly FROM task_manager.freelancers WHERE email='" + my_email + "'";
  client.query(pre_query_str, function(err, result) {
    if (err) {
      console.log(err);
      res.status(400).send(err);  
    }    
    let bookkeeper_full_name = "N/A"; 
    let acl_level = admin_emails.includes(my_email) ? 1 : 0;
    if (acl_level == 1) bookkeeper_full_name = "Admin";
    else if (result.rows.length > 0) bookkeeper_full_name = result.rows[0].bookkeeper_name;

    let start_date = ""; let end_date = "";
    if (req.body.sel_start_date)
      start_date = moment(req.body.sel_start_date, 'DD-MM-YYYY').format('YYYY-MM-DD');
    if (req.body.sel_end_date) 
      end_date = moment(req.body.sel_end_date, 'DD-MM-YYYY').format('YYYY-MM-DD');

    let service_from = req.body.this_year + "-01-01";
    let service_until = req.body.this_year + "-12-31";
  
    let recordsTotal = 0;
    let recordsFiltered = 0;
  
    let init_query = "CALL set_customer_time_into_temp('" + service_from + "', '" + service_until + "');"

    let query_str = "SELECT (COALESCE(january_spent, 0.00) + COALESCE(february_spent, 0.00) + COALESCE(march_spent, 0.00) + " +
                    "COALESCE(april_spent, 0.00) + COALESCE(may_spent, 0.00) + COALESCE(june_spent, 0.00) + " +
                    "COALESCE(july_spent, 0.00) + COALESCE(august_spent, 0.00) + COALESCE(september_spent, 0.00) + " +
                    "COALESCE(october_spent, 0.00) + COALESCE(november_spent, 0.00) + COALESCE(december_spent, 0.00)) as time_spent, reg_date, " +
                    "task_manager.time_entries.customer_id, email_address, task_manager.time_entries.company_name, task_manager.time_entries.bookkeeper_name, task_type, period, delivery_year, note ";
                    
    
    let query_from = "FROM task_manager.time_entries JOIN temp_customer_time ON task_manager.time_entries.customer_id = temp_customer_time.customer_id WHERE deleted = false ";
    
    if (bookkeeper_full_name != "Admin")
      query_from = query_from + "AND task_manager.time_entries.bookkeeper_name = '" + bookkeeper_full_name + "' ";
    if (start_date != "")
      query_from = query_from + "AND reg_date >= '" + start_date + "'::date ";
    if (end_date != "")
      query_from = query_from + "AND reg_date <= '" + end_date + "'::date ";
    // query_from = query_from + "ORDER BY reg_date ASC";
    query_str = query_str + query_from;

    let query_count = "SELECT COUNT(*) " + query_from;

    let order_list = {
      'time_spent': 1, 'reg_date': 2, 'customer_id': 3, 'email_address': 4, 'company_name': 5, 
      'bookkeeper_name': 6, 'task_type': 7, 'period': 8, 'delivery_year': 9, 'note': 10
    };

    let o_index = 'reg_date';
    let o_dir = 'ASC';
    if (req.body['order[0][column]']) {
      o_index = 'columns[' + req.body['order[0][column]'] + '][data]';
      o_index = req.body[o_index];
      o_dir = req.body['order[0][dir]'];
    }
    let order_by = " ORDER BY " + order_list[o_index] + " " + o_dir + " ";
    let searchStr_r = req.body["search[value]"];
    let searchStr = ""
    if(req.body["search[value]"])  {
      let time_spent_str = "(COALESCE(january_spent, 0.00) + COALESCE(february_spent, 0.00) + COALESCE(march_spent, 0.00) + " +
                          "COALESCE(april_spent, 0.00) + COALESCE(may_spent, 0.00) + COALESCE(june_spent, 0.00) + " +
                          "COALESCE(july_spent, 0.00) + COALESCE(august_spent, 0.00) + COALESCE(september_spent, 0.00) + " +
                          "COALESCE(october_spent, 0.00) + COALESCE(november_spent, 0.00) + COALESCE(december_spent, 0.00))"
      searchStr = "AND (" + time_spent_str + "::TEXT ILIKE '%" + searchStr_r + "%' OR reg_date::TEXT ILIKE '%" + searchStr_r + 
                      "%' OR task_manager.time_entries.customer_id::TEXT ILIKE '%" + searchStr_r + "%' OR email_address::TEXT ILIKE '%" + searchStr_r + 
                      "%' OR task_manager.time_entries.company_name::TEXT ILIKE '%" + searchStr_r + "%' OR task_manager.time_entries.bookkeeper_name::TEXT ILIKE '%" + searchStr_r + 
                      "%' OR task_type::TEXT ILIKE '%" + searchStr_r + "%' OR period::TEXT ILIKE '%" + searchStr_r + 
                      "%' OR delivery_year::TEXT ILIKE '%" + searchStr_r + "%' OR note::TEXT ILIKE '%" + searchStr_r + "%') ";
    }
    let query_search_count = "SELECT COUNT(*) " + query_from + searchStr;

    query_str = query_str + searchStr + order_by;
    console.log("query_str-----------------", query_str);
    if (req.body.length != -1)
      query_str = query_str + "LIMIT " + req.body.length + " OFFSET " + req.body.start;

    client.query(init_query, function(){
      client.query(query_count, function(err, result) {
        recordsTotal = result.rows[0].count;
        client.query(query_search_count, function(err, result) {
          recordsFiltered = result.rows[0].count;
          client.query(query_str, function(err, result) {
            if (err) {
              console.log(err);
              res.status(400).send(err);
            }
  
            for (let i = 0; i < result.rows.length; i++) {
              result.rows[i].reg_date = moment(result.rows[i].reg_date, 'YYYY-MM-DD').format('DD-MM-YYYY');
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
  });
  return;

  let service_from = req.body.this_year + "-01-01";
  let service_until = req.body.this_year + "-12-31";

  let recordsTotal = 0;
  let recordsFiltered = 0;

  let init_query = "CALL set_customer_time_into_temp('" + service_from + "', '" + service_until + "');"
  let query_count = "SELECT COUNT(vv.*) FROM " + 
                      "(SELECT COALESCE(time_spent[1], 0.00) as january_spent, COALESCE(time_spent[2], 0.00) as february_spent, " + 
                      "COALESCE(time_spent[3], 0.00) as march_spent, COALESCE(time_spent[4], 0.00) as april_spent, " + 
                      "COALESCE(time_spent[5], 0.00) as may_spent, COALESCE(time_spent[6], 0.00) as june_spent, " +
                      "COALESCE(time_spent[7], 0.00) as july_spent, COALESCE(time_spent[8], 0.00) as august_spent, " +
                      "COALESCE(time_spent[9], 0.00) as september_spent, COALESCE(time_spent[10], 0.00) as october_spent, " +
                      "COALESCE(time_spent[11], 0.00) as november_spent, COALESCE(time_spent[12], 0.00) as december_spent, " + 
                      "COALESCE((COALESCE(time_spent[1], 0.00) + COALESCE(time_spent[2], 0.00) + COALESCE(time_spent[3], 0.00) + " + 
                      "COALESCE(time_spent[4], 0.00) + COALESCE(time_spent[5], 0.00) + COALESCE(time_spent[6], 0.00) + COALESCE(time_spent[7], 0.00) + " + 
                      "COALESCE(time_spent[8], 0.00) + COALESCE(time_spent[9], 0.00) + COALESCE(time_spent[10], 0.00) + COALESCE(time_spent[11], 0.00) + " + 
                      "COALESCE(time_spent[12], 0.00)), 0.00) as total_spent, " +
                      "aa.* FROM (" + 
                      "SELECT customer_id, primary_email, company_name, bookkeeper_name, bookkeeper_email, " +
                      "calc_timespent_month(customer_id, '" + service_from + "'::date, '" + service_until + "'::date) AS time_spent " +
                      "FROM temp_customer_time) AS aa) AS vv ";

  let acl_level = admin_emails.includes(my_email) ? 1 : 0;
  if (acl_level != 1) query_count += "WHERE bookkeeper_email = '" + my_email + "' ";

  let order_list = {
    'january_spent': 1, 'february_spent': 2, 'march_spent': 3, 'april_spent': 4, 'may_spent': 5, 'june_spent': 6, 'july_spent': 7,
    'august_spent': 8, 'september_spent': 9, 'october_spent': 10, 'november_spent': 11, 'december_spent': 12, 
    'total_spent': 13, 'customer_id': 14, 'primary_email': 15, 'company_name': 16, 'bookkeeper_name': 17, 'time_spent': 19
  };

  let o_index = 'customer_id';
  let o_dir = 'ASC';
  if (req.body['order[0][column]']) {
    o_index = 'columns[' + req.body['order[0][column]'] + '][data]';
    o_index = req.body[o_index];
    o_dir = req.body['order[0][dir]'];
  }
  let order_by = " ORDER BY " + order_list[o_index] + " " + o_dir + " ";

  let searchStr_r = req.body["search[value]"];
  let searchStr = "WHERE "
  if(req.body["search[value]"])  {
    if (acl_level != 1) searchStr += "bookkeeper_email = '" + my_email + "' AND ";
    let sub_searchStr = "(vv.january_spent::TEXT ILIKE '%" + searchStr_r + "%' OR vv.february_spent::TEXT ILIKE '%" + searchStr_r + 
                        "%' OR vv.march_spent::TEXT ILIKE '%" + searchStr_r + "%' OR vv.april_spent::TEXT ILIKE '%" + searchStr_r + 
                        "%' OR vv.may_spent::TEXT ILIKE '%" + searchStr_r + "%' OR vv.june_spent::TEXT ILIKE '%" + searchStr_r + 
                        "%' OR vv.july_spent::TEXT ILIKE '%" + searchStr_r + "%' OR vv.august_spent::TEXT ILIKE '%" + searchStr_r + 
                        "%' OR vv.september_spent::TEXT ILIKE '%" + searchStr_r + "%' OR vv.october_spent::TEXT ILIKE '%" + searchStr_r +
                        "%' OR vv.november_spent::TEXT ILIKE '%" + searchStr_r + "%' OR vv.december_spent::TEXT ILIKE '%" + searchStr_r +
                        "%' OR vv.total_spent::TEXT ILIKE '%" + searchStr_r + "%' OR vv.customer_id::TEXT ILIKE '%" + searchStr_r + 
                        "%' OR vv.primary_email::TEXT ILIKE '%" + searchStr_r + "%') ";
    searchStr += sub_searchStr;
  } else {
    if (acl_level != 1) searchStr += "bookkeeper_email = '" + my_email + "' ";
    else searchStr = "";
  }

  // change based on Search//
  let query_search_count = "SELECT COUNT(vv.*) FROM " + 
                      "(SELECT COALESCE(time_spent[1], 0.00) as january_spent, COALESCE(time_spent[2], 0.00) as february_spent, " + 
                      "COALESCE(time_spent[3], 0.00) as march_spent, COALESCE(time_spent[4], 0.00) as april_spent, " + 
                      "COALESCE(time_spent[5], 0.00) as may_spent, COALESCE(time_spent[6], 0.00) as june_spent, " +
                      "COALESCE(time_spent[7], 0.00) as july_spent, COALESCE(time_spent[8], 0.00) as august_spent, " +
                      "COALESCE(time_spent[9], 0.00) as september_spent, COALESCE(time_spent[10], 0.00) as october_spent, " +
                      "COALESCE(time_spent[11], 0.00) as november_spent, COALESCE(time_spent[12], 0.00) as december_spent, " + 
                      "COALESCE((COALESCE(time_spent[1], 0.00) + COALESCE(time_spent[2], 0.00) + COALESCE(time_spent[3], 0.00) + " + 
                      "COALESCE(time_spent[4], 0.00) + COALESCE(time_spent[5], 0.00) + COALESCE(time_spent[6], 0.00) + COALESCE(time_spent[7], 0.00) + " + 
                      "COALESCE(time_spent[8], 0.00) + COALESCE(time_spent[9], 0.00) + COALESCE(time_spent[10], 0.00) + COALESCE(time_spent[11], 0.00) + " + 
                      "COALESCE(time_spent[12], 0.00)), 0.00) as total_spent, " +
                      "aa.* FROM (" + 
                      "SELECT customer_id, primary_email, company_name, bookkeeper_name, bookkeeper_email, " +
                      "calc_timespent_month(customer_id, '" + service_from + "'::date, '" + service_until + "'::date) AS time_spent " +
                      "FROM temp_customer_time) AS aa) AS vv " + searchStr;
  
  // add offset and limit//
  let query_str = "SELECT vv.* FROM " +
              "(SELECT COALESCE(time_spent[1], 0.00) as january_spent, COALESCE(time_spent[2], 0.00) as february_spent, " + 
              "COALESCE(time_spent[3], 0.00) as march_spent, COALESCE(time_spent[4], 0.00) as april_spent, " + 
              "COALESCE(time_spent[5], 0.00) as may_spent, COALESCE(time_spent[6], 0.00) as june_spent, " +
              "COALESCE(time_spent[7], 0.00) as july_spent, COALESCE(time_spent[8], 0.00) as august_spent, " +
              "COALESCE(time_spent[9], 0.00) as september_spent, COALESCE(time_spent[10], 0.00) as october_spent, " +
              "COALESCE(time_spent[11], 0.00) as november_spent, COALESCE(time_spent[12], 0.00) as december_spent, " + 
              "COALESCE((COALESCE(time_spent[1], 0.00) + COALESCE(time_spent[2], 0.00) + COALESCE(time_spent[3], 0.00) + " + 
              "COALESCE(time_spent[4], 0.00) + COALESCE(time_spent[5], 0.00) + COALESCE(time_spent[6], 0.00) + COALESCE(time_spent[7], 0.00) + " + 
              "COALESCE(time_spent[8], 0.00) + COALESCE(time_spent[9], 0.00) + COALESCE(time_spent[10], 0.00) + COALESCE(time_spent[11], 0.00) + " + 
              "COALESCE(time_spent[12], 0.00)), 0.00) as total_spent, " +
              "aa.* FROM (" + 
              "SELECT customer_id, primary_email, company_name, bookkeeper_name, bookkeeper_email, " +
              "calc_timespent_month(customer_id, '" + service_from + "'::date, '" + service_until + "'::date) AS time_spent " +
              "FROM temp_customer_time) AS aa) AS vv " + searchStr + order_by;
  
  if (req.body.length != -1)
    query_str = query_str + " LIMIT " + req.body.length + " OFFSET " + req.body.start;

  client.query(init_query, function() {
    client.query(query_count, function(err, result) {
      recordsTotal = result.rows[0].count;
      client.query(query_search_count, function(err, result) {
        recordsFiltered = result.rows[0].count;
        client.query(query_str, function(err, result) {
          if (err) {
            console.log(err);
            res.status(400).send(err);
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

exports.insertReportTime = (req, res) => {
    
  if (!req.body) {
      return res.status(400).send({
        message: "Data to update can not be empty!"
      });
  }
  
  if (!req.body.customer_id || !req.body.bookkeeper_name || !req.body.company_name || !req.body.primary_email || 
      !req.body.task_type || !req.body.period || !req.body.time_spent || !req.body.time_note) {
      console.log("Oops!");
      res.redirect("/");
      return;
  }
  
  let task_list = {
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

  let month_list = {
    "01": "january_spent",
    "02": "february_spent",
    "03": "march_spent",
    "04": "april_spent",
    "05": "may_spent",
    "06": "june_spent",
    "07": "july_spent",
    "08": "august_spent",
    "09": "september_spent",
    "10": "october_spent",
    "11": "november_spent",
    "12": "december_spent"
  }
  let month_nlist = {
    "01": "January",
    "02": "February",
    "03": "March",
    "04": "April",
    "05": "May",
    "06": "June",
    "07": "July",
    "08": "August",
    "09": "September",
    "10": "October",
    "11": "November",
    "12": "December"
  }
  let query_str = "INSERT INTO task_manager.time_entries (customer_id, company_name, bookkeeper_name, email_address, " +
                  "task_type, period, " + month_list[req.body.month] + ", reg_date, note, delivery_year) " + 
                  "VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10);";
  client.query(query_str, [req.body.customer_id, req.body.company_name, req.body.bookkeeper_name, req.body.primary_email,
                           task_list[req.body.task_type], req.body.period, req.body.time_spent, req.body.cur_time, req.body.time_note, req.body.year], 
              function(err, result) {
    if (err) {
        console.log(err);
        res.status(400).send(err);
    }

    let ext_query_str = "INSERT INTO task_manager.time_audit_log (customer_id, company_name, bookkeeper_name, email_address, delivery_year, sel_month, chg_column, new_value, change_date) VALUES (" + 
                    req.body.customer_id + ", '" + req.body.company_name + "', '" + req.body.bookkeeper_name + "', '" +
                    req.body.primary_email + "', " + req.body.year + ", '" + month_nlist[req.body.month] + "', " + "'Primary Task Type', '" +
                    task_list[req.body.task_type] + "', '" + req.body.cur_time + "'::timestamp); " +

                    "INSERT INTO task_manager.time_audit_log (customer_id, company_name, bookkeeper_name, email_address, delivery_year, sel_month, chg_column, new_value, change_date) VALUES (" + 
                    req.body.customer_id + ", '" + req.body.company_name + "', '" + req.body.bookkeeper_name + "', '" +
                    req.body.primary_email + "', " + req.body.year + ", '" + month_nlist[req.body.month] + "', " + "'Period', '" +
                    req.body.period + "', '" + req.body.cur_time + "'::timestamp); " +

                    "INSERT INTO task_manager.time_audit_log (customer_id, company_name, bookkeeper_name, email_address, delivery_year, sel_month, chg_column, new_value, change_date) VALUES (" + 
                    req.body.customer_id + ", '" + req.body.company_name + "', '" + req.body.bookkeeper_name + "', '" +
                    req.body.primary_email + "', " + req.body.year + ", '" + month_nlist[req.body.month] + "', " + "'Time Spent', '" +
                    req.body.time_spent + "', '" + req.body.cur_time + "'::timestamp); " +

                    "INSERT INTO task_manager.time_audit_log (customer_id, company_name, bookkeeper_name, email_address, delivery_year, sel_month, chg_column, new_value, change_date) VALUES (" + 
                    req.body.customer_id + ", '" + req.body.company_name + "', '" + req.body.bookkeeper_name + "', '" +
                    req.body.primary_email + "', " + req.body.year + ", '" + month_nlist[req.body.month] + "', " + "'Note', '" +
                    req.body.time_note + "', '" + req.body.cur_time + "'::timestamp); ";
    
    client.query(ext_query_str, function(err, result) {
      if (err) {
        console.log(err);
        res.status(400).send(err);
      }

      res.send({ message: "It was updated successfully." });
    });
  });
};

exports.findReportTimes = (req, res) => {
    
  if (!req.body) {
      return res.status(400).send({
        message: "Data to update can not be empty!"
      });
  }
  
  if (!req.body.customer_id || !req.body.sel_year) {
      console.log("Oops!");
      res.redirect("/");
      return;
  }

  let query_str = "SELECT * FROM task_manager.time_entries WHERE customer_id = " + req.body.customer_id + 
                      " AND extract(year from reg_date) = '" + req.body.sel_year + "' " + 
                      " AND deleted = false " +
                  "ORDER BY id;";
                      
  client.query(query_str, function(err, result) {
    if (err) {
        console.log(err);
        res.status(400).send(err);
    }
    
    res.send({ data: result.rows });
  });
};

exports.findAuditLog = (req, res) => {
    
  if (!req.body) {
      return res.status(400).send({
        message: "Data to update can not be empty!"
      });
  }
  
  if (!req.body.customer_id || !req.body.sel_year) {
      console.log("Oops!");
      res.redirect("/");
      return;
  }

  let query_str = "SELECT *, change_date::TEXT as change_date_str FROM task_manager.time_audit_log WHERE customer_id = " + req.body.customer_id + 
                      " AND extract(year from change_date) = '" + req.body.sel_year + "' " + 
                  "ORDER BY id;";
                      
  client.query(query_str, function(err, result) {
    if (err) {
        console.log(err);
        res.status(400).send(err);
    }
    
    res.send({ data: result.rows });
  });
};

exports.updateReportTimes = (req, res) => {
    
  if (!req.body) {
      return res.status(400).send({
        message: "Data to update can not be empty!"
      });
  }

  if (!req.body.task_type && !req.body.period && 
      !req.body.time_spent && !req.body.note) {
      console.log("Oops!");
      res.redirect("/");
      return;
  }
  let pre_query_str = "SELECT * FROM task_manager.time_entries WHERE id=" + req.body.id;

  client.query(pre_query_str, function(err, result){
    if (err) {
      console.log(err);
      res.status(400).send(err);
    }
    let old_data = result.rows[0];
    let month_list = {
      "January": "january_spent", 
      "February": "february_spent", 
      "March": "march_spent",
      "April": "april_spent", 
      "May": "may_spent",
      "June": "june_spent", 
      "July": "july_spent", 
      "August": "august_spent", 
      "September": "september_spent", 
      "October": "october_spent",
      "November": "november_spent", 
      "December": "december_spent" 
    }
  
    let task_list = {
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

    let query_str = "UPDATE task_manager.time_entries SET ";
    if (req.body.task_type)
      query_str = query_str + "task_type='" + task_list[req.body.task_type] + "', ";
    if (req.body.period)
      query_str = query_str + "period='" + req.body.period + "', ";
    if (req.body.time_spent)
      query_str = query_str + month_list[req.body.month] + "=" + req.body.time_spent + ", ";
    if (req.body.note)
      query_str = query_str + "note='" + req.body.note + "', ";
  
    query_str = query_str.substring(0, query_str.length - 2);
    query_str = query_str + " WHERE id=" + req.body.id + "; ";

    if (req.body.task_type) {
      query_str = query_str + "INSERT INTO task_manager.time_audit_log (customer_id, company_name, bookkeeper_name, email_address, delivery_year, sel_month, chg_column, old_value, new_value, change_date) VALUES (" + 
                old_data.customer_id + ", '" + old_data.company_name + "', '" + old_data.bookkeeper_name + "', '" +
                old_data.email_address + "', " + old_data.delivery_year + ", '" + req.body.month + "', " + "'Primary Task Type', '" + old_data.task_type + "', '" +
                task_list[req.body.task_type] + "', '" + req.body.today + "'::timestamp); ";

    }
    if (req.body.period) {
      query_str = query_str + "INSERT INTO task_manager.time_audit_log (customer_id, company_name, bookkeeper_name, email_address, delivery_year, sel_month, chg_column, old_value, new_value, change_date) VALUES (" + 
                old_data.customer_id + ", '" + old_data.company_name + "', '" + old_data.bookkeeper_name + "', '" +
                old_data.email_address + "', " + old_data.delivery_year + ", '" + req.body.month + "', " + "'Period', '" + old_data.period + "', '" +
                req.body.period + "', '" + req.body.today + "'::timestamp); ";

    }
    if (req.body.time_spent) {
      query_str = query_str + "INSERT INTO task_manager.time_audit_log (customer_id, company_name, bookkeeper_name, email_address, delivery_year, sel_month, chg_column, old_value, new_value, change_date) VALUES (" + 
                old_data.customer_id + ", '" + old_data.company_name + "', '" + old_data.bookkeeper_name + "', '" +
                old_data.email_address + "', " + old_data.delivery_year + ", '" + req.body.month + "', " + "'Time Spent', '" + old_data[month_list[req.body.month]] + "', '" +
                req.body.time_spent + "', '" + req.body.today + "'::timestamp); ";
    }
    if (req.body.note) {
      query_str = query_str + "INSERT INTO task_manager.time_audit_log (customer_id, company_name, bookkeeper_name, email_address, delivery_year, sel_month, chg_column, old_value, new_value, change_date) VALUES (" + 
                old_data.customer_id + ", '" + old_data.company_name + "', '" + old_data.bookkeeper_name + "', '" +
                old_data.email_address + "', " + old_data.delivery_year + ", '" + req.body.month + "', " + "'Note', '" + old_data.note + "', '" +
                req.body.note + "', '" + req.body.today + "'::timestamp); ";
    }

    client.query(query_str, function(err, result) {
      if (err) {
          console.log(err);
          res.status(400).send(err);
      }
      res.send({ message: "It was updated successfully." });
    });
  });
  
};

exports.deleteReportTimes = (req, res) => {
    
  if (!req.body) {
      return res.status(400).send({
        message: "Data to update can not be empty!"
      });
  }

  let pre_query_str = "SELECT * FROM task_manager.time_entries WHERE id=" + req.body.id;

  client.query(pre_query_str, function(err, result){
    if (err) {
      console.log(err);
      res.status(400).send(err);
    }
    let old_data = result.rows[0];

    let query_str = "UPDATE task_manager.time_entries SET " + 
                    "deleted=true WHERE id=" + req.body.id + "; ";
    
    query_str = query_str + "INSERT INTO task_manager.time_audit_log (customer_id, company_name, bookkeeper_name, email_address, delivery_year, sel_month, chg_column, old_value, new_value, change_date) VALUES (" + 
              old_data.customer_id + ", '" + old_data.company_name + "', '" + old_data.bookkeeper_name + "', '" +
              old_data.email_address + "', " + old_data.delivery_year + ", '" + req.body.month + "', " + "'deleted', 'FALSE', 'TRUE', '" + req.body.today + "'::timestamp); ";
  

    client.query(query_str, function(err, result) {
      if (err) {
          console.log(err);
          res.status(400).send(err);
      }
      res.send({ message: "It was updated successfully." });
    });
  });
  
};

exports.findTotalTimes = (req, res) => {
    
  if (!req.body) {
      return res.status(400).send({
        message: "Data to update can not be empty!"
      });
  }
  
  if (!req.body.sel_year || !req.body.user_token) {
      console.log("Oops!");
      res.redirect(linkConfig.OTHER_LINK);
      return;
  }
  const token_data = auth.tokenVeryfy(req.body.user_token);
  if (!token_data) {
    console.log("Token expired");
    // res.redirect(linkConfig.OTHER_LINK); ////////////////////////Ajax
    res.send({ other_link: linkConfig.OTHER_LINK + "logout", data: "token_expired" });
    return;
  }

  const my_email = token_data.username;

  let pre_query_str = "SELECT TRIM(CONCAT(first_name, ' ', last_name)) AS bookkeeper_name FROM task_manager.freelancers WHERE email='" + my_email + "'";
  client.query(pre_query_str, function(err, result) {
    if (err) {
        console.log(err);
        res.status(400).send(err);
    }
    let my_name = "N/A";
    let acl_level = admin_emails.includes(my_email) ? 1 : 0;
    if (acl_level == 1) my_name = "Admin";
    else {
      if (result.rows.length > 0) my_name = result.rows[0].bookkeeper_name;
    }

    let query_str = "SELECT COALESCE(SUM(january_spent), 0.00) as january_time, " + 
                    "COALESCE(SUM(february_spent), 0.00) as february_time, " +
                    "COALESCE(SUM(march_spent), 0.00) as march_time, " + 
                    "COALESCE(SUM(april_spent), 0.00) as april_time, " +
                    "COALESCE(SUM(may_spent), 0.00) as may_time, " +
                    "COALESCE(SUM(june_spent), 0.00) as june_time, " +
                    "COALESCE(SUM(july_spent), 0.00) as july_time, " +
                    "COALESCE(SUM(august_spent), 0.00) as august_time, " +
                    "COALESCE(SUM(september_spent), 0.00) as september_time, " +
                    "COALESCE(SUM(october_spent), 0.00) as october_time, " +
                    "COALESCE(SUM(november_spent), 0.00) as november_time, " +
                    "COALESCE(SUM(december_spent), 0.00) as december_time " +
                    "FROM task_manager.time_entries WHERE deleted=false AND " +
                    "extract(year from reg_date) = '" + req.body.sel_year + "' ";
    
    if (my_name != 'N/A' && my_name != 'Admin')
      query_str = query_str + "AND bookkeeper_name='" + my_name + "'";

    client.query(query_str, function(err, result) {
      if (err) {
        console.log(err);
        res.status(400).send(err);
      }
      if (my_name == 'N/A') result.rows = [];

      res.send({ data: result.rows });
    });
  });
};

exports.findExCustomerInfo = (req, res) => {
    
  if (!req.body) {
      return res.status(400).send({
        message: "Data to update can not be empty!"
      });
  }
  
  if (!req.body.sel_id) {
      console.log("Oops!");
      res.redirect("/");
      return;
  }
  
  let query_str = "SELECT customer_payments.customer_id, customers.primary_email, customers.name as company_name, " +
                  "(SELECT TRIM(CONCAT(first_name, ' ', last_name)) AS bookkeeper_name FROM freelancers WHERE worker_initials = year_end_accountant) " +
                  "FROM customers JOIN customer_payments ON customers.id = customer_payments.customer_id " +
                  "WHERE customers.id=" + req.body.sel_id + " " +
                  "GROUP BY customer_payments.customer_id, customers.primary_email, customers.name, customers.year_end_accountant;"
                      
  client.query(query_str, function(err, result) {
    if (err) {
        console.log(err);
        res.status(400).send(err);
    }

    res.send({ data: result.rows });
  });
};
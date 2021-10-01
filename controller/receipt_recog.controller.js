const dbConfig = require("../config/db.config");
const linkConfig = require("../config/links.config");
const {Client} = require('pg');
const ocrSpace = require('ocr-space-api-wrapper');

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

const OCR_API_KEY = '8163d9aa9b88957';

exports.index = (req, res) => {

  res.render('receipt-recog', {
    page:' Receipt Recognition', 
    menuId:'receipt-recog', 
    this_year: "2021",
    other_link:linkConfig.OTHER_LINK, 
    data:{},
    my_email: "my_email@mail.com",
    acl_level: 1,
    acl_array: [],
    user_token: "123456789"
  });
}

exports.getRecogResult = (req, res) => {

  console.log("//////////////////////////////////testtestetsts");
  if (!req.body.image_path) {
    console.log("Oops!");
    res.redirect(linkConfig.OTHER_LINK);
    return;     
  }
  ocrFunc(req.body.image_path, res);
}

const ocrFunc = async (image_path, res) => {
  try {
    console.log("okokokokokokokokokookokookokokokokokokok");
    let image_path = $('#imagePath').val();
    let path_split = image_path.split('.');
    let filetype = path_split[path_split.length - 1].toUpperCase();
    if (filetype == 'PDF') filetype = 'PDF';
    else if (filetype == 'GIF') filetype = 'GIF';
    else if (filetype == 'PNG') filetype = 'PNG';
    else if (filetype == 'JPG' || filetype == 'JPEG') filetype = 'JPG';
    else if (filetype == 'TIF' || filetype == 'TIFF') filetype = 'TIF';
    else if (filetype == 'BMP') filetype = 'BMP';
    else {
      res.status(400).send("The file is not supported.");
      return;
    }
    const result = await ocrSpace(image_path, { apiKey: OCR_API_KEY, language: 'dan', isTable: true, OCREngine: 2, filetype: filetype });
    console.log("okokokokokokokokokookokookokokokokokokok--------------------------");
    console.log(result);
    res.send({ data: result.ParsedResults });
  } catch (error) {
    console.log(error);
    res.status(400).send(error);
  }
}
///////////////////////////////////////////////////////

exports.getCurrentYear = (req, res) => {

  let admin_emails = ['tk@ebogholderen.dk', 'tr@ebogholderen.dk', 'thra@c.dk', 'yurii@gmail.com'];

  if (!req.body.user_token) {
    console.log("Oops!");
    res.redirect(linkConfig.OTHER_LINK);
    return;             
  }
  let pre_query_str = "SELECT user_email FROM interfaces.user_tokens WHERE user_token='" + req.body.user_token + "';";

  client.query(pre_query_str, function(err, result) {
    if (err) {
      console.log(err);
      res.status(400).send(err);  
    }
    let my_email = "";
    if (result.rows.length > 0) {
      my_email = result.rows[0].user_email;
    } else {
      res.redirect(linkConfig.OTHER_LINK);
      return;
    } 

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
      res.render('report-overview', {
          page:'Time Entry Overview', 
          menuId:'report-overview', 
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
  });
};

exports.findAllTimeEntry = (req, res) => {

  if (!req.body) {
    console.log("Oops!");
    res.redirect("/");
    return;
  }

  let recordsTotal = 0;
  let recordsFiltered = 0;

  let query_count = "SELECT COUNT(*) FROM task_manager.time_entries";

  let order_list = {
    'customer_id': 1, 'email_address': 2, 'company_name': 3, 'bookkeeper_name': 4, 'task_type': 5, 
    'period': 6, 'delivery_year': 7, 'deleted': 8, 'note': 9, 'time_spent': 10
  };

  let o_index = 'customer_id';
  let o_dir = 'ASC';
  if (req.body['order[0][column]']) {
    o_index = 'columns[' + req.body['order[0][column]'] + '][data]';
    o_index = req.body[o_index];
    o_dir = req.body['order[0][dir]'];
  }
  let order_by = " ORDER BY " + order_list[o_index] + " " + o_dir + ", reg_date ASC ";

  let searchStr = req.body["search[value]"];
  if(req.body["search[value]"]) {
    searchStr = "WHERE " +
                "customer_id::TEXT ILIKE '%" + searchStr + "%' OR email_address::TEXT ILIKE '%" + searchStr + 
                "%' OR company_name::TEXT ILIKE '%" + searchStr + "%' OR bookkeeper_name::TEXT ILIKE '%" + searchStr + 
                "%' OR task_type::TEXT ILIKE '%" + searchStr + "%' OR period::TEXT ILIKE '%" + searchStr + 
                "%' OR delivery_year::TEXT ILIKE '%" + searchStr + "%' OR deleted::TEXT ILIKE '%" + searchStr + 
                "%' OR note::TEXT ILIKE '%" + searchStr + "%' OR (COALESCE(february_spent,0.00) + COALESCE(march_spent,0.00) + " + 
                "COALESCE(april_spent,0.00) + COALESCE(may_spent,0.00) + COALESCE(june_spent,0.00) + COALESCE(july_spent,0.00) + " + 
                "COALESCE(august_spent,0.00) + COALESCE(september_spent,0.00) + COALESCE(october_spent,0.00) + COALESCE(november_spent,0.00) + " + 
                "COALESCE(december_spent,0.00), 0.00)::TEXT ILIKE '%" + searchStr + "%' "
  } else searchStr = "";

  let extra_search = JSON.parse(req.body.extra_search);
  let extra_search_str = "";

  if (extra_search["s_bookkeeper_arr"]) {
    extra_search_str = extra_search_str + " AND bookkeeper_name = ANY(ARRAY['" + extra_search["s_bookkeeper_arr"][0] + "'";
    for (let i = 1; i < extra_search["s_bookkeeper_arr"].length; i++) {
      extra_search_str = extra_search_str + ", '" + extra_search["s_bookkeeper_arr"][i] + "'";
    }
    extra_search_str = extra_search_str + "])";
  }

  if (extra_search["s_deleted_val"]) {
    if (extra_search["s_deleted_val"] != 'show_all') {
      extra_search_str = extra_search_str + " AND deleted = " + extra_search["s_deleted_val"];
    }
  }

  if (extra_search["s_task_arr"]) {
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
    extra_search_str = extra_search_str + " AND task_type = ANY(ARRAY['" + task_list[extra_search["s_task_arr"][0]] + "'";
    for (let i = 1; i < extra_search["s_task_arr"].length; i++) {
      extra_search_str = extra_search_str + ", '" + task_list[extra_search["s_task_arr"][i]] + "'";
    }
    extra_search_str = extra_search_str + "])";
  }

  if (extra_search["s_period_arr"]) {

    extra_search_str = extra_search_str + " AND period = ANY(ARRAY['" + extra_search["s_period_arr"][0] + "'";
    for (let i = 1; i < extra_search["s_period_arr"].length; i++) {
      extra_search_str = extra_search_str + ", '" + extra_search["s_period_arr"][i] + "'";
    }
    extra_search_str = extra_search_str + "])";
  }

  if (extra_search["s_note_val"]) {
    if (extra_search["s_note_val"] != 'show_all') {
      extra_search_str = extra_search_str + " AND note IS " + extra_search["s_note_val"];
    }
  }
  if (extra_search["s_start_date_val"]) {
    extra_search_str = extra_search_str + " AND '" + extra_search["s_start_date_val"] + "'::DATE " + "<= reg_date::DATE";
  }

  if (extra_search["s_end_date_val"]) {
    extra_search_str = extra_search_str + " AND '" + extra_search["s_end_date_val"] + "'::DATE " + ">= reg_date::DATE";
  }

  if (extra_search_str != "") {
    extra_search_str = extra_search_str.substring(4, extra_search_str.length);
    extra_search_str = "WHERE (" + extra_search_str + ") ";
  }

  // change based on Search//
  let query_search_count = "SELECT COUNT(*) FROM task_manager.time_entries " + extra_search_str + searchStr;
  
  // add offset and limit//
  let query_str = "SELECT customer_id, email_address, company_name, bookkeeper_name, task_type, period, delivery_year, deleted, note, " + 
                  "COALESCE(COALESCE(january_spent,0.00) + COALESCE(february_spent,0.00) + COALESCE(march_spent,0.00) + " + 
                  "COALESCE(april_spent,0.00) + COALESCE(may_spent,0.00) + COALESCE(june_spent,0.00) + COALESCE(july_spent,0.00) + COALESCE(august_spent,0.00) + " +
                  "COALESCE(september_spent,0.00) + COALESCE(october_spent,0.00) + COALESCE(november_spent,0.00) + COALESCE(december_spent,0.00)" +
                  ", 0.00) as time_spent, id, january_spent, february_spent, march_spent, april_spent, may_spent, june_spent, " + 
                  "july_spent, august_spent, september_spent, october_spent, november_spent, december_spent " +
                  "FROM task_manager.time_entries " + searchStr + extra_search_str + order_by;

  if (req.body.length != -1)
    query_str = query_str + " LIMIT " + req.body.length + " OFFSET " + req.body.start;

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
          if (result.rows[i].january_spent != null) result.rows[i].sel_month = 'January';
          else if (result.rows[i].february_spent != null) result.rows[i].sel_month = 'February';
          else if (result.rows[i].march_spent != null) result.rows[i].sel_month = 'March';
          else if (result.rows[i].april_spent != null) result.rows[i].sel_month = 'April';
          else if (result.rows[i].may_spent != null) result.rows[i].sel_month = 'May';
          else if (result.rows[i].june_spent != null) result.rows[i].sel_month = 'June';
          else if (result.rows[i].july_spent != null) result.rows[i].sel_month = 'July';
          else if (result.rows[i].august_spent != null) result.rows[i].sel_month = 'August';
          else if (result.rows[i].september_spent != null) result.rows[i].sel_month = 'September';
          else if (result.rows[i].october_spent != null) result.rows[i].sel_month = 'October';
          else if (result.rows[i].november_spent != null) result.rows[i].sel_month = 'November';
          else if (result.rows[i].december_spent != null) result.rows[i].sel_month = 'December';
        }
        var data = JSON.stringify({
          "draw": req.body.draw,
          "recordsFiltered": recordsFiltered,
          "recordsTotal": recordsTotal,
          "data": result.rows
        });
        res.send(data);
      });
    });
  });

};

exports.findBookkeeperNames = (req, res) => {
    
  let query_str = "SELECT TRIM(CONCAT(first_name, ' ', last_name)) AS bookkeeper_name, price_per_hour FROM task_manager.freelancers" + 
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

/////////////////////////////////deleted///////////////////////////

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
  
    // let task_list = {
    //   "1": "Almindelig kontering",
    //   "2": "Årsafslutningspakke - Selskaber 1. År",
    //   "3": "Årsafslutningspakke - Selskaber eksisterende kunde",
    //   "4": "Årsafslutningspakke - Enkeltmands 1. År",
    //   "5": "Årsafslutningspakke - Enkeltmands eksisterende kunde",
    //   "6": "VSO - beregning ny kunde",
    //   "7": "VSO - beregning eksisterende kunde",
    //   "8": "Samtale/Rådgivning af kunde",
    //   "9": "Intern kommunikation og møder",
    //   "10": "Primo ny kunde",
    //   "11": "Primo eksisterende",
    //   "12": "kundeCatchup/kontering"
    // }

    let query_str = "UPDATE task_manager.time_entries SET ";
    if (req.body.task_type)
      query_str = query_str + "task_type='" + req.body.task_type + "', ";
    if (req.body.period)
      query_str = query_str + "period='" + req.body.period + "', ";
    if (req.body.delivery_year)
      query_str = query_str + "delivery_year=" + req.body.delivery_year + ", ";
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
                req.body.task_type + "', '" + req.body.today + "'::timestamp); ";
    }
    if (req.body.delivery_year) {
      query_str = query_str + "INSERT INTO task_manager.time_audit_log (customer_id, company_name, bookkeeper_name, email_address, delivery_year, sel_month, chg_column, old_value, new_value, change_date) VALUES (" + 
                old_data.customer_id + ", '" + old_data.company_name + "', '" + old_data.bookkeeper_name + "', '" +
                old_data.email_address + "', " + old_data.delivery_year + ", '" + req.body.month + "', " + "'Delivery Year', '" + old_data.delivery_year + "', '" +
                req.body.delivery_year + "', '" + req.body.today + "'::timestamp); ";
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
  
  if (!req.body.sel_year) {
      console.log("Oops!");
      res.redirect("/");
      return;
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
                  "extract(year from reg_date) = '" + req.body.sel_year + "';";
                      
  client.query(query_str, function(err, result) {
    if (err) {
        console.log(err);
        res.status(400).send(err);
    }

    res.send({ data: result.rows });
  });
};
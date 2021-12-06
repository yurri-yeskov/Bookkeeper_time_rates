const dbConfig = require("../config/db.config");
const linkConfig = require("../config/links.config");
const auth = require("../controller/auth.controller");
const { Client } = require("pg");

const client = new Client({
  user: dbConfig.USER,
  host: dbConfig.HOST,
  database: dbConfig.DB_NAME,
  password: dbConfig.PASSWORD,
  port: dbConfig.DB_PORT,
});

// For dev
// const client = new Client({
//     user: "z_new_user",
//     host: "replica-of-live2.cas2tln5cone.us-east-1.rds.amazonaws.com",
//     database: "dama86dd4g3vj6",
//     password: "MJ4MXjmK4TSK",
//     port: 5732
// });

client.connect();
const admin_emails = auth.adminEmails();

exports.findProductProfiles = (req, res) => { // Select All product info - id, use_a, name, note
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
  client.query(acl_query_str, function (err, result) {
    if (result.rows.length > 0) {
      for (let i = 0; i < result.rows.length; i++) {
        acl_array[i] = result.rows[i].interface_name;
      }
    }

    let query_str =
      "SELECT task_manager.product_profiles.id, use_a, product_profile_nid, task_manager.product_profiles.note " +
      "FROM task_manager.product_profiles ORDER BY product_profile_nid";

    client.query(query_str, function (err, result) {
      if (err) {
        console.log(err);
        res.status(400).send(err);
      }
      let new_arr = [];
      let next_index = "P1";
      if (result.rows.length > 0) {
        new_arr = result.rows;
        new_arr.sort(stringNumberSort);

        let getPart = new_arr[new_arr.length - 1].product_profile_nid.replace(/[^\d.]/g, "");
        var num = parseInt(getPart);
        var newVal = num + 1;
        next_index = "P" + newVal;
      }
      let this_year = new Date();
      this_year = this_year.getFullYear();
      res.render("time-calculation", {
        page: "Product Time Calculation",
        menuId: "time-calculation",
        data: new_arr,
        next_index: next_index,
        this_year: this_year,
        other_link: linkConfig.OTHER_LINK,
        my_email: my_email,
        acl_level: acl_level,
        acl_array: acl_array,
        user_token: req.body.user_token,
      });
    });
  });
};

exports.findCustomer = (req, res) => { // Select a specified customer_id info
  if (!req.body) {
    return res.status(400).send({
      message: "Data to select can not be empty!",
    });
  }

  let query_str =
    "SELECT service_from, service_until, receipts_paid_for, vat_period, reporting_period, package, public.customers.id, " +
    "public.customers.company_type, public.customers.name FROM public.customers " +
    "JOIN public.customer_payments ON public.customers.id = public.customer_payments.customer_id " +
    "WHERE public.customers.id = " + req.body.customer_id + " AND public.customers.potential_customer = TRUE " +
    "ORDER BY public.customer_payments.service_from ";

  client.query(query_str, function (err, result) {
    if (err) {
      console.log(err);
      res.status(400).send(err);
    }

    let new_arr = [];
    let new_customer = false;
    for (let i = 0; i < result.rows.length; i++) {
      let min_year = result.rows[i].service_from.getFullYear();
      let max_year = result.rows[i].service_until.getFullYear();

      if (i == 0 && min_year == req.body.sel_year) new_customer = true;

      if (min_year <= req.body.sel_year && req.body.sel_year <= max_year)
        new_arr[new_arr.length] = result.rows[i];
    }
    res.send({ data: new_arr, new_customer: new_customer });
  });
};

exports.calculationTime = (req, res) => { // calculcate Time for a special customer
  let query_str =
    "SELECT task_manager.product_profiles.id, product_profile_nid, task_manager.time_elements.element_id, element_value, " +
    "new_customer, package_id, company_type FROM task_manager.product_profiles " +
    "JOIN task_manager.product_profile_package ON task_manager.product_profile_package.product_profile_id = task_manager.product_profiles.id " +
    "JOIN task_manager.product_profile_company_type ON " +
    "task_manager.product_profile_company_type.product_profile_id = task_manager.product_profiles.id " +
    "JOIN task_manager.product_profile_time_element ON " +
    "task_manager.product_profile_time_element.product_profile_id = task_manager.product_profiles.id " +
    "JOIN task_manager.time_elements ON task_manager.time_elements.id = task_manager.product_profile_time_element.element_id " +
    "WHERE ";
  let customer_info_arr = JSON.parse(req.body.customer_info);
  query_str = 
    query_str + "(package_id='" + customer_info_arr[0].package +
    "' AND company_type='" + customer_info_arr[0].company_type + 
    "' AND new_customer=" + req.body.new_customer + ") ";

  for (let i = 1; i < customer_info_arr.length; i++) {
    query_str =
      query_str + "OR " + "(package_id='" + customer_info_arr[i].package + "' AND company_type='" + 
      customer_info_arr[i].company_type + "' AND new_customer=" + req.body.new_customer + ") ";
  }

  query_str = query_str + "ORDER BY task_manager.product_profiles.id;";

  client.query(query_str, function (err, result) {
    if (err) {
      console.log(err);
      res.status(400).send(err);
    }

    if (result.rows.length <= 0) {
      res.send({ calc_val: 0, product_profile_nid: "NONEE" }); // No product profile matched
      return;
    }

    let calculation_val = 0;
    let product_profile_nid_arr = [];

    for (let i = 0; i < result.rows.length; i++) {
      let n_receipts_paid_for, n_reporting_period, n_vat_period;
      product_profile_nid_arr[product_profile_nid_arr.length] =
        result.rows[i].product_profile_nid;
      for (let j = customer_info_arr.length - 1; j >= 0; j--) {
        if (result.rows[i].package_id == customer_info_arr[j].package && 
            result.rows[i].company_type == customer_info_arr[j].company_type) {
            
          n_receipts_paid_for = customer_info_arr[j].receipts_paid_for;
          if (n_receipts_paid_for == null) n_receipts_paid_for = 0;
          n_reporting_period = customer_info_arr[j].reporting_period;
          n_vat_period = customer_info_arr[j].vat_period;
          break;
        }
      }

      if (result.rows[i].element_id == "B")
        calculation_val += n_receipts_paid_for * result.rows[i].element_value;
      else if (result.rows[i].element_id == "E") {
        switch (n_vat_period) {
          case "quarterly":
            calculation_val += 4 * result.rows[i].element_value;
            break;
          case "half-year":
            calculation_val += 2 * result.rows[i].element_value;
            break;
          default:
            calculation_val += 0 * result.rows[i].element_value;
        }
      } else if (result.rows[i].element_id == "F") {
        switch (n_reporting_period) {
          case "quarterly":
            calculation_val += 5 * result.rows[i].element_value;
            break;
          case "half-year":
            calculation_val += 3 * result.rows[i].element_value;
            break;
          case "yearly":
            calculation_val += 1 * result.rows[i].element_value;
            break;
          default:
            calculation_val += 0 * result.rows[i].element_value;
        }
      } else calculation_val += 1 * result.rows[i].element_value;
    }
    let n_product_profile_nid_arr = product_profile_nid_arr.filter(function (elem, index, self) {
      return index === self.indexOf(elem);
    });

    res.send({
      calc_val: calculation_val,
      product_profile_nid: n_product_profile_nid_arr,
    });
  });
};

exports.getProductProfilePackage = (req, res) => { // Select All Product and it's packages - both of ids.
  let query_str =
    "SELECT task_manager.product_profiles.id, " + "task_manager.product_profile_package.package_id " +
    "FROM task_manager.product_profiles " + "JOIN task_manager.product_profile_package ON " +
    "task_manager.product_profile_package.product_profile_id = task_manager.product_profiles.id " + 
    "ORDER BY task_manager.product_profiles.id";

  client.query(query_str, function (err, result) {
    if (err) {
      console.log(err);
      res.status(400).send(err);
    }
    res.send({ data: result.rows });
  });
};

exports.getProductProfileCompanyType = (req, res) => { // Select All Product and it's company types. - both of ids.
  let query_str =
    "SELECT task_manager.product_profiles.id," + "task_manager.product_profile_company_type.company_type " +
    "FROM task_manager.product_profiles " + "JOIN task_manager.product_profile_company_type ON " +
    "task_manager.product_profile_company_type.product_profile_id = task_manager.product_profiles.id " + 
    "ORDER BY task_manager.product_profiles.id";

  client.query(query_str, function (err, result) {
    if (err) {
      console.log(err);
      res.status(400).send(err);
    }
    res.send({ data: result.rows });
  });
};

exports.getProductProfileTimeElement = (req, res) => {
  let query_str =
    "SELECT task_manager.product_profiles.id, use_a, task_manager.time_elements.id AS ele_id, " +
    "task_manager.time_elements.element_id, new_customer, task_manager.time_elements.element_name " +
    "FROM task_manager.product_profiles " + "JOIN task_manager.product_profile_time_element ON " +
    "task_manager.product_profiles.id = task_manager.product_profile_time_element.product_profile_id " +
    "JOIN task_manager.time_elements ON " +
    "task_manager.product_profile_time_element.element_id = task_manager.time_elements.id " + 
    "ORDER BY task_manager.product_profiles.id;";

  client.query(query_str, function (err, result) {
    if (err) {
      console.log(err);
      res.status(400).send(err);
    }
    result.rows = sortMyArray(result.rows);
    res.send({ data: result.rows });
  });
};

exports.findTimeElememts = (req, res) => {
  let query_str = "SELECT * FROM task_manager.time_elements WHERE element_id <> 'A' ORDER BY element_id;";
  client.query(query_str, function (err, result) {
    if (err) {
      console.log(err);
      res.status(400).send(err);
    }
    result.rows = sortMyArray(result.rows);
    res.send({ data: result.rows });
  });
};

exports.findPackages = (req, res) => {
  let query_str = "SELECT id, short_name FROM public.products WHERE short_name IS NOT NULL ORDER BY short_name;";
  client.query(query_str, function (err, result) {
    if (err) {
      console.log(err);
      res.status(400).send(err);
    }
    res.send({ data: result.rows });
  });
};

exports.findCompanyTypes = (req, res) => {
  let query_str = "SELECT enum_range(NULL::public.company_type_enum);";
  client.query(query_str, function (err, result) {
    if (err) {
      console.log(err);
      res.status(400).send(err);
    }
    res.send({ data: result.rows });
  });
};

exports.addProductProfile = (req, res) => {
  if (!req.body) {
    return res.status(400).send({
      message: "Data to add can not be empty!",
    });
  }

  let query_str =
    "INSERT INTO task_manager.product_profiles (product_profile_nid, use_a, note) VALUES ($1, $2, $3) RETURNING *; ";

  client.query( query_str, [req.body.product_profile_id, req.body.use_a, req.body.product_note], function (err, result) {
    if (err) {
      console.log(err);
      res.status(400).send(err);
    }
    res.send({
      message: "It was added successfully.",
      product_profile: result.rows[0],
    });
  });
};

exports.updateProductProfile = (req, res) => {
  if (!req.body) {
    return res.status(400).send({
      message: "Data to update can not be empty!",
    });
  }

  let query_str =
    "UPDATE task_manager.product_profiles SET use_a=" + req.body.use_a + ", note='" +
    req.body.product_note + "' WHERE product_profile_nid='" + req.body.product_profile_id + "' RETURNING *;";
  client.query(query_str, function (err, result) {
    if (err) {
      console.log(err);
      res.status(400).send(err);
    }
    res.send({
      message: "It was updated successfully.",
      product_profile: result.rows[0],
    });
  });
};

exports.addProductProfilePackage = (req, res) => {
  if (!req.body) {
    return res.status(400).send({
      message: "Data to add can not be empty!",
    });
  }

  let package_id_arr = JSON.parse(req.body.package_ids);
  let query_str =
    "INSERT INTO task_manager.product_profile_package (product_profile_id, package_id) VALUES ";
  query_str += "(" + req.body.product_profile_id + ",'" + package_id_arr[0] + "')";

  for (let i = 1; i < package_id_arr.length; i++) {
    query_str += ",(" + req.body.product_profile_id + ",'" + package_id_arr[i] + "')";
  }

  client.query(query_str, function (err, result) {
    if (err) {
      console.log(err);
      res.status(400).send(err);
    }
    res.send({ message: "It was added successfully." });
  });
};

exports.updateProductProfilePackage = (req, res) => {
  if (!req.body) {
    return res.status(400).send({
      message: "Data to update can not be empty!",
    });
  }

  let package_id_arr = JSON.parse(req.body.package_ids);
  let query_str =
    "DELETE FROM task_manager.product_profile_package WHERE product_profile_id=" +
    req.body.product_profile_id + ";" +
    "INSERT INTO task_manager.product_profile_package (product_profile_id, package_id) VALUES ";
  query_str += "(" + req.body.product_profile_id + ",'" + package_id_arr[0] + "')";

  for (let i = 1; i < package_id_arr.length; i++) {
    query_str += ",(" + req.body.product_profile_id + ",'" + package_id_arr[i] + "')";
  }

  client.query(query_str, function (err, result) {
    if (err) {
      console.log(err);
      res.status(400).send(err);
    }
    res.send({ message: "It was updated successfully." });
  });
};

exports.addProductProfileCompanyType = (req, res) => {
  if (!req.body) {
    return res.status(400).send({
      message: "Data to add can not be empty!",
    });
  }

  let company_type_arr = JSON.parse(req.body.company_types);
  let query_str =
    "INSERT INTO task_manager.product_profile_company_type (product_profile_id, company_type) VALUES ";
  query_str += "(" + req.body.product_profile_id + ",'" + company_type_arr[0] + "')";

  for (let i = 1; i < company_type_arr.length; i++) {
    query_str += ",(" + req.body.product_profile_id + ",'" + company_type_arr[i] + "')";
  }

  client.query(query_str, function (err, result) {
    if (err) {
      console.log(err);
      res.status(400).send(err);
    }
    res.send({ message: "It was added successfully." });
  });
};

exports.updateProductProfileCompanyType = (req, res) => {
  if (!req.body) {
    return res.status(400).send({
      message: "Data to update can not be empty!",
    });
  }

  let company_type_arr = JSON.parse(req.body.company_types);
  let query_str =
    "DELETE FROM task_manager.product_profile_company_type WHERE product_profile_id=" +
    req.body.product_profile_id + ";" +
    "INSERT INTO task_manager.product_profile_company_type (product_profile_id, company_type) VALUES ";
  query_str += "(" + req.body.product_profile_id + ",'" + company_type_arr[0] + "')";

  for (let i = 1; i < company_type_arr.length; i++) {
    query_str += ",(" + req.body.product_profile_id + ",'" + company_type_arr[i] + "')";
  }

  client.query(query_str, function (err, result) {
    if (err) {
      console.log(err);
      res.status(400).send(err);
    }
    res.send({ message: "It was updated successfully." });
  });
};

exports.addProductProfileTimeElement = (req, res) => {
  if (!req.body) {
    return res.status(400).send({
      message: "Data to add can not be empty!",
    });
  }

  let element_id_arr = JSON.parse(req.body.element_ids);

  let query_str =
    "INSERT INTO task_manager.product_profile_time_element (product_profile_id, element_id, new_customer) VALUES ";
  query_str += "(" + req.body.product_profile_id + "," + element_id_arr[0] +
    ",'" + req.body.new_customer + "')";

  for (let i = 1; i < element_id_arr.length; i++) {
    query_str += ",(" + req.body.product_profile_id + "," +
      element_id_arr[i] + ",'" + req.body.new_customer + "')";
  }

  client.query(query_str, function (err, result) {
    if (err) {
      console.log(err);
      res.status(400).send(query_str);
    }
    res.send({ message: "It was added successfully." });
  });
};

exports.updateProductProfileTimeElement = (req, res) => {
  if (!req.body) {
    return res.status(400).send({
      message: "Data to update can not be empty!",
    });
  }

  let element_id_arr = JSON.parse(req.body.element_ids);
  let query_str = "";
  if (req.body.new_customer == "FALSE")
    query_str = query_str +
      "DELETE FROM task_manager.product_profile_time_element WHERE product_profile_id=" +
      req.body.product_profile_id + ";";
  query_str = query_str +
    "INSERT INTO task_manager.product_profile_time_element (product_profile_id, element_id, new_customer) VALUES ";
  query_str += "(" + req.body.product_profile_id + "," +
    element_id_arr[0] + ",'" + req.body.new_customer + "')";

  for (let i = 1; i < element_id_arr.length; i++) {
    query_str += ",(" + req.body.product_profile_id + "," +
      element_id_arr[i] + ",'" + req.body.new_customer + "')";
  }

  client.query(query_str, function (err, result) {
    if (err) {
      console.log(err);
      res.status(400).send(query_str);
    }
    res.send({ message: "It was updated successfully." });
  });
};

const change_arr = {
  "A": "65", "B": "66", "C": "67", "D": "68", "E": "69", "F": "70", "G": "71", "H": "72", "I": "73", 
  "J": "74", "K": "75", "L": "76", "M": "77", "N": "78", "O": "79", "P": "80", "Q": "81", "R": "82", 
  "S": "83", "T": "84", "U": "85", "V": "86", "W": "87", "X": "88", "Y": "89", "Z": "90",
};

function sortMyArray(my_array) {
  for (let i = 0; i < my_array.length; i++) {
    let change_id = "";
    for (let j = 0; j < my_array[i].element_id.length; j++) {
      change_id = change_id + change_arr[my_array[i].element_id[j]];
    }
    my_array[i].change_id = parseInt(change_id);
  }

  my_array.sort(function (x, y) {
    let a = x.change_id,
      b = y.change_id;
    return a - b;
  });
  return my_array;
}

function stringNumberSort(x, y) {
  let a = x.product_profile_nid;
  let b = y.product_profile_nid;
  return Number(a.match(/(\d+)/g)[0]) - Number(b.match(/(\d+)/g)[0]);
}

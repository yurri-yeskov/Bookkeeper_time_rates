const dbConfig = require("../config/db.config");
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

exports.findAll = (req, res) => {
    
    client.query('SELECT * FROM task_manager.time_elements ORDER BY element_id;', function (err, result) {
      
        if (err) {
            console.log(err);
            res.status(400).send(err);
        }
        var next_index_str;
        if (result.rows.length > 0) {
            result.rows = sortMyArray(result.rows);
            var current_index_str = result.rows[result.rows.length - 1].element_id;
            next_index_str = incrementString(current_index_str);
        } else {
            next_index_str = "G";
        }
        res.render('time-elements', {page:'Time Elements', menuId:'time-elements', data: result.rows, next_index_str: next_index_str});
    });
};

exports.insert = (req, res) => {
    
    if (!req.body) {
        return res.status(400).send({
          message: "Data to update can not be empty!"
        });
    }
    if (!req.body.element_name || !req.body.element_value || !req.body.element_note || !req.body.element_id) {
        console.log("Oops!");
        res.redirect("/");
        return;
    }
    let query_str = "INSERT INTO task_manager.time_elements (element_id, element_name, element_value, note) VALUES ($1, $2, $3, $4)";
    client.query(query_str, [req.body.element_id, req.body.element_name, req.body.element_value, req.body.element_note], function(err, result) {
    if (err) {
        console.log(err);
        res.status(400).send(err);
    }
    res.send({ message: "It was updated successfully." });
    // res.redirect("/");
    });
};

exports.update = (req, res) => {
    
    if (!req.body) {
        return res.status(400).send({
          message: "Data to update can not be empty!"
        });
    }

    if (!req.body.new_ename || !req.body.new_evalue || !req.body.new_enote || !req.body.element_uid) {
        console.log("Oops!");
        res.redirect("/");
        return;
    }
    let query_str = "UPDATE task_manager.time_elements SET element_name='" + req.body.new_ename +
                                            "', element_value=" + req.body.new_evalue +
                                            ", note='" + req.body.new_enote +
                                            "' WHERE id=" + req.body.element_uid;
    client.query(query_str, function(err, result) {
    if (err) {
        console.log(err);
        res.status(400).send(err);
    }
    res.send({ message: "It was updated successfully." });
    });
};

function incrementString(value) {
  let carry = 1;
  let res = '';

  for (let i = value.length - 1; i >= 0; i--) {
    let char = value.toUpperCase().charCodeAt(i);

    char += carry;

    if (char > 90) {
      char = 65;
      carry = 1;
    } else {
      carry = 0;
    }

    res = String.fromCharCode(char) + res;

    if (!carry) {
      res = value.substring(0, i) + res;
      break;
    }
  }

  if (carry) {
    res = 'A' + res;
  }

  return res;
}

change_arr = {
  'A' : '65', 'B' : '66', 'C' : '67', 'D' : '68', 'E' : '69', 'F' : '70', 'G' : '71', 'H' : '72', 'I' : '73',
  'J' : '74', 'K' : '75', 'L' : '76', 'M' : '77', 'N' : '78', 'O' : '79', 'P' : '80', 'Q' : '81', 'R' : '82', 
  'S' : '83', 'T' : '84', 'U' : '85', 'V' : '86', 'W' : '87', 'X' : '88', 'Y' : '89', 'Z' : '90' };

  
function sortMyArray(my_array) {
  for (let i = 0; i < my_array.length; i++) {
    let change_id = '';
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
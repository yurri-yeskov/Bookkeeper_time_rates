const {Client} = require('pg');
const client = new Client ({
    user: "postgres",
    host: "localhost",
    database: "dvdrental",
    password: "~!@`12",
    port: 5732,
});

client.connect();

exports.findAll = (req, res) => {
    
    client.query('SELECT * from time_elements order by element_id;', function (err, result) {
        if (err) {
            console.log(err);
            res.status(400).send(err);
        }
        console.log(result.rows);
        var next_index_str;
        if (result.rows.length > 0) {
            var current_index_str = result.rows[result.rows.length - 1].element_id;
            next_index_str = incrementString(current_index_str);
        } else {
            next_index_str = "G";
        }
        // res.render('index', {page:'Bookkeeper hourly rates', menuId:'hourly-rates', data:result.rows});
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
    let query_str = "INSERT INTO time_elements (element_id, element_name, element_value, note) VALUES ($1, $2, $3, $4)";
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
    let query_str = "UPDATE time_elements SET element_name='" + req.body.new_ename +
                                            "', element_value=" + req.body.new_evalue +
                                            ", note='" + req.body.new_enote +
                                            "' WHERE id=" + req.body.element_uid;
    // console.log(query_str);
    client.query(query_str, function(err, result) {
    if (err) {
        console.log(err);
        res.status(400).send(err);
    }
    res.send({ message: "It was updated successfully." });
    // res.redirect("/");
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
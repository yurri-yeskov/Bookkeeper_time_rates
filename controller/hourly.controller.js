const dbConfig = require("../config/db.config");
const {Client} = require('pg');

const client = new Client ({
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

exports.findAll = (req, res) => { // Select all bookkeeper info - id, name, hourly, note
    
    let query_str = 
        "SELECT task_manager.freelancers.id, worker_initials, price_per_hour, notes FROM task_manager.freelancers " + 
        "LEFT JOIN task_manager.freelancer_roles ON task_manager.freelancers.worker_initials = task_manager.freelancer_roles.freelancer_short_name " + 
        "WHERE task_manager.freelancer_roles.role_name = 'bookkeeper';"
        
    client.query(query_str, function (err, result) {
        if (err) {
            console.log(err);
            res.status(400).send(err);
        }
        res.render('index', {page:'Bookkeeper hourly rates', menuId:'hourly-rates', data:result.rows});
    });
};

exports.update = (req, res) => { // Update bookkeeper's hourly and note
    if (!req.body) {
        return res.status(400).send({
          message: "Data to update can not be empty!"
        });
    }

    if (!req.body.new_hourly || !req.body.new_note) {
        console.log("Oops!");
        res.redirect("/");
        return;
    }

    let query_str = 
        "UPDATE task_manager.freelancers SET price_per_hour=" + req.body.new_hourly + ", notes='" + req.body.new_note + 
        "' WHERE id=" + req.body.bookkeeper_id + ";";
    client.query(query_str, function(err, result) {
    if (err) {
        console.log(err);
        res.status(400).send(err);
    }
    res.send({ message: "It was updated successfully." });
    });

    return;
};

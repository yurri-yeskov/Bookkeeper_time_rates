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
    
    //LIMIT 4 OFFSET 3
    client.query('SELECT actor_id, first_name, hourly, note from actor left join hourly_rates on hourly_rates.bookkeeper_id = actor.actor_id order by actor_id;', function (err, result) {
        if (err) {
            console.log(err);
            res.status(400).send(err);
        }
        // console.log(result.rows);
        res.render('index', {page:'Bookkeeper hourly rates', menuId:'hourly-rates', data:result.rows});
    });
};

exports.update = (req, res) => {
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

    let query_str = "UPDATE hourly_rates SET hourly=" + req.body.new_hourly + ", note='" + req.body.new_note + "' where bookkeeper_id=" + req.body.bookkeeper_id + "; " +
                    "INSERT INTO hourly_rates (bookkeeper_id, hourly, note)" +
                    " SELECT " + req.body.bookkeeper_id + ", " + req.body.new_hourly + ", '" + req.body.new_note + 
                    "' WHERE NOT EXISTS (SELECT * FROM hourly_rates WHERE bookkeeper_id=" + req.body.bookkeeper_id + ");";
    console.log(query_str)
    client.query(query_str, function(err, result) {
    if (err) {
        console.log(err);
        res.status(400).send(err);
    }
    res.send({ message: "It was updated successfully." });
    // res.redirect("/");
    });

    return;
};

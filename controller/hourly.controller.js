const dbConfig = require("../config/db.config");
const linkConfig = require("../config/links.config");
const jwt = require("jsonwebtoken");
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

    let admin_emails = ['tk@ebogholderen.dk', 'tr@ebogholderen.dk', 'thra@c.dk', 'yurii@gmail.com'];

    if (!req.body.user_token) {
        console.log("Oops!");
        res.redirect(linkConfig.OTHER_LINK);
        return;
    }

    // const new_token = jwt.sign(
    //     { user_id: "123", email: "email@mail.com" },
    //     "123456",
    //     {
    //       expiresIn: "30s",
    //     }
    // );

    // const new_decoded = jwt.verify(new_token, "123456");
    // console.log(new_decoded);

    const token_expiration = linkConfig.TOKEN_EXPIRATION;
    const token_expiration = 30000;

    const t_key = req.body.user_token.substring(0, 4);
    const t_token = req.body.user_token.substring(4);
    const decoded = jwt.verify(t_token, t_key);
    console.log("///////////////////////", decoded);
    const now = new Date();
    const token_timestamp = new Date(decoded.timestamp * 1000);
    if (now - token_timestamp > token_expiration) {
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
    
            let query_str = 
                "SELECT task_manager.freelancers.id, worker_initials, price_per_hour, notes FROM task_manager.freelancers " + 
                "LEFT JOIN task_manager.freelancer_roles ON task_manager.freelancers.worker_initials = task_manager.freelancer_roles.freelancer_short_name " + 
                "WHERE task_manager.freelancer_roles.role_name = 'bookkeeper';"
                
            client.query(query_str, function (err, result) {
                if (err) {
                    console.log(err);
                    res.status(400).send(err);
                }
                res.render('index', {
                    page:' Bookkeeper hourly rates', 
                    this_year: this_year,
                    other_link:linkConfig.OTHER_LINK, 
                    menuId:'hourly-rates', 
                    data:result.rows,
                    my_email: my_email,
                    acl_level: acl_level,
                    acl_array: acl_array,
                    user_token: req.body.user_token
                });
            });
            return;
        });
        return;

        
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

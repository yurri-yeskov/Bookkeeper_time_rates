const dbConfig = require("../config/db.config");
const { Client } = require("pg");

const client = new Client({
  user: dbConfig.USER,
  host: dbConfig.HOST,
  database: dbConfig.DB_NAME,
  password: dbConfig.PASSWORD,
  port: dbConfig.DB_PORT,
});

// const client = new Client({
//     user: "z_new_user",
//     host: "replica-of-live2.cas2tln5cone.us-east-1.rds.amazonaws.com",
//     database: "dama86dd4g3vj6",
//     password: "MJ4MXjmK4TSK",
//     port: 5732
// });

// const client = new Client({
//     user: "yurii",
//     host: "test-replica-yurii.cas2tln5cone.us-east-1.rds.amazonaws.com",
//     database: "dama86dd4g3vj6",
//     password: "MJ4MXjmK4TSK",
//     port: 5732
// });

// client.connect();

const createTable = async (query) => {
  try {
    await client.connect(); // gets connection
    await client.query(query); // sends queries
    return true;
  } catch (error) {
    console.error(error.stack);
    return false;
  } finally {
    await client.end(); // closes connection
  }
};

const query_str = "CREATE TABLE IF NOT EXISTS task_manager.time_elements (id SERIAL, element_id VARCHAR(4) NOT NULL, element_name VARCHAR(100) NOT NULL, element_value FLOAT(4), note TEXT, PRIMARY KEY (id)); " +
                    "INSERT INTO task_manager.time_elements (element_id, element_name, note) " + 
                    "SELECT 'A', 'new_customer', 'Is this the first year, then new_customer is true' " +
                    "WHERE NOT EXISTS(SELECT 1 FROM task_manager.time_elements WHERE element_id='A'); " +

                    "INSERT INTO task_manager.time_elements (element_id, element_name, element_value, note) " +
                    "SELECT 'B', 'receipt_bookkeeping', 0.24, 'Receipts paid for in accounting year' " +
                    "WHERE NOT EXISTS(SELECT 1 FROM task_manager.time_elements WHERE element_id='B'); " +

                    "INSERT INTO task_manager.time_elements (element_id, element_name, element_value, note) " +
                    "SELECT 'E', 'vat_deliveries_send_customer', 10, 'Time needed to send the bookkeeping and the receipts to the customers through the ticket systems' " +
                    "WHERE NOT EXISTS(SELECT 1 FROM task_manager.time_elements WHERE element_id='E'); " +

                    "INSERT INTO task_manager.time_elements (element_id, element_name, element_value, note) " +
                    "SELECT 'F', 'vat_reporting_erst', 10, 'Reporting time of VAT in SKAT and downloading vat_receipts to the customer' " +
                    "WHERE NOT EXISTS(SELECT 1 FROM task_manager.time_elements WHERE element_id='F'); " +

                  "CREATE TABLE IF NOT EXISTS task_manager.product_profiles (id SERIAL, product_profile_nid VARCHAR(4) NOT NULL, use_a BOOLEAN DEFAULT FALSE, note TEXT, PRIMARY KEY (id)); " +
                  "CREATE TABLE IF NOT EXISTS task_manager.product_profile_package (id SERIAL, product_profile_id INTEGER REFERENCES task_manager.product_profiles (id) NOT NULL, package_id VARCHAR(100), PRIMARY KEY (id)); " +
                  "CREATE TABLE IF NOT EXISTS task_manager.product_profile_company_type (id SERIAL, product_profile_id INTEGER REFERENCES task_manager.product_profiles (id) NOT NULL, company_type VARCHAR(100), PRIMARY KEY (id)); " +
                  "CREATE TABLE IF NOT EXISTS task_manager.product_profile_time_element (id SERIAL, product_profile_id INTEGER REFERENCES task_manager.product_profiles (id) NOT NULL, element_id INTEGER REFERENCES task_manager.time_elements (id) NOT NULL, new_customer BOOLEAN NOT NULL, PRIMARY KEY (id)); " +
                  "CREATE TABLE IF NOT EXISTS task_manager.time_entries (id SERIAL, customer_id INTEGER REFERENCES public.customers (id) NOT NULL, company_name VARCHAR(255), bookkeeper_name VARCHAR(255), reporter_name VARCHAR(255), email_address VARCHAR(255), task_type VARCHAR(255), period VARCHAR(20), " + 
                    "january_spent NUMERIC(20, 2), " + "february_spent NUMERIC(20, 2), " + "march_spent NUMERIC(20, 2), " + "april_spent NUMERIC(20, 2), " + "may_spent NUMERIC(20, 2), " + "june_spent NUMERIC(20, 2), " + 
                    "july_spent NUMERIC(20, 2), " + "august_spent NUMERIC(20, 2), " + "september_spent NUMERIC(20, 2), " + "october_spent NUMERIC(20, 2), " + "november_spent NUMERIC(20, 2), " + "december_spent NUMERIC(20, 2), " +
                    "delivery_year INTEGER, reg_date timestamp without time zone, note TEXT, deleted BOOLEAN NOT NULL DEFAULT FALSE, PRIMARY KEY (id)); " +
                  "CREATE TABLE IF NOT EXISTS task_manager.time_audit_log (id SERIAL, customer_id INTEGER REFERENCES public.customers (id) NOT NULL, company_name VARCHAR(255), bookkeeper_name VARCHAR(255), reporter_name VARCHAR(255), email_address VARCHAR(255), " +
                    "delivery_year INTEGER, sel_month VARCHAR(50), chg_column VARCHAR(255), old_value VARCHAR(255), new_value VARCHAR(255), change_date timestamp without time zone, PRIMARY KEY (id)); ";
                  // "ALTER TABLE task_manager.time_entries " +  
                  // "ADD COLUMN reporter_name VARCHAR(255);" + 
                  // "ALTER TABLE task_manager.time_audit_log " +  
                  // "ADD COLUMN reporter_name VARCHAR(255);";
                  // "CREATE TABLE IF NOT EXISTS interfaces.user_tokens (id SERIAL, user_email VARCHAR(255) NOT NULL, user_token VARCHAR(255) NOT NULL, PRIMARY KEY (id)); "

createTable(query_str).then(result => {
  if (result) {
    console.log('Tables created');
  }
});

module.exports = client;

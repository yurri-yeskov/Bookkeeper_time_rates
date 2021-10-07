const dbConfig = require("../config/db.config");
const linkConfig = require("../config/links.config");
const {Client} = require('pg');
const ocrSpace = require('ocr-space-api-wrapper');
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

// const OCR_API_KEY = '8163d9aa9b88957';
const OCR_API_KEY = linkConfig.OCR_API_KEY;

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

  console.log("//////////////////////////////////START//////////////////////////////////");
  if (!req.body.image_path) {
    console.log("Oops!");
    res.redirect(linkConfig.OTHER_LINK);
    return;     
  }
  
  ocrFunc(req.body.image_path, req.body.date_str, req.body.amount_str, req.body.word_str, res);
}

const ocrFunc = async (image_path, date_str, amount_str, word_str, res) => {
  try {
    let date_format_arr = ['YYYYMMDD',   'YYYYDDMM',   'DDYYYYMM',   'MMYYYYDD',   'MMDDYYYY',   'DDMMYYYY',
                           'YYMMDD',     'YYDDMM',     'DDYYMM',     'MMYYDD',     'MMDDYY',     'DDMMYY',
                           'YYYYMMMDD',  'YYYYDDMMM',  'DDYYYYMMM',  'MMMYYYYDD',  'MMMDDYYYY',  'DDMMMYYYY',
                           'YYMMMDD',    'YYDDMMM',    'DDYYMMM',    'MMMYYDD',    'MMMDDYY',    'DDMMMYY',
                           'YYYYMMMMDD', 'YYYYDDMMMM', 'DDYYYYMMMM', 'MMMMYYYYDD', 'MMMMDDYYYY', 'DDMMMMYYYY',
                           'YYMMMMDD',   'YYDDMMMM',   'DDYYMMMM',   'MMMMYYDD',   'MMMMDDYY',   'DDMMMMYY'];
    let pos_date_arr = [];
    for (let i = 0; i < date_format_arr.length; i++) {
      pos_date_arr[pos_date_arr.length] = moment(date_str, 'YYYY-MM-DD').format(date_format_arr[i]);
    }
    console.log(pos_date_arr, "////////////////////////////////////////////");
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
    console.log("//////////////////////////////////END//////////////////////////////////");
    console.log(result);
    let parse_result = result.ParsedResults;
    let limit_rate = 0.6;
    let words_index = 0;
    let amount_index_arr = []; let str_index_arr = [];
    let lowercase_word_str = word_str.toLowerCase().replace(/\s+/g, '');
    for (let i = 0; i < parse_result.length; i++) {
      let lines = parse_result[i].TextOverlay.Lines;
      for (let j = 0; j < lines.length; j++) {
        let words = lines[j].Words;
        let delta = 0; let delta_count = 0; let match_count = 0;
        let w_delta_count = 0;
        let lowercase_word_text = ""; 
        for (let k = 0; k < words.length; k++) {
          let word_text = words[k].WordText;

          ////////////////////////////////Amount START/////////////////////////////////////
          let format = /[,.]/; let ch_amount_str = amount_str;
          if (!format.test(ch_amount_str) && ch_amount_str.length > 0) ch_amount_str = ch_amount_str + "00";
          let num_word_text = word_text.replace(/[^0-9]/g,'');
          let num_amount_str = ch_amount_str.replace(/[^0-9]/g,'');

          for (let ii = 0; ii < num_word_text.length; ii++) 
            if (num_word_text.substring(ii, ii+1) == num_amount_str.substring(delta+ii, delta+ii+1)) match_count++;
          
          if (num_word_text.length > 0) {
            
            let match_rate = 0;
            if (num_amount_str.length > 0) {
              match_rate = match_count / num_amount_str.length;
              if (match_rate > limit_rate) {
                console.log("Amount word_text_______________________", word_text, num_word_text, num_amount_str);
                console.log("Amount Rate____________________________", match_count, match_rate, delta_count, delta);
                for (let idx = delta_count; idx >= 0; idx--) {
                  amount_index_arr[amount_index_arr.length] = words_index - idx;
                }
              }
            }
          }

          if (num_word_text.length + delta < num_amount_str.length && num_word_text.length > 0) {
            delta = num_word_text.length + delta;
            delta_count++;
          }
          else {
            match_count = 0;
            delta = 0;
            delta_count = 0;
          }
          ////////////////////////////////Amount END/////////////////////////////////////////
          
          ////////////////////////////////WordString START///////////////////////////////////
          lowercase_word_text = lowercase_word_text + word_text.toLowerCase().replace(/\s+/g, '');
          if (lowercase_word_text.length >= lowercase_word_str.length) {
            let match_rate = similarity(lowercase_word_text, lowercase_word_str);
            if (match_rate > limit_rate) {
              console.log("STR word_text_______________________", word_text, lowercase_word_text, lowercase_word_str);
              console.log("STR Rate____________________________", match_rate, w_delta_count);
              for (let idx = w_delta_count; idx >= 0; idx--) {
                str_index_arr[str_index_arr.length] = words_index - idx;
              }         
            }
            lowercase_word_text = "";
          } else w_delta_count++;
          ////////////////////////////////WordString END/////////////////////////////////////
          
          words_index++;
        }
      }
    }
    console.log("amount_index_arr----------------------------", amount_index_arr);
    console.log("str_index_arr-------------------------------", str_index_arr);
    res.send({ data: result.ParsedResults, amount_indexes: amount_index_arr, str_indexes: str_index_arr });
  } catch (error) {
    console.log(error);
    res.status(400).send(error);
  }
}

function similarity(s1, s2) {
  var longer = s1;
  var shorter = s2;
  if (s1.length < s2.length) {
    longer = s2;
    shorter = s1;
  }
  var longerLength = longer.length;
  if (longerLength == 0) {
    return 1.0;
  }
  return (longerLength - editDistance(longer, shorter)) / parseFloat(longerLength);
}

function editDistance(s1, s2) {
  s1 = s1.toLowerCase();
  s2 = s2.toLowerCase();

  var costs = new Array();
  for (var i = 0; i <= s1.length; i++) {
    var lastValue = i;
    for (var j = 0; j <= s2.length; j++) {
      if (i == 0)
        costs[j] = j;
      else {
        if (j > 0) {
          var newValue = costs[j - 1];
          if (s1.charAt(i - 1) != s2.charAt(j - 1))
            newValue = Math.min(Math.min(newValue, lastValue),
              costs[j]) + 1;
          costs[j - 1] = lastValue;
          lastValue = newValue;
        }
      }
    }
    if (i > 0)
      costs[s2.length] = lastValue;
  }
  return costs[s2.length];
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
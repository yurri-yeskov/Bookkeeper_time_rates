const dbConfig = require("../config/db.config");
const linkConfig = require("../config/links.config");
const auth = require("../controller/auth.controller");
const moment = require("moment");
const { Client } = require("pg");

const client = new Client({
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
    res.render("report-overview", {
      page: "Time Entry Overview",
      menuId: "report-overview",
      this_year: this_year,
      month_index: month_index,
      month_list: month_list,
      other_link: linkConfig.OTHER_LINK,
      my_email: my_email,
      acl_level: acl_level,
      acl_array: acl_array,
      user_token: req.body.user_token,
    });
  });
};

exports.findAllTimeEntry = (req, res) => {
  if (!req.body) {
    console.log("Oops!");
    res.redirect("/");
    return;
  }
/*let test_acc = [];
test_acc[1] = "Flemming Hansen";
test_acc[2] = "Flemming Hansen";
test_acc[3] = "Tamir Kuhr";
test_acc[4] = "Flemming Hansen";
test_acc[5] = "Flemming Hansen";
test_acc[6] = "Flemming Hansen";
test_acc[7] = "Flemming Hansen";
test_acc[8] = "Flemming Hansen";
test_acc[9] = "Flemming Hansen";
test_acc[10] = "Flemming Hansen";
test_acc[11] = "Flemming Hansen";
test_acc[12] = "Flemming Hansen";
test_acc[13] = "Flemming Hansen";
test_acc[14] = "Flemming Hansen";
test_acc[15] = "Flemming Hansen";
test_acc[16] = "Flemming Hansen";
test_acc[17] = "Flemming Hansen";
test_acc[18] = "Flemming Hansen";
test_acc[19] = "Flemming Hansen";
test_acc[20] = "Flemming Hansen";
test_acc[21] = "Flemming Hansen";
test_acc[22] = "Flemming Hansen";
test_acc[23] = "Flemming Hansen";
test_acc[24] = "Flemming Hansen";
test_acc[25] = "Flemming Hansen";
test_acc[26] = "Flemming Hansen";
test_acc[27] = "Flemming Hansen";
test_acc[28] = "Flemming Hansen";
test_acc[29] = "Flemming Hansen";
test_acc[30] = "Flemming Hansen";
test_acc[31] = "Flemming Hansen";
test_acc[32] = "Flemming Hansen";
test_acc[33] = "Flemming Hansen";
test_acc[34] = "Flemming Hansen";
test_acc[35] = "Flemming Hansen";
test_acc[36] = "Flemming Hansen";
test_acc[37] = "Flemming Hansen";
test_acc[38] = "Flemming Hansen";
test_acc[39] = "Flemming Hansen";
test_acc[40] = "Flemming Hansen";
test_acc[41] = "Flemming Hansen";
test_acc[42] = "Flemming Hansen";
test_acc[43] = "Flemming Hansen";
test_acc[44] = "Flemming Hansen";
test_acc[45] = "Flemming Hansen";
test_acc[46] = "Flemming Hansen";
test_acc[47] = "Flemming Hansen";
test_acc[48] = "Flemming Hansen";
test_acc[49] = "Flemming Hansen";
test_acc[50] = "Flemming Hansen";
test_acc[51] = "Flemming Hansen";
test_acc[52] = "Flemming Hansen";
test_acc[53] = "Flemming Hansen";
test_acc[54] = "Flemming Hansen";
test_acc[55] = "Flemming Hansen";
test_acc[56] = "Flemming Hansen";
test_acc[57] = "Flemming Hansen";
test_acc[58] = "Flemming Hansen";
test_acc[59] = "Flemming Hansen";
test_acc[60] = "Flemming Hansen";
test_acc[61] = "Flemming Hansen";
test_acc[62] = "Flemming Hansen";
test_acc[63] = "Flemming Hansen";
test_acc[64] = "Flemming Hansen";
test_acc[65] = "Flemming Hansen";
test_acc[66] = "Flemming Hansen";
test_acc[67] = "Flemming Hansen";
test_acc[68] = "Flemming Hansen";
test_acc[69] = "Flemming Hansen";
test_acc[70] = "Flemming Hansen";
test_acc[71] = "Flemming Hansen";
test_acc[72] = "Flemming Hansen";
test_acc[73] = "Flemming Hansen";
test_acc[74] = "Flemming Hansen";
test_acc[75] = "Flemming Hansen";
test_acc[76] = "Flemming Hansen";
test_acc[77] = "Flemming Hansen";
test_acc[78] = "Flemming Hansen";
test_acc[79] = "Flemming Hansen";
test_acc[80] = "Flemming Hansen";
test_acc[81] = "Flemming Hansen";
test_acc[82] = "Flemming Hansen";
test_acc[83] = "Flemming Hansen";
test_acc[84] = "Flemming Hansen";
test_acc[85] = "Flemming Hansen";
test_acc[86] = "Flemming Hansen";
test_acc[87] = "Flemming Hansen";
test_acc[88] = "Flemming Hansen";
test_acc[89] = "Flemming Hansen";
test_acc[90] = "Flemming Hansen";
test_acc[91] = "Flemming Hansen";
test_acc[92] = "Flemming Hansen";
test_acc[93] = "Flemming Hansen";
test_acc[94] = "Flemming Hansen";
test_acc[95] = "Flemming Hansen";
test_acc[96] = "Flemming Hansen";
test_acc[97] = "Flemming Hansen";
test_acc[98] = "Flemming Hansen";
test_acc[99] = "Flemming Hansen";
test_acc[100] = "Flemming Hansen";
test_acc[101] = "Flemming Hansen";
test_acc[102] = "Flemming Hansen";
test_acc[103] = "Flemming Hansen";
test_acc[104] = "Flemming Hansen";
test_acc[105] = "Flemming Hansen";
test_acc[106] = "Flemming Hansen";
test_acc[107] = "Flemming Hansen";
test_acc[108] = "Flemming Hansen";
test_acc[109] = "Flemming Hansen";
test_acc[110] = "Flemming Hansen";
test_acc[111] = "Flemming Hansen";
test_acc[112] = "Flemming Hansen";
test_acc[113] = "Flemming Hansen";
test_acc[114] = "Flemming Hansen";
test_acc[115] = "Flemming Hansen";
test_acc[116] = "Flemming Hansen";
test_acc[117] = "Flemming Hansen";
test_acc[118] = "Flemming Hansen";
test_acc[119] = "Flemming Hansen";
test_acc[120] = "Flemming Hansen";
test_acc[121] = "Flemming Hansen";
test_acc[122] = "Flemming Hansen";
test_acc[123] = "Flemming Hansen";
test_acc[124] = "Flemming Hansen";
test_acc[125] = "Flemming Hansen";
test_acc[126] = "Flemming Hansen";
test_acc[127] = "Flemming Hansen";
test_acc[128] = "Flemming Hansen";
test_acc[129] = "Flemming Hansen";
test_acc[130] = "Flemming Hansen";
test_acc[131] = "Flemming Hansen";
test_acc[132] = "Flemming Hansen";
test_acc[133] = "Flemming Hansen";
test_acc[134] = "Flemming Hansen";
test_acc[135] = "Flemming Hansen";
test_acc[136] = "Flemming Hansen";
test_acc[137] = "Flemming Hansen";
test_acc[138] = "Flemming Hansen";
test_acc[139] = "Flemming Hansen";
test_acc[140] = "Flemming Hansen";
test_acc[141] = "Flemming Hansen";
test_acc[142] = "Flemming Hansen";
test_acc[143] = "Flemming Hansen";
test_acc[144] = "Flemming Hansen";
test_acc[145] = "Flemming Hansen";
test_acc[146] = "Flemming Hansen";
test_acc[147] = "Flemming Hansen";
test_acc[148] = "Flemming Hansen";
test_acc[149] = "Flemming Hansen";
test_acc[150] = "Flemming Hansen";
test_acc[151] = "Flemming Hansen";
test_acc[152] = "Flemming Hansen";
test_acc[153] = "Flemming Hansen";
test_acc[154] = "Flemming Hansen";
test_acc[155] = "Flemming Hansen";
test_acc[156] = "Flemming Hansen";
test_acc[157] = "Lotte Poulsen";
test_acc[158] = "Lotte Poulsen";
test_acc[159] = "Martin Sørensen";
test_acc[160] = "Martin Sørensen";
test_acc[161] = "Flemming Hansen";
test_acc[162] = "Flemming Hansen";
test_acc[163] = "Flemming Hansen";
test_acc[164] = "Flemming Hansen";
test_acc[165] = "Flemming Hansen";
test_acc[166] = "Flemming Hansen";
test_acc[167] = "Flemming Hansen";
test_acc[168] = "Flemming Hansen";
test_acc[169] = "Flemming Hansen";
test_acc[170] = "Flemming Hansen";
test_acc[171] = "Flemming Hansen";
test_acc[172] = "Flemming Hansen";
test_acc[173] = "Flemming Hansen";
test_acc[174] = "Lotte Poulsen";
test_acc[175] = "Lotte Poulsen";
test_acc[176] = "Flemming Hansen";
test_acc[177] = "Flemming Hansen";
test_acc[178] = "Flemming Hansen";
test_acc[179] = "Flemming Hansen";
test_acc[180] = "Flemming Hansen";
test_acc[181] = "Flemming Hansen";
test_acc[182] = "Flemming Hansen";
test_acc[183] = "Flemming Hansen";
test_acc[184] = "Flemming Hansen";
test_acc[185] = "Lotte Poulsen";
test_acc[186] = "Flemming Hansen";
test_acc[187] = "Flemming Hansen";
test_acc[188] = "Flemming Hansen";
test_acc[189] = "Flemming Hansen";
test_acc[190] = "Flemming Hansen";
test_acc[191] = "Flemming Hansen";
test_acc[192] = "Flemming Hansen";
test_acc[193] = "Flemming Hansen";
test_acc[194] = "Flemming Hansen";
test_acc[195] = "Flemming Hansen";
test_acc[196] = "Flemming Hansen";
test_acc[197] = "Flemming Hansen";
test_acc[198] = "Flemming Hansen";
test_acc[199] = "Flemming Hansen";
test_acc[200] = "Flemming Hansen";
test_acc[201] = "Flemming Hansen";
test_acc[202] = "Flemming Hansen";
test_acc[203] = "Flemming Hansen";
test_acc[204] = "Flemming Hansen";
test_acc[205] = "Flemming Hansen";
test_acc[206] = "Flemming Hansen";
test_acc[207] = "Flemming Hansen";
test_acc[208] = "Flemming Hansen";
test_acc[209] = "Flemming Hansen";
test_acc[210] = "Flemming Hansen";
test_acc[211] = "Flemming Hansen";
test_acc[212] = "Flemming Hansen";
test_acc[213] = "Flemming Hansen";
test_acc[214] = "Flemming Hansen";
test_acc[215] = "Flemming Hansen";
test_acc[216] = "Flemming Hansen";
test_acc[217] = "Flemming Hansen";
test_acc[218] = "Lotte Poulsen";
test_acc[219] = "Flemming Hansen";
test_acc[220] = "Flemming Hansen";
test_acc[221] = "Flemming Hansen";
test_acc[222] = "Flemming Hansen";
test_acc[223] = "Flemming Hansen";
test_acc[224] = "Flemming Hansen";
test_acc[225] = "Flemming Hansen";
test_acc[226] = "Flemming Hansen";
test_acc[227] = "Flemming Hansen";
test_acc[228] = "Flemming Hansen";
test_acc[229] = "Flemming Hansen";
test_acc[230] = "Flemming Hansen";
test_acc[231] = "Flemming Hansen";
test_acc[232] = "Flemming Hansen";
test_acc[233] = "Flemming Hansen";
test_acc[234] = "Flemming Hansen";
test_acc[235] = "Flemming Hansen";
test_acc[236] = "Flemming Hansen";
test_acc[237] = "Flemming Hansen";
test_acc[238] = "Flemming Hansen";
test_acc[239] = "Flemming Hansen";
test_acc[240] = "Flemming Hansen";
test_acc[241] = "Flemming Hansen";
test_acc[242] = "Flemming Hansen";
test_acc[243] = "Flemming Hansen";
test_acc[244] = "Flemming Hansen";
test_acc[245] = "Flemming Hansen";
test_acc[246] = "Flemming Hansen";
test_acc[247] = "Flemming Hansen";
test_acc[248] = "Flemming Hansen";
test_acc[249] = "Flemming Hansen";
test_acc[250] = "Flemming Hansen";
test_acc[251] = "Flemming Hansen";
test_acc[252] = "Flemming Hansen";
test_acc[253] = "Flemming Hansen";
test_acc[254] = "Flemming Hansen";
test_acc[255] = "Flemming Hansen";
test_acc[256] = "Flemming Hansen";
test_acc[257] = "Flemming Hansen";
test_acc[258] = "Flemming Hansen";
test_acc[259] = "Flemming Hansen";
test_acc[260] = "Flemming Hansen";
test_acc[261] = "Flemming Hansen";
test_acc[262] = "Flemming Hansen";
test_acc[263] = "Flemming Hansen";
test_acc[264] = "Flemming Hansen";
test_acc[265] = "Flemming Hansen";
test_acc[266] = "Lotte Poulsen";
test_acc[267] = "Flemming Hansen";
test_acc[268] = "Flemming Hansen";
test_acc[269] = "Flemming Hansen";
test_acc[270] = "Flemming Hansen";
test_acc[271] = "Flemming Hansen";
test_acc[272] = "Flemming Hansen";
test_acc[273] = "Flemming Hansen";
test_acc[274] = "Flemming Hansen";
test_acc[275] = "Flemming Hansen";
test_acc[276] = "Flemming Hansen";
test_acc[277] = "Flemming Hansen";
test_acc[278] = "Flemming Hansen";
test_acc[279] = "Flemming Hansen";
test_acc[280] = "Flemming Hansen";
test_acc[281] = "Flemming Hansen";
test_acc[282] = "Flemming Hansen";
test_acc[283] = "Flemming Hansen";
test_acc[284] = "Flemming Hansen";
test_acc[285] = "Flemming Hansen";
test_acc[286] = "Flemming Hansen";
test_acc[287] = "Flemming Hansen";
test_acc[288] = "Flemming Hansen";
test_acc[289] = "Flemming Hansen";
test_acc[290] = "Flemming Hansen";
test_acc[291] = "Flemming Hansen";
test_acc[292] = "Flemming Hansen";
test_acc[293] = "Flemming Hansen";
test_acc[294] = "Flemming Hansen";
test_acc[295] = "Flemming Hansen";
test_acc[296] = "Flemming Hansen";
test_acc[297] = "Lotte Poulsen";
test_acc[298] = "Flemming Hansen";
test_acc[299] = "Flemming Hansen";
test_acc[300] = "Flemming Hansen";
test_acc[301] = "Lotte Poulsen";
test_acc[302] = "Flemming Hansen";
test_acc[303] = "Flemming Hansen";
test_acc[304] = "Flemming Hansen";
test_acc[305] = "Flemming Hansen";
test_acc[306] = "Flemming Hansen";
test_acc[307] = "Flemming Hansen";
test_acc[308] = "Flemming Hansen";
test_acc[309] = "Flemming Hansen";
test_acc[310] = "Flemming Hansen";
test_acc[311] = "Flemming Hansen";
test_acc[312] = "Flemming Hansen";
test_acc[313] = "Flemming Hansen";
test_acc[314] = "Flemming Hansen";
test_acc[315] = "Flemming Hansen";
test_acc[316] = "Flemming Hansen";
test_acc[317] = "Flemming Hansen";
test_acc[318] = "Flemming Hansen";
test_acc[319] = "Flemming Hansen";
test_acc[320] = "Flemming Hansen";
test_acc[321] = "Flemming Hansen";
test_acc[322] = "Flemming Hansen";
test_acc[323] = "Flemming Hansen";
test_acc[324] = "Flemming Hansen";
test_acc[325] = "Flemming Hansen";
test_acc[326] = "Flemming Hansen";
test_acc[327] = "Flemming Hansen";
test_acc[328] = "Flemming Hansen";
test_acc[329] = "Flemming Hansen";
test_acc[330] = "Flemming Hansen";
test_acc[331] = "Flemming Hansen";
test_acc[332] = "Flemming Hansen";
test_acc[333] = "Flemming Hansen";
test_acc[334] = "Flemming Hansen";
test_acc[335] = "Flemming Hansen";
test_acc[336] = "Flemming Hansen";
test_acc[337] = "Flemming Hansen";
test_acc[338] = "Flemming Hansen";
test_acc[339] = "Flemming Hansen";
test_acc[340] = "Flemming Hansen";
test_acc[341] = "Flemming Hansen";
test_acc[342] = "Flemming Hansen";
test_acc[343] = "Flemming Hansen";
test_acc[344] = "Flemming Hansen";
test_acc[345] = "Flemming Hansen";
test_acc[346] = "Flemming Hansen";
test_acc[347] = "Flemming Hansen";
test_acc[348] = "Flemming Hansen";
test_acc[349] = "Flemming Hansen";
test_acc[350] = "Flemming Hansen";
test_acc[351] = "Flemming Hansen";
test_acc[352] = "Flemming Hansen";
test_acc[353] = "Flemming Hansen";
test_acc[354] = "Flemming Hansen";
test_acc[355] = "Flemming Hansen";
test_acc[356] = "Flemming Hansen";
test_acc[357] = "Flemming Hansen";
test_acc[358] = "Flemming Hansen";
test_acc[359] = "Flemming Hansen";
test_acc[360] = "Flemming Hansen";
test_acc[361] = "Flemming Hansen";
test_acc[362] = "Flemming Hansen";
test_acc[363] = "Flemming Hansen";
test_acc[364] = "Flemming Hansen";
test_acc[365] = "Flemming Hansen";
test_acc[366] = "Flemming Hansen";
test_acc[367] = "Flemming Hansen";
test_acc[368] = "Flemming Hansen";
test_acc[369] = "Flemming Hansen";
test_acc[370] = "Flemming Hansen";
test_acc[371] = "Lotte Poulsen";
test_acc[372] = "Flemming Hansen";
test_acc[373] = "Flemming Hansen";
test_acc[374] = "Flemming Hansen";
test_acc[375] = "Flemming Hansen";
test_acc[376] = "Flemming Hansen";
test_acc[377] = "Flemming Hansen";
test_acc[378] = "Flemming Hansen";
test_acc[379] = "Flemming Hansen";
test_acc[380] = "Lotte Poulsen";
test_acc[381] = "Flemming Hansen";
test_acc[382] = "Flemming Hansen";
test_acc[383] = "Flemming Hansen";
test_acc[384] = "Flemming Hansen";
test_acc[385] = "Flemming Hansen";
test_acc[386] = "Flemming Hansen";
test_acc[387] = "Flemming Hansen";
test_acc[388] = "Flemming Hansen";
test_acc[389] = "Flemming Hansen";
test_acc[390] = "Flemming Hansen";
test_acc[391] = "Flemming Hansen";
test_acc[392] = "Lotte Poulsen";
test_acc[393] = "Flemming Hansen";
test_acc[394] = "Flemming Hansen";
test_acc[395] = "Flemming Hansen";
test_acc[396] = "Flemming Hansen";
test_acc[397] = "Flemming Hansen";
test_acc[398] = "Lotte Poulsen";
test_acc[399] = "Flemming Hansen";
test_acc[400] = "Lotte Poulsen";
test_acc[401] = "Flemming Hansen";
test_acc[402] = "Flemming Hansen";
test_acc[403] = "Flemming Hansen";
test_acc[404] = "Flemming Hansen";
test_acc[405] = "Flemming Hansen";
test_acc[406] = "Flemming Hansen";
test_acc[407] = "Flemming Hansen";
test_acc[408] = "Flemming Hansen";
test_acc[409] = "Flemming Hansen";
test_acc[410] = "Flemming Hansen";
test_acc[411] = "Flemming Hansen";
test_acc[412] = "Flemming Hansen";
test_acc[413] = "Flemming Hansen";
test_acc[414] = "Flemming Hansen";
test_acc[415] = "Flemming Hansen";
test_acc[416] = "Flemming Hansen";
test_acc[417] = "Flemming Hansen";
test_acc[418] = "Flemming Hansen";
test_acc[419] = "Flemming Hansen";
test_acc[420] = "Flemming Hansen";
test_acc[421] = "Flemming Hansen";
test_acc[422] = "Flemming Hansen";
test_acc[423] = "Flemming Hansen";
test_acc[424] = "Lotte Poulsen";
test_acc[425] = "Flemming Hansen";
test_acc[426] = "Flemming Hansen";
test_acc[427] = "Lotte Poulsen";
test_acc[428] = "Flemming Hansen";
test_acc[429] = "Flemming Hansen";
test_acc[430] = "Flemming Hansen";
test_acc[431] = "Flemming Hansen";
test_acc[432] = "Flemming Hansen";
test_acc[433] = "Flemming Hansen";
test_acc[434] = "Flemming Hansen";
test_acc[435] = "Flemming Hansen";
test_acc[436] = "Flemming Hansen";
test_acc[437] = "Flemming Hansen";
test_acc[438] = "Flemming Hansen";
test_acc[439] = "Flemming Hansen";
test_acc[440] = "Flemming Hansen";
test_acc[441] = "Flemming Hansen";
test_acc[442] = "Flemming Hansen";
test_acc[443] = "Flemming Hansen";
test_acc[444] = "Flemming Hansen";
test_acc[445] = "Flemming Hansen";
test_acc[446] = "Flemming Hansen";
test_acc[447] = "Flemming Hansen";
test_acc[448] = "Flemming Hansen";
test_acc[449] = "Flemming Hansen";
test_acc[450] = "Flemming Hansen";
test_acc[451] = "Flemming Hansen";
test_acc[452] = "Flemming Hansen";
test_acc[453] = "Flemming Hansen";
test_acc[454] = "Flemming Hansen";
test_acc[455] = "Flemming Hansen";
test_acc[456] = "Lotte Poulsen";
test_acc[457] = "Flemming Hansen";
test_acc[458] = "Lotte Poulsen";
test_acc[459] = "Flemming Hansen";
test_acc[460] = "Flemming Hansen";
test_acc[461] = "Flemming Hansen";
test_acc[462] = "Lotte Poulsen";
test_acc[463] = "Flemming Hansen";
test_acc[464] = "Flemming Hansen";
test_acc[465] = "Flemming Hansen";
test_acc[466] = "Flemming Hansen";
test_acc[467] = "Flemming Hansen";
test_acc[468] = "Flemming Hansen";
test_acc[469] = "Flemming Hansen";
test_acc[470] = "Flemming Hansen";
test_acc[471] = "Flemming Hansen";
test_acc[472] = "Flemming Hansen";
test_acc[473] = "Flemming Hansen";
test_acc[474] = "Flemming Hansen";
test_acc[475] = "Flemming Hansen";
test_acc[476] = "Flemming Hansen";
test_acc[477] = "Flemming Hansen";
test_acc[478] = "Flemming Hansen";
test_acc[479] = "Flemming Hansen";
test_acc[480] = "Flemming Hansen";
test_acc[481] = "Flemming Hansen";
test_acc[482] = "Flemming Hansen";
test_acc[483] = "Flemming Hansen";
test_acc[484] = "Flemming Hansen";
test_acc[485] = "Flemming Hansen";
test_acc[486] = "Flemming Hansen";
test_acc[487] = "Flemming Hansen";
test_acc[488] = "Flemming Hansen";
test_acc[489] = "Flemming Hansen";
test_acc[490] = "Flemming Hansen";
test_acc[491] = "Flemming Hansen";
test_acc[492] = "Flemming Hansen";
test_acc[493] = "Flemming Hansen";
test_acc[494] = "Flemming Hansen";
test_acc[495] = "Flemming Hansen";
test_acc[496] = "Flemming Hansen";
test_acc[497] = "Flemming Hansen";
test_acc[498] = "Flemming Hansen";
test_acc[499] = "Flemming Hansen";
test_acc[500] = "Flemming Hansen";
test_acc[501] = "Flemming Hansen";
test_acc[502] = "Flemming Hansen";
test_acc[503] = "Flemming Hansen";
test_acc[504] = "Flemming Hansen";
test_acc[505] = "Flemming Hansen";
test_acc[506] = "Flemming Hansen";
test_acc[507] = "Flemming Hansen";
test_acc[508] = "Flemming Hansen";
test_acc[509] = "Flemming Hansen";
test_acc[510] = "Lotte Poulsen";
test_acc[511] = "Flemming Hansen";
test_acc[512] = "Flemming Hansen";
test_acc[513] = "Flemming Hansen";
test_acc[514] = "Flemming Hansen";
test_acc[515] = "Flemming Hansen";
test_acc[516] = "Flemming Hansen";
test_acc[517] = "Flemming Hansen";
test_acc[518] = "Flemming Hansen";
test_acc[519] = "Flemming Hansen";
test_acc[520] = "Flemming Hansen";
test_acc[521] = "Flemming Hansen";
test_acc[522] = "Flemming Hansen";
test_acc[523] = "Flemming Hansen";
test_acc[524] = "Flemming Hansen";
test_acc[525] = "Flemming Hansen";
test_acc[526] = "Flemming Hansen";
test_acc[527] = "Flemming Hansen";
test_acc[528] = "Flemming Hansen";
test_acc[529] = "Flemming Hansen";
test_acc[530] = "Flemming Hansen";
test_acc[531] = "Flemming Hansen";
test_acc[532] = "Flemming Hansen";
test_acc[533] = "Flemming Hansen";
test_acc[534] = "Flemming Hansen";
test_acc[535] = "Flemming Hansen";
test_acc[536] = "Flemming Hansen";
test_acc[537] = "Flemming Hansen";
test_acc[538] = "Flemming Hansen";
test_acc[539] = "Flemming Hansen";
test_acc[540] = "Flemming Hansen";
test_acc[541] = "Flemming Hansen";
test_acc[542] = "Flemming Hansen";
test_acc[543] = "Flemming Hansen";
test_acc[544] = "Flemming Hansen";
test_acc[545] = "Flemming Hansen";
test_acc[546] = "Flemming Hansen";
test_acc[547] = "Flemming Hansen";
test_acc[548] = "Flemming Hansen";
test_acc[549] = "Flemming Hansen";
test_acc[550] = "Flemming Hansen";
test_acc[551] = "Flemming Hansen";
test_acc[552] = "Lotte Poulsen";
test_acc[553] = "Flemming Hansen";
test_acc[554] = "Flemming Hansen";
test_acc[555] = "Flemming Hansen";
test_acc[556] = "Flemming Hansen";
test_acc[557] = "Flemming Hansen";
test_acc[558] = "Flemming Hansen";
test_acc[559] = "Flemming Hansen";
test_acc[560] = "Flemming Hansen";
test_acc[561] = "Flemming Hansen";
test_acc[562] = "Flemming Hansen";
test_acc[563] = "Flemming Hansen";
test_acc[564] = "Flemming Hansen";
test_acc[565] = "Flemming Hansen";
test_acc[566] = "Flemming Hansen";
test_acc[567] = "Flemming Hansen";
test_acc[568] = "Flemming Hansen";
test_acc[569] = "Flemming Hansen";
test_acc[570] = "Flemming Hansen";
test_acc[571] = "Flemming Hansen";
test_acc[572] = "Flemming Hansen";
test_acc[573] = "Flemming Hansen";
test_acc[574] = "Flemming Hansen";
test_acc[575] = "Flemming Hansen";
test_acc[576] = "Flemming Hansen";
test_acc[577] = "Flemming Hansen";
test_acc[578] = "Flemming Hansen";
test_acc[579] = "Flemming Hansen";
test_acc[580] = "Flemming Hansen";
test_acc[581] = "Flemming Hansen";
test_acc[582] = "Lotte Poulsen";
test_acc[583] = "Flemming Hansen";
test_acc[584] = "Flemming Hansen";
test_acc[585] = "Flemming Hansen";
test_acc[586] = "Flemming Hansen";
test_acc[587] = "Flemming Hansen";
test_acc[588] = "Flemming Hansen";
test_acc[589] = "Flemming Hansen";
test_acc[590] = "Lotte Poulsen";
test_acc[591] = "Flemming Hansen";
test_acc[592] = "Flemming Hansen";
test_acc[593] = "Flemming Hansen";
test_acc[594] = "Flemming Hansen";
test_acc[595] = "Flemming Hansen";
test_acc[596] = "Flemming Hansen";
test_acc[597] = "Flemming Hansen";
test_acc[598] = "Lotte Poulsen";
test_acc[599] = "Flemming Hansen";
test_acc[600] = "Flemming Hansen";
test_acc[601] = "Flemming Hansen";
test_acc[602] = "Flemming Hansen";
test_acc[603] = "Flemming Hansen";
test_acc[604] = "Flemming Hansen";
test_acc[605] = "Flemming Hansen";
test_acc[606] = "Flemming Hansen";
test_acc[607] = "Flemming Hansen";

let query_strss = "";
for (let i = 1; i <= 607; i++) {
  query_strss = query_strss + " UPDATE task_manager.time_entries SET " + "reporter_name='" + test_acc[i] + "' WHERE id=" + i + "; ";
}
client.query(query_strss, function(err, result) {
  if (err) {
    console.log(err);
  }
  console.log("okokokok");
});
return;*/

  let recordsTotal = 0;
  let recordsFiltered = 0;

  let query_count = "SELECT COUNT(*) FROM task_manager.time_entries";

  let order_list = {
    'customer_id': 1, 'email_address': 2, 'company_name': 3, 'bookkeeper_name': 4, 'reporter_name': 5, 'task_type': 6, 
    'period': 7, 'delivery_year': 8, 'deleted': 9, 'note': 10, 'time_spent': 11, 'reg_date': 12
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
                "%' OR company_name::TEXT ILIKE '%" + searchStr + "%' OR bookkeeper_name::TEXT ILIKE '%" + searchStr + "%' OR reporter_name::TEXT ILIKE '%" + searchStr +
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
    let format_start_date = moment(extra_search["s_start_date_val"], 'DD-MM-YYYY').format("YYYY-MM-DD");
    extra_search_str = extra_search_str + " AND '" + format_start_date + "'::DATE " + "<= reg_date::DATE";
  }
  if (extra_search["s_end_date_val"]) {
    let format_end_date = moment(extra_search["s_end_date_val"], 'DD-MM-YYYY').format("YYYY-MM-DD");
    extra_search_str = extra_search_str + " AND '" + format_end_date + "'::DATE " + ">= reg_date::DATE";
  }
  if (extra_search_str != "") {
    extra_search_str = extra_search_str.substring(4, extra_search_str.length);
    extra_search_str = "WHERE (" + extra_search_str + ") ";
  }

  // change based on Search//
  let query_search_count = "SELECT COUNT(*) FROM task_manager.time_entries " + extra_search_str + searchStr;
  // add offset and limit//
  let query_str = "SELECT customer_id, email_address, company_name, bookkeeper_name, reporter_name, task_type, period, delivery_year, deleted, note, " + 
                  "COALESCE(COALESCE(january_spent,0.00) + COALESCE(february_spent,0.00) + COALESCE(march_spent,0.00) + " + 
                  "COALESCE(april_spent,0.00) + COALESCE(may_spent,0.00) + COALESCE(june_spent,0.00) + COALESCE(july_spent,0.00) + COALESCE(august_spent,0.00) + " +
                  "COALESCE(september_spent,0.00) + COALESCE(october_spent,0.00) + COALESCE(november_spent,0.00) + COALESCE(december_spent,0.00)" +
                  ", 0.00) as time_spent, reg_date, id, january_spent, february_spent, march_spent, april_spent, may_spent, june_spent, " + 
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
          result.rows[i].reg_date = moment(result.rows[i].reg_date, "YYYY-MM-DD").format("DD-MM-YYYY");
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

// exports.findReportTimes = (req, res) => {
    
//   if (!req.body) {
//       return res.status(400).send({
//         message: "Data to update can not be empty!"
//       });
//   }
  
//   if (!req.body.customer_id || !req.body.sel_year) {
//       console.log("Oops!");
//       res.redirect("/");
//       return;
//   }

//   let query_str = "SELECT * FROM task_manager.time_entries WHERE customer_id = " + req.body.customer_id + 
//                       " AND extract(year from reg_date) = '" + req.body.sel_year + "' " + 
//                       " AND deleted = false " +
//                   "ORDER BY id;";
                      
//   client.query(query_str, function(err, result) {
//     if (err) {
//         console.log(err);
//         res.status(400).send(err);
//     }
    
//     res.send({ data: result.rows });
//   });
// };

// exports.findAuditLog = (req, res) => {
    
//   if (!req.body) {
//       return res.status(400).send({
//         message: "Data to update can not be empty!"
//       });
//   }
  
//   if (!req.body.customer_id || !req.body.sel_year) {
//       console.log("Oops!");
//       res.redirect("/");
//       return;
//   }

//   let query_str = "SELECT *, change_date::TEXT as change_date_str FROM task_manager.time_audit_log WHERE customer_id = " + req.body.customer_id + 
//                       " AND extract(year from change_date) = '" + req.body.sel_year + "' " + 
//                   "ORDER BY id;";
                      
//   client.query(query_str, function(err, result) {
//     if (err) {
//         console.log(err);
//         res.status(400).send(err);
//     }
    
//     res.send({ data: result.rows });
//   });
// };

exports.updateReportTimes = (req, res) => {
  if (!req.body) {
    return res.status(400).send({
      message: "Data to update can not be empty!",
    });
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
    res.send({
      other_link: linkConfig.OTHER_LINK + "logout",
      data: "token_expired",
    });
    return;
  }
  const my_email = token_data.username;
  let bpre_query_str = 
    "SELECT TRIM(CONCAT(first_name, ' ', last_name)) AS bookkeeper_name, COALESCE(price_per_hour, 0.00) " +
    "AS hourly FROM task_manager.freelancers WHERE email='" + my_email + "'";

  if ( !req.body.task_type && !req.body.period &&
       !req.body.time_spent && !req.body.note ) {
    console.log("Oops!");
    res.redirect("/");
    return;
  }
  let pre_query_str = "SELECT * FROM task_manager.time_entries WHERE id=" + req.body.id;

  client.query(bpre_query_str, function(err, result) {
    let reporter_full_name = "N/A";
    let acl_level = admin_emails.includes(my_email) ? 1 : 0;
    // if (acl_level == 1) bookkeeper_full_name = "Admin";
    // else if (result.rows.length > 0)
    if (result.rows.length > 0) reporter_full_name = result.rows[0].bookkeeper_name;
    else reporter_full_name = my_email;

    client.query(pre_query_str, function(err, result){
      if (err) {
        console.log(err);
        res.status(400).send(err);
      }
      let old_data = result.rows[0];
      let month_list = {
        "January":    "january_spent", 
        "February":   "february_spent", 
        "March":      "march_spent",
        "April":      "april_spent", 
        "May":        "may_spent",
        "June":       "june_spent", 
        "July":       "july_spent", 
        "August":     "august_spent", 
        "September":  "september_spent", 
        "October":    "october_spent",
        "November":   "november_spent", 
        "December":   "december_spent" 
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
      if (reporter_full_name)
        query_str = query_str + "reporter_name='" + reporter_full_name + "', ";
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
        query_str = query_str + "INSERT INTO task_manager.time_audit_log (customer_id, company_name, bookkeeper_name, reporter_name, email_address, delivery_year, sel_month, chg_column, old_value, new_value, change_date) VALUES (" + 
                  old_data.customer_id + ", '" + old_data.company_name + "', '" + old_data.bookkeeper_name + "', '" + old_data.reporter_name + "', '" +
                  old_data.email_address + "', " + old_data.delivery_year + ", '" + req.body.month + "', " + "'Primary Task Type', '" + old_data.task_type + "', '" +
                  req.body.task_type + "', '" + req.body.today + "'::timestamp); ";
      }
      if (old_data.reporter_name != reporter_full_name) {
        query_str = query_str + "INSERT INTO task_manager.time_audit_log (customer_id, company_name, bookkeeper_name, reporter_name, email_address, delivery_year, sel_month, chg_column, old_value, new_value, change_date) VALUES (" + 
                  old_data.customer_id + ", '" + old_data.company_name + "', '" + old_data.bookkeeper_name + "', '" + old_data.reporter_name + "', '" +
                  old_data.email_address + "', " + old_data.delivery_year + ", '" + req.body.month + "', " + "'Reporter Name', '" + old_data.reporter_name + "', '" +
                  reporter_full_name + "', '" + req.body.today + "'::timestamp); ";
      }
      if (req.body.delivery_year) {
        query_str = query_str + "INSERT INTO task_manager.time_audit_log (customer_id, company_name, bookkeeper_name, reporter_name, email_address, delivery_year, sel_month, chg_column, old_value, new_value, change_date) VALUES (" + 
                  old_data.customer_id + ", '" + old_data.company_name + "', '" + old_data.bookkeeper_name + "', '" + old_data.reporter_name + "', '" +
                  old_data.email_address + "', " + old_data.delivery_year + ", '" + req.body.month + "', " + "'Delivery Year', '" + old_data.delivery_year + "', '" +
                  req.body.delivery_year + "', '" + req.body.today + "'::timestamp); ";
      }
      if (req.body.period) {
        query_str = query_str + "INSERT INTO task_manager.time_audit_log (customer_id, company_name, bookkeeper_name, reporter_name, email_address, delivery_year, sel_month, chg_column, old_value, new_value, change_date) VALUES (" + 
                  old_data.customer_id + ", '" + old_data.company_name + "', '" + old_data.bookkeeper_name + "', '" + old_data.reporter_name + "', '" +
                  old_data.email_address + "', " + old_data.delivery_year + ", '" + req.body.month + "', " + "'Period', '" + old_data.period + "', '" +
                  req.body.period + "', '" + req.body.today + "'::timestamp); ";
      }
      if (req.body.time_spent) {
        query_str = query_str + "INSERT INTO task_manager.time_audit_log (customer_id, company_name, bookkeeper_name, reporter_name, email_address, delivery_year, sel_month, chg_column, old_value, new_value, change_date) VALUES (" + 
                  old_data.customer_id + ", '" + old_data.company_name + "', '" + old_data.bookkeeper_name + "', '" + old_data.reporter_name + "', '" +
                  old_data.email_address + "', " + old_data.delivery_year + ", '" + req.body.month + "', " + "'Time Spent', '" + old_data[month_list[req.body.month]] + "', '" +
                  req.body.time_spent + "', '" + req.body.today + "'::timestamp); ";
      }
      if (req.body.note) {
        query_str = query_str + "INSERT INTO task_manager.time_audit_log (customer_id, company_name, bookkeeper_name, reporter_name, email_address, delivery_year, sel_month, chg_column, old_value, new_value, change_date) VALUES (" + 
                  old_data.customer_id + ", '" + old_data.company_name + "', '" + old_data.bookkeeper_name + "', '" + old_data.reporter_name + "', '" +
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
  });
};

exports.deleteReportTimes = (req, res) => {
  if (!req.body) {
    return res.status(400).send({
      message: "Data to update can not be empty!",
    });
  }

  let pre_query_str = "SELECT * FROM task_manager.time_entries WHERE id=" + req.body.id;

  client.query(pre_query_str, function (err, result) {
    if (err) {
      console.log(err);
      res.status(400).send(err);
    }
    let old_data = result.rows[0];

    let query_str = "UPDATE task_manager.time_entries SET " +
      "deleted=true WHERE id=" + req.body.id + "; ";

    query_str = query_str + "INSERT INTO task_manager.time_audit_log (customer_id, company_name, " + 
      "bookkeeper_name, reporter_name, email_address, delivery_year, sel_month, chg_column, old_value, new_value, " + 
      "change_date) VALUES (" + old_data.customer_id + ", '" + old_data.company_name + "', '" +
      old_data.bookkeeper_name + "', '" + old_data.reporter_name + "', '" + old_data.email_address + "', " + old_data.delivery_year +
      ", '" + req.body.month + "', " + "'deleted', 'FALSE', 'TRUE', '" +
      req.body.today + "'::timestamp); ";

    client.query(query_str, function (err, result) {
      if (err) {
        console.log(err);
        res.status(400).send(err);
      }
      res.send({ message: "It was deleted successfully." });
    });
  });
};

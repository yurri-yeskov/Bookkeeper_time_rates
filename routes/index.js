var express = require('express');
var router = express.Router();

const actorCtrl = require('../controller/hourly.controller');
const timeElementCtrol = require('../controller/time_element.controller');

/* GET HOURLY-RATES page. */
router.get('/', actorCtrl.findAll);
router.get('/hourly-rates', actorCtrl.findAll);
/* SET HOURLY-RATES page. */
router.post('/set_hourly', actorCtrl.update)

/* GET TIME-ELEMENTS page. */
router.get('/time-elements', timeElementCtrol.findAll);
router.post('/set_time_elements', timeElementCtrol.insert);
router.post('/update_time_elements', timeElementCtrol.update);
// router.get('/time-elements', function(req, res, next) {
//   res.render('time-elements', {page:'Time Elements', menuId:'time-elements'});
// });

/* GET CALCULATION page. */
router.get('/time-calculation', function(req, res, next) {
  res.render('time-calculation', {page:'Product Time Calculation', menuId:'time-calculation'});
});

module.exports = router;

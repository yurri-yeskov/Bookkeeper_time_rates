var express = require('express');
var router = express.Router();

const actorCtrl = require('../controller/hourly.controller');
const timeElementCtrl = require('../controller/time_element.controller');
const timeCalcCtrl = require('../controller/time_calculation.controller');
const timeOvvwCtrl = require('../controller/time_overview.controller');

/* GET HOURLY-RATES page. */
router.get('/', actorCtrl.findAll);
router.get('/hourly-rates', actorCtrl.findAll);
/* SET HOURLY-RATES page. */
router.post('/set_hourly', actorCtrl.update)

/* GET TIME-ELEMENTS page. */
router.get('/time-elements', timeElementCtrl.findAll);
router.post('/set_time_elements', timeElementCtrl.insert);
router.post('/update_time_elements', timeElementCtrl.update);

/* GET CALCULATION page. */
router.get('/time-calculation', timeCalcCtrl.findProductProfiles);

router.get('/get_time_elements', timeCalcCtrl.findTimeElememts);
router.get('/get_packages', timeCalcCtrl.findPackages);
router.get('/get_company_types', timeCalcCtrl.findCompanyTypes);
router.post('/set_product_profile', timeCalcCtrl.addProductProfile);
router.post('/set_product_profile_package', timeCalcCtrl.addProductProfilePackage);
router.post('/set_product_profile_companytype', timeCalcCtrl.addProductProfileCompanyType);
router.post('/set_product_profile_timeelement', timeCalcCtrl.addProductProfileTimeElement);
// router.get('/get_testers', timeCalcCtrl.delfindProductProfiles);
router.get('/get_product_profile_package', timeCalcCtrl.getProductProfilePackage);
router.get('/get_product_profile_company_type', timeCalcCtrl.getProductProfileCompanyType);
router.get('/get_product_profile_time_element', timeCalcCtrl.getProductProfileTimeElement);

router.post('/update_product_profile', timeCalcCtrl.updateProductProfile);
router.post('/update_product_profile_package', timeCalcCtrl.updateProductProfilePackage);
router.post('/update_product_profile_companytype', timeCalcCtrl.updateProductProfileCompanyType);
router.post('/update_product_profile_timeelement', timeCalcCtrl.updateProductProfileTimeElement);

router.post('/get_customerinfo', timeCalcCtrl.findCustomer);
router.post('/calculate_time', timeCalcCtrl.calculationTime);

/* GET TIME OVERVIEW page */
router.get('/time-overview', timeOvvwCtrl.getCurrentYear);
router.post('/get_customerinfo_with_year', timeOvvwCtrl.findCustomerInfoWithYear);
router.get('/get_bookkeeper_list', timeOvvwCtrl.findBookkeepers);
router.get('/get_package_list', timeOvvwCtrl.findPackages);
router.get('/get_company_list', timeOvvwCtrl.findCompanyTypes);

module.exports = router;

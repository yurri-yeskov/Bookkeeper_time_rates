var express = require('express');
var router = express.Router();

const actorCtrl = require('../controller/hourly.controller');
const timeElementCtrl = require('../controller/time_element.controller');
const timeCalcCtrl = require('../controller/time_calculation.controller');
const timeOvvwCtrl = require('../controller/time_overview.controller');
const timeReptCtrl = require('../controller/time_reporting.controller');
const reptOvvwCtrl = require('../controller/report_overview.controller');
const rcptRecoCtrl = require('../controller/receipt_recog.controller');
const linkConfig = require("../config/links.config");

/* GET HOURLY-RATES page. */
router.post('/', actorCtrl.findAll);
router.get('/', );
router.get('/', function(req, res) { res.redirect(linkConfig.OTHER_LINK); });
router.post('/hourly-rates', actorCtrl.findAll);
router.get('/hourly-rates', function(req, res) { res.redirect(linkConfig.OTHER_LINK); });
/* SET HOURLY-RATES page. */
router.post('/set_hourly', actorCtrl.update)

/* GET TIME-ELEMENTS page. */
router.post('/time-elements', timeElementCtrl.findAll);
router.get('/time-elements', function(req, res) { res.redirect(linkConfig.OTHER_LINK); });
router.post('/set_time_elements', timeElementCtrl.insert);
router.post('/update_time_elements', timeElementCtrl.update);

/* GET CALCULATION page. */
router.post('/time-calculation', timeCalcCtrl.findProductProfiles);
router.get('/time-calculation', function(req, res) { res.redirect(linkConfig.OTHER_LINK); });

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
router.post('/time-overview', timeOvvwCtrl.getCurrentYear);
router.get('/time-overview', function(req, res) { res.redirect(linkConfig.OTHER_LINK); });
router.post('/get_customerinfo_with_year', timeOvvwCtrl.findCustomerInfoWithYear);
router.get('/get_bookkeeper_list', timeOvvwCtrl.findBookkeepers);
router.get('/get_package_list', timeOvvwCtrl.findPackages);
router.get('/get_company_list', timeOvvwCtrl.findCompanyTypes);

/* GET TIME REPORTING page */
router.post('/time-reporting', timeReptCtrl.getCurrentYear);
router.get('/time-reporting', function(req, res) { res.redirect(linkConfig.OTHER_LINK); });
router.post('/get_day_customer_info', timeReptCtrl.getDayCustomerInfo);
router.post('/get_customerminfo_with_year', timeReptCtrl.findCustomerInfoWithYear);
router.post('/set_report_time', timeReptCtrl.insertReportTime);
router.post('/get_report_time', timeReptCtrl.findReportTimes);
router.post('/get_audit_log', timeReptCtrl.findAuditLog);
router.post('/update_report_time', timeReptCtrl.updateReportTimes);
router.post('/delete_report_time', timeReptCtrl.deleteReportTimes);
router.post('/get_total_times', timeReptCtrl.findTotalTimes);
router.post('/get_ex_customer_info', timeReptCtrl.findExCustomerInfo);

/* GET REPORT OVERVIEW page */
router.post('/report-overview', reptOvvwCtrl.getCurrentYear);
router.get('/report-overview', function(req, res) { res.redirect(linkConfig.OTHER_LINK); });
router.post('/get_all_time_entry', reptOvvwCtrl.findAllTimeEntry);
router.get('/get_bookkeeper_name_list', reptOvvwCtrl.findBookkeeperNames);
router.post('/update_areport_time', reptOvvwCtrl.updateReportTimes);
router.post('/delete_areport_time', reptOvvwCtrl.deleteReportTimes);

/* GET RECEIPT RECOG page */
router.get('/receipt-recog', rcptRecoCtrl.index);
router.post('/get_recog_result', rcptRecoCtrl.getRecogResult);

router.post('/time-reporting/:customer_id', timeReptCtrl.timeReportingWithCustomerId);
router.get('/time-reporting/:customer_id', function(req, res) { res.redirect(linkConfig.OTHER_LINK); });

module.exports = router;

import { Router } from "express";
import { 
    createServiceRequest,
    findRequests,
    acceptRequest,
    setQuoteAmount,
    acceptRepairQuote,
    rejectRepairQuote,
    updateWorkerLocation,
    cancelledByWorkerAsCustomerNotResponding,
    cancelledByWorkerAsNotAbleToServe,
    cancelledByCustomerAsWorkerNotRespondingOrLate,
    cancelledByCustomerAsByMistake,
    cancelBySystemAsNotConnected,
    cancelledBySystemAsUnattended,
    rateWorker,
    reportWorker
} from "../controllers/serviceRequest.controller.js";

import verifyJWTWorker from "../middlewares/workerAuth.middleware.js";
import verifyJWTCustomer from "../middlewares/customerAuth.middleware.js";

const router = Router();

router.route("/create").post(verifyJWTCustomer, createServiceRequest); 
router.route("/find-requests").get(verifyJWTWorker, findRequests);
router.route("/:serviceRequestId/accept").post(verifyJWTWorker, acceptRequest);
router.route("/:serviceRequestId/set-quote-amount").patch(verifyJWTWorker, setQuoteAmount);
router.route("/:serviceRequestId/accept-repair-quote").patch(verifyJWTCustomer, acceptRepairQuote);
router.route("/:serviceRequestId/reject-repair-quote").patch(verifyJWTCustomer, rejectRepairQuote);
router.route("/:serviceRequestId/update-worker-location").patch(verifyJWTWorker, updateWorkerLocation);
router.route("/:serviceRequestId/cancelled-by-worker-as-customer-not-responding").patch(verifyJWTWorker, cancelledByWorkerAsCustomerNotResponding);
router.route("/:serviceRequestId/cancelled-by-worker-as-not-able-to-serve").patch(verifyJWTWorker, cancelledByWorkerAsNotAbleToServe);
router.route("/:serviceRequestId/cancelled-by-customer-as-worker-not-responding-or-late").patch(verifyJWTCustomer, cancelledByCustomerAsWorkerNotRespondingOrLate);
router.route("/:serviceRequestId/cancelled-by-customer-as-by-mistake").patch(verifyJWTCustomer, cancelledByCustomerAsByMistake);
router.route("/cancel-by-system-as-not-connected").patch(cancelBySystemAsNotConnected);
router.route("/cancelled-by-system-as-unattended").patch(cancelledBySystemAsUnattended);
router.route("/:serviceRequestId/rate-worker").patch(verifyJWTCustomer, rateWorker);
router.route("/:serviceRequestId/report-worker").post(verifyJWTCustomer, reportWorker);

export default router;

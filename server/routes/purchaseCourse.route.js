import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import {
  getCourseDetailWithPurchaseStatus,
  getAllPurchasedCourse,
  dummyBuyCourse,
} from "../controllers/coursePurchase.controller.js";
const router = express.Router();

router
  .route("/course/:courseId/detail-with-status")
  .get(getCourseDetailWithPurchaseStatus);

router.get("/purchased-courses", isAuthenticated, getAllPurchasedCourse);
router.post("/dummy-buy", isAuthenticated, dummyBuyCourse);
export default router;

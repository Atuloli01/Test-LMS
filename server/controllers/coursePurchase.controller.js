import { Course } from "../models/course.model.js";
import { CoursePurchase } from "../models/coursePurchase.model.js";
import { Lecture } from "../models/lecture.model.js";
import { User } from "../models/user.model.js";

// Dummy payment endpoint (simulate payment success)
export const dummyBuyCourse = async (req, res) => {
  try {
    const userId = req.id;
    const { courseId } = req.body;

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: "Course not found!" });

    // Check if already purchased
    const existingPurchase = await CoursePurchase.findOne({ userId, courseId });
    if (existingPurchase?.status === "completed") {
      return res.status(400).json({ message: "Course already purchased!" });
    }

    // Create new purchase and mark as completed
    const newPurchase = new CoursePurchase({
      courseId,
      userId,
      amount: course.coursePrice,
      status: "completed",
      paymentId: `DUMMY_${Date.now()}`, // Optional dummy payment ID
    });

    await newPurchase.save();

    // Make lectures visible (if required)
    if (course.lectures.length > 0) {
      await Lecture.updateMany(
        { _id: { $in: course.lectures } },
        { $set: { isPreviewFree: true } }
      );
    }

    // Update user’s enrolledCourses
    await User.findByIdAndUpdate(
      userId,
      { $addToSet: { enrolledCourses: course._id } },
      { new: true }
    );

    // Update course’s enrolledStudents
    await Course.findByIdAndUpdate(
      course._id,
      { $addToSet: { enrolledStudents: userId } },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: "Course purchased successfully (dummy payment).",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Something went wrong." });
  }
};
export const getCourseDetailWithPurchaseStatus = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.id;

    const course = await Course.findById(courseId)
      .populate({ path: "creator" })
      .populate({ path: "lectures" });

    const purchased = await CoursePurchase.findOne({ userId, courseId });
    console.log(purchased);

    if (!course) {
      return res.status(404).json({ message: "course not found!" });
    }

    return res.status(200).json({
      course,
      purchased: !!purchased, // true if purchased, false otherwise
    });
  } catch (error) {
    console.log(error);
  }
};

export const getAllPurchasedCourse = async (req, res) => {
  try {
    const { userId } = req; // Extract userId from req (added by middleware like isAuthenticated)

    const purchasedCourse = await CoursePurchase.find({
      userId, // Filter by the specific user ID
      status: "completed",
    }).populate("courseId");

    if (!purchasedCourse || purchasedCourse.length === 0) {
      return res.status(404).json({
        purchasedCourse: [],
        message: "No purchased courses found.",
      });
    }

    return res.status(200).json({
      purchasedCourse,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "An error occurred while fetching purchased courses.",
    });
  }
};

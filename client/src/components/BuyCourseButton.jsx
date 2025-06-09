import PropTypes from "prop-types";
import { useState } from "react";
import { Button } from "./ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useDummyBuyCourseMutation } from "@/features/api/purchaseApi";
import { useNavigate } from "react-router-dom";

const BuyCourseButton = ({ courseId, coursePrice }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dummyBuyCourse, { isLoading }] = useDummyBuyCourseMutation();
  const navigate = useNavigate();

  const openPaymentModal = () => {
    setIsModalOpen(true);
  };

  const closePaymentModal = () => {
    setIsModalOpen(false);
  };

  const processDummyPayment = async () => {
    try {
      const res = await dummyBuyCourse(courseId).unwrap();
      toast.success(res.message || "Dummy Payment Successful!");
      closePaymentModal();
      navigate(`/course-progress/${courseId}`);
    } catch (err) {
      toast.error(err?.data?.message || "Payment failed. Try again.");
      closePaymentModal();
    }
  };

  return (
    <div>
      <Button onClick={openPaymentModal} className="w-full">
        Purchase Course
      </Button>

      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg w-96">
            <h2 className="text-lg font-bold mb-4">Complete Payment</h2>
            <p className="text-sm mb-4">
              You are about to pay <strong>${coursePrice}</strong> for this
              course.
            </p>
            <div className="flex justify-between">
              <Button onClick={closePaymentModal} variant="outline">
                Cancel
              </Button>
              <Button onClick={processDummyPayment} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin mr-2 h-4 w-4" />
                    Processing...
                  </>
                ) : (
                  `Pay ${coursePrice}`
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
BuyCourseButton.propTypes = {
  courseId: PropTypes.string.isRequired,
  coursePrice: PropTypes.number.isRequired,
};

export default BuyCourseButton;

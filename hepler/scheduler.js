const cron = require('node-cron');
const moment = require('moment-timezone'); // Import moment-timezone để xử lý thời gian theo múi giờ
const Order = require('../mongo/order.model'); // Import model Order
const Payment = require('../mongo/payment.model'); // Import model Payment, dùng để cập nhật trạng thái thanh toán

// Lịch chạy job mỗi giờ (ở đầu mỗi giờ)
// Ở đây dùng biểu thức cron mặc định để chạy đầu mỗi giờ. Trong môi trường test bạn có thể dùng '*/10 * * * * *' (mỗi 10 giây)
cron.schedule('0 */10 * * * *', async () => {
  try {
    // Lấy thời gian cách hiện tại 1 ngày theo múi giờ Asia/Ho_Chi_Minh (GMT+7)
    const oneDayAgo = moment.tz('Asia/Ho_Chi_Minh').subtract(1, 'day').toDate();
    console.log(`Kiểm tra đơn hàng pending từ lúc: ${oneDayAgo}`);

    // Tìm các đơn hàng có:
    // - payment_status là 'pending'
    // - payment_method không phải là 'cash'
    // - Thời gian tạo (ở đây dùng trường 'date', hoặc nếu bạn dùng timestamps thì có thể dùng 'createdAt') trước oneDayAgo
    const ordersToCancel = await Order.find({
      payment_status: 'pending',
      payment_method: { $ne: 'cash' },
      date: { $lte: oneDayAgo } // Nếu schema của bạn dùng 'date'. Nếu dùng timestamps, chuyển thành createdAt.
    });

    if (ordersToCancel.length > 0) {
      console.log(`Tìm thấy ${ordersToCancel.length} đơn hàng cần hủy.`);
      for (const order of ordersToCancel) {
        // Cập nhật trạng thái của đơn hàng:
        // Đặt payment_status thành 'failed'
        // Đặt status thành -1
        order.payment_status = 'failed';
        order.status = -1;
        await order.save();
        console.log(`Đã hủy đơn hàng ${order._id}: payment_status => 'failed', status => -1.`);

        // Nếu đơn hàng có liên kết đến payment (paymentId tồn tại),
        // cập nhật trạng thái của Payment thành 'failed'
        if (order.paymentId) {
          await Payment.findByIdAndUpdate(order.paymentId, { status: 'failed' });
          console.log(`Đã cập nhật trạng thái Payment ${order.paymentId} thành 'failed'.`);
        }
      }
    } else {
      console.log('Không có đơn hàng cần hủy lúc này.');
    }
  } catch (err) {
    console.error('Lỗi khi tự động hủy đơn hàng:', err);
  }
});
const { Order, Payment, Notification } = require('../models');
const vnpay = require('../utils/vnpay');

exports.createVnpayUrl = async (req, res) => {
  try {
    const { order_id } = req.body;
    const order = await Order.findOne({ where: { id: order_id, user_id: req.user.id } });
    if (!order) return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
    if (order.payment_status === 'paid') return res.status(400).json({ message: 'Đơn hàng đã được thanh toán' });

    const ipAddr = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
    const paymentUrl = vnpay.createPaymentUrl(order.id, Number(order.total), `Thanh toán đơn hàng ${order.order_code}`, ipAddr);

    res.json({ paymentUrl });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi tạo thanh toán VNPay' });
  }
};

exports.vnpayReturn = async (req, res) => {
  try {
    const vnpParams = { ...req.query };
    const isValid = vnpay.verifyReturnUrl(vnpParams);

    if (!isValid) return res.json({ success: false, message: 'Chữ ký không hợp lệ' });

    const orderId = vnpParams.vnp_TxnRef;
    const responseCode = vnpParams.vnp_ResponseCode;
    const transactionId = vnpParams.vnp_TransactionNo;

    const order = await Order.findByPk(orderId);
    if (!order) return res.json({ success: false, message: 'Không tìm thấy đơn hàng' });

    if (responseCode === '00') {
      order.payment_status = 'paid';
      await order.save();
      await Payment.update({ status: 'paid', vnpay_transaction_id: transactionId, vnpay_response: JSON.stringify(vnpParams) }, { where: { order_id: order.id } });
      await Notification.create({ user_id: order.user_id, title: 'Thanh toán thành công', message: `Đơn hàng #${order.order_code} đã thanh toán thành công qua VNPay`, type: 'payment' });
      return res.json({ success: true, message: 'Thanh toán thành công', order_code: order.order_code });
    } else {
      order.payment_status = 'failed';
      await order.save();
      await Payment.update({ status: 'failed', vnpay_response: JSON.stringify(vnpParams) }, { where: { order_id: order.id } });
      return res.json({ success: false, message: 'Thanh toán thất bại' });
    }
  } catch (error) {
    res.json({ success: false, message: 'Lỗi xử lý thanh toán' });
  }
};

const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = process.env.MAIL_FROM_ADDRESS || 'noreply@qlhtt.io.vn';
const FROM_NAME = process.env.MAIL_FROM_NAME || 'Shop';

exports.sendForgotPassword = async (to, name, resetUrl) => {
    await resend.emails.send({
        from: `${FROM_NAME} <${FROM_EMAIL}>`,
        to,
        subject: 'Đặt lại mật khẩu',
        html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px">
        <h2 style="color:#4f46e5">Đặt lại mật khẩu</h2>
        <p>Xin chào <strong>${name}</strong>,</p>
        <p>Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn.</p>
        <p>Nhấn vào nút bên dưới để đặt lại mật khẩu (liên kết có hiệu lực trong 30 phút):</p>
        <a href="${resetUrl}" style="display:inline-block;margin:16px 0;padding:12px 24px;background:#4f46e5;color:#fff;text-decoration:none;border-radius:8px;font-weight:bold">
          Đặt lại mật khẩu
        </a>
        <p style="color:#6b7280;font-size:13px">Nếu bạn không yêu cầu đặt lại mật khẩu, hãy bỏ qua email này.</p>
        <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0"/>
        <p style="color:#9ca3af;font-size:12px">${FROM_NAME}</p>
      </div>
    `,
    });
};

exports.sendOrderConfirmation = async (to, name, order) => {
    const itemsHtml = order.items?.map(item =>
        `<tr>
      <td style="padding:8px;border-bottom:1px solid #f3f4f6">${item.product_name} (${item.size}/${item.color}) x${item.quantity}</td>
      <td style="padding:8px;border-bottom:1px solid #f3f4f6;text-align:right">${Number(item.price * item.quantity).toLocaleString('vi-VN')}đ</td>
    </tr>`
    ).join('') || '';

    await resend.emails.send({
        from: `${FROM_NAME} <${FROM_EMAIL}>`,
        to,
        subject: `Xác nhận đơn hàng #${order.order_code}`,
        html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px">
        <h2 style="color:#4f46e5">Đặt hàng thành công!</h2>
        <p>Xin chào <strong>${name}</strong>, đơn hàng của bạn đã được đặt thành công.</p>
        <div style="background:#f9fafb;border-radius:8px;padding:16px;margin:16px 0">
          <p><strong>Mã đơn hàng:</strong> #${order.order_code}</p>
          <p><strong>Địa chỉ giao hàng:</strong> ${order.address}</p>
          <p><strong>Phương thức thanh toán:</strong> ${order.payment_method === 'cod' ? 'COD (Thanh toán khi nhận)' : 'VNPay'}</p>
        </div>
        <table style="width:100%;border-collapse:collapse">
          <thead>
            <tr style="background:#f3f4f6">
              <th style="padding:8px;text-align:left">Sản phẩm</th>
              <th style="padding:8px;text-align:right">Thành tiền</th>
            </tr>
          </thead>
          <tbody>${itemsHtml}</tbody>
          <tfoot>
            <tr>
              <td style="padding:8px;font-weight:bold">Tổng cộng</td>
              <td style="padding:8px;font-weight:bold;text-align:right">${Number(order.total).toLocaleString('vi-VN')}đ</td>
            </tr>
          </tfoot>
        </table>
        <p style="color:#6b7280;font-size:13px;margin-top:20px">Cảm ơn bạn đã mua hàng!</p>
        <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0"/>
        <p style="color:#9ca3af;font-size:12px">${FROM_NAME}</p>
      </div>
    `,
    });
};

exports.sendOrderStatusUpdate = async (to, name, orderCode, status) => {
    const statusMap = {
        confirmed: 'Đã xác nhận',
        shipping: 'Đang giao hàng',
        completed: 'Hoàn thành',
        cancelled: 'Đã hủy',
    };
    const label = statusMap[status] || status;

    await resend.emails.send({
        from: `${FROM_NAME} <${FROM_EMAIL}>`,
        to,
        subject: `Cập nhật đơn hàng #${orderCode}`,
        html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px">
        <h2 style="color:#4f46e5">Cập nhật đơn hàng</h2>
        <p>Xin chào <strong>${name}</strong>,</p>
        <p>Đơn hàng <strong>#${orderCode}</strong> của bạn đã được cập nhật trạng thái: <strong style="color:#4f46e5">${label}</strong></p>
        <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0"/>
        <p style="color:#9ca3af;font-size:12px">${FROM_NAME}</p>
      </div>
    `,
    });
};

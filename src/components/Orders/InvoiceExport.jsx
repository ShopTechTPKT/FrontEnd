import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import formatCurrency from '../../utils/formatCurrency';

/**
 * Handles generating and downloading a PDF invoice for a specific order.
 * @param {Object} order The order object containing details
 * @param {String} customerName Optional customer name if resolved
 */
export const downloadInvoice = async (order, customerName) => {
  // 1. Create a hidden, temporary DOM element to render the invoice template
  const invoiceElement = document.createElement('div');
  invoiceElement.style.padding = '40px';
  invoiceElement.style.width = '800px';
  invoiceElement.style.background = 'white';
  invoiceElement.style.color = 'black';
  invoiceElement.style.fontFamily = 'Arial, sans-serif';
  invoiceElement.style.position = 'absolute';
  invoiceElement.style.left = '-9999px';
  invoiceElement.style.top = '-9999px';

  const orderDate = order.createdDate 
    ? new Date(order.createdDate).toLocaleDateString('vi-VN') 
    : 'N/A';


  // Build the invoice HTML structure
  invoiceElement.innerHTML = `
    <div style="border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; display: flex; justify-content: space-between; align-items: start;">
      <div>
        <h1 style="color: #4f46e5; margin: 0; font-size: 32px; font-weight: bold;">HÓA ĐƠN</h1>
        <p style="margin: 5px 0; color: #64748b;">Mã Đơn Hàng: <strong style="color: #0f172a;">#${order.id}</strong></p>
        <p style="margin: 5px 0; color: #64748b;">Ngày: ${orderDate}</p>
      </div>
      <div style="text-align: right; color: #64748b;">
        <h2 style="color: #0f172a; margin: 0; font-size: 20px;">SHOP ONLINE</h2>
        <p style="margin: 5px 0;">12 Nguyễn Văn Bảo, Gò Vấp</p>
        <p style="margin: 5px 0;">Hồ Chí Minh, Việt Nam</p>
      </div>
    </div>
    
    <div style="margin-top: 30px; display: flex; justify-content: space-between;">
      <div>
        <h3 style="color: #64748b; margin-bottom: 10px; font-size: 16px; text-transform: uppercase;">Thông Tin Khách Hàng</h3>
        <p style="margin: 5px 0; font-weight: bold; font-size: 18px;">${customerName || order.customerName || 'Khách Vãng Lai'}</p>
        <p style="margin: 5px 0; color: #64748b;">ID: ${order.userId || 'N/A'}</p>
      </div>
      <div style="text-align: right;">
        <h3 style="color: #64748b; margin-bottom: 10px; font-size: 16px; text-transform: uppercase;">Tình Trạng</h3>
        <span style="display: inline-block; padding: 6px 12px; border-radius: 6px; font-weight: bold; background: #f1f5f9; color: #334155;">
          ${order.status || 'PENDING'}
        </span>
      </div>
    </div>

    <table style="width: 100%; border-collapse: collapse; margin-top: 40px;">
      <thead>
        <tr style="background: #f8fafc; border-bottom: 2px solid #cbd5e1;">
          <th style="padding: 15px; text-align: left; color: #1e293b;">Mô tả</th>
          <th style="padding: 15px; text-align: right; color: #1e293b;">Trị giá</th>
        </tr>
      </thead>
      <tbody>
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 15px; color: #334155;">Đơn hàng #${order.id}</td>
          <td style="padding: 15px; text-align: right; font-weight: bold; color: #0f172a;">${formatPrice(order.totalPrice)}</td>
        </tr>
      </tbody>
    </table>

    <div style="margin-top: 40px; display: flex; justify-content: flex-end;">
      <div style="width: 300px;">
        <div style="display: flex; justify-content: space-between; padding: 10px 0; border-top: 2px solid #cbd5e1;">
          <strong style="font-size: 20px; color: #0f172a;">Tổng Cộng:</strong>
          <strong style="font-size: 20px; color: #4f46e5;">${formatPrice(order.totalPrice)}</strong>
        </div>
      </div>
    </div>

    <div style="margin-top: 50px; text-align: center; color: #94a3b8; font-size: 14px;">
      <p>Cảm ơn quý khách đã mua sắm tại Cửa Hàng!</p>
    </div>
  `;

  document.body.appendChild(invoiceElement);

  try {
    // 2. Generate canvas from the HTML element
    const canvas = await html2canvas(invoiceElement, {
      scale: 2,
      useCORS: true,
      logging: false,
    });
    
    const imgData = canvas.toDataURL('image/png');
    
    // 3. Create PDF and add the image
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    
    // 4. Trigger download
    pdf.save(`HoaDon_${order.id || 'Unknown'}.pdf`);
  } catch (error) {
    console.error("Failed to generate PDF:", error);
    alert('Không thể tạo PDF lúc này.');
  } finally {
    // 5. Cleanup DOM
    document.body.removeChild(invoiceElement);
  }
};

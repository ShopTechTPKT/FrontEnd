/**
 * notify — Unified notification adapter.
 *
 * Single source of truth for all toast notifications across the app.
 * Built on top of react-toastify (configured in App.jsx via <ToastContainer>).
 *
 * Usage:
 *   import notify from '../utils/notify';
 *   notify.success('Đăng nhập thành công');
 *   notify.error('Lỗi xảy ra');
 *   notify.warning('Cảnh báo');
 *   notify.info('Thông tin');
 */
import { toast } from 'react-toastify';

const notify = {
  success: (msg, opts) => toast.success(msg, opts),
  error:   (msg, opts) => toast.error(msg, opts),
  warning: (msg, opts) => toast.warn(msg, opts),
  info:    (msg, opts) => toast.info(msg, opts),
};

export default notify;

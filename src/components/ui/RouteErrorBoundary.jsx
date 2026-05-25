import React from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import Button from "./Button";

export default class RouteErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Route level error captured:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-12 text-center animate-fadeIn">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 mb-6 shadow-sm border border-rose-100 dark:border-rose-900/30 animate-bounce">
            <AlertTriangle className="h-8 w-8" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100 sm:text-3xl">
            Đã xảy ra lỗi tải trang
          </h2>
          <p className="mt-3 max-w-md text-base text-gray-500 dark:text-gray-400">
            Ứng dụng gặp sự cố khi đang kết xuất trang này. Điều này có thể do kết nối mạng không ổn định hoặc lỗi hệ thống tạm thời.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 items-center justify-center">
            <Button
              onClick={this.handleReset}
              className="flex items-center gap-2 px-6 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl shadow-md transition-all font-semibold"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Thử lại ngay</span>
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.href = "/";
              }}
              className="flex items-center gap-2 px-6 py-2.5 text-gray-700 hover:bg-gray-50 rounded-xl transition-all font-semibold border border-gray-200 dark:border-gray-800 dark:text-gray-300"
            >
              <Home className="h-4 w-4" />
              <span>Về trang chủ</span>
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

import React from "react";
import { withTranslation } from "react-i18next";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error);
    console.error("Error info:", errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  render() {
    const { t } = this.props;
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
          <div className="max-w-2xl w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg dark:shadow-gray-900/40 p-8 border border-gray-100 dark:border-gray-700">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-12 w-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="ml-4 flex-1">
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  {t("error_boundary.title")}
                </h3>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  {t("error_boundary.description")}
                </p>

                {this.state.error && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
                    <h4 className="text-sm font-semibold text-red-800 dark:text-red-300 mb-2">
                      {t("error_boundary.error_message")}
                    </h4>
                    <pre className="text-xs text-red-700 dark:text-red-200 whitespace-pre-wrap overflow-auto">
                      {this.state.error.toString()}
                    </pre>
                  </div>
                )}

                {this.state.errorInfo && (
                  <details className="mb-4">
                    <summary className="cursor-pointer text-sm font-semibold text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white">
                      {t("error_boundary.stack_trace")}
                    </summary>
                    <pre className="mt-2 text-xs text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-900 p-3 rounded overflow-auto max-h-64">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </details>
                )}

                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
                  <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-2">
                    {t("error_boundary.how_to_fix")}
                  </h4>
                  <ul className="list-disc list-inside text-sm text-blue-700 dark:text-blue-200 space-y-1">
                    <li>{t("error_boundary.tips.backend")}</li>
                    <li>{t("error_boundary.tips.component_props")}</li>
                    <li>{t("error_boundary.tips.console")}</li>
                    <li>{t("error_boundary.tips.refresh")}</li>
                  </ul>
                </div>

                <button
                  onClick={() => window.location.reload()}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  {t("error_boundary.refresh_page")}
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default withTranslation()(ErrorBoundary);
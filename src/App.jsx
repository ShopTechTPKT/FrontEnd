import "./App.css";
import { Suspense, lazy } from "react";
import AppRouter from "./router/AppRouter";
import { UserProvider } from "./context/UserContext";
import { Provider } from "react-redux";
import store from "./utils/redux/store";
import { ToastContainer, Slide } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ChatBox = lazy(() => import("./components/ChatBox"));
const ChatWidget = lazy(() => import("./components/ChatWidget"));
const GlobalWebSocketNotification = lazy(() =>
  import("./components/Notifications/GlobalWebSocketNotification")
);
const DailyCheckInModal = lazy(() => import("./components/minigame/DailyCheckInModal"));

function App() {
  return (
    <div>
      <UserProvider>
        <Provider store={store}>
          <AppRouter />
          <Suspense fallback={null}>
            <ChatBox />
            <ChatWidget />
            <GlobalWebSocketNotification />
            <DailyCheckInModal />
          </Suspense>
          <ToastContainer
            position="bottom-right"
            autoClose={2500}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="colored"
            limit={2}
            transition={Slide}
            toastClassName="shop-toast"
            progressClassName="shop-toast-progress"
          />
        </Provider>
      </UserProvider>
    </div>
  );
}

export default App;

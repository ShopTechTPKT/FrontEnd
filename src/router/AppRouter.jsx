import React, { Suspense, lazy, useContext } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";
import { UserContext } from "../context/UserContext";
import ProtectedRoute from "../services/ProtectedRoute";

const Layout = lazy(() => import("../pages/Layout/Layout"));
const Content = lazy(() => import("../components/Content/Content"));
const Contact = lazy(() => import("../components/Contact"));
const About = lazy(() => import("../components/About"));
const LoginWave = lazy(() => import("../pages/login/LoginWave"));
const GoogleCallback = lazy(() => import("../pages/login/GoogleCallback"));
const ProfileLayout = lazy(() => import("../pages/Profile/ProfileLayout"));
const ProfileDashboard = lazy(() => import("../pages/Profile/ProfileDashboard"));
const ProfileInfo = lazy(() => import("../pages/Profile/ProfileInfo"));
const MyOrders = lazy(() => import("../pages/Profile/MyOrders"));
const MyFavourite = lazy(() => import("../pages/Profile/MyFavourite"));
const Laptop = lazy(() => import("../pages/Laptops/Laptops"));
const Desktop = lazy(() => import("../pages/Desktops/Desktops"));
const NetWorking = lazy(() => import("../pages/Networking_devices/Networking_devices"));
const Printer_Scanner = lazy(() => import("../pages/Printer_scanner/Printer_scanner"));
const PC_Part = lazy(() => import("../pages/Pc_parts/PC_Part"));
const All_Product = lazy(() => import("../pages/All_Products/All_Products"));
const Repair = lazy(() => import("../pages/Repair/Repair"));
const Our_Deal = lazy(() => import("../pages/Our_Deal/Our_Deal"));
const Card = lazy(() => import("../pages/Card/Card"));
const Catalog = lazy(() => import("../pages/Laptops/Catalog"));
const FAQ = lazy(() => import("../pages/faq/FAQ"));
const ShoppingCard_CheckOut = lazy(() => import("../pages/ShoppingCard/ShoppingCard_CheckOut"));
const ProductDetail = lazy(() => import("../components/product/ProductDetail"));
const ProductSpeccs = lazy(() => import("../components/product/ProductSpecss"));
const AdminLayout = lazy(() => import("../pages/AdminLayout/AdminLayout"));
const ProductAbout = lazy(() => import("../components/product/ProductAbout"));
const Product = lazy(() => import("../components/product/Product"));
import ScrollToTop from "../components/option/ScrollToTop";
const VIPCalendar = lazy(() => import("../pages/Calendar/VIPCalendar"));
const ThankYouPage = lazy(() => import("../pages/ShoppingCard/ThankForShopping"));
const ShoppingCardItem = lazy(() => import("../pages/ShoppingCard/ShoppingCardItem"));
const ShoppingCart = lazy(() => import("../pages/ShoppingCard/ShoppingCart"));
const Deals = lazy(() => import("../pages/Deals/Deals"));
const NewArrivals = lazy(() => import("../pages/NewArrivals/NewArrivals"));
const Brands = lazy(() => import("../pages/Brands/Brands"));
const TrackOrder = lazy(() => import("../pages/TrackOrder/TrackOrder"));
const Blog = lazy(() => import("../pages/Blog/Blog"));
const Appointments = lazy(() => import("../pages/Appointments/Appointments"));
const Warranties = lazy(() => import("../pages/Warranties/Warranties"));
const CustomerManagement = lazy(() => import("../pages/Customers/CustomerManagement"));
const PromotionsManagement = lazy(() => import("../pages/Promotions/PromotionsManagement"));
const CategoriesManagement = lazy(() => import("../pages/Categories/CategoriesManagement"));
const StaffManagement = lazy(() => import("../pages/Staff/StaffManagement"));
const CustomerServiceDashboard = lazy(() => import("../pages/CustomerService/CustomerServiceDashboard"));
const ToastDemo = lazy(() => import("../pages/ToastDemo/ToastDemo"));
const I18nDemo = lazy(() => import("../pages/I18nDemo/I18nDemo"));
const UserProfile = lazy(() => import("../pages/UserProfile/UserProfile"));
const FlappyBird = lazy(() => import("../components/minigame/flappy-bord"));
const Favorites = lazy(() => import("../pages/Favorites/Favorites"));
const NotFound = lazy(() => import("../pages/NotFound/NotFound"));
const AuditLogsPage = lazy(() => import("../pages/AuditLogs/AuditLogsPage"));
const PCBuilder = lazy(() => import("../pages/PCBuilder/PCBuilder"));
const AnalyticsDashboard = lazy(() => import("../pages/AdminLayout/AnalyticsDashboard"));
const CompareTable = lazy(() => import("../components/product/CompareTable"));
const LaptopTable = lazy(() => import("../pages/AdminLayout/LaptopTable"));
const PhoneTable = lazy(() => import("../pages/AdminLayout/PhoneTable"));
const DashboardViewContainer = lazy(() => import("../pages/AdminLayout/components/DashboardViewContainer"));

const AppRouter = () => {
  const { getUserRole } = useContext(UserContext);

  const userRole = getUserRole();

  return (
    <BrowserRouter>
      <ScrollToTop />
      <Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center text-sm text-gray-500">
            Loading...
          </div>
        }
      >
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginWave />} />
        <Route path="/login/callback" element={<GoogleCallback />} />

        {/* Admin routes - Only accessible by ADMIN role */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute requiredRoles={["admin"]}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardViewContainer />} />
          <Route path="products/laptops" element={<LaptopTable />} />
          <Route path="products/phones" element={<PhoneTable />} />
          <Route path="analytics" element={<AnalyticsDashboard />} />
          <Route path="calendar" element={<VIPCalendar />} />
          <Route path="audit-logs" element={<AuditLogsPage />} />
        </Route>
        {/* Customer/public routes */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Content />} />

          {/* Minigame route - Requires authentication */}
          <Route
            path="minigame"
            element={
              <ProtectedRoute requireAuth={true} requiredRoles={[]}>
                <FlappyBird />
              </ProtectedRoute>
            }
          />
          <Route path="contact" element={<Contact />} />
          <Route path="about" element={<About />} />
          <Route path="laptops" element={<Laptop />} />
          <Route path="laptops/catalog" element={<Catalog />} />
          <Route path="faq" element={<FAQ />} />
          <Route path="desktops" element={<Desktop />} />
          <Route path="networking_devices" element={<NetWorking />} />
          <Route path="printer_scanner" element={<Printer_Scanner />} />
          <Route path="pc_parts" element={<PC_Part />} />
          <Route path="all_products" element={<All_Product />} />
          <Route path="repair" element={<Repair />} />
          <Route path="our_deal" element={<Our_Deal />} />
          <Route path="thank_you_shopping" element={<ThankYouPage />} />

          {/* New 2025 Ecommerce Pages */}
          <Route path="deals" element={<Deals />} />
          <Route path="new-arrivals" element={<NewArrivals />} />
          <Route path="brands" element={<Brands />} />
          <Route path="track-order" element={<TrackOrder />} />
          <Route path="blog" element={<Blog />} />
          <Route path="favorites" element={<Favorites />} />
          <Route path="pc-builder" element={<PCBuilder />} />
          <Route path="pc-builder/:presetId" element={<PCBuilder />} />
          <Route path="compare" element={<CompareTable />} />

          {/* Management Pages - Protected by roles */}
          <Route 
            path="appointments" 
            element={
              <ProtectedRoute requiredRoles={["admin", "customer_service"]}>
                <Appointments />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="warranties" 
            element={
              <ProtectedRoute requiredRoles={["admin"]}>
                <Warranties />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="customers" 
            element={
              <ProtectedRoute requiredRoles={["admin"]}>
                <CustomerManagement />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="promotions" 
            element={
              <ProtectedRoute requiredRoles={["admin"]}>
                <PromotionsManagement />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="categories" 
            element={
              <ProtectedRoute requiredRoles={["admin"]}>
                <CategoriesManagement />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="staff" 
            element={
              <ProtectedRoute requiredRoles={["admin"]}>
                <StaffManagement />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="customer-service" 
            element={
              <ProtectedRoute requiredRoles={["admin", "customer_service"]}>
                <CustomerServiceDashboard />
              </ProtectedRoute>
            } 
          />
       
          {/* Protected customer routes - Requires authentication */}
          <Route
            path="userProfile"
            element={
              <ProtectedRoute requireAuth={true} requiredRoles={[]}>
                <UserProfile />
              </ProtectedRoute>
            }
          ></Route>
          <Route
            path="profile"
            element={
              <ProtectedRoute requireAuth={true} requiredRoles={[]}>
                <ProfileLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<ProfileDashboard />} />
            <Route path="info" element={<ProfileInfo />} />
            <Route path="my-orders" element={<MyOrders />} />
            <Route path="my-favourite" element={<MyFavourite />} />
          </Route>
          <Route
            path="card"
            element={
              <ProtectedRoute requireAuth={true} requiredRoles={[]}>
                <Card />
              </ProtectedRoute>
            }
          />

          {/* Shopping cart routes - Requires authentication for checkout */}
          <Route
            path="shopping_card_checkout"
            element={
              <ProtectedRoute requireAuth={true} requiredRoles={[]}>
                <ShoppingCard_CheckOut />
              </ProtectedRoute>
            }
          />
          <Route
            path="shopping_card_item"
            element={
              <ShoppingCart />
            }
          />
          <Route
            path="shopping_payment"
            element={
              <ProtectedRoute requireAuth={true} requiredRoles={[]}>
                <ShoppingCardItem />
              </ProtectedRoute>
            }
          />
          <Route path="thank_you_shopping" element={<ThankYouPage />} />
          {/* Product routes */}
          <Route path="/product/:id" element={<Product />}>
            <Route path="productAbout" element={<ProductAbout />} />
            <Route path="productDetail" element={<ProductDetail />} />
            <Route path="productSpeccs" element={<ProductSpeccs />} />
            <Route index element={<ProductAbout />} />
          </Route>
          {/* Products route - Uses Catalog component (original design) */}
          <Route path="/products" element={<Catalog />} />

          {/* Toast Demo */}
          <Route path="/toast-demo" element={<ToastDemo />} />

          {/* I18n Demo */}
          <Route path="/i18n-demo" element={<I18nDemo />} />
        </Route>

        {/* Redirect based on role */}
        <Route
          path="/dashboard"
          element={
            userRole === "admin" ? (
              <Navigate to="/admin" />
            ) : userRole === "customer_service" ? (
              <Navigate to="/customer-service" />
            ) : (
              <Navigate to="/" />
            )
          }
        />

        {/* 404 Not Found Page */}
        <Route path="/404" element={<NotFound />} />
        
        {/* Catch all - 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      </Suspense>
    </BrowserRouter>
  );
};

export default AppRouter;

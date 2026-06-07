import Header from "../../components/Header"
import Footer from "../../components/Footer"
import MobileBottomNav from "../../components/MobileBottomNav"
import { Outlet } from "react-router-dom";
import BackToTop from "../../components/ui/BackToTop";
import ScrollProgress from "../../components/ui/ScrollProgress";
import CommandSearch from "../../components/CommandSearch";
import CompareBar from "../../components/product/CompareBar";
import AutoBreadcrumb from "../../components/ui/AutoBreadcrumb";
import PageTransition from "../../components/ui/PageTransition";
import usePageMeta from "../../hooks/usePageMeta";

function Layout() {
    usePageMeta();

    return (
        <>
            <a
                href="#main-content"
                className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[9999] focus:px-4 focus:py-2 focus:rounded-lg focus:bg-indigo-600 focus:text-white"
            >
                Skip to main content
            </a>
            <ScrollProgress />
            <Header />
            {/* Content area — uses header-height CSS var instead of magic numbers */}
            <main id="main-content" className="pt-[var(--header-height)] pb-16 lg:pb-0">
                <div className="container-app pt-4">
                    <AutoBreadcrumb className="mb-2" />
                </div>
                <PageTransition>
                    <Outlet></Outlet>
                </PageTransition>
            </main>
            <Footer />
            <MobileBottomNav />
            <BackToTop />
            <CommandSearch />
            <CompareBar />
            {/* Chat: dùng ChatBox toàn cục trong App.jsx — tránh 2 nút chat trùng lặp */}
        </>
    )
}

export default Layout;


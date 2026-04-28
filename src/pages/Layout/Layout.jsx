import Header from "../../components/Header"
import Footer from "../../components/Footer"
import { Outlet } from "react-router-dom";
import BackToTop from "../../components/ui/BackToTop";
import ScrollProgress from "../../components/ui/ScrollProgress";
import CommandSearch from "../../components/CommandSearch";
import CompareBar from "../../components/product/CompareBar";

function Layout() {
    return (
        <>
            <ScrollProgress />
            <Header />
            {/* Content area — uses header-height CSS var instead of magic numbers */}
            <main className="pt-[var(--header-height)]">
                <div className="animate-pageIn">
                    <Outlet></Outlet>
                </div>
            </main>
            <Footer />
            <BackToTop />
            <CommandSearch />
            <CompareBar />
            {/* Chat: dùng ChatBox toàn cục trong App.jsx — tránh 2 nút chat trùng lặp */}
        </>
    )
}

export default Layout;


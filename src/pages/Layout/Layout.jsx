import Header from "../../components/Header"
import Footer from "../../components/Footer"
import { Outlet } from "react-router-dom";

function Layout() {
    return (
        <>
            <Header />
            {/* Add padding-top to prevent content from being hidden behind fixed header */}
            <main className="pt-[120px]">
                <Outlet></Outlet>
            </main>
            <Footer />
            {/* Chat: dùng ChatBox toàn cục trong App.jsx — tránh 2 nút chat trùng lặp */}
        </>
    )
}

export default Layout;


import { Outlet } from 'react-router-dom';
import Navbar from '../navigation/Navbar';
import Footer from '../footer/Footer';
import { useAuth } from '../../context/AuthContext';

const MainLayout = () => {
    const { session, loading } = useAuth();

    if (loading) {
        return <div className="text-center mt-10 text-lg font-semibold">Cargando...</div>;
    }

    return (
        <div className="flex flex-col min-h-screen ">
            {session && <Navbar />}
            <main className="flex-grow p-4 container mx-auto max-w-8xl">
                <Outlet />
            </main>
            <Footer />
        </div>
    );
};

export default MainLayout;

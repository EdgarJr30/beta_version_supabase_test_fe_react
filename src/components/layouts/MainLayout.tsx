import { Outlet } from 'react-router-dom';
import Navbar from '../navigation/Navbar';
import Footer from '../footer/Footer';
import { useAuth } from '../../context/AuthContext';
import Loader from '../ui/Loader';

const MainLayout = () => {
    const { session, loading } = useAuth();

    // Forzar loading si estás en modo desarrollo
    // const devAlwaysLoading = import.meta.env.DEV;

    // if (loading || devAlwaysLoading) {
    //     return <Loader />;
    // }
    if (loading) {
        return <Loader />;
    }

    return (
        <div className="flex flex-col min-h-screen ">
            {session && <Navbar />}
            <main className="flex-grow p-4 w-full">
                <Outlet />
            </main>
            <Footer />
        </div>
    );
};

export default MainLayout;

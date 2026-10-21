import { Outlet } from 'react-router-dom';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';

const Layout = () => {
  return (
    <div className="min-h-screen bg-zinc-100 text-zinc-900">
      <NavBar />
      <main className="flex min-h-[calc(100vh-4rem)] flex-col gap-6 bg-brand pb-16 pt-20">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default Layout;

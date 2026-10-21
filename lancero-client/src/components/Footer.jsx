import { Link } from 'react-router-dom';
import logo from '../assets/img/nubdexchange_logo.png';

const Footer = () => {
  return (
    <footer className="border-t-4 border-yellow-400 bg-zinc-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="wrap flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <img src={logo} alt="" className="h-10 w-10 object-contain" />
          <div>
            <p className="text-lg font-bold text-zinc-900">BulldogEx Shop</p>
            <p className="text-sm text-zinc-500">Campus essentials, simple ordering.</p>
          </div>
        </div>
        <nav className="flex gap-5 text-[11px] font-semibold uppercase tracking-[0.24em] text-zinc-600">
          <Link to="/products" className="hover:text-brand">Products</Link>
          <Link to="/cart" className="hover:text-brand">Cart</Link>
          <Link to="/orders" className="hover:text-brand">Orders</Link>
        </nav>
      </div>
    </footer>
  );
};

export default Footer;

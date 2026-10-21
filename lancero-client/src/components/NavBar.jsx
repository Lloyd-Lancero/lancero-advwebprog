import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import logo from '../assets/img/nubdexchange_logo.png';
import { useAuth } from '../context/AuthContext';
import Button from './Button';

const links = [
  { label: 'Home', to: '/' },
  { label: 'About', to: '/about' },
  { label: 'Products', to: '/products' },
];

const navLinkClassName = ({ isActive }) =>
  [
    'rounded-full px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.24em] transition',
    isActive
      ? 'bg-yellow-400 text-zinc-900'
      : 'text-zinc-100 hover:bg-yellow-400 hover:text-zinc-900',
  ].join(' ');

const NavBar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setOpen(false);
    navigate('/');
  };

  // all links in one list so desktop and mobile menus match
  const allLinks = [
    ...links,
    ...(isAdmin ? [{ label: 'Admin', to: '/admin' }] : []),
    ...(isAuthenticated
      ? [
          { label: 'Cart', to: '/cart' },
          { label: 'Orders', to: '/orders' },
          { label: 'Profile', to: '/profile' },
        ]
      : []),
  ];

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b-4 border-yellow-400 bg-brand shadow-lg">
      <div className="wrap flex items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <NavLink to="/" className="flex items-center gap-3" onClick={() => setOpen(false)}>
          <img src={logo} alt="BulldogEx" className="h-9 w-9 object-contain" />
          <p className="text-xl font-bold text-zinc-50">BulldogEx Shop</p>
        </NavLink>

        <nav className="hidden items-center gap-1 lg:flex">
          {allLinks.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.to === '/'} className={navLinkClassName}>
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <span className="hidden text-sm font-medium text-zinc-100 xl:inline">
                Hi, {user.name.split(' ')[0]}
              </span>
              <Button type="button" variant="secondary" onClick={handleLogout} className="hidden sm:inline-flex">
                Log Out
              </Button>
            </>
          ) : (
            <div className="hidden gap-2 sm:flex">
              <Button to="/auth/signin" variant="secondary">Log In</Button>
              <Button to="/auth/signup" variant="primary">Sign Up</Button>
            </div>
          )}

          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-label="Toggle menu"
            aria-expanded={open}
            className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-zinc-50 text-lg text-zinc-50 lg:hidden"
          >
            {open ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {open && (
        <nav className="border-t border-zinc-50/20 bg-brand px-4 py-4 lg:hidden">
          <div className="wrap flex flex-col gap-2">
            {allLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                className={navLinkClassName}
                onClick={() => setOpen(false)}
              >
                {link.label}
              </NavLink>
            ))}
            <div className="mt-2 flex gap-2 sm:hidden">
              {isAuthenticated ? (
                <Button type="button" onClick={handleLogout}>Log Out</Button>
              ) : (
                <>
                  <Button to="/auth/signin" onClick={() => setOpen(false)}>Log In</Button>
                  <Button to="/auth/signup" variant="primary" onClick={() => setOpen(false)}>Sign Up</Button>
                </>
              )}
            </div>
          </div>
        </nav>
      )}
    </header>
  );
};

export default NavBar;

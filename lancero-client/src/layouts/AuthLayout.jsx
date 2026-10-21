import { Link, Outlet } from 'react-router-dom';
import logo from '../assets/img/nubdexchange_logo.png';
import background from '../assets/img/nu-background.jpg';

const AuthLayout = () => {
  return (
    <section className="min-h-screen bg-zinc-100 text-zinc-900">
      <div className="grid min-h-screen w-full lg:grid-cols-[1fr_1fr]">
        {/* logo sits directly on the NU background, no boxes around it */}
        <div className="relative flex min-h-[18rem] flex-col items-center justify-center gap-6 overflow-hidden p-8 shadow-lg sm:p-10 lg:p-16">
          <img
            src={background}
            alt=""
            className="absolute inset-0 h-full w-full object-cover object-[75%_center]"
          />
          <div className="absolute inset-0 bg-brand/40" />

          <div className="relative z-10 flex flex-col items-center gap-6 text-center">
            <img src={logo} alt="BulldogEx" className="w-full max-w-[16rem] object-contain drop-shadow-2xl" />
            <div>
              <p className="text-2xl font-bold text-zinc-50 drop-shadow-md">BulldogEx Shop</p>
              <p className="mt-1 text-sm text-zinc-100 drop-shadow-md">Campus essentials, simple ordering.</p>
            </div>
          </div>
        </div>

        <main className="flex items-center bg-brand px-6 py-10 sm:px-10 lg:px-16">
          <div className="mx-auto w-full max-w-md">
            <div className="rounded-3xl bg-zinc-50 p-6 shadow-xl sm:p-8">
              <Outlet />
            </div>
            <p className="mt-6 text-center text-sm">
              <Link to="/" className="font-semibold text-zinc-100 underline hover:text-yellow-400">
                ← Back to the shop
              </Link>
            </p>
          </div>
        </main>
      </div>
    </section>
  );
};

export default AuthLayout;

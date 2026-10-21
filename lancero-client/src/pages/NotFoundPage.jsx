import Button from '../components/Button';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import PageHeader from '../components/PageHeader';
import logo from '../assets/img/nubdexchange_logo.png';

// NotFoundPage is used as an errorElement (outside the Layout), so it adds the nav and footer itself
const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-zinc-100 text-zinc-900">
      <NavBar />
      <main className="flex min-h-[calc(100vh-4rem)] flex-col gap-6 bg-brand pb-16 pt-20">
        <PageHeader eyebrow="Error" title="404 - Page not found" text="The page you're looking for doesn't exist or has been moved.">
          <Button to="/" variant="primary">Back Home</Button>
          <Button to="/products">View Products</Button>
        </PageHeader>

        <section className="band">
          <div className="wrap grid items-center gap-6 md:grid-cols-[auto_1fr]">
            <img src={logo} alt="" className="mx-auto h-32 w-32 object-contain" />
            <div>
              <p className="eyebrow">Quick Links</p>
              <h2 className="mt-2 text-2xl font-semibold text-zinc-900">Explore the site</h2>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="card">
                  <h3 className="font-semibold text-zinc-900">Home</h3>
                  <p className="mt-1 text-sm text-zinc-600">Return to the homepage</p>
                  <Button to="/" className="mt-3">Go Home</Button>
                </div>
                <div className="card">
                  <h3 className="font-semibold text-zinc-900">Products</h3>
                  <p className="mt-1 text-sm text-zinc-600">Browse all featured store items</p>
                  <Button to="/products" className="mt-3">View Products</Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default NotFoundPage;

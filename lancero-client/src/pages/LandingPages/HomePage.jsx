import Button from '../../components/Button';
import banner from '../../assets/img/nu_bulldogex_banner.jpg';
import essentials from '../../assets/img/essentials.jpg';
import supplies from '../../assets/img/supplies.jpg';
import apparels from '../../assets/img/apparels.jpg';

const stats = [
  { value: '08', label: 'Products' },
  { value: '06', label: 'Categories' },
  { value: '24', label: 'Orders' },
  { value: '03', label: 'Pickup Slots' },
];

const sections = [
  {
    image: essentials,
    title: 'Daily Essentials',
    text: 'Bags, tumblers, lanyards, and items used every school day.',
    to: '/products?category=Bags',
    button: 'View Products',
  },
  {
    image: supplies,
    title: 'Study Supplies',
    text: 'Notes, desk tools, and study kits for class and review weeks.',
    to: '/products?category=Stationery',
    button: 'Shop Supplies',
  },
  {
    image: apparels,
    title: 'Campus Apparel',
    text: 'Comfortable pieces for class days, commute days, and weekends.',
    to: '/products?category=Apparel',
    button: 'View Apparel',
  },
];

const HomePage = () => {
  return (
    <>
      <section className="relative min-h-[28rem] overflow-hidden bg-zinc-900 px-4 py-10 shadow-lg sm:px-6 lg:px-8">
        <img src={banner} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-zinc-900/45" />

        <div className="relative z-10 flex min-h-[22rem] items-start justify-end text-right sm:min-h-[24rem]">
          <div className="max-w-xl">
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-zinc-200">
              Campus Marketplace
            </p>
            <h1 className="text-3xl font-bold leading-tight text-zinc-50 sm:text-4xl">
              Welcome to BulldogEx Shop
            </h1>
            <p className="mt-4 text-sm leading-7 text-zinc-100 sm:text-base">
              Explore campus uniforms, student essentials, and school merch in one
              quick storefront.
            </p>
            <div className="mt-6 flex flex-wrap justify-end gap-3">
              <Button to="/products" variant="primary">Shop Now</Button>
              <Button to="/about">About Store</Button>
            </div>
          </div>
        </div>
      </section>

      <section className="band">
        <div className="wrap">
          <p className="eyebrow">Store Overview</p>
          <h2 className="mt-2 mb-6 text-2xl font-semibold text-zinc-900">Quick shopping blocks</h2>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="card-yellow">
                <p className="text-2xl font-bold text-zinc-900">{stat.value}</p>
                <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-zinc-900">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="band">
        <div className="wrap">
          <p className="eyebrow">Shop Sections</p>
          <h2 className="mt-2 mb-6 text-2xl font-semibold text-zinc-900">Simple store cards</h2>

          <div className="grid gap-4 md:grid-cols-3">
            {sections.map((item) => (
              <article key={item.title} className="card flex flex-col bg-blue-900">
                <div className="aspect-square overflow-hidden rounded-[1.25rem] bg-zinc-200">
                  <img src={item.image} alt={item.title} className="h-full w-full object-cover" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-zinc-100">{item.title}</h3>
                <p className="mt-3 flex-1 text-sm leading-6 text-zinc-300">{item.text}</p>
                <Button to={item.to} variant="primary" className="mt-4 self-start">{item.button}</Button>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default HomePage;

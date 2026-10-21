import Button from '../../components/Button';
import PageHeader from '../../components/PageHeader';
import jacket from '../../assets/img/jacket.png';
import sweatshirt from '../../assets/img/sweatshirt.png';
import shirt1 from '../../assets/img/shirt1.png';
import shirt2 from '../../assets/img/shirt2.png';

const stats = [
  { value: '08', label: 'Items' },
  { value: '06', label: 'Categories' },
  { value: '03', label: 'Pickup Slots' },
  { value: '24', label: 'Orders' },
];

const steps = [
  { title: 'Curated Catalog', text: 'Products are grouped by daily need so shoppers can scan faster.' },
  { title: 'Simple Checkout', text: 'Product pages keep price, stock, and action buttons easy to find.' },
  { title: 'Pickup Ready', text: 'Store information stays direct for students who need quick order updates.' },
];

const gallery = [
  { src: jacket, alt: 'Jacket' },
  { src: sweatshirt, alt: 'Sweatshirt' },
  { src: shirt1, alt: 'Shirt' },
  { src: shirt2, alt: 'Shirt' },
];

const AboutPage = () => {
  return (
    <>
      <PageHeader
        eyebrow="About Store"
        title="A campus shop focused on useful products and simple ordering."
        text="BulldogEx Shop keeps things simple, with clear product categories, quick actions, and straightforward store information."
      >
        <Button to="/products" variant="primary">Open Products</Button>
        <Button to="/">Back Home</Button>
      </PageHeader>

      <section className="band">
        <div className="wrap">
          <p className="eyebrow">Store Overview</p>
          <h2 className="mt-2 mb-6 text-2xl font-semibold text-zinc-900">Quick store blocks</h2>

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
        <div className="wrap grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="eyebrow">Store Flow</p>
            <h2 className="mt-2 text-2xl font-semibold text-zinc-900">How shopping works</h2>

            <div className="mt-6 space-y-4">
              {steps.map((step, index) => (
                <article key={step.title} className="card">
                  <p className="eyebrow">Step {index + 1}</p>
                  <h3 className="mt-1 text-lg font-semibold text-zinc-900">{step.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-zinc-600">{step.text}</p>
                </article>
              ))}
            </div>
          </div>

          <div className="card-yellow self-start">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-zinc-900">
              Category Grid
            </p>
            <div className="mt-5 grid grid-cols-2 gap-4">
              {gallery.map((item, index) => (
                <div key={index} className="aspect-square overflow-hidden rounded-[1.25rem] bg-zinc-200">
                  <img src={item.src} alt={item.alt} className="h-full w-full object-cover" />
                </div>
              ))}
            </div>
            <Button to="/products" className="mt-5">View Products</Button>
          </div>
        </div>
      </section>
    </>
  );
};

export default AboutPage;

import Button from './Button';

const ProductCard = ({ product, index }) => {
  return (
    <article className="card flex flex-col bg-blue-900">
      <div className="flex aspect-4/3 items-center justify-center overflow-hidden rounded-[1.25rem] bg-zinc-200">
        {product.image ? (
          <img src={product.image} alt={product.title} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-16 w-16 items-center justify-center border-2 border-zinc-300 bg-zinc-100 text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">
            Item
          </div>
        )}
      </div>
      <p className="eyebrow mt-4">
        {product.category} {String(index + 1).padStart(2, '0')}
      </p>
      <h3 className="mt-2 text-lg font-semibold text-zinc-100">{product.title}</h3>
      <p className="mt-2 text-base font-bold text-brand text-zinc-200">{product.price}</p>
      <p className="mt-3 flex-1 text-sm leading-6 text-zinc-300">
        {product.content[0].substring(0, 120)}...
      </p>
      <Button to={`/products/${product.name}`} variant="primary" className="mt-4 self-start">View Product</Button>
    </article>
  );
};

export default ProductCard;

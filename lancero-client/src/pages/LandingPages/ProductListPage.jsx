import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Button from '../../components/Button.jsx';
import PageHeader from '../../components/PageHeader.jsx';
import ProductList from '../../components/ProductList.jsx';
import { getCategories, getProducts } from '../../api/products.js';

const ProductListPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    getProducts({ search, category })
      .then(setProducts)
      .catch(() => setError('Products could not be loaded right now.'));
  }, [search, category]);

  useEffect(() => {
    getCategories().then(setCategories).catch(() => setCategories([]));
  }, []);

  const updateFilters = (nextSearch, nextCategory) => {
    const params = {};
    if (nextSearch) params.search = nextSearch;
    if (nextCategory) params.category = nextCategory;
    setSearchParams(params);
  };

  return (
    <>
      <PageHeader
        eyebrow="Products"
        title="Shop campus essentials in a simple product grid"
        text="Browse practical items for class, study, commute, and everyday campus routines."
      >
        <Button to="/">Back Home</Button>
      </PageHeader>

      <section className="band">
        <div className="wrap">
          <p className="eyebrow">Featured Products</p>
          <h2 className="mt-2 mb-6 text-2xl font-semibold text-zinc-900">Products Available</h2>

          <div className="mb-6 grid gap-3 sm:grid-cols-[1fr_auto]">
            <input
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                updateFilters(event.target.value, category);
              }}
              placeholder="Search products"
              aria-label="Search products"
              className="rounded-xl border-2 border-transparent bg-white shadow-md px-4 py-3 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-brand"
            />
            <select
              value={category}
              onChange={(event) => {
                setCategory(event.target.value);
                updateFilters(search, event.target.value);
              }}
              aria-label="Filter products by category"
              className="rounded-xl border-2 border-transparent bg-white shadow-md px-4 py-3 text-sm text-zinc-900 outline-none focus:border-brand"
            >
              <option value="">All categories</option>
              {categories.map((item) => (
                <option key={item._id} value={item.name}>{item.name}</option>
              ))}
            </select>
          </div>

          {error ? (
            <p className="alert-error">{error}</p>
          ) : products.length === 0 && (search || category) ? (
            <p className="text-zinc-700">No products match your search.</p>
          ) : products.length === 0 ? (
            <p className="text-zinc-700">Loading products...</p>
          ) : (
            <ProductList products={products} />
          )}
        </div>
      </section>
    </>
  );
}

export default ProductListPage

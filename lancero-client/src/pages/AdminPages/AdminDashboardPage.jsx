import { useEffect, useState } from 'react';
import api from '../../api/axiosInstance';
import Button from '../../components/Button.jsx';
import ProductImageInput from '../../components/ProductImageInput.jsx';

const panel = 'rounded-3xl bg-zinc-50 p-5 shadow-lg sm:p-6';
const input = 'w-full rounded-xl border-2 border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-zinc-900';
const fieldLabels = { name: 'Product name (slug)', title: 'Title', price: 'Price (PHP)', stock: 'Stock' };
const emptyProduct = { name: '', title: '', category: '', supplier: '', price: '', stock: '', content: '' };

const AdminDashboardPage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [users, setUsers] = useState([]);
  const [productForm, setProductForm] = useState(emptyProduct);
  const [editingProduct, setEditingProduct] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imageError, setImageError] = useState('');
  const [reviewEdits, setReviewEdits] = useState({});
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  const notify = (text, error = false) => { setMessage(text); setIsError(error); };
  const errorText = (error, fallback) => error.response?.data?.message || fallback;

  const loadData = async () => {
    const responses = await Promise.all([
      api.get('/product?limit=100'), api.get('/category'), api.get('/supplier'),
      api.get('/order'), api.get('/review'), api.get('/user'),
    ]);
    setProducts(responses[0].data.data);
    setCategories(responses[1].data);
    setSuppliers(responses[2].data);
    setOrders(responses[3].data);
    setReviews(responses[4].data);
    setUsers(responses[5].data);
  };

  // Data loading updates the management panels after the API responds.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { loadData().catch((error) => notify(errorText(error, 'Could not load admin data.'), true)); }, []);

  const updateProductField = (event) => setProductForm({ ...productForm, [event.target.name]: event.target.value });

  const saveProduct = async (event) => {
    event.preventDefault();
    // multipart/form-data so the image file can travel with the product fields
    const formData = new FormData();
    ['name', 'title', 'category', 'supplier', 'price', 'stock'].forEach((field) => formData.append(field, productForm[field]));
    productForm.content.split('\n').filter(Boolean).forEach((paragraph) => formData.append('content[]', paragraph));
    if (imageFile) formData.append('image', imageFile);
    try {
      if (editingProduct) await api.put(`/product/${editingProduct._id}`, formData);
      else await api.post('/product', formData);
      setProductForm(emptyProduct);
      setEditingProduct(null);
      setImageFile(null);
      setImageError('');
      notify('Product saved successfully.');
      await loadData();
    } catch (error) {
      const text = errorText(error, 'Could not save product.');
      // size / type problems are shown next to the image picker as well
      if (error.response?.status === 413 || /image/i.test(text)) setImageError(text);
      notify(text, true);
    }
  };

  const removeProductImage = async () => {
    if (!window.confirm('Remove this product image?')) return;
    try {
      await api.delete(`/product/${editingProduct._id}/image`);
      setEditingProduct({ ...editingProduct, image: '' });
      notify('Product image removed.');
      await loadData();
    } catch (error) { notify(errorText(error, 'Could not remove image.'), true); }
  };

  const startEditProduct = (product) => {
    setEditingProduct(product);
    setProductForm({ name: product.name, title: product.title, category: product.category?._id || '', supplier: product.supplier?._id || suppliers[0]?._id || '', price: product.price, stock: product.stock, content: product.content.join('\n') });
    setImageFile(null);
    setImageError('');
  };

  const changeOrderStatus = async (orderId, status) => {
    try { await api.patch(`/order/${orderId}/status`, { status }); notify('Order updated.'); await loadData(); }
    catch (error) { notify(errorText(error, 'Could not update order.'), true); }
  };
  const saveReview = async (review) => {
    const edit = reviewEdits[review._id] || {};
    try {
      await api.put(`/review/${review._id}`, { rating: Number(edit.rating ?? review.rating), comment: edit.comment ?? review.comment });
      notify('Review updated successfully.');
      await loadData();
    } catch (error) { notify(errorText(error, 'Could not update review.'), true); }
  };
  const updateUser = async (user) => {
    const name = window.prompt('Edit user name', user.name);
    if (!name) return;
    try { await api.put(`/user/${user._id}`, { name, email: user.email, role: user.role }); notify('User updated.'); await loadData(); }
    catch (error) { notify(errorText(error, 'Could not update user.'), true); }
  };
  const toggleUser = async (user) => {
    try { await api.patch(`/user/${user._id}/active`, { isActive: !user.isActive }); notify('User status updated.'); await loadData(); }
    catch (error) { notify(errorText(error, 'Could not update user status.'), true); }
  };

  return (
    <div className="wrap space-y-6 px-4 sm:px-6 lg:px-8">
      <div><p className="eyebrow-light mb-3">Admin</p><h1 className="text-3xl font-bold text-zinc-50 sm:text-4xl">Admin Dashboard</h1><p className="mt-3 text-sm text-zinc-100 sm:text-base">Manage products, orders, reviews, and customer accounts.</p></div>
      {message && <p className={isError ? 'alert-error' : 'alert-success'}>{message}</p>}

      <section className={panel}><h2 className="text-xl font-semibold text-zinc-900">Product Management</h2><form onSubmit={saveProduct} className="mt-4 grid gap-3 md:grid-cols-3">
        {['name', 'title', 'price', 'stock'].map((field) => <input key={field} name={field} value={productForm[field]} onChange={updateProductField} placeholder={fieldLabels[field]} aria-label={fieldLabels[field]} type={['price', 'stock'].includes(field) ? 'number' : 'text'} className={input} required={['name', 'title', 'price', 'stock'].includes(field)} />)}
        <select name="category" value={productForm.category} onChange={updateProductField} className={input} required><option value="">Category</option>{categories.map((item) => <option key={item._id} value={item._id}>{item.name}</option>)}</select>
        <select name="supplier" value={productForm.supplier} onChange={updateProductField} className={input} required><option value="">Supplier</option>{suppliers.map((item) => <option key={item._id} value={item._id}>{item.name}</option>)}</select>
        <textarea name="content" value={productForm.content} onChange={updateProductField} placeholder="Description paragraphs, one per line" className={`${input} md:col-span-2`} required />
        <ProductImageInput file={imageFile} currentImage={editingProduct?.image} error={imageError} onSelect={setImageFile} onError={setImageError} onClear={() => setImageFile(null)} onRemoveCurrent={editingProduct ? removeProductImage : undefined} />
        <Button type="submit" variant="primary" className="self-start md:col-span-3 md:w-fit">{editingProduct ? 'Save Product' : 'Create Product'}</Button>
      </form><div className="mt-6 space-y-2">{products.map((product) => <div key={product._id} className="flex flex-wrap items-center justify-between gap-3 border-t-2 border-zinc-200 py-3"><span className="flex items-center gap-3">{product.image ? <span className="h-12 w-12 shrink-0 overflow-hidden rounded bg-zinc-200"><img src={product.image} alt={product.title} className="h-full w-full object-cover" /></span> : <span className="flex h-12 w-12 items-center justify-center rounded border border-zinc-300 text-[10px] text-zinc-500">No img</span>}<span>{product.title} · PHP {product.price} · stock {product.stock}</span></span><Button onClick={() => startEditProduct(product)}>Edit</Button></div>)}</div></section>

      <section className={panel}><h2 className="text-xl font-semibold text-zinc-900">Order Management</h2><div className="mt-4 space-y-3">{orders.length === 0 && <p className="text-zinc-700">No orders yet.</p>}{orders.map((order) => <div key={order._id} className="border-t-2 border-zinc-200 py-3"><div className="flex flex-wrap justify-between gap-2"><span>Order {order._id.slice(-6)} · {order.user?.name || 'Customer'} · PHP {order.total.toLocaleString()}</span><strong className="capitalize">{order.status.replaceAll('_', ' ')}</strong></div><div className="mt-2 flex flex-wrap gap-2"><Button onClick={() => changeOrderStatus(order._id, 'confirmed')}>Confirm Order</Button><Button onClick={() => changeOrderStatus(order._id, 'ready_for_claiming')}>Ready for Claiming</Button></div></div>)}</div></section>

      <section className={panel}><h2 className="text-xl font-semibold text-zinc-900">Review Management</h2><div className="mt-4 space-y-3">{reviews.length === 0 && <p className="text-zinc-700">No reviews yet.</p>}{reviews.map((review) => <div key={review._id} className="border-t-2 border-zinc-200 py-3"><p className="font-semibold">{review.product?.title} · {review.user?.name || 'Customer'}</p><div className="mt-2 grid gap-2 md:grid-cols-[6rem_1fr_auto]"><input className={input} type="number" min="1" max="5" value={reviewEdits[review._id]?.rating ?? review.rating} onChange={(event) => setReviewEdits({ ...reviewEdits, [review._id]: { ...reviewEdits[review._id], rating: event.target.value } })} /><input className={input} value={reviewEdits[review._id]?.comment ?? review.comment} onChange={(event) => setReviewEdits({ ...reviewEdits, [review._id]: { ...reviewEdits[review._id], comment: event.target.value } })} /><Button onClick={() => saveReview(review)}>Save Review</Button></div></div>)}</div></section>

      <section className={panel}><h2 className="text-xl font-semibold text-zinc-900">User Management</h2><div className="mt-4 space-y-2">{users.map((user) => <div key={user._id} className="flex flex-wrap items-center justify-between gap-3 border-t-2 border-zinc-200 py-3"><span>{user.name} · {user.email} · <strong>{user.isActive ? 'Active' : 'Inactive'}</strong></span><div className="flex flex-wrap gap-2"><Button onClick={() => updateUser(user)}>Edit User</Button><Button onClick={() => toggleUser(user)}>{user.isActive ? 'Set Inactive' : 'Set Active'}</Button></div></div>)}</div></section>
    </div>
  );
};

export default AdminDashboardPage;

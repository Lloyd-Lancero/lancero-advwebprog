import { useEffect, useState } from 'react';
import Button from '../components/Button.jsx';
import PageHeader from '../components/PageHeader.jsx';
import { checkout, getMyCart } from '../api/cart.js';

const CartPage = () => {
  const [cart, setCart] = useState(null);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    getMyCart().then(setCart).catch(() => { setMessage('Could not load your cart.'); setIsError(true); });
  }, []);

  const total = cart?.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0) || 0;

  const placeOrder = async () => {
    try {
      await checkout();
      setCart({ ...cart, items: [] });
      setMessage('Order placed. Status: processing.');
      setIsError(false);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Could not place order.');
      setIsError(true);
    }
  };

  return (
    <>
      <PageHeader eyebrow="Cart" title="Your Cart" text="Review your items before placing your order for pickup." />

      <section className="band">
        <div className="wrap max-w-3xl">
          {message && <p className={`mb-6 ${isError ? 'alert-error' : 'alert-success'}`}>{message}</p>}

          {cart?.items.length ? (
            <>
              <div className="space-y-3">
                {cart.items.map((item) => (
                  <div key={item.product._id} className="card flex items-center gap-4 !p-4">
                    {item.product.image && (
                      <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-zinc-200">
                        <img src={item.product.image} alt={item.product.title} className="h-full w-full object-cover" />
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="font-semibold text-zinc-900">{item.product.title}</p>
                      <p className="text-sm text-zinc-500">Quantity: {item.quantity}</p>
                    </div>
                    <strong className="text-zinc-900">PHP {(item.product.price * item.quantity).toLocaleString()}</strong>
                  </div>
                ))}
              </div>

              <div className="card-yellow mt-6 flex flex-wrap items-center justify-between gap-4">
                <p className="text-xl font-bold text-zinc-900">Total: PHP {total.toLocaleString()}</p>
                <Button onClick={placeOrder}>Proceed with Order</Button>
              </div>
            </>
          ) : (
            <div className="card text-center">
              <p className="text-zinc-700">Your cart is empty.</p>
              <Button to="/products" variant="primary" className="mt-4">Browse Products</Button>
            </div>
          )}

          <div className="mt-6">
            <Button to="/orders">View Orders</Button>
          </div>
        </div>
      </section>
    </>
  );
};

export default CartPage;

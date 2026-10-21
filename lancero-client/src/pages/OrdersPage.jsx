import { useEffect, useState } from 'react';
import Button from '../components/Button.jsx';
import PageHeader from '../components/PageHeader.jsx';
import { getMyOrders } from '../api/cart.js';

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    getMyOrders()
      .then((data) => setOrders([...data].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))))
      .catch((err) => setError(err.response?.data?.message || 'Could not load your orders.'));
  }, []);

  return (
    <>
      <PageHeader eyebrow="Orders" title="My Orders" text="Track the status of your orders here." />

      <section className="band">
        <div className="wrap max-w-3xl">
          {error && <p className="alert-error mb-6">{error}</p>}

          <div className="space-y-4">
            {orders.map((order) => (
              <article key={order._id} className="card">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <strong className="text-zinc-900">Order {order._id.slice(-6)}</strong>
                  <span className="badge bg-yellow-400 capitalize">{order.status.replaceAll('_', ' ')}</span>
                </div>
                <p className="mt-3 text-sm text-zinc-700">
                  Total: <strong>PHP {order.total.toLocaleString()}</strong>
                </p>
              </article>
            ))}
          </div>

          {orders.length === 0 && !error && (
            <div className="card text-center">
              <p className="text-zinc-700">No orders yet.</p>
              <Button to="/products" variant="primary" className="mt-4">Start Shopping</Button>
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default OrdersPage;

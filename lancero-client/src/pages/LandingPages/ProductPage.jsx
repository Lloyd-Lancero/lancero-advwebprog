import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/Button.jsx';
import { createProductReview, getProductByName, getProductReviews } from '../../api/products.js';
import { addCartItem } from '../../api/cart.js';
import { useAuth } from '../../context/AuthContext.jsx';

function ProductPage() {
  const { name } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [result, setResult] = useState({ name: '', product: null, notFound: false });
  const [cartMessage, setCartMessage] = useState('');
  const [addingToCart, setAddingToCart] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [reviewsError, setReviewsError] = useState('');
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [reviewMessage, setReviewMessage] = useState('');

  useEffect(() => {
    getProductByName(name)
      .then(async (product) => {
        setResult({ name, product, notFound: false });
        try {
          setReviews(await getProductReviews(product._id));
        } catch {
          setReviewsError('Reviews could not be loaded.');
        }
      })
      .catch(() => setResult({ name, product: null, notFound: true }));
  }, [name]);

  const loading = result.name !== name;
  const product = result.product;

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      navigate('/auth/signin', { state: { from: { pathname: `/products/${name}` } } });
      return;
    }

    setAddingToCart(true);
    setCartMessage('');

    try {
      await addCartItem(product._id);
      setCartMessage('Added to cart.');
    } catch (error) {
      setCartMessage(error.response?.data?.message || 'Could not add this product to your cart.');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleReviewSubmit = async (event) => {
    event.preventDefault();
    if (!isAuthenticated) {
      navigate('/auth/signin', { state: { from: { pathname: `/products/${name}` } } });
      return;
    }
    try {
      const review = await createProductReview(product._id, Number(reviewForm.rating), reviewForm.comment);
      setReviews((current) => [review, ...current]);
      setReviewForm({ rating: 5, comment: '' });
      setReviewMessage('Review posted.');
    } catch (error) {
      setReviewMessage(error.response?.data?.message || 'Could not post review.');
    }
  };

  if (loading) {
    return <p className="p-8 text-zinc-100">Loading product...</p>;
  }

  if (result.notFound || !product) {
    return (
      <div className="flex w-full flex-col gap-6">
        <section className="bg-zinc-50 shadow-lg px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <h1 className="text-3xl font-bold text-zinc-900">Product not found</h1>
            <Button to="/products" className="mt-6">Back to Products</Button>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col gap-6">
      
      <section className="bg-brand shadow-lg px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="max-w-3xl">
          <div className="mb-4">
            <Button to="/products">Back to Products</Button>
          </div>
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-amber-300">
            {product.category}
          </p>
          <h1 className="text-3xl font-bold leading-tight text-amber-300 sm:text-4xl">
            {product.title}
          </h1>
          <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-amber-300">
            <span className="font-bold text-amber-300">{product.price}</span>
            <span>{product.stock}</span>
          </div>
        </div>
      </section>

      <section className="bg-brand shadow-lg px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <div className="mb-8 flex aspect-4/3 items-center justify-center overflow-hidden rounded-[1.25rem] bg-zinc-200 shadow-lg">
            {product.image ? (
              <img src={product.image} alt={product.title} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-24 w-24 items-center justify-center border-2 border-zinc-300 bg-zinc-100 text-[11px] font-semibold uppercase tracking-[0.24em] text-zinc-500">
                Item
              </div>
            )}
          </div>

          <div className="prose prose-sm max-w-none space-y-4 text-zinc-700">
            {product.content.map((paragraph, index) => (
              <p key={index} className="text-base leading-7 text-zinc-100 whitespace-pre-wrap">
                {paragraph}
              </p>
            ))}
          </div>

          <div className="mt-8 border-t-2 border-zinc-50/30 pt-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-amber-300">
              Reviews
            </p>
            {reviewsError ? (
              <p className="mt-3 text-sm text-zinc-100">{reviewsError}</p>
            ) : reviews.length === 0 ? (
              <p className="mt-3 text-sm text-zinc-100">No reviews yet.</p>
            ) : (
              <div className="mt-4 space-y-4">
                {reviews.map((review) => (
                  <article key={review._id} className="rounded-xl bg-zinc-50 p-4 text-zinc-900 shadow-lg">
                    <p className="font-semibold">{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</p>
                    <p className="mt-2 text-sm leading-6">{review.comment}</p>
                    <p className="mt-2 text-xs text-zinc-500">{review.user?.name || 'Shopper'}</p>
                  </article>
                ))}
              </div>
            )}
            <form className="mt-6 space-y-3" onSubmit={handleReviewSubmit}>
              <div className="flex gap-3">
                <label className="text-sm text-zinc-100">
                  Rating
                  <select value={reviewForm.rating} onChange={(event) => setReviewForm({ ...reviewForm, rating: event.target.value })} className="ml-2 rounded border px-2 py-1 text-zinc-900">
                    {[5, 4, 3, 2, 1].map((rating) => <option key={rating} value={rating}>{rating}</option>)}
                  </select>
                </label>
              </div>
              <textarea value={reviewForm.comment} onChange={(event) => setReviewForm({ ...reviewForm, comment: event.target.value })} placeholder="Write a review" required className="w-full rounded-xl bg-white p-3 text-sm text-zinc-900 shadow-md" />
              <Button type="submit" variant="primary">Post Review</Button>
              {reviewMessage && <p className="text-sm text-zinc-100">{reviewMessage}</p>}
            </form>
          </div>

          <div className="mt-8 border-t-2 border-zinc-50/30 pt-6">
            <Button
              variant="primary"
              className="mr-3"
              onClick={handleAddToCart}
              disabled={addingToCart}
            >
              {addingToCart ? 'Adding...' : 'Add to Cart'}
            </Button>
            <Button to="/products">Back to Products</Button>
            {cartMessage && (
              <p className="mt-4 text-sm text-zinc-100">{cartMessage}</p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

export default ProductPage;

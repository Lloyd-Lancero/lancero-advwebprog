import api from './axiosInstance';

const formatPrice = (price) => `PHP ${Number(price).toLocaleString('en-PH')}`;

const formatStock = (product) => {
  if (product.availability) {
    return product.availability;
  }

  if (product.stock === 0) {
    return 'Out of stock';
  }

  return product.stock < 10 ? 'Low stock' : 'In stock';
};

export const normalizeProduct = (product) => ({
  ...product,
  category: product.category?.name || product.category,
  price: formatPrice(product.price),
  stock: formatStock(product),
});

export const getProducts = async ({ search = '', category = '' } = {}) => {
  const response = await api.get('/product', {
    params: { search: search || undefined, category: category || undefined, limit: 100 },
  });
  // API response shape: { success, message, count, data: [...] }
  return response.data.data.map(normalizeProduct);
};

export const getProductByName = async (name) => {
  const response = await api.get(`/product/slug/${name}`);
  return normalizeProduct(response.data.data);
};

export const getProductReviews = async (productId) => {
  const response = await api.get(`/review/product/${productId}`);
  return response.data;
};

export const getCategories = async () => {
  const response = await api.get('/category');
  return response.data;
};

export const createProductReview = async (productId, rating, comment) => {
  const response = await api.post('/review', { product: productId, rating, comment });
  return response.data;
};
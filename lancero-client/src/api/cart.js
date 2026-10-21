import api from './axiosInstance';

export const addCartItem = async (productId, quantity = 1) => {
  const response = await api.post('/cart/items', { productId, quantity });
  return response.data;
};

export const getMyCart = async () => (await api.get('/cart/me')).data;
export const checkout = async () => (await api.post('/order')).data;
export const getMyOrders = async () => (await api.get('/order')).data;
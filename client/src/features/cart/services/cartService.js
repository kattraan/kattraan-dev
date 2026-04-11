import apiClient from '@/api/apiClient';

/**
 * GET /api/cart — get current user's cart items
 */
export async function getCart() {
  const res = await apiClient.get('/cart');
  const data = res?.data?.data ?? res?.data;
  return { items: data?.items ?? [], count: data?.count ?? 0 };
}

/**
 * GET /api/cart/count — get cart count only (for header badge)
 */
export async function getCartCount() {
  const res = await apiClient.get('/cart/count');
  return res?.data?.count ?? 0;
}

/**
 * POST /api/cart/add — add course to cart. Body: { courseId }
 */
export async function addToCart(courseId) {
  const res = await apiClient.post('/cart/add', { courseId });
  const data = res?.data?.data ?? res?.data;
  return { items: data?.items ?? [], count: data?.count ?? 0 };
}

/**
 * DELETE /api/cart/remove/:courseId — remove course from cart
 */
export async function removeFromCart(courseId) {
  const res = await apiClient.delete(`/cart/remove/${courseId}`);
  const data = res?.data?.data ?? res?.data;
  return { items: data?.items ?? [], count: data?.count ?? 0 };
}

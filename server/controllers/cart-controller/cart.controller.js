const Cart = require('../../models/Cart');
const Course = require('../../models/Course');

/**
 * GET /api/cart
 * Returns the authenticated user's cart (list of items with course details).
 */
async function getCart(req, res) {
  try {
    const userId = req.user._id.toString();
    let cart = await Cart.findOne({ userId }).lean();
    if (!cart) {
      return res.json({ success: true, data: { items: [], count: 0 } });
    }
    const items = cart.items || [];
    res.json({ success: true, data: { items, count: items.length } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * GET /api/cart/count
 * Returns only the number of items in the cart (for header badge).
 */
async function getCartCount(req, res) {
  try {
    const userId = req.user._id.toString();
    const cart = await Cart.findOne({ userId }).select('items').lean();
    const count = (cart?.items || []).length;
    res.json({ success: true, count });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * POST /api/cart/add
 * Body: { courseId }
 * Adds a course to the cart. Fetches title, price, thumbnail from Course.
 */
async function addToCart(req, res) {
  try {
    const userId = req.user._id.toString();
    const { courseId } = req.body;
    if (!courseId) {
      return res.status(400).json({ success: false, message: 'courseId is required' });
    }

    const course = await Course.findOne({ _id: courseId, isDeleted: false })
      .select('title price thumbnail status')
      .lean();
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }
    if (course.status !== 'published') {
      return res.status(400).json({ success: false, message: 'Course is not available for purchase' });
    }

    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = new Cart({ userId, items: [] });
    }
    const exists = cart.items.some((i) => i.courseId.toString() === courseId.toString());
    if (exists) {
      return res.json({ success: true, message: 'Already in cart', data: { items: cart.items, count: cart.items.length } });
    }
    cart.items.push({
      courseId: course._id.toString(),
      title: course.title || 'Untitled',
      price: course.price ?? 0,
      thumbnail: course.thumbnail || '',
      addedAt: new Date(),
    });
    await cart.save();
    res.json({
      success: true,
      message: 'Added to cart',
      data: { items: cart.items, count: cart.items.length },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * DELETE /api/cart/remove/:courseId
 * Removes a course from the cart.
 */
async function removeFromCart(req, res) {
  try {
    const userId = req.user._id.toString();
    const { courseId } = req.params;
    if (!courseId) {
      return res.status(400).json({ success: false, message: 'courseId is required' });
    }

    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.json({ success: true, data: { items: [], count: 0 } });
    }
    cart.items = cart.items.filter((i) => i.courseId.toString() !== courseId.toString());
    await cart.save();
    res.json({ success: true, data: { items: cart.items, count: cart.items.length } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

module.exports = { getCart, getCartCount, addToCart, removeFromCart };

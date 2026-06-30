/* ============================================
   Middle2Class Shop - Data Management
   ============================================ */

const STORE_KEY = 'middle2class_products';
const REVIEWS_KEY = 'middle2class_reviews';
const ADMIN_KEY = 'middle2class_admin';

// Default admin password (change in production)
const ADMIN_PASSWORD = 'admin123';

// Sample products data
const defaultProducts = [
  {
    id: 1,
    name: 'Silver Butterfly Necklace',
    category: 'jewellery',
    price: 599,
    originalPrice: 799,
    stock: 12,
    image: '',
    emoji: '🦋',
    description: 'A beautiful handcrafted silver butterfly pendant necklace. Perfect for everyday wear or special occasions. Made with 925 sterling silver.',
    rating: 4.5,
    ratingCount: 23
  },
  {
    id: 2,
    name: 'Rose Gold Hoop Earrings',
    category: 'jewellery',
    price: 399,
    originalPrice: 499,
    stock: 8,
    image: '',
    emoji: '💎',
    description: 'Elegant rose gold plated hoop earrings with a polished finish. Lightweight and comfortable for all-day wear.',
    rating: 4.8,
    ratingCount: 45
  },
  {
    id: 3,
    name: 'Pearl Charm Bracelet',
    category: 'jewellery',
    price: 299,
    originalPrice: 399,
    stock: 20,
    image: '',
    emoji: '📿',
    description: 'Delicate freshwater pearl bracelet with adjustable chain. A timeless piece that adds grace to any outfit.',
    rating: 4.3,
    ratingCount: 18
  },
  {
    id: 4,
    name: 'Gold Plated Ring Set',
    category: 'jewellery',
    price: 450,
    originalPrice: 600,
    stock: 5,
    image: '',
    emoji: '💍',
    description: 'Set of 3 stackable gold plated rings. Minimalist design with a touch of elegance. Perfect for layering.',
    rating: 4.6,
    ratingCount: 32
  },
  {
    id: 5,
    name: 'A5 Spiral Notebook - Dotted',
    category: 'books-copies',
    price: 89,
    originalPrice: 120,
    stock: 50,
    image: '',
    emoji: '📓',
    description: 'A5 size spiral bound notebook with dotted pages. 120 pages of premium 80gsm paper. Ideal for journaling, bullet journaling, or note-taking.',
    rating: 4.7,
    ratingCount: 67
  },
  {
    id: 6,
    name: 'Cute Cat Sticky Notes Pack',
    category: 'books-copies',
    price: 45,
    originalPrice: 60,
    stock: 100,
    image: '',
    emoji: '🐱',
    description: 'Adorable cat-shaped sticky notes in 5 pastel colors. 100 sheets per pad. Perfect for reminders, bookmarks, and decoration.',
    rating: 4.9,
    ratingCount: 89
  },
  {
    id: 7,
    name: 'Leather Bound Journal',
    category: 'books-copies',
    price: 249,
    originalPrice: 349,
    stock: 15,
    image: '',
    emoji: '📔',
    description: 'Handcrafted leather bound journal with vintage lock. 200 lined pages with ribbon bookmark. Makes a perfect gift.',
    rating: 4.4,
    ratingCount: 41
  },
  {
    id: 8,
    name: 'Pastel Highlighter Set (12)',
    category: 'books-copies',
    price: 120,
    originalPrice: 180,
    stock: 30,
    image: '',
    emoji: '🖍️',
    description: 'Set of 12 pastel highlighters in soft aesthetic colors. Mild ink that does not bleed through. Perfect for students and planners.',
    rating: 4.6,
    ratingCount: 55
  },
  {
    id: 9,
    name: 'Crystal Heart Pendant',
    category: 'jewellery',
    price: 350,
    originalPrice: 450,
    stock: 9,
    image: '',
    emoji: '💗',
    description: 'Sparkling crystal heart pendant on a delicate chain. Adjustable length 16-18 inches. A lovely gift for someone special.',
    rating: 4.5,
    ratingCount: 28
  },
  {
    id: 10,
    name: 'Washi Tape Collection (10)',
    category: 'books-copies',
    price: 199,
    originalPrice: 299,
    stock: 40,
    image: '',
    emoji: '🎀',
    description: 'Set of 10 decorative washi tapes in floral, geometric, and solid patterns. 15mm wide, 5 meters each. Great for scrapbooking and journaling.',
    rating: 4.8,
    ratingCount: 72
  }
];

const defaultReviews = {
  1: [
    { name: 'Priya Sharma', date: '2025-01-15', rating: 5, text: 'Absolutely gorgeous! The butterfly detail is so delicate and pretty. Got so many compliments!' },
    { name: 'Anjali K.', date: '2025-01-10', rating: 4, text: 'Lovely necklace, great quality. Shipping was quick too.' },
    { name: 'Riya Mehta', date: '2024-12-28', rating: 5, text: 'Bought this as a gift for my sister. She loved it! The packaging was cute too.' }
  ],
  5: [
    { name: 'StudentLife', date: '2025-01-20', rating: 5, text: 'Best dotted notebook I have used. The paper quality is amazing and the spiral binding makes it easy to flip.' },
    { name: 'ArtLover', date: '2025-01-05', rating: 4, text: 'Good for bullet journaling. Would love more color options though.' }
  ],
  6: [
    { name: 'Kavya', date: '2025-01-18', rating: 5, text: 'These sticky notes are the cutest thing ever! The cat shapes make studying so much more fun.' },
    { name: 'Meera', date: '2025-01-12', rating: 5, text: 'Bought 3 packs for my friends. Everyone loved them. Great adhesive too.' }
  ]
};

/* ============================================
   DATA FUNCTIONS
   ============================================ */

function getProducts() {
  const data = localStorage.getItem(STORE_KEY);
  if (data) {
    try { return JSON.parse(data); } catch (e) { console.error('Error parsing products', e); }
  }
  return [...defaultProducts];
}

function saveProducts(products) {
  localStorage.setItem(STORE_KEY, JSON.stringify(products));
}

function getProductById(id) {
  return getProducts().find(p => p.id === Number(id));
}

function getReviews(productId) {
  const data = localStorage.getItem(REVIEWS_KEY);
  if (data) {
    try {
      const all = JSON.parse(data);
      return all[productId] || defaultReviews[productId] || [];
    } catch (e) { console.error('Error parsing reviews', e); }
  }
  return defaultReviews[productId] || [];
}

function saveReview(productId, review) {
  const data = localStorage.getItem(REVIEWS_KEY);
  let all = {};
  if (data) {
    try { all = JSON.parse(data); } catch (e) {}
  }
  if (!all[productId]) all[productId] = [];
  all[productId].unshift(review);
  localStorage.setItem(REVIEWS_KEY, JSON.stringify(all));
}

function addProduct(product) {
  const products = getProducts();
  const newId = Math.max(...products.map(p => p.id), 0) + 1;
  const newProduct = {
    ...product,
    id: newId,
    emoji: product.emoji || getEmojiForCategory(product.category),
    rating: 0,
    ratingCount: 0
  };
  products.push(newProduct);
  saveProducts(products);
  return newProduct;
}

function updateProduct(id, updates) {
  const products = getProducts();
  const idx = products.findIndex(p => p.id === Number(id));
  if (idx !== -1) {
    products[idx] = { ...products[idx], ...updates };
    saveProducts(products);
    return products[idx];
  }
  return null;
}

function deleteProduct(id) {
  const products = getProducts();
  const filtered = products.filter(p => p.id !== Number(id));
  saveProducts(filtered);
}

function getEmojiForCategory(category) {
  const emojis = {
    'jewellery': '💎',
    'books-copies': '📚'
  };
  return emojis[category] || '📦';
}

function getCategoryName(category) {
  const names = {
    'jewellery': 'Jewellery',
    'books-copies': 'Books & Copies'
  };
  return names[category] || category;
}

function filterProducts(category, search) {
  let products = getProducts();
  if (category && category !== 'all') {
    products = products.filter(p => p.category === category);
  }
  if (search && search.trim()) {
    const s = search.toLowerCase().trim();
    products = products.filter(p =>
      p.name.toLowerCase().includes(s) ||
      p.description.toLowerCase().includes(s) ||
      getCategoryName(p.category).toLowerCase().includes(s)
    );
  }
  return products;
}

function isAdminLoggedIn() {
  return sessionStorage.getItem(ADMIN_KEY) === 'true';
}

function adminLogin(password) {
  if (password === ADMIN_PASSWORD) {
    sessionStorage.setItem(ADMIN_KEY, 'true');
    return true;
  }
  return false;
}

function adminLogout() {
  sessionStorage.removeItem(ADMIN_KEY);
}

function resetData() {
  localStorage.removeItem(STORE_KEY);
  localStorage.removeItem(REVIEWS_KEY);
}

// Export for use in other scripts
if (typeof window !== 'undefined') {
  window.DataStore = {
    getProducts,
    saveProducts,
    getProductById,
    getReviews,
    saveReview,
    addProduct,
    updateProduct,
    deleteProduct,
    getEmojiForCategory,
    getCategoryName,
    filterProducts,
    isAdminLoggedIn,
    adminLogin,
    adminLogout,
    resetData,
    defaultProducts,
    defaultReviews
  };
}

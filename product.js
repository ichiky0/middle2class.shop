/* ============================================
   Middle2Class Shop - Product Detail Script
   ============================================ */

(function() {
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get('id');
  const productDetail = document.getElementById('productDetail');
  const reviewsList = document.getElementById('reviewsList');
  const toast = document.getElementById('toast');
  const searchInput = document.getElementById('searchInput');
  const searchBtn = document.getElementById('searchBtn');

  let product = null;

  function renderStars(rating) {
    let html = '';
    for (let i = 1; i <= 5; i++) {
      html += i <= Math.round(rating) ? '<span class="star">&#11088;</span>' : '<span class="star empty">&#11088;</span>';
    }
    return html;
  }

  function formatDate(dateStr) {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
  }

  function showToast(message, type = 'success') {
    toast.textContent = message;
    toast.className = `toast ${type} show`;
    setTimeout(() => {
      toast.classList.remove('show');
    }, 3000);
  }

  function renderProduct() {
    product = DataStore.getProductById(Number(productId));
    if (!product) {
      productDetail.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 40px;">
          <div style="font-size: 4rem; margin-bottom: 15px;">&#128543;</div>
          <h3>Product not found</h3>
          <p style="color: var(--text-medium);">The product you're looking for doesn't exist.</p>
        </div>
      `;
      return;
    }

    const imageHtml = product.image
      ? `<img src="${product.image}" alt="${product.name}">`
      : `<span style="font-size: 6rem;">${product.emoji || '&#128230;'}</span>`;

    const originalPriceHtml = product.originalPrice && product.originalPrice > product.price
      ? `<span style="font-size: 1.2rem; color: var(--text-light); text-decoration: line-through; font-weight: 500;">&#8377;${product.originalPrice}</span>`
      : '';

    const ratingHtml = product.rating > 0
      ? `<div class="detail-rating"><span class="stars">${renderStars(product.rating)}</span><span class="rating-count">(${product.ratingCount} reviews)</span></div>`
      : '<div class="detail-rating"><span class="rating-count">No reviews yet</span></div>';

    const stockText = product.stock === 0 ? 'Out of Stock' : `${product.stock} available in store`;
    const stockIcon = product.stock === 0 ? '&#128683;' : '&#128717;';

    productDetail.innerHTML = `
      <div class="detail-image">${imageHtml}</div>
      <div class="detail-info">
        <span class="category">${DataStore.getCategoryName(product.category)}</span>
        <h2>${product.name}</h2>
        <div class="detail-price">&#8377;${product.price} ${originalPriceHtml}</div>
        <div class="detail-stock">${stockIcon} ${stockText}</div>
        <div class="detail-description">${product.description || 'No description available.'}</div>
        ${ratingHtml}
      </div>
    `;
  }

  function renderReviews() {
    const reviews = DataStore.getReviews(Number(productId));
    reviewsList.innerHTML = '';

    if (reviews.length === 0) {
      reviewsList.innerHTML = `
        <div style="text-align: center; padding: 30px; color: var(--text-light);">
          <div style="font-size: 3rem; margin-bottom: 10px;">&#128172;</div>
          <p>No reviews yet. Be the first to review!</p>
        </div>
      `;
      return;
    }

    reviews.forEach(r => {
      const item = document.createElement('div');
      item.className = 'review-item';
      item.innerHTML = `
        <div class="review-header">
          <span class="reviewer-name">${r.name}</span>
          <span class="review-date">${formatDate(r.date)}</span>
        </div>
        <div style="margin-bottom: 5px;">${renderStars(r.rating)}</div>
        <div class="review-text">${r.text}</div>
      `;
      reviewsList.appendChild(item);
    });
  }

  // Submit review
  document.getElementById('submitReview').addEventListener('click', () => {
    const name = document.getElementById('reviewerName').value.trim();
    const rating = Number(document.getElementById('reviewerRating').value);
    const text = document.getElementById('reviewerText').value.trim();

    if (!name || !text) {
      showToast('Please fill in your name and review!', 'error');
      return;
    }

    const review = {
      name,
      rating,
      text,
      date: new Date().toISOString().split('T')[0]
    };

    DataStore.saveReview(Number(productId), review);
    renderReviews();

    // Update product rating
    if (product) {
      const reviews = DataStore.getReviews(Number(productId));
      const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
      DataStore.updateProduct(productId, { rating: avgRating, ratingCount: reviews.length });
      renderProduct();
    }

    document.getElementById('reviewerName').value = '';
    document.getElementById('reviewerText').value = '';
    showToast('Review submitted! Thank you! &#128150;');
  });

  // Search
  searchBtn.addEventListener('click', () => {
    const q = searchInput.value.trim();
    if (q) window.location.href = `index.html?search=${encodeURIComponent(q)}`;
  });
  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const q = searchInput.value.trim();
      if (q) window.location.href = `index.html?search=${encodeURIComponent(q)}`;
    }
  });

  // Initialize
  renderProduct();
  renderReviews();
})();

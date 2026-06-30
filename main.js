/* ============================================
   Middle2Class Shop - Main Page Script
   ============================================ */

(function() {
  const productGrid = document.getElementById('productGrid');
  const emptyState = document.getElementById('emptyState');
  const searchInput = document.getElementById('searchInput');
  const searchBtn = document.getElementById('searchBtn');
  const categoryBtns = document.querySelectorAll('.category-btn');
  const toast = document.getElementById('toast');

  let currentCategory = 'all';
  let currentSearch = '';

  function renderStars(rating) {
    let html = '';
    for (let i = 1; i <= 5; i++) {
      html += i <= Math.round(rating) ? '<span class="star">&#11088;</span>' : '<span class="star empty">&#11088;</span>';
    }
    return html;
  }

  function getStockDot(stock) {
    if (stock === 0) return 'out';
    if (stock <= 5) return 'low';
    return '';
  }

  function getStockText(stock) {
    if (stock === 0) return 'Out of Stock';
    if (stock <= 5) return `Only ${stock} left`;
    return `${stock} available`;
  }

  function renderProducts() {
    const products = DataStore.filterProducts(currentCategory, currentSearch);
    productGrid.innerHTML = '';

    if (products.length === 0) {
      emptyState.classList.remove('hidden');
      productGrid.classList.add('hidden');
      return;
    }

    emptyState.classList.add('hidden');
    productGrid.classList.remove('hidden');

    products.forEach(p => {
      const card = document.createElement('div');
      card.className = 'product-card';
      card.onclick = () => {
        window.location.href = `product.html?id=${p.id}`;
      };

      const imageHtml = p.image
        ? `<img src="${p.image}" alt="${p.name}">`
        : `<span style="font-size: 4rem;">${p.emoji || '&#128230;'}</span>`;

      const originalPriceHtml = p.originalPrice && p.originalPrice > p.price
        ? `<span class="original">&#8377;${p.originalPrice}</span>`
        : '';

      const ratingHtml = p.rating > 0
        ? `<div class="product-rating">${renderStars(p.rating)} <span style="color: var(--text-light); font-size: 0.8rem;">(${p.ratingCount})</span></div>`
        : '';

      card.innerHTML = `
        <div class="product-image">${imageHtml}</div>
        <div class="product-info">
          <span class="product-category-tag">${DataStore.getCategoryName(p.category)}</span>
          <div class="product-name">${p.name}</div>
          <div class="product-price">&#8377;${p.price}${originalPriceHtml}</div>
          ${ratingHtml}
          <div class="product-stock">
            <span class="stock-dot ${getStockDot(p.stock)}"></span>
            ${getStockText(p.stock)}
          </div>
        </div>
      `;

      productGrid.appendChild(card);
    });
  }

  function showToast(message, type = 'success') {
    toast.textContent = message;
    toast.className = `toast ${type} show`;
    setTimeout(() => {
      toast.classList.remove('show');
    }, 3000);
  }

  // Search
  function doSearch() {
    currentSearch = searchInput.value;
    renderProducts();
  }

  searchBtn.addEventListener('click', doSearch);
  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') doSearch();
  });
  searchInput.addEventListener('input', () => {
    currentSearch = searchInput.value;
    renderProducts();
  });

  // Category filter
  categoryBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      categoryBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentCategory = btn.dataset.category;
      renderProducts();
    });
  });

  // Check URL for search param
  const urlParams = new URLSearchParams(window.location.search);
  const urlSearch = urlParams.get('search');
  if (urlSearch) {
    searchInput.value = urlSearch;
    currentSearch = urlSearch;
  }

  // Initial render
  renderProducts();
})();

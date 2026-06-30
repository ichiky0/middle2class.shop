/* ============================================
   Middle2Class Shop - Admin Panel Script
   ============================================ */

(function() {
  const loginModal = document.getElementById('loginModal');
  const adminContent = document.getElementById('adminContent');
  const adminPassword = document.getElementById('adminPassword');
  const loginBtn = document.getElementById('loginBtn');
  const logoutBtn = document.getElementById('logoutBtn');
  const toast = document.getElementById('toast');
  const addProductForm = document.getElementById('addProductForm');
  const adminTableBody = document.getElementById('adminTableBody');
  const excelFile = document.getElementById('excelFile');
  const excelUploadArea = document.getElementById('excelUploadArea');
  const processExcel = document.getElementById('processExcel');
  const downloadTemplate = document.getElementById('downloadTemplate');
  const resetDataBtn = document.getElementById('resetDataBtn');

  let uploadedFile = null;

  function showToast(message, type = 'success') {
    toast.textContent = message;
    toast.className = `toast ${type} show`;
    setTimeout(() => {
      toast.classList.remove('show');
    }, 3000);
  }

  // Login check
  function checkLogin() {
    if (!DataStore.isAdminLoggedIn()) {
      loginModal.classList.add('active');
      adminContent.style.display = 'none';
    } else {
      loginModal.classList.remove('active');
      adminContent.style.display = 'block';
      renderProductTable();
    }
  }

  loginBtn.addEventListener('click', () => {
    if (DataStore.adminLogin(adminPassword.value)) {
      showToast('Welcome, Admin! &#128075;');
      checkLogin();
    } else {
      showToast('Wrong password! Try again.', 'error');
      adminPassword.value = '';
    }
  });

  adminPassword.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') loginBtn.click();
  });

  logoutBtn.addEventListener('click', () => {
    DataStore.adminLogout();
    showToast('Logged out successfully.');
    setTimeout(() => {
      window.location.href = 'index.html';
    }, 1000);
  });

  // Render product table
  function renderProductTable() {
    const products = DataStore.getProducts();
    adminTableBody.innerHTML = '';

    products.forEach(p => {
      const tr = document.createElement('tr');
      const imgCell = p.image
        ? `<img src="${p.image}" alt="${p.name}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 10px;">`
        : `<div class="table-img">${p.emoji || '&#128230;'}</div>`;

      tr.innerHTML = `
        <td>${imgCell}</td>
        <td><strong>${p.name}</strong></td>
        <td>${DataStore.getCategoryName(p.category)}</td>
        <td>&#8377;${p.price}</td>
        <td>${p.stock}</td>
        <td>
          <div class="actions">
            <button class="action-btn delete" data-id="${p.id}">&#128465;</button>
          </div>
        </td>
      `;
      adminTableBody.appendChild(tr);
    });

    // Attach delete handlers
    document.querySelectorAll('.action-btn.delete').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        if (confirm('Are you sure you want to delete this product?')) {
          DataStore.deleteProduct(id);
          renderProductTable();
          showToast('Product deleted!');
        }
      });
    });
  }

  // Add product
  addProductForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const product = {
      name: document.getElementById('newName').value.trim(),
      category: document.getElementById('newCategory').value,
      price: Number(document.getElementById('newPrice').value),
      originalPrice: Number(document.getElementById('newOriginalPrice').value) || 0,
      stock: Number(document.getElementById('newStock').value),
      image: document.getElementById('newImage').value.trim(),
      emoji: document.getElementById('newEmoji').value.trim(),
      description: document.getElementById('newDescription').value.trim()
    };

    DataStore.addProduct(product);
    addProductForm.reset();
    renderProductTable();
    showToast('Product added successfully! &#127881;');
  });

  // Excel / CSV handling
  excelUploadArea.addEventListener('click', () => excelFile.click());
  excelUploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    excelUploadArea.style.borderColor = 'var(--aqua)';
  });
  excelUploadArea.addEventListener('dragleave', () => {
    excelUploadArea.style.borderColor = 'var(--aqua-light)';
  });
  excelUploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    excelUploadArea.style.borderColor = 'var(--aqua-light)';
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFile(files[0]);
    }
  });

  excelFile.addEventListener('change', () => {
    if (excelFile.files.length > 0) {
      handleFile(excelFile.files[0]);
    }
  });

  function handleFile(file) {
    uploadedFile = file;
    const label = excelUploadArea.querySelector('.excel-upload-label span:nth-child(2)');
    label.textContent = `Selected: ${file.name}`;
    processExcel.disabled = false;
  }

  // Simple CSV parser
  function parseCSV(text) {
    const lines = text.split(/\r?\n/).filter(l => l.trim());
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const rows = [];
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',');
      const obj = {};
      headers.forEach((h, idx) => {
        obj[h] = values[idx] ? values[idx].trim() : '';
      });
      rows.push(obj);
    }
    return rows;
  }

  processExcel.addEventListener('click', () => {
    if (!uploadedFile) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      const rows = parseCSV(text);
      let added = 0;

      rows.forEach(row => {
        const name = row.name || row.productname || row.product || row['product name'] || '';
        const category = row.category || row.type || '';
        const price = Number(row.price || row.mrp || 0);
        const originalPrice = Number(row.originalprice || row.original || 0);
        const stock = Number(row.stock || row.quantity || row.qty || 0);
        const description = row.description || row.desc || row.details || '';
        const emoji = row.emoji || row.icon || '';

        if (name && category && price > 0) {
          const cat = category.toLowerCase().includes('jewel') ? 'jewellery' :
                      category.toLowerCase().includes('book') || category.toLowerCase().includes('copy') ? 'books-copies' : 'jewellery';

          DataStore.addProduct({
            name,
            category: cat,
            price,
            originalPrice,
            stock,
            description,
            emoji,
            image: row.image || row.img || row.imageurl || ''
          });
          added++;
        }
      });

      renderProductTable();
      showToast(`Added ${added} products from file! &#127881;`);
      uploadedFile = null;
      processExcel.disabled = true;
      const label = excelUploadArea.querySelector('.excel-upload-label span:nth-child(2)');
      label.textContent = 'Click or drag file here';
      excelFile.value = '';
    };
    reader.readAsText(uploadedFile);
  });

  // Download template
  downloadTemplate.addEventListener('click', () => {
    const template = 'name,category,price,originalPrice,stock,description,emoji\nSilver Necklace,jewellery,599,799,10,Beautiful silver necklace,&#128141;\nA5 Notebook,books-copies,89,120,50,Spiral notebook with dotted pages,&#128211;';
    const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'product_template.csv';
    a.click();
    URL.revokeObjectURL(url);
    showToast('Template downloaded! &#128229;');
  });

  // Reset data
  resetDataBtn.addEventListener('click', () => {
    if (confirm('WARNING: This will delete ALL products and reviews and reset to defaults. Are you sure?')) {
      DataStore.resetData();
      renderProductTable();
      showToast('All data has been reset to defaults.');
    }
  });

  // Initialize
  checkLogin();
})();

/* ============================================
   Middle2Class Shop - Admin Panel Script
   ============================================ */

(function() {
  // SECURITY: Always clear any previous admin session on page load
  // This ensures the admin password is ALWAYS required
  DataStore.adminLogout();

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

  function showToast(message, type) {
    toast.textContent = message;
    toast.className = 'toast ' + (type || 'success') + ' show';
    setTimeout(function() {
      toast.classList.remove('show');
    }, 3000);
  }

  // Show login modal, hide admin content
  function showLogin() {
    loginModal.style.display = 'flex';
    loginModal.style.visibility = 'visible';
    loginModal.style.opacity = '1';
    adminContent.style.display = 'none';
  }

  // Show admin content, hide login modal
  function showAdmin() {
    loginModal.style.display = 'none';
    loginModal.style.visibility = 'hidden';
    loginModal.style.opacity = '0';
    adminContent.style.display = 'block';
    renderProductTable();
  }

  // Login check - ALWAYS require password on page load
  function checkLogin() {
    if (DataStore.isAdminLoggedIn()) {
      showAdmin();
    } else {
      showLogin();
    }
  }

  loginBtn.addEventListener('click', function() {
    if (DataStore.adminLogin(adminPassword.value)) {
      showToast('Welcome, Admin!');
      showAdmin();
    } else {
      showToast('Wrong password! Try again.', 'error');
      adminPassword.value = '';
    }
  });

  adminPassword.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') loginBtn.click();
  });

  logoutBtn.addEventListener('click', function() {
    DataStore.adminLogout();
    showToast('Logged out successfully.');
    setTimeout(function() {
      window.location.href = 'index.html';
    }, 1000);
  });

  // Render product table
  function renderProductTable() {
    var products = DataStore.getProducts();
    adminTableBody.innerHTML = '';

    products.forEach(function(p) {
      var tr = document.createElement('tr');
      var imgCell = p.image
        ? '<img src="' + p.image + '" alt="' + p.name + '" style="width: 50px; height: 50px; object-fit: cover; border-radius: 10px;">'
        : '<div class="table-img">' + (p.emoji || '&#128230;') + '</div>';

      tr.innerHTML = '<td>' + imgCell + '</td>' +
        '<td><strong>' + p.name + '</strong></td>' +
        '<td>' + DataStore.getCategoryName(p.category) + '</td>' +
        '<td>&#8377;' + p.price + '</td>' +
        '<td>' + p.stock + '</td>' +
        '<td><div class="actions"><button class="action-btn delete" data-id="' + p.id + '">&#128465;</button></div></td>';
      adminTableBody.appendChild(tr);
    });

    // Attach delete handlers
    document.querySelectorAll('.action-btn.delete').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var id = btn.dataset.id;
        if (confirm('Are you sure you want to delete this product?')) {
          DataStore.deleteProduct(id);
          renderProductTable();
          showToast('Product deleted!');
        }
      });
    });
  }

  // Add product
  addProductForm.addEventListener('submit', function(e) {
    e.preventDefault();
    var product = {
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
    showToast('Product added successfully!');
  });

  // Excel / CSV handling
  excelUploadArea.addEventListener('click', function() { excelFile.click(); });
  excelUploadArea.addEventListener('dragover', function(e) {
    e.preventDefault();
    excelUploadArea.style.borderColor = '#4ecdc4';
  });
  excelUploadArea.addEventListener('dragleave', function() {
    excelUploadArea.style.borderColor = '#a8e6e1';
  });
  excelUploadArea.addEventListener('drop', function(e) {
    e.preventDefault();
    excelUploadArea.style.borderColor = '#a8e6e1';
    var files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFile(files[0]);
    }
  });

  excelFile.addEventListener('change', function() {
    if (excelFile.files.length > 0) {
      handleFile(excelFile.files[0]);
    }
  });

  function handleFile(file) {
    uploadedFile = file;
    var label = excelUploadArea.querySelector('.excel-upload-label span:nth-child(2)');
    label.textContent = 'Selected: ' + file.name;
    processExcel.disabled = false;
  }

  // Simple CSV parser
  function parseCSV(text) {
    var lines = text.split(/\r?\n/).filter(function(l) { return l.trim(); });
    if (lines.length < 2) return [];

    var headers = lines[0].split(',').map(function(h) { return h.trim().toLowerCase(); });
    var rows = [];
    for (var i = 1; i < lines.length; i++) {
      var values = lines[i].split(',');
      var obj = {};
      headers.forEach(function(h, idx) {
        obj[h] = values[idx] ? values[idx].trim() : '';
      });
      rows.push(obj);
    }
    return rows;
  }

  processExcel.addEventListener('click', function() {
    if (!uploadedFile) return;

    var reader = new FileReader();
    reader.onload = function(e) {
      var text = e.target.result;
      var rows = parseCSV(text);
      var added = 0;

      rows.forEach(function(row) {
        var name = row.name || row.productname || row.product || row['product name'] || '';
        var category = row.category || row.type || '';
        var price = Number(row.price || row.mrp || 0);
        var originalPrice = Number(row.originalprice || row.original || 0);
        var stock = Number(row.stock || row.quantity || row.qty || 0);
        var description = row.description || row.desc || row.details || '';
        var emoji = row.emoji || row.icon || '';

        if (name && category && price > 0) {
          var cat = category.toLowerCase().indexOf('jewel') !== -1 ? 'jewellery' :
                    category.toLowerCase().indexOf('book') !== -1 || category.toLowerCase().indexOf('copy') !== -1 ? 'books-copies' : 'jewellery';

          DataStore.addProduct({
            name: name,
            category: cat,
            price: price,
            originalPrice: originalPrice,
            stock: stock,
            description: description,
            emoji: emoji,
            image: row.image || row.img || row.imageurl || ''
          });
          added++;
        }
      });

      renderProductTable();
      showToast('Added ' + added + ' products from file!');
      uploadedFile = null;
      processExcel.disabled = true;
      var label = excelUploadArea.querySelector('.excel-upload-label span:nth-child(2)');
      label.textContent = 'Click or drag file here';
      excelFile.value = '';
    };
    reader.readAsText(uploadedFile);
  });

  // Download template
  downloadTemplate.addEventListener('click', function() {
    var template = 'name,category,price,originalPrice,stock,description,emoji\nSilver Necklace,jewellery,599,799,10,Beautiful silver necklace,\u2764\nA5 Notebook,books-copies,89,120,50,Spiral notebook with dotted pages,\u270F';
    var blob = new Blob([template], { type: 'text/csv' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'product_template.csv';
    a.click();
    URL.revokeObjectURL(url);
    showToast('Template downloaded!');
  });

  // Reset data
  resetDataBtn.addEventListener('click', function() {
    if (confirm('WARNING: This will delete ALL products and reviews and reset to defaults. Are you sure?')) {
      DataStore.resetData();
      renderProductTable();
      showToast('All data has been reset to defaults.');
    }
  });

  // Initialize - ALWAYS show login first
  showLogin();
})();

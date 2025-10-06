// cardapio.js 
(function(){
  const btnDetails = document.querySelectorAll('.btn-detail');
  const btnAdds = document.querySelectorAll('.btn-add');
  const itemModal = $('#itemModal');
  const itemTitle = document.getElementById('itemTitle');
  const itemDesc = document.getElementById('itemDesc');
  const itemPrice = document.getElementById('itemPrice');
  const itemQty = document.getElementById('itemQty');
  const modalAdd = document.getElementById('modalAdd');

  const miniCart = document.getElementById('miniCart');
  const cartItems = document.getElementById('cartItems');
  const cartTotal = document.getElementById('cartTotal');
  const clearCart = document.getElementById('clearCart');
  const checkoutBtn = document.getElementById('checkoutBtn');

  const checkoutModal = $('#checkoutModal');

  let currentItem = null;
  let cart = [];

  function centsToBRL(cents) {
    return 'R$ ' + (cents/100).toFixed(2).replace('.', ',');
  }

  // Função para extrair URL da imagem do elemento
  function getItemImageUrl(article) {
    const thumbElement = article.querySelector('.thumb');
    if (thumbElement && thumbElement.style.backgroundImage) {
      // Extrai a URL da background-image (remove "url(...)"")
      const bgImage = thumbElement.style.backgroundImage;
      return bgImage.replace(/^url\(["']?/, '').replace(/["']?\)$/, '');
    }
    return 'imagens/placeholder.png'; // Fallback
  }

  // Abrir modal de detalhes
  btnDetails.forEach((btn) => {
    btn.addEventListener('click', function(){
      const article = this.closest('.menu-item');
      const name = article.dataset.name;
      const price = parseInt(article.dataset.price || '0', 10);
      const desc = article.dataset.desc || '';
      const imageUrl = getItemImageUrl(article);
      currentItem = { name, price, desc, imageUrl };

      itemTitle.textContent = name;
      itemDesc.textContent = desc;
      itemPrice.textContent = centsToBRL(price);
      itemQty.value = 1;
      itemModal.modal('show');
    });
  });

  // Adicionar direto ao carrinho
  btnAdds.forEach((btn) => {
    btn.addEventListener('click', function(){
      const article = this.closest('.menu-item');
      const name = article.dataset.name;
      const price = parseInt(article.dataset.price || '0', 10);
      const imageUrl = getItemImageUrl(article);
      addToCart({name, price, qty: 1, imageUrl});
    });
  });

  // Adicionar do modal
  modalAdd.addEventListener('click', function(){
    if (!currentItem) return;
    const qty = Math.max(1, parseInt(itemQty.value || '1', 10));
    addToCart({ 
      name: currentItem.name, 
      price: currentItem.price, 
      qty, 
      imageUrl: currentItem.imageUrl 
    });
    itemModal.modal('hide');
  });

  function addToCart(item){
    const found = cart.find(i => i.name === item.name);
    if (found) {
      found.qty += item.qty;
    } else {
      cart.push({ ...item });
    }
    renderCart();
  }

  function renderCart(){
    if (cart.length === 0) {
      miniCart.hidden = true;
      return;
    }
    miniCart.hidden = false;
    cartItems.innerHTML = '';
    let total = 0;

    cart.forEach((it, idx) => {
      const row = document.createElement('div');
      row.style.display = 'flex';
      row.style.justifyContent = 'space-between';
      row.style.alignItems = 'center';
      row.style.padding = '8px 0';
      row.innerHTML = `
        <div style="flex:1; display: flex; align-items: center;">
          <div class="cart-item-thumb" style="background-image: url('${it.imageUrl}')"></div>
          <div>
            <strong>${it.name}</strong>
            <div style="font-size:.85rem;color:rgba(255,255,255,0.7)">${it.qty} x ${centsToBRL(it.price)}</div>
          </div>
        </div>
        <div style="margin-left:8px">
          <div style="text-align:right">${centsToBRL(it.price * it.qty)}</div>
          <div style="margin-top:6px">
            <button class="btn btn-sm btn-outline-light mr-1" data-action="dec" data-idx="${idx}">-</button>
            <button class="btn btn-sm btn-outline-light" data-action="inc" data-idx="${idx}">+</button>
          </div>
        </div>`;
      cartItems.appendChild(row);
      total += it.price * it.qty;
    });

    cartTotal.textContent = centsToBRL(total);

    // Botões + e -
    cartItems.querySelectorAll('button[data-action]').forEach(btn => {
      btn.addEventListener('click', function(){
        const idx = parseInt(this.dataset.idx, 10);
        const action = this.dataset.action;
        if (action === 'inc') cart[idx].qty++;
        else {
          cart[idx].qty = Math.max(0, cart[idx].qty - 1);
          if (cart[idx].qty === 0) cart.splice(idx,1);
        }
        renderCart();
      });
    });
  }

  // Limpar carrinho
  clearCart.addEventListener('click', function(){
    cart = [];
    renderCart();
  });

  // Checkout visual - MODIFICADO para abrir modal
  checkoutBtn.addEventListener('click', function(){
    openCheckoutModal();
  });

  function openCheckoutModal() {
    if (cart.length === 0) {
      alert('Seu carrinho está vazio!');
      return;
    }
    
    // Esconde o mini-carrinho quando o modal de checkout abrir
    miniCart.classList.add('hidden');
    
    renderCheckoutItems();
    checkoutModal.modal('show');
  }

  // Quando o modal de checkout for fechado, mostra o mini-carrinho novamente
  checkoutModal.on('hidden.bs.modal', function () {
    // Só mostra o mini-carrinho se houver itens
    if (cart.length > 0) {
      miniCart.classList.remove('hidden');
    }
  });

  function renderCheckoutItems() {
    const checkoutItemsList = document.getElementById('checkoutItemsList');
    const subtotalEl = document.getElementById('checkoutSubtotal');
    const taxEl = document.getElementById('checkoutTax');
    const totalEl = document.getElementById('checkoutTotal');
    
    checkoutItemsList.innerHTML = '';
    let subtotal = 0;

    cart.forEach((item) => {
      const itemElement = document.createElement('div');
      itemElement.className = 'checkout-item';
      itemElement.innerHTML = `
        <div class="checkout-item-thumb" style="background-image: url('${item.imageUrl}')"></div>
        <div class="flex-grow-1">
          <div class="font-weight-bold">${item.name}</div>
          <small class="text-muted">${item.qty} x ${centsToBRL(item.price)}</small>
        </div>
        <div class="font-weight-bold">${centsToBRL(item.price * item.qty)}</div>
      `;
      checkoutItemsList.appendChild(itemElement);
      subtotal += item.price * item.qty;
    });

    const tax = Math.round(subtotal * 0.05);
    const total = subtotal + tax;

    subtotalEl.textContent = centsToBRL(subtotal);
    taxEl.textContent = centsToBRL(tax);
    totalEl.textContent = centsToBRL(total);

    // Bind payment method events
    bindCheckoutEvents();
  }

  function bindCheckoutEvents() {
    // Métodos de pagamento
    document.querySelectorAll('.pay-method').forEach(btn => {
      btn.addEventListener('click', function() {
        document.querySelectorAll('.pay-method').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        
        // Mostra/oculta campo de troco
        const changeField = document.getElementById('changeField');
        if (this.dataset.method === 'cash') {
          changeField.style.display = 'block';
        } else {
          changeField.style.display = 'none';
        }
      });
    });

    // Confirmar pedido
    document.getElementById('confirmOrderBtn').addEventListener('click', function() {
      const paymentMethod = document.querySelector('.pay-method.active').dataset.method;
      const changeFor = document.getElementById('changeFor').value || '';
      const orderNote = document.getElementById('orderNote').value || '';
      
      const orderSummary = {
        items: cart.map(item => `${item.qty}x ${item.name}`),
        payment: paymentMethod,
        changeFor: changeFor,
        note: orderNote,
        total: cart.reduce((sum, item) => sum + (item.price * item.qty), 0)
      };
      
      // Fecha o modal
      checkoutModal.modal('hide');
      
      // Mostra confirmação
      showOrderConfirmation(orderSummary);
    });
  }

  function showOrderConfirmation(orderSummary) {
    const itemsList = orderSummary.items.join(', ');
    const total = centsToBRL(orderSummary.total + Math.round(orderSummary.total * 0.05));
    
    let message = `✅ Pedido confirmado!\n\n`;
    message += `Itens: ${itemsList}\n`;
    message += `Total: ${total}\n`;
    message += `Pagamento: ${getPaymentMethodText(orderSummary.payment)}\n`;
    
    if (orderSummary.changeFor) {
      message += `Troco para: ${orderSummary.changeFor}\n`;
    }
    
    if (orderSummary.note) {
      message += `Observações: ${orderSummary.note}\n`;
    }
    
    message += `\nSeu pedido foi enviado para a cozinha!`;
    
    alert(message);
    
    // Limpa o carrinho após o pedido
    cart = [];
    renderCart();
  }

  function getPaymentMethodText(method) {
    const methods = {
      cash: 'Dinheiro',
      card: 'Cartão',
      pix: 'PIX',
      pay_on_exit: 'Pagar na Saída'
    };
    return methods[method] || method;
  }

  // Inicializa carrinho escondido
  renderCart();
})();
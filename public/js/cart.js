/**
 * Cart Module
 * Управление корзиной товаров с сохранением в localStorage
 */
class Cart {
  constructor() {
    this.key = 'marketplace_cart';
    this.items = this.loadCart();
    this.initEventListeners();
    this.updateCartUI();
  }

  /**
   * Загружает корзину из localStorage
   */
  loadCart() {
    const cartData = localStorage.getItem(this.key);
    return cartData ? JSON.parse(cartData) : [];
  }

  /**
   * Сохраняет текущее состояние корзины
   */
  saveCart() {
    localStorage.setItem(this.key, JSON.stringify(this.items));
    this.updateCartUI();
  }

  /**
   * Добавляет товар в корзину
   * @param {Object} product - Объект товара
   */
  addItem(product) {
    const existingItem = this.items.find(item => item.id === product.id);
    
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      this.items.push({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity: 1
      });
    }
    
    this.saveCart();
    this.showNotification(`Товар "${product.name}" добавлен в корзину`);
  }

  /**
   * Удаляет товар из корзины
   * @param {Number} productId - ID товара
   */
  removeItem(productId) {
    this.items = this.items.filter(item => item.id !== productId);
    this.saveCart();
  }

  /**
   * Изменяет количество товара
   * @param {Number} productId - ID товара
   * @param {Number} quantity - Новое количество
   */
  updateQuantity(productId, quantity) {
    if (quantity < 1) {
      this.removeItem(productId);
      return;
    }

    const item = this.items.find(item => item.id === productId);
    if (item) {
      item.quantity = quantity;
      this.saveCart();
    }
  }

  /**
   * Очищает корзину полностью
   */
  clearCart() {
    this.items = [];
    this.saveCart();
  }

  /**
   * Возвращает общую сумму заказа
   */
  getTotal() {
    return this.items.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);
  }

  /**
   * Возвращает количество позиций в корзине
   */
  getItemCount() {
    return this.items.reduce((count, item) => {
      return count + item.quantity;
    }, 0);
  }

  /**
   * Обновляет UI корзины
   */
  updateCartUI() {
    // Обновление счетчика в шапке
    const counterElements = document.querySelectorAll('.cart-counter');
    counterElements.forEach(el => {
      el.textContent = this.getItemCount();
    });

    // Обновление мини-корзины (если есть)
    const miniCart = document.getElementById('mini-cart');
    if (miniCart) {
      miniCart.innerHTML = this.items.map(item => `
        <div class="mini-cart-item">
          <img src="${item.image}" alt="${item.name}" width="50">
          <div>
            <h5>${item.name}</h5>
            <p>${item.quantity} × ${item.price.toFixed(2)} ₽</p>
          </div>
          <button class="remove-item" data-id="${item.id}">×</button>
        </div>
      `).join('');

      // Обновление итоговой суммы
      const totalElement = document.getElementById('mini-cart-total');
      if (totalElement) {
        totalElement.textContent = this.getTotal().toFixed(2);
      }
    }

    // Обновление страницы корзины (если есть)
    if (document.getElementById('cart-page')) {
      this.renderCartPage();
    }
  }

  /**
   * Рендерит страницу корзины
   */
  renderCartPage() {
    const cartItemsElement = document.getElementById('cart-items');
    const cartTotalElement = document.getElementById('cart-total');
    
    if (!cartItemsElement) return;

    cartItemsElement.innerHTML = this.items.map(item => `
      <div class="cart-item">
        <img src="${item.image}" alt="${item.name}">
        <div class="cart-item-details">
          <h4>${item.name}</h4>
          <div class="cart-item-controls">
            <button class="quantity-btn minus" data-id="${item.id}">-</button>
            <span>${item.quantity}</span>
            <button class="quantity-btn plus" data-id="${item.id}">+</button>
          </div>
        </div>
        <div class="cart-item-price">
          <p>${(item.price * item.quantity).toFixed(2)} ₽</p>
          <button class="remove-item" data-id="${item.id}">Удалить</button>
        </div>
      </div>
    `).join('');

    if (cartTotalElement) {
      cartTotalElement.textContent = this.getTotal().toFixed(2);
    }
  }

  /**
   * Инициализирует обработчики событий
   */
  initEventListeners() {
    // Обработчик для кнопок "Добавить в корзину"
    document.addEventListener('click', (e) => {
      if (e.target.closest('.add-to-cart')) {
        const productElement = e.target.closest('.product');
        const product = {
          id: productElement.dataset.id,
          name: productElement.dataset.name,
          price: parseFloat(productElement.dataset.price),
          image: productElement.dataset.image
        };
        this.addItem(product);
      }
    });

    // Обработчик для страницы корзины
    document.addEventListener('click', (e) => {
      // Удаление товара
      if (e.target.closest('.remove-item')) {
        const productId = parseInt(e.target.closest('.remove-item').dataset.id);
        this.removeItem(productId);
      }

      // Изменение количества
      if (e.target.closest('.quantity-btn')) {
        const btn = e.target.closest('.quantity-btn');
        const productId = parseInt(btn.dataset.id);
        const item = this.items.find(item => item.id === productId);
        
        if (item) {
          const newQuantity = btn.classList.contains('plus') 
            ? item.quantity + 1 
            : item.quantity - 1;
          this.updateQuantity(productId, newQuantity);
        }
      }
    });

    // Очистка корзины
    document.getElementById('clear-cart')?.addEventListener('click', () => {
      if (confirm('Очистить корзину?')) {
        this.clearCart();
      }
    });

    // Оформление заказа
    document.getElementById('checkout-btn')?.addEventListener('click', async () => {
      if (this.items.length === 0) {
        alert('Корзина пуста!');
        return;
      }

      try {
        const response = await fetch('/api/orders', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            items: this.items,
            total: this.getTotal()
          })
        });

        if (response.ok) {
          this.clearCart();
          window.location.href = '/order-success.html';
        } else {
          const error = await response.json();
          alert(error.message || 'Ошибка оформления заказа');
        }
      } catch (err) {
        console.error('Checkout error:', err);
        alert('Ошибка соединения');
      }
    });
  }

  /**
   * Показывает уведомление
   * @param {String} message - Текст уведомления
   */
  showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'cart-notification';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.classList.add('show');
    }, 10);

    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 300);
    }, 3000);
  }
}

// Инициализация корзины при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
  window.cart = new Cart();
});
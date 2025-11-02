// Toast message (nhẹ nhàng, an toàn hơn)
function toast({
  title = 'Success',
  message = 'Tạo tài khoản thành công',
  type = 'success',
  duration = 3000
}) {
  let main = document.getElementById('toast');
  // Nếu chưa có container, tự tạo (không đổi UI sẵn có)
  if (!main) {
    main = document.createElement('div');
    main.id = 'toast';
    document.body.appendChild(main);
  }
  if (!main) return;

  const toast = document.createElement('div');

  // Map màu & icon giữ nguyên như cũ
  const colors = {
    success: '#47d864',
    info: '#2f86eb',
    warning: '#ffc021',
    error: '#ff6243'
  };
  const icons = {
    success: 'fa-light fa-check',
    info: 'fa-solid fa-circle-info',
    warning: 'fa-solid fa-triangle-exclamation',
    error: 'fa-solid fa-bug'
  };
  const color = colors[type] || colors.success;
  const icon = icons[type] || icons.success;

  const delay = (duration / 1000).toFixed(2);
  toast.classList.add('toast', `toast--${type}`);
  toast.style.animation = `slideInLeft ease 0.3s, fadeOut linear 1s ${delay}s forwards`;
  toast.setAttribute('role', 'alert');
  toast.setAttribute('aria-live', 'assertive');

  // Dùng textContent cho title/message để tránh inject HTML
  toast.innerHTML = `
    <div class="toast__private">
      <div class="toast__icon"><i class="${icon}"></i></div>
      <div class="toast__body">
        <h3 class="toast__title"></h3>
        <p class="toast__msg"></p>
      </div>
      <div class="toast__close" aria-label="Đóng thông báo">
        <i class="fa-regular fa-circle-xmark"></i>
      </div>
    </div>
    <div class="toast__background" style="background-color: ${color};"></div>
  `;

  // Gán text an toàn
  const titleEl = toast.querySelector('.toast__title');
  const msgEl = toast.querySelector('.toast__msg');
  if (titleEl) titleEl.textContent = title;
  if (msgEl) msgEl.textContent = message;

  // Auto remove
  const autoRemove = setTimeout(() => {
    if (toast.parentNode === main) main.removeChild(toast);
  }, duration + 1000);

  // Close by click – chỉ khi click vào nút đóng
  toast.addEventListener('click', (e) => {
    if (e.target.closest('.toast__close')) {
      if (toast.parentNode === main) main.removeChild(toast);
      clearTimeout(autoRemove);
    }
  });

  main.appendChild(toast);
}

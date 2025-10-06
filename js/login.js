// login.js - Script para a página de login
(function(){
  // Elementos do DOM
  const loginForm = document.getElementById('loginForm');
  const togglePwdBtn = document.getElementById('togglePwd');
  const senhaInput = document.getElementById('senha');
  const socialBtns = document.querySelectorAll('.social-btn');
  
  // Alternar visibilidade da senha
  if (togglePwdBtn && senhaInput) {
    togglePwdBtn.addEventListener('click', function() {
      const icon = this.querySelector('i');
      if (senhaInput.type === 'password') {
        senhaInput.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
        this.setAttribute('aria-label', 'Ocultar senha');
      } else {
        senhaInput.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
        this.setAttribute('aria-label', 'Mostrar senha');
      }
    });
  }
  
  // Validação do formulário
  if (loginForm) {
    loginForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      // Remove mensagens anteriores
      removeMessages();
      
      // Validação básica
      if (!validateForm()) {
        return;
      }
      
      // Simula envio do formulário
      simulateLogin();
    });
  }
  
  // Botões de login social
  socialBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      const provider = this.dataset.provider;
      socialLogin(provider);
    });
  });
  
  // Função de validação do formulário
  function validateForm() {
    let isValid = true;
    const email = document.getElementById('email').value.trim();
    const senha = document.getElementById('senha').value.trim();
    
    // Validação de email
    if (!email) {
      showError('Por favor, insira seu e-mail ou usuário.');
      isValid = false;
    }
    
    // Validação de senha
    if (!senha) {
      showError('Por favor, insira sua senha.');
      isValid = false;
    } else if (senha.length < 6) {
      showError('A senha deve ter pelo menos 6 caracteres.');
      isValid = false;
    }
    
    // Marca campos como válidos/inválidos
    loginForm.classList.add('was-validated');
    
    return isValid;
  }
  
  // Simula processo de login
  function simulateLogin() {
    const submitBtn = loginForm.querySelector('button[type="submit"]');
    const email = document.getElementById('email').value.trim();
    
    // Mostra estado de loading
    submitBtn.disabled = true;
    submitBtn.classList.add('btn-loading');
    submitBtn.textContent = 'Entrando...';
    
    // Simula delay de rede
    setTimeout(() => {
      // Remove loading
      submitBtn.disabled = false;
      submitBtn.classList.remove('btn-loading');
      submitBtn.textContent = 'Entrar';
      
      // Simula login bem-sucedido
      showSuccess(`Bem-vindo de volta, ${email.split('@')[0]}!`);
      
      // Redireciona após sucesso 
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 2000);
      
    }, 1500);
  }
  
  // Login social
  function socialLogin(provider) {
    removeMessages();
    
    const btn = document.querySelector(`.social-btn[data-provider="${provider}"]`);
    const originalText = btn.innerHTML;
    
    // Mostra loading no botão social
    btn.disabled = true;
    btn.innerHTML = `<i class="fas fa-spinner fa-spin mr-2"></i> Conectando...`;
    
    // Simula processo de autenticação social
    setTimeout(() => {
      btn.disabled = false;
      btn.innerHTML = originalText;
      
      showSuccess(`Login com ${provider.charAt(0).toUpperCase() + provider.slice(1)} realizado com sucesso!`);
      
      // Redireciona após sucesso
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 2000);
      
    }, 2000);
  }
  
  // Mostra mensagem de sucesso
  function showSuccess(message) {
    removeMessages();
    
    const successDiv = document.createElement('div');
    successDiv.className = 'login-success';
    successDiv.innerHTML = `<i class="fas fa-check-circle mr-2"></i> ${message}`;
    
    loginForm.insertBefore(successDiv, loginForm.firstChild);
  }
  
  // Mostra mensagem de erro
  function showError(message) {
    removeMessages();
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'login-error';
    errorDiv.innerHTML = `<i class="fas fa-exclamation-triangle mr-2"></i> ${message}`;
    
    loginForm.insertBefore(errorDiv, loginForm.firstChild);
  }
  
  // Remove mensagens
  function removeMessages() {
    const messages = document.querySelectorAll('.login-success, .login-error');
    messages.forEach(msg => msg.remove());
  }
  
  // Validação em tempo real
  const inputs = document.querySelectorAll('#loginForm input[required]');
  inputs.forEach(input => {
    input.addEventListener('blur', function() {
      if (this.value.trim() === '') {
        this.classList.add('is-invalid');
      } else {
        this.classList.remove('is-invalid');
      }
    });
    
    input.addEventListener('input', function() {
      if (this.value.trim() !== '') {
        this.classList.remove('is-invalid');
        removeMessages();
      }
    });
  });
  
  // Foco automático no primeiro campo
  document.getElementById('email')?.focus();
  
  // Tecla Enter para submit
  document.addEventListener('keypress', function(e) {
    if (e.key === 'Enter' && !e.target.matches('.social-btn')) {
      const submitBtn = loginForm.querySelector('button[type="submit"]');
      if (submitBtn && !submitBtn.disabled) {
        submitBtn.click();
      }
    }
  });
})();
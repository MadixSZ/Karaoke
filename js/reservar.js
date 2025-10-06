(function(){
  // Elementos do DOM
  const reserveForm = document.getElementById('reserveForm');
  const previewBtn = document.getElementById('previewBtn');
  const confirmModal = $('#confirmModal');
  const successModal = $('#successModal');
  const summaryContent = document.getElementById('summaryContent');
  const totalAmountEl = document.getElementById('totalAmount');
  const depositAmountEl = document.getElementById('depositAmount');
  const holdTimerEl = document.getElementById('holdTimer');
  const simulatePayBtn = document.getElementById('simulatePay');
  const statusMsg = document.getElementById('statusMsg');
  
  // Variáveis de estado
  let holdSeconds = 15 * 60;
  let holdInterval = null;
  let currentReservation = null;
  
  // Formata valor em centavos para BRL
  function formatBRL(cents) {
    return 'R$ ' + (cents/100).toFixed(2).replace('.', ',');
  }
  
  // Calcula valores da reserva
  function calcValues() {
    const tipo = document.getElementById('tipo');
    const tipoPrice = parseInt(tipo.options[tipo.selectedIndex].dataset.price || '0', 10);
    const duracao = parseInt(document.getElementById('duracao').value || '1', 10);
    
    const total = tipoPrice * duracao;
    const deposit = Math.ceil(total * 0.5);
    return { 
      total, 
      deposit, 
      tipoText: tipo.options[tipo.selectedIndex].text,
      tipoValue: tipo.value
    };
  }
  
  // Validação do formulário
  function validateForm() {
    let isValid = true;
    const requiredFields = reserveForm.querySelectorAll('[required]');
    
    requiredFields.forEach(field => {
      if (!field.value.trim()) {
        field.classList.add('is-invalid');
        isValid = false;
      } else {
        field.classList.remove('is-invalid');
      }
    });
    
    // Validação específica para data
    const dataField = document.getElementById('data');
    if (dataField.value) {
      const selectedDate = new Date(dataField.value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        dataField.classList.add('is-invalid');
        showMessage('error', 'Não é possível reservar para datas passadas.');
        isValid = false;
      }
    }
    
    // Validação específica para convidados
    const convidadosField = document.getElementById('convidados');
    if (convidadosField.value) {
      const convidados = parseInt(convidadosField.value);
      const tipo = document.getElementById('tipo').value;
      
      let maxConvidados = 6; // padrão
      if (tipo === 'vip') maxConvidados = 10;
      if (tipo === 'party') maxConvidados = 20;
      
      if (convidados > maxConvidados) {
        convidadosField.classList.add('is-invalid');
        showMessage('error', `A sala selecionada suporta no máximo ${maxConvidados} convidados.`);
        isValid = false;
      }
    }
    
    reserveForm.classList.add('was-validated');
    return isValid;
  }
  
  // Verifica disponibilidade (simulação)
  function checkAvailability(data, hora) {
    // Simulação - datas pares estão disponíveis, ímpares não
    const day = new Date(data).getDate();
    return day % 2 === 0;
  }
  
  // Inicia o timer do hold
  function startHoldTimer() {
    clearInterval(holdInterval);
    holdSeconds = 15 * 60;
    updateTimerDisplay();
    
    holdInterval = setInterval(() => {
      holdSeconds--;
      if (holdSeconds <= 0) {
        clearInterval(holdInterval);
        holdTimerEl.textContent = '00:00';
        holdTimerEl.classList.add('hold-expired');
        statusMsg.innerHTML = '<div class="reserve-error">Hold expirado — tente outro horário.</div>';
        simulatePayBtn.disabled = true;
      } else {
        updateTimerDisplay();
      }
    }, 1000);
  }
  
  // Atualiza display do timer
  function updateTimerDisplay() {
    const mm = String(Math.floor(holdSeconds / 60)).padStart(2, '0');
    const ss = String(holdSeconds % 60).padStart(2, '0');
    holdTimerEl.textContent = mm + ':' + ss;
    holdTimerEl.classList.remove('hold-expired');
  }
  
  // Mostra mensagem
  function showMessage(type, message) {
    removeMessages();
    
    const messageDiv = document.createElement('div');
    messageDiv.className = type === 'error' ? 'reserve-error' : 'reserve-success';
    messageDiv.innerHTML = message;
    
    reserveForm.insertBefore(messageDiv, reserveForm.firstChild);
    
    // Remove após 5 segundos
    setTimeout(() => {
      messageDiv.remove();
    }, 5000);
  }
  
  // Remove mensagens
  function removeMessages() {
    const messages = document.querySelectorAll('.reserve-success, .reserve-error');
    messages.forEach(msg => msg.remove());
  }
  
  // Previsualização da reserva
  previewBtn.addEventListener('click', function() {
    removeMessages();
    
    if (!validateForm()) {
      return;
    }
    
    const data = document.getElementById('data').value;
    const hora = document.getElementById('hora').value;
    const nome = document.getElementById('nome').value;
    const telefone = document.getElementById('telefone').value;
    const convidados = document.getElementById('convidados').value;
    const observacoes = document.getElementById('observacoes').value;
    const duracao = document.getElementById('duracao').value;
    const tipo = document.getElementById('tipo');
    const tipoText = tipo.options[tipo.selectedIndex].text;
    
    // Verifica disponibilidade
    if (!checkAvailability(data, hora)) {
      showMessage('error', 'Sala indisponível nesse horário. Tente outra data/hora.');
      return;
    }
    
    const vals = calcValues();
    currentReservation = { ...vals, data, hora, nome, telefone, convidados, observacoes, duracao, tipoText };
    
    // Preenche o resumo
    summaryContent.innerHTML = `
      <div class="summary-line"><div>Nome</div><div>${nome}</div></div>
      <div class="summary-line"><div>Contato</div><div>${telefone}</div></div>
      <div class="summary-line"><div>Data / Hora</div><div>${formatDate(data)} — ${hora}</div></div>
      <div class="summary-line"><div>Duração</div><div>${duracao} hora(s)</div></div>
      <div class="summary-line"><div>Sala</div><div>${tipoText}</div></div>
      <div class="summary-line"><div>Convidados</div><div>${convidados}</div></div>
      <div class="summary-line"><div>Observações</div><div>${observacoes || '—'}</div></div>
    `;
    
    totalAmountEl.textContent = formatBRL(vals.total);
    depositAmountEl.textContent = formatBRL(vals.deposit);
    statusMsg.innerHTML = '<div class="reserve-success">Sala disponível. Você tem 15 minutos para completar o depósito de 50%.</div>';
    simulatePayBtn.disabled = false;
    
    confirmModal.modal('show');
    startHoldTimer();
  });
  
  // Simula pagamento
  simulatePayBtn.addEventListener('click', function() {
    simulatePayBtn.disabled = true;
    simulatePayBtn.classList.add('btn-loading');
    statusMsg.innerHTML = '<div class="help">Processando pagamento...</div>';
    
    // Simula processamento
    setTimeout(() => {
      simulatePayBtn.classList.remove('btn-loading');
      clearInterval(holdInterval);
      confirmModal.modal('hide');
      
      // Mostra modal de sucesso
      successModal.modal('show');
      
      // Limpa formulário após sucesso
      setTimeout(() => {
        reserveForm.reset();
        reserveForm.classList.remove('was-validated');
      }, 1000);
      
    }, 2000);
  });
  
  // Formata data para exibição
  function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  }
  
  // Event listener quando o modal é fechado
  confirmModal.on('hidden.bs.modal', function() {
    clearInterval(holdInterval);
    simulatePayBtn.disabled = false;
    simulatePayBtn.classList.remove('btn-loading');
  });
  
  // Validação em tempo real
  const inputs = document.querySelectorAll('#reserveForm input[required], #reserveForm select[required]');
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
  
  // Validação de convidados baseada no tipo de sala
  document.getElementById('tipo').addEventListener('change', function() {
    const convidadosField = document.getElementById('convidados');
    const tipo = this.value;
    
    let maxConvidados = 6;
    if (tipo === 'vip') maxConvidados = 10;
    if (tipo === 'party') maxConvidados = 20;
    
    convidadosField.setAttribute('max', maxConvidados);
    
    // Atualiza o valor se necessário
    const currentConvidados = parseInt(convidadosField.value);
    if (currentConvidados > maxConvidados) {
      convidadosField.value = maxConvidados;
    }
  });
  
  // Configura data mínima como hoje
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('data').setAttribute('min', today);
  
  // Foco automático no primeiro campo
  document.getElementById('nome')?.focus();
})();
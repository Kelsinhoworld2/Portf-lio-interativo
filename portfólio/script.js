const canvas = document.getElementById('matrixCanvas');
const ctx = canvas.getContext('2d');
const terminalBody = document.getElementById('terminalBody');
const terminalInput = document.getElementById('terminalInput');
const suggestions = document.getElementById('commandSuggestions');
const suggestionButtons = document.querySelectorAll('.suggestion-chip, .shortcut-btn');

const commands = {
  help: {
    description: 'Lista de comandos disponíveis',
    response: [
      "help - mostrar esta lista de comandos",
      "projetos - ver projetos recentes",
      "sobre - conhecer Kelson Varela",
      "contacto - informações para contato",
      "clear - limpar o terminal"
    ]
  },
  projetos: {
    description: 'Mostra projetos selecionados',
    response: [
      "1) Portfólio Interativo - site com Matrix rain, terminal e comandos intuitivos",
      "2) Dashboard de dados - interface em tempo real e visual hacker",
      "3) App Mobile - experiência futurista com animações e UX acessível",
      "\nUse 'ver site1' para mais detalhes sobre o projeto 1"
    ]
  },
  sobre: {
    description: 'Informações pessoais e habilidades',
    response: [
      "Sou Kelson Varela, apaixonado por design interativo e experiências digitais futuristas.",
      "Combino estética hacker com usabilidade moderna, criando interfaces memoráveis.",
      "Tecnologias: HTML, CSS, JavaScript, Canvas API, animações e design responsivo."
    ]
  },
  contacto: {
    description: 'Informações de contato',
    response: [
      "GitHub: https://github.com/Kelsinhoworld2",
      "WhatsApp: https://wa.me/947861804",
      "Email: varelakelson20@gmail.com"
    ]
  },
  'ver site1': {
    description: 'Detalhes do projeto Portfólio Interativo',
    response: [
      "Portfólio inspirado em The Matrix (1999), com chuva de código, terminal e navegação simplificada.",
      "Foco em experiência acessível: comando rápido, cliques opcionais, sugestões automáticas e auto-complete.",
      "Layout responsivo para desktop e mobile com input fixo e interface intuitiva."
    ]
  },
  clear: {
    description: 'Limpa o terminal',
    response: []
  }
};

const history = [];
let historyPosition = -1;
const suggestionsList = Object.keys(commands);

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

const matrix = {
  columns: [],
  fontSize: 18,
  speedBase: 4,
  chars: 'アァカサタナハマヤャラワガザダバパイィキシチニヒミリヰギジヂビピウゥクスツヌフムユュルグズヅブプエェケセテネヘメレヱゲゼデベペオォコソトノホモヨョロヲゴゾドボポ0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz@#$%&*+-=<>',
};

function setupMatrix() {
  matrix.columns = [];
  const columns = Math.floor(canvas.width / matrix.fontSize) + 1;
  for (let i = 0; i < columns; i += 1) {
    matrix.columns[i] = Math.random() * canvas.height;
  }
}

function drawMatrix() {
  ctx.fillStyle = 'rgba(0, 0, 0, 0.06)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.font = `${matrix.fontSize}px 'Fira Code', monospace`;
  matrix.columns.forEach((y, index) => {
    const text = matrix.chars.charAt(Math.floor(Math.random() * matrix.chars.length));
    const x = index * matrix.fontSize;
    const speed = matrix.speedBase + Math.random() * 4;
    const opacity = 0.15 + Math.random() * 0.25;
    ctx.fillStyle = `rgba(0, 255, 159, ${opacity})`;
    ctx.fillText(text, x, y);
    if (y > canvas.height + Math.random() * 1000) {
      matrix.columns[index] = 0;
    } else {
      matrix.columns[index] = y + speed;
    }
  });
  requestAnimationFrame(drawMatrix);
}

function typeLine(text, delay = 20) {
  return new Promise((resolve) => {
    const line = document.createElement('div');
    line.className = 'terminal-line';
    terminalBody.appendChild(line);
    terminalBody.scrollTop = terminalBody.scrollHeight;
    let i = 0;
    function nextChar() {
      if (i < text.length) {
        line.textContent += text.charAt(i);
        i += 1;
        terminalBody.scrollTop = terminalBody.scrollHeight;
        setTimeout(nextChar, delay);
      } else {
        resolve();
      }
    }
    nextChar();
  });
}

async function printLines(lines, type = true) {
  for (const line of lines) {
    if (type) {
      await typeLine(line);
    } else {
      const element = document.createElement('div');
      element.className = 'terminal-line';
      element.textContent = line;
      terminalBody.appendChild(element);
    }
  }
}

function clearTerminal() {
  terminalBody.innerHTML = '';
}

function appendTerminalLine(text) {
  const line = document.createElement('div');
  line.className = 'terminal-line';
  line.textContent = text;
  terminalBody.appendChild(line);
  terminalBody.scrollTop = terminalBody.scrollHeight;
}

function setInputPlaceholder(command = '') {
  terminalInput.placeholder = command ? `Ex: ${command}` : 'Digite um comando ou clique em uma sugestão...';
}

function updateAutoComplete(value) {
  const input = value.trim().toLowerCase();
  const matched = suggestionsList.filter((cmd) => cmd.startsWith(input));
  const buttons = Array.from(suggestions.querySelectorAll('.suggestion-chip'));
  buttons.forEach((button) => {
    const command = button.dataset.command;
    button.textContent = command;
    button.style.opacity = matched.length > 0 && !matched.includes(command) && input.length > 0 ? '0.35' : '1';
    button.disabled = matched.length > 0 && !matched.includes(command) && input.length > 0;
  });
}

function handleCommand(rawValue) {
  const value = rawValue.trim().toLowerCase();
  if (!value) {
    return;
  }
  history.push(value);
  historyPosition = history.length;
  appendTerminalLine(`guest@kelson:~$ ${value}`);
  terminalInput.value = '';
  updateAutoComplete('');

  if (value === 'clear') {
    clearTerminal();
    return;
  }

  const command = commands[value];
  if (command) {
    if (command.response.length === 0) {
      return;
    }
    printLines(command.response);
  } else {
    const message = "Comando não reconhecido. Tente 'help'";
    typeLine(message);
  }
}

function handleKeyDown(event) {
  if (event.key === 'Enter') {
    event.preventDefault();
    handleCommand(terminalInput.value);
  }
  if (event.key === 'ArrowUp') {
    if (history.length === 0) return;
    historyPosition = Math.max(0, historyPosition - 1);
    terminalInput.value = history[historyPosition] || '';
    terminalInput.setSelectionRange(terminalInput.value.length, terminalInput.value.length);
  }
  if (event.key === 'ArrowDown') {
    if (history.length === 0) return;
    historyPosition = Math.min(history.length, historyPosition + 1);
    terminalInput.value = history[historyPosition] || '';
  }
}

function setUpCommands() {
  suggestionButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const command = button.dataset.command;
      if (command) {
        handleCommand(command);
        terminalInput.focus();
      }
    });
  });

  terminalInput.addEventListener('input', (event) => {
    updateAutoComplete(event.target.value);
  });

  terminalInput.addEventListener('keydown', handleKeyDown);
}

async function initTerminal() {
  clearTerminal();
  await printLines([
    'Sistema iniciado...',
    'Bem-vindo ao portfólio de Kelson Varela',
    "Digite 'help' ou clique nas opções abaixo"
  ], true);
  setInputPlaceholder('help');
}

function handleResize() {
  resizeCanvas();
  setupMatrix();
}

window.addEventListener('resize', handleResize);
window.addEventListener('mousemove', (event) => {
  const intensity = event.clientX / window.innerWidth;
  canvas.style.opacity = 0.92 + intensity * 0.08;
});

function bootstrap() {
  setUpCommands();
  handleResize();
  drawMatrix();
  initTerminal();
  terminalInput.focus();
}

bootstrap();

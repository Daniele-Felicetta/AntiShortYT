
function createCustomButton(blocked) {
  // Prima definiamo le icone
  const showIcon = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 9C11.2044 9 10.4413 9.31607 9.87868 9.87868C9.31607 10.4413 9 11.2044 9 12C9 12.7956 9.31607 13.5587 9.87868 14.1213C10.4413 14.6839 11.2044 15 12 15C12.7956 15 13.5587 14.6839 14.1213 14.1213C14.6839 13.5587 15 12.7956 15 12C15 11.2044 14.6839 10.4413 14.1213 9.87868C13.5587 9.31607 12.7956 9 12 9Z" fill="white"/>
    <path d="M12 5C4 5 1 12 1 12C1 12 4 19 12 19C20 19 23 12 23 12C23 12 20 5 12 5ZM12 16C9.79086 16 8 14.2091 8 12C8 9.79086 9.79086 8 12 8C14.2091 8 16 9.79086 16 12C16 14.2091 14.2091 16 12 16Z" fill="white"/>
  </svg>`;

  const hideIcon = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 9C13.6569 9 15 10.3431 15 12C15 12.3506 14.9398 12.6872 14.8293 13M12 9C10.3431 9 9 10.3431 9 12C9 12.3506 9.06015 12.6872 9.17071 13M12 9V6M6 6L18 18M15 12C15 13.0913 14.5931 14.1174 13.889 14.889M12 15C10.3431 15 9 13.6569 9 12C9 11.9087 9.00899 11.8187 9.02643 11.731M4 4L8 8M1 1L3 3M21 21L16 16M12 15V18" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
  </svg>`;

  // Poi creiamo il bottone
  const toggleBtn = document.createElement('button');
  toggleBtn.innerHTML = `
    <span class="btn-icon">${blocked ? showIcon : hideIcon}</span>
    <span>${blocked ? 'Show Videos' : 'Hide Videos'}</span>
  `;

  // Stili base con miglioramenti
  toggleBtn.style.cssText = `
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 12px 24px;
    border: none;
    border-radius: 12px;
    cursor: pointer;
    font-weight: 600;
    font-size: 14px;
    font-family: 'Segoe UI', system-ui, sans-serif;
    transform 0.2s cubic-bezier(0.22, 0.61, 0.36, 1), 
        box-shadow 0.2s cubic-bezier(0.22, 0.61, 0.36, 1),
        background 0.3s ease;
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    color: white;
    background: ${blocked ? '#2e7d32' : '#d32f2f'};
    gap: 10px;
    position: relative;
    overflow: hidden;
    box-sizing: border-box;
    transform: translateZ(0); /* Migliora le performance delle animazioni */
  `;

    // Effetto hover
    toggleBtn.addEventListener('mouseenter', () => {
    toggleBtn.style.transform = 'translateY(-2px)';
    toggleBtn.style.boxShadow = '0 6px 8px rgba(0,0,0,0.15)';
    });

    toggleBtn.addEventListener('mouseleave', () => {
    toggleBtn.style.transform = 'translateY(0)';
    toggleBtn.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
    });

    // Effetto click
    toggleBtn.addEventListener('mousedown', () => {
    toggleBtn.style.transform = 'translateY(1px)';
    toggleBtn.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
    });

    toggleBtn.addEventListener('mouseup', () => {
    toggleBtn.style.transform = 'translateY(-2px)';
    toggleBtn.style.boxShadow = '0 6px 8px rgba(0,0,0,0.15)';
    });
    toggleBtn.style.willChange = 'transform, box-shadow'; 

    // Effetto luce dinamica
    const hoverLightEffect = document.createElement('div');
    hoverLightEffect.style.cssText = `
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 60%);
    opacity: 0;
    transition: opacity 0.4s ease;
    pointer-events: none;
    `;
    toggleBtn.appendChild(hoverLightEffect);

    toggleBtn.addEventListener('mousemove', (e) => {
    const rect = toggleBtn.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    hoverLightEffect.style.background = `
        radial-gradient(circle at ${x}px ${y}px, rgba(255,255,255,0.4) 0%, transparent 60%)
    `;
    hoverLightEffect.style.opacity = '1';
    });

    toggleBtn.addEventListener('mouseleave', () => {
    hoverLightEffect.style.opacity = '0';
    });

    toggleBtn.setAttribute('aria-label', blocked ? 'Show videos' : 'Hide videos');
    toggleBtn.setAttribute('role', 'button');
    return toggleBtn;
}



// Stato letto dal localStorage (corretto dalla versione precedente)
let blocked = localStorage.getItem('videosBlocked') !== 'false';

// NUOVA FUNZIONE per iniettare il CSS e prevenire il flash
function injectCss() {
  if (!blocked) return; // Inietta lo stile solo se il blocco è attivo

  const style = document.createElement('style');
  style.id = 'anti-flash-style';
  style.textContent = `
    /* Nasconde immediatamente la griglia dei video e i correlati per evitare il "flash" */
    ytd-two-column-browse-results-renderer,
    #related {
      visibility: hidden !important;
    }
  `;
  // Appende lo stile all'head del documento, garantendo che venga applicato subito
  document.head.appendChild(style);
}

function wipeHome() {
  const browse = document.querySelector('ytd-two-column-browse-results-renderer');
  if (browse && blocked) browse.innerHTML = '';

  const related = document.querySelector('#related');
  if (related && blocked) related.innerHTML = '';
}

function removeShorts() {
  const shortsSelectors = [
    'ytd-rich-section-renderer:has(ytd-rich-shelf-renderer[is-shorts])',
    'ytd-guide-entry-renderer[title="Shorts"]',
    'a[href^="/shorts"]',
    'ytd-reel-shelf-renderer',
    'ytd-reel-item-renderer',
    'ytd-thumbnail-overlay-time-status-renderer[overlay-style="SHORTS"]'
  ];
  shortsSelectors.forEach(sel => {
    document.querySelectorAll(sel).forEach(el => el.remove());
  });
}

function blockVideoGridLoad() {
  const origObserve = MutationObserver.prototype.observe;

  MutationObserver.prototype.observe = function (target, options) {
    if (
      blocked &&
      (target?.tagName?.toLowerCase().includes('ytd-rich-grid-renderer') ||
      target?.id === 'related')
    ) {
      return;
    }
    return origObserve.apply(this, arguments);
  };
}


function addToggle() {
  if (document.getElementById('video-toggle-container')) return;

  const container = document.createElement('div');
  container.id = 'video-toggle-container';
  container.style.position = 'fixed';
  container.style.top = '80px';
  container.style.right = '20px';
  container.style.zIndex = '9999';
  
  // Aggiungi stili al container
  container.style.display = 'flex';
  container.style.flexDirection = 'column';
  container.style.gap = '10px';
  container.style.alignItems = 'flex-end';

  container.style.top = '70px';
  container.style.right = '10px';

  // Per dispositivi mobili
  if (window.innerWidth < 768) {
    container.style.top = '60px';
    container.style.right = '5px';
    button.style.padding = '10px 16px';
    button.style.fontSize = '13px';
  }

  // PASSIAMO IL PARAMETRO blocked
  let button = createCustomButton(blocked);
  
  button.onclick = () => {
    const newState = !blocked;
    localStorage.setItem('videosBlocked', newState);
    location.reload();
  };

  container.appendChild(button);
  document.body.appendChild(container);


  document.addEventListener('fullscreenchange', () => {
    container.style.display = document.fullscreenElement ? 'none' : 'flex';
  });
}

(function init() {
  // 1. ESEGUI QUESTA FUNZIONE PER PRIMA IN ASSOLUTO
  injectCss();

  // 2. Continua con la logica di blocco esistente
  if (blocked) {
    blockVideoGridLoad();
    removeShorts();
    wipeHome();
    setInterval(() => {
      removeShorts();
      wipeHome();
    }, 1000);
  }
  
  // 3. Aggiungi il pulsante di controllo
  addToggle();
})();
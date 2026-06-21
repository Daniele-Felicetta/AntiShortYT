(() => {
  const STORAGE_KEY = 'videosBlocked';
  const AUTO_BLOCK_MS = 30000;
  const COUNTDOWN_SEC = 10;
  const MIN_SLIDER = 10;
  const MAX_SLIDER = 60;

  let blocked = getBlockedState();
  let autoBlockTimer = null;
  let wipeInterval = null;
  let toggleButton = null;
  let overlayBg = null;
  let sliderContainer = null;
  let sliderEl = null;
  let confirmMode = false;

  function getBlockedState() {
    try {
      return localStorage.getItem(STORAGE_KEY) !== 'false';
    } catch {
      return true;
    }
  }

  function saveBlockedState(state) {
    try {
      localStorage.setItem(STORAGE_KEY, state);
    } catch {}
  }

  function generateIcon(visible) {
    if (visible) {
      return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 9C11.2044 9 10.4413 9.31607 9.87868 9.87868C9.31607 10.4413 9 11.2044 9 12C9 12.7956 9.31607 13.5587 9.87868 14.1213C10.4413 14.6839 11.2044 15 12 15C12.7956 15 13.5587 14.6839 14.1213 14.1213C14.6839 13.5587 15 12.7956 15 12C15 11.2044 14.6839 10.4413 14.1213 9.87868C13.5587 9.31607 12.7956 9 12 9Z" fill="white"/>
        <path d="M12 5C4 5 1 12 1 12C1 12 4 19 12 19C20 19 23 12 23 12C23 12 20 5 12 5ZM12 16C9.79086 16 8 14.2091 8 12C8 9.79086 9.79086 8 12 8C14.2091 8 16 9.79086 16 12C16 14.2091 14.2091 16 12 16Z" fill="white"/>
      </svg>`;
    }
    return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 9C13.6569 9 15 10.3431 15 12C15 12.3506 14.9398 12.6872 14.8293 13M12 9C10.3431 9 9 10.3431 9 12C9 12.3506 9.06015 12.6872 9.17071 13M12 9V6M6 6L18 18M15 12C15 13.0913 14.5931 14.1174 13.889 14.889M12 15C10.3431 15 9 13.6569 9 12C9 11.9087 9.00899 11.8187 9.02643 11.731M4 4L8 8M1 1L3 3M21 21L16 16M12 15V18" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
    </svg>`;
  }

  const BUTTON_STYLES = {
    base: `
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
      transition: transform 0.2s cubic-bezier(0.22, 0.61, 0.36, 1),
                  box-shadow 0.2s cubic-bezier(0.22, 0.61, 0.36, 1),
                  background 0.3s ease;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      color: white;
      gap: 10px;
      position: relative;
      overflow: hidden;
      box-sizing: border-box;
      will-change: transform, box-shadow;
    `,
    hover: 'translateY(-2px)',
    hoverShadow: '0 6px 8px rgba(0,0,0,0.15)',
    rest: 'translateY(0)',
    restShadow: '0 4px 6px rgba(0,0,0,0.1)',
    press: 'translateY(1px)',
    pressShadow: '0 2px 4px rgba(0,0,0,0.1)',
  };

  function createCustomButton(blockedState) {
    const toggleBtn = document.createElement('button');
    updateButtonContent(toggleBtn, blockedState);

    toggleBtn.style.cssText = `
      ${BUTTON_STYLES.base}
      background: ${blockedState ? '#2e7d32' : '#d32f2f'};
    `;

    toggleBtn.addEventListener('mouseenter', () => {
      toggleBtn.style.transform = BUTTON_STYLES.hover;
      toggleBtn.style.boxShadow = BUTTON_STYLES.hoverShadow;
    });

    toggleBtn.addEventListener('mouseleave', () => {
      toggleBtn.style.transform = BUTTON_STYLES.rest;
      toggleBtn.style.boxShadow = BUTTON_STYLES.restShadow;
      const light = toggleBtn.querySelector('.hover-light');
      if (light) light.style.opacity = '0';
    });

    toggleBtn.addEventListener('mousedown', () => {
      toggleBtn.style.transform = BUTTON_STYLES.press;
      toggleBtn.style.boxShadow = BUTTON_STYLES.pressShadow;
    });

    toggleBtn.addEventListener('mouseup', () => {
      toggleBtn.style.transform = BUTTON_STYLES.hover;
      toggleBtn.style.boxShadow = BUTTON_STYLES.hoverShadow;
    });

    const hoverLightEffect = document.createElement('div');
    hoverLightEffect.className = 'hover-light';
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

    toggleBtn.setAttribute('aria-label', blockedState ? 'Show videos' : 'Hide videos');
    toggleBtn.setAttribute('role', 'button');
    return toggleBtn;
  }

  function updateButtonContent(btn, blockedState) {
    btn.innerHTML = `
      <span class="btn-icon">${generateIcon(blockedState)}</span>
      <span>${blockedState ? 'Show Videos' : 'Hide Videos'}</span>
    `;
  }

  function setButtonCountdown(btn, secondsLeft) {
    btn.innerHTML = `
      <span class="btn-icon">${generateIcon(true)}</span>
      <span>Wait ${secondsLeft}s</span>
    `;
  }

  function updateButtonToConfirm(btn) {
    btn.innerHTML = `<span>Conferma</span>`;
    btn.style.background = '#e65100';
  }

  function updateToggleButton(state) {
    if (!toggleButton) return;
    updateButtonContent(toggleButton, state);
    toggleButton.style.background = state ? '#2e7d32' : '#d32f2f';
    toggleButton.setAttribute('aria-label', state ? 'Show videos' : 'Hide videos');
    toggleButton.disabled = false;
    toggleButton.style.cursor = 'pointer';
    toggleButton.style.opacity = '1';
  }

  function showWarningOverlay() {
    if (!overlayBg) {
      overlayBg = document.createElement('div');
      overlayBg.id = 'anti-shorts-overlay-bg';
      overlayBg.style.cssText = `
        position: fixed;
        top: 0; left: 0; right: 0; bottom: 0;
        background: rgba(0,0,0,0.75);
        z-index: 9998;
        display: none;
        align-items: center;
        justify-content: center;
      `;
      document.body.appendChild(overlayBg);

      const warningText = document.createElement('div');
      warningText.style.cssText = `
        color: #ff0000;
        font-size: 48px;
        font-weight: 900;
        font-family: 'Segoe UI', system-ui, sans-serif;
        text-align: center;
        text-shadow: 2px 2px 8px rgba(0,0,0,0.8);
        padding: 40px;
        max-width: 800px;
        line-height: 1.3;
      `;
      warningText.textContent = 'ATTENZIONE: Sei sicuro che vuoi perdere tempo così?';
      overlayBg.appendChild(warningText);
    }
    overlayBg.style.display = 'flex';
  }

  function hideWarningOverlay() {
    if (overlayBg) {
      overlayBg.style.display = 'none';
    }
  }

  function showSliderInput(container) {
    hideSliderInput();

    sliderContainer = document.createElement('div');
    sliderContainer.style.cssText = `
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
      padding: 10px 14px;
      background: rgba(30,30,30,0.95);
      border-radius: 10px;
      width: 180px;
      border: 1px solid rgba(255,255,255,0.15);
    `;

    const label = document.createElement('div');
    label.style.cssText = `
      color: #aaa;
      font-size: 12px;
      font-family: 'Segoe UI', system-ui, sans-serif;
      text-transform: uppercase;
      letter-spacing: 1px;
    `;
    label.textContent = 'Scegli i secondi';

    const valueDisplay = document.createElement('div');
    valueDisplay.style.cssText = `
      color: white;
      font-size: 20px;
      font-weight: 700;
      font-family: 'Segoe UI', system-ui, sans-serif;
    `;
    valueDisplay.textContent = `${COUNTDOWN_SEC}s`;

    sliderEl = document.createElement('input');
    sliderEl.type = 'range';
    sliderEl.min = String(MIN_SLIDER);
    sliderEl.max = String(MAX_SLIDER);
    sliderEl.value = String(COUNTDOWN_SEC);
    sliderEl.style.cssText = `
      width: 100%;
      height: 6px;
      -webkit-appearance: none;
      appearance: none;
      background: #444;
      border-radius: 3px;
      outline: none;
      cursor: pointer;
    `;

    sliderEl.addEventListener('input', () => {
      valueDisplay.textContent = `${sliderEl.value}s`;
    });

    sliderContainer.appendChild(label);
    sliderContainer.appendChild(valueDisplay);
    sliderContainer.appendChild(sliderEl);
    container.appendChild(sliderContainer);
  }

  function hideSliderInput() {
    if (sliderContainer) {
      sliderContainer.remove();
      sliderContainer = null;
    }
    sliderEl = null;
  }

  function isChannelPage() {
    const path = window.location.pathname;
    return path.startsWith('/@') || path.startsWith('/channel/');
  }

  function applyBlockCss() {
    let style = document.getElementById('anti-flash-style');
    if (!style) {
      style = document.createElement('style');
      style.id = 'anti-flash-style';
      document.head.appendChild(style);
    }
    if (isChannelPage()) {
      style.textContent = `
        #related {
          visibility: hidden !important;
        }
      `;
    } else {
      style.textContent = `
        ytd-two-column-browse-results-renderer,
        #related {
          visibility: hidden !important;
        }
      `;
    }
  }

  function removeBlockCss() {
    const style = document.getElementById('anti-flash-style');
    if (style) style.remove();
  }

  function wipeHome() {
    if (isChannelPage()) return;
    const browse = document.querySelector('ytd-two-column-browse-results-renderer');
    if (browse) browse.innerHTML = '';
    const related = document.querySelector('#related');
    if (related) related.innerHTML = '';
  }

  function removeShorts() {
    const selectors = [
      'ytd-rich-section-renderer:has(ytd-rich-shelf-renderer[is-shorts])',
      'ytd-guide-entry-renderer[title="Shorts"]',
      'a[href^="/shorts"]',
      'ytd-reel-shelf-renderer',
      'ytd-reel-item-renderer',
      'ytd-thumbnail-overlay-time-status-renderer[overlay-style="SHORTS"]',
    ];
    selectors.forEach((sel) => {
      document.querySelectorAll(sel).forEach((el) => el.remove());
    });
  }

  function blockVideoGridLoad() {
    const origObserve = MutationObserver.prototype.observe;
    MutationObserver.prototype.observe = function (target, options) {
      if (
        blocked &&
        !isChannelPage() &&
        (target?.tagName?.toLowerCase().includes('ytd-rich-grid-renderer') ||
          target?.id === 'related')
      ) {
        return;
      }
      return origObserve.apply(this, arguments);
    };
  }

  function startWipeInterval() {
    stopWipeInterval();
    wipeInterval = setInterval(() => {
      wipeHome();
      applyBlockCss();
    }, 1000);
  }

  function stopWipeInterval() {
    if (wipeInterval) {
      clearInterval(wipeInterval);
      wipeInterval = null;
    }
  }

  function applyBlocking() {
    blocked = true;
    saveBlockedState('true');
    applyBlockCss();
    wipeHome();
    startWipeInterval();
    updateToggleButton(true);
  }

  function removeBlocking() {
    blocked = false;
    saveBlockedState('false');
    removeBlockCss();
    stopWipeInterval();
    updateToggleButton(false);
  }

  function resetAutoBlockTimer() {
    clearAutoBlockTimer();
    if (!blocked) {
      autoBlockTimer = setTimeout(() => {
        if (!blocked) {
          applyBlocking();
        }
      }, AUTO_BLOCK_MS);
    }
  }

  function clearAutoBlockTimer() {
    if (autoBlockTimer) {
      clearTimeout(autoBlockTimer);
      autoBlockTimer = null;
    }
  }

  function getContainerStyles() {
    const base = {
      position: 'fixed',
      zIndex: '9999',
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
      alignItems: 'flex-end',
    };

    if (window.innerWidth < 768) {
      return { ...base, top: '60px', right: '5px' };
    }
    return { ...base, top: '70px', right: '10px' };
  }

  function startCountdown(button, seconds, onComplete) {
    button.disabled = true;
    button.style.cursor = 'not-allowed';
    button.style.opacity = '0.7';
    setButtonCountdown(button, seconds);

    const interval = setInterval(() => {
      seconds--;
      if (seconds <= 0) {
        clearInterval(interval);
        onComplete();
      } else {
        setButtonCountdown(button, seconds);
      }
    }, 1000);
  }

  function addToggle() {
    if (document.getElementById('video-toggle-container')) return;

    const container = document.createElement('div');
    container.id = 'video-toggle-container';
    Object.assign(container.style, getContainerStyles());

    toggleButton = createCustomButton(blocked);

    toggleButton.onclick = () => {
      if (blocked) {
        if (confirmMode) {
          const seconds = parseInt(sliderEl?.value, 10) || COUNTDOWN_SEC;
          confirmMode = false;
          hideWarningOverlay();
          hideSliderInput();
          startCountdown(toggleButton, seconds, () => {
            removeBlocking();
            resetAutoBlockTimer();
          });
        } else {
          confirmMode = true;
          showWarningOverlay();
          showSliderInput(container);
          updateButtonToConfirm(toggleButton);
        }
      } else {
        clearAutoBlockTimer();
        applyBlocking();
      }
    };

    container.appendChild(toggleButton);
    document.body.appendChild(container);

    document.addEventListener('fullscreenchange', () => {
      container.style.display = document.fullscreenElement ? 'none' : 'flex';
    });
  }

  function init() {
    if (blocked) {
      applyBlockCss();
      wipeHome();
      startWipeInterval();
    }

    blockVideoGridLoad();
    removeShorts();
    setInterval(removeShorts, 1000);

    addToggle();

    if (!blocked) {
      resetAutoBlockTimer();
    }
  }

  init();
})();

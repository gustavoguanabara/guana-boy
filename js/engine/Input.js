/**
 * Gerenciador Unificado de Entradas (Teclado, Touch, Multi-Touch e Botões Virtuais)
 * Baseado no Technical Requirement Document (TRD) e ADR-0016
 */

export class InputManager {
  constructor() {
    this.jumpPressed = false;
    this.jumpHeld = false;
    this.keyboardJumpHeld = false;
    this.activeJumpPointers = new Set();
    this.listeners = new Map();

    this._setupGlobalInteractions();
    this._bindKeyboard();
    this._bindVirtualButtons();
    this._bindScreenTouch();
  }

  vibrate(pattern = 10) {
    try {
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate(pattern);
      }
    } catch (_) {}
  }

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  _emit(event, data) {
    const cbs = this.listeners.get(event);
    if (cbs) {
      cbs.forEach(cb => cb(data));
    }
  }

  _setupGlobalInteractions() {
    // Desbloqueio universal do AudioContext no primeiro toque/clique
    const unlockAudio = () => {
      this._emit('user_interacted');
      window.removeEventListener('pointerdown', unlockAudio);
      window.removeEventListener('touchstart', unlockAudio);
    };
    window.addEventListener('pointerdown', unlockAudio, { passive: true });
    window.addEventListener('touchstart', unlockAudio, { passive: true });

    // Previne menu de contexto nativo do navegador em toques longos
    const consoleWrapper = document.getElementById('console-wrapper');
    if (consoleWrapper) {
      consoleWrapper.addEventListener('contextmenu', (e) => e.preventDefault());
    }
  }

  _setButtonActive(id, active) {
    const el = document.getElementById(id);
    if (!el) return;
    if (active) {
      el.classList.add('active');
    } else {
      el.classList.remove('active');
    }
  }

  _handleJumpStart(pointerId = null) {
    if (pointerId !== null) {
      this.activeJumpPointers.add(pointerId);
    }
    if (!this.jumpHeld) {
      this.jumpPressed = true;
      this.jumpHeld = true;
      this.vibrate(12);
      this._emit('jump_start');
    }
  }

  _handleJumpEnd(pointerId = null) {
    if (pointerId !== null) {
      this.activeJumpPointers.delete(pointerId);
    }
    if (this.activeJumpPointers.size === 0 && !this.keyboardJumpHeld) {
      this.jumpHeld = false;
      this._emit('jump_end');
    }
  }

  _bindKeyboard() {
    window.addEventListener('keydown', (e) => {
      if (e.code === 'Space') {
        this._setButtonActive('btn-a', true);
        this._setButtonActive('btn-b', true);
        if (!e.repeat) {
          this.keyboardJumpHeld = true;
          this._handleJumpStart();
        }
        e.preventDefault();
      } else if (e.code === 'ArrowUp') {
        this._setButtonActive('dpad-up', true);
        this._setButtonActive('btn-a', true);
        if (!e.repeat) {
          this.keyboardJumpHeld = true;
          this._handleJumpStart();
        }
        e.preventDefault();
      } else if (e.code === 'ArrowDown') {
        this._setButtonActive('dpad-down', true);
        this.vibrate(8);
        e.preventDefault();
      } else if (e.code === 'ArrowLeft') {
        this._setButtonActive('dpad-left', true);
        this.vibrate(8);
        e.preventDefault();
      } else if (e.code === 'ArrowRight') {
        this._setButtonActive('dpad-right', true);
        this.vibrate(8);
        e.preventDefault();
      } else if (e.code === 'KeyP' || e.code === 'Escape') {
        this._setButtonActive('btn-start', true);
        this.vibrate(10);
        this._emit('pause');
        e.preventDefault();
      } else if (e.code === 'KeyM') {
        this._setButtonActive('btn-select', true);
        this.vibrate(10);
        this._emit('mute');
        e.preventDefault();
      } else if (e.code === 'KeyZ') {
        this._setButtonActive('btn-power-switch', true);
        this.vibrate(10);
        this._emit('toggle_zoom');
        e.preventDefault();
      } else if (e.code === 'Enter') {
        this._setButtonActive('btn-start', true);
        this.vibrate(10);
        this._emit('start');
        this._emit('pause');
        e.preventDefault();
      }
    });

    window.addEventListener('keyup', (e) => {
      if (e.code === 'Space') {
        this._setButtonActive('btn-a', false);
        this._setButtonActive('btn-b', false);
        this.keyboardJumpHeld = false;
        this._handleJumpEnd();
        e.preventDefault();
      } else if (e.code === 'ArrowUp') {
        this._setButtonActive('dpad-up', false);
        this._setButtonActive('btn-a', false);
        this.keyboardJumpHeld = false;
        this._handleJumpEnd();
        e.preventDefault();
      } else if (e.code === 'ArrowDown') {
        this._setButtonActive('dpad-down', false);
        e.preventDefault();
      } else if (e.code === 'ArrowLeft') {
        this._setButtonActive('dpad-left', false);
        e.preventDefault();
      } else if (e.code === 'ArrowRight') {
        this._setButtonActive('dpad-right', false);
        e.preventDefault();
      } else if (e.code === 'KeyP' || e.code === 'Escape' || e.code === 'Enter') {
        this._setButtonActive('btn-start', false);
        e.preventDefault();
      } else if (e.code === 'KeyM') {
        this._setButtonActive('btn-select', false);
        e.preventDefault();
      } else if (e.code === 'KeyZ') {
        this._setButtonActive('btn-power-switch', false);
        e.preventDefault();
      }
    });
  }

  _bindVirtualButtons() {
    const attachButton = (id, onDown, onUp) => {
      const el = document.getElementById(id);
      if (!el) return;

      const handleDown = (e) => {
        e.preventDefault();
        el.classList.add('active');
        this.vibrate(10);
        try {
          el.setPointerCapture(e.pointerId);
        } catch (_) {}
        if (onDown) onDown(e);
      };

      const handleUp = (e) => {
        e.preventDefault();
        el.classList.remove('active');
        try {
          el.releasePointerCapture(e.pointerId);
        } catch (_) {}
        if (onUp) onUp(e);
      };

      el.addEventListener('pointerdown', handleDown);
      el.addEventListener('pointerup', handleUp);
      el.addEventListener('pointercancel', handleUp);
      el.addEventListener('pointerleave', (e) => {
        if (!el.hasPointerCapture || !el.hasPointerCapture(e.pointerId)) {
          el.classList.remove('active');
          if (onUp) onUp(e);
        }
      });
    };

    // Botões de pulo com multi-touch tracking independente
    attachButton('btn-a', (e) => this._handleJumpStart(e.pointerId), (e) => this._handleJumpEnd(e.pointerId));
    attachButton('btn-b', (e) => this._handleJumpStart(e.pointerId), (e) => this._handleJumpEnd(e.pointerId));
    attachButton('dpad-up', (e) => this._handleJumpStart(e.pointerId), (e) => this._handleJumpEnd(e.pointerId));

    // Direcionais restantes
    attachButton('dpad-down', () => {}, () => {});
    attachButton('dpad-left', () => {}, () => {});
    attachButton('dpad-right', () => {}, () => {});

    // Botão START
    attachButton('btn-start', () => {
      this._emit('start');
      this._emit('pause');
    });

    // Botão SELECT
    attachButton('btn-select', () => {
      this._emit('mute');
    });

    // Interruptor Virtual OFF/ON no Topo Esquerdo (Alternar Zoom da Tela)
    attachButton('btn-power-switch', () => {
      this._emit('toggle_zoom');
    });
  }

  _bindScreenTouch() {
    // Interatividade tátil com o visor LCD: tocar na tela pula e interage
    const screen = document.getElementById('screen-container');
    if (!screen) return;

    screen.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      screen.classList.add('active');
      try {
        screen.setPointerCapture(e.pointerId);
      } catch (_) {}
      this._emit('start');
      this._handleJumpStart(e.pointerId);
    });

    const handleScreenUp = (e) => {
      e.preventDefault();
      screen.classList.remove('active');
      try {
        screen.releasePointerCapture(e.pointerId);
      } catch (_) {}
      this._handleJumpEnd(e.pointerId);
    };

    screen.addEventListener('pointerup', handleScreenUp);
    screen.addEventListener('pointercancel', handleScreenUp);
    screen.addEventListener('pointerleave', (e) => {
      if (!screen.hasPointerCapture || !screen.hasPointerCapture(e.pointerId)) {
        screen.classList.remove('active');
        this._handleJumpEnd(e.pointerId);
      }
    });
  }

  /**
   * Consome o pulo imediato (impede múltiplos disparos no mesmo frame)
   */
  consumeJump() {
    const pressed = this.jumpPressed;
    this.jumpPressed = false;
    return pressed;
  }
}

/**
 * Gerenciador do Menu Flutuante Inferior (Bottom Floating Menu / Drawer)
 * Controla a aba "MENU", painel expansível e ações com ícones bitmap.
 * Requisitos:
 * - Botão de Play/Pause no início do menu
 * - Botão de Zoom Dinâmico da tela
 * - Desligar/ligar o som
 * - Reiniciar o jogo
 * - Limpar o placar de recorde (com confirmação)
 * - Ícones bitmap para todas as opções (sem texto escrito nos botões)
 */

import { ASSET_PATHS, GameState } from '../utils/Constants.js';

export class FloatingMenu {
  constructor({ game, audio }) {
    this.game = game;
    this.audio = audio;

    this.isOpen = false;
    this.isConfirmingClear = false;
    this.isZoomed = false;

    this._bindElements();
    this._attachEvents();
    this.syncUI();
  }

  _vibrate(pattern = 8) {
    try {
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate(pattern);
      }
    } catch (_) {}
  }

  _bindElements() {
    this.container = document.getElementById('floating-menu');
    this.tabBtn = document.getElementById('menu-tab');
    this.panel = document.getElementById('menu-panel');
    this.consoleWrapper = document.getElementById('console-wrapper');

    // Botão de Play / Pause
    this.btnTogglePlay = document.getElementById('btn-toggle-play');
    this.playPauseIconImg = document.getElementById('play-pause-icon-img');

    // Botão de zoom
    this.btnToggleZoom = document.getElementById('btn-toggle-zoom');
    this.zoomIconImg = document.getElementById('zoom-icon-img');

    // Botão de som
    this.btnToggleSound = document.getElementById('btn-toggle-sound');
    this.soundIconImg = document.getElementById('sound-icon-img');

    // Botão de reiniciar
    this.btnRestartGame = document.getElementById('btn-restart-game');

    // Botão e diálogo de limpar recorde
    this.btnClearRecord = document.getElementById('btn-clear-record');
    this.confirmDialog = document.getElementById('confirm-record-dialog');
    this.btnConfirmClear = document.getElementById('btn-confirm-clear');
    this.btnCancelClear = document.getElementById('btn-cancel-clear');
  }

  _attachEvents() {
    if (!this.tabBtn) return;

    // Clique na aba de puxar "MENU"
    this.tabBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this._vibrate(8);
      this.toggle();
    });

    // Botão Play / Pause
    this.btnTogglePlay?.addEventListener('click', (e) => {
      e.stopPropagation();
      this._vibrate(8);
      this.game.togglePause();
      this.updatePlayPauseUI();
    });

    // Ouvir alterações de estado do jogo (via teclado, toque ou fim de jogo)
    this.game.onStateChange(() => {
      this.updatePlayPauseUI();
    });

    // Alternar Zoom da Tela do Jogo
    this.btnToggleZoom?.addEventListener('click', (e) => {
      e.stopPropagation();
      this._vibrate(8);
      this.toggleZoom();
    });

    // Ligar / Desligar Som
    this.btnToggleSound?.addEventListener('click', (e) => {
      e.stopPropagation();
      this._vibrate(8);
      this.audio.toggleMute();
      this.updateSoundUI();
    });

    // Reiniciar o Jogo
    this.btnRestartGame?.addEventListener('click', (e) => {
      e.stopPropagation();
      this._vibrate(10);
      this.audio.playMenuBeep(true);
      this.game.restartGame();
      this.close();
    });

    // Solicitar limpeza de recorde (abre confirmação)
    this.btnClearRecord?.addEventListener('click', (e) => {
      e.stopPropagation();
      this._vibrate(8);
      this.audio.playMenuBeep(false);
      this.showConfirmDialog();
    });

    // Confirmar limpeza
    this.btnConfirmClear?.addEventListener('click', (e) => {
      e.stopPropagation();
      this._vibrate(12);
      this.game.clearHighScore();
      this.audio.playMenuBeep(true);
      this.hideConfirmDialog();
    });

    // Cancelar limpeza
    this.btnCancelClear?.addEventListener('click', (e) => {
      e.stopPropagation();
      this._vibrate(8);
      this.audio.playMenuBeep(false);
      this.hideConfirmDialog();
    });

    // Fechar ao clicar fora do painel
    document.addEventListener('pointerdown', (e) => {
      if (this.isOpen && this.container && !this.container.contains(e.target)) {
        this.close();
      }
    });

    // Fechar ao pressionar Escape se o menu estiver aberto
    window.addEventListener('keydown', (e) => {
      if (e.code === 'Escape' && this.isOpen) {
        this.close();
      }
    });
  }

  toggle() {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  open() {
    this.isOpen = true;
    this.container?.classList.add('open');
    this.tabBtn?.setAttribute('aria-expanded', 'true');
    this.audio.playMenuBeep(true);
  }

  close() {
    this.isOpen = false;
    this.container?.classList.remove('open');
    this.tabBtn?.setAttribute('aria-expanded', 'false');
    this.hideConfirmDialog();
  }

  showConfirmDialog() {
    this.isConfirmingClear = true;
    this.confirmDialog?.classList.remove('hidden');
    this.btnClearRecord?.classList.add('pulse-active');
  }

  hideConfirmDialog() {
    this.isConfirmingClear = false;
    this.confirmDialog?.classList.add('hidden');
    this.btnClearRecord?.classList.remove('pulse-active');
  }

  updatePlayPauseUI() {
    if (!this.playPauseIconImg) return;
    const isPlaying = (this.game.state === GameState.PLAYING);
    // Se o jogo está rodando, exibe o ícone de PAUSE. Se está pausado/pronto, exibe PLAY.
    this.playPauseIconImg.src = isPlaying ? ASSET_PATHS.ICONS.PAUSE : ASSET_PATHS.ICONS.PLAY;
    if (this.btnTogglePlay) {
      this.btnTogglePlay.classList.toggle('active-playing', isPlaying);
      this.btnTogglePlay.title = isPlaying ? 'Pausar Jogo' : 'Iniciar / Retomar Jogo';
      this.btnTogglePlay.setAttribute('aria-label', isPlaying ? 'Pausar Jogo' : 'Iniciar / Retomar Jogo');
    }
  }

  toggleZoom() {
    this.isZoomed = !this.isZoomed;
    this.updateZoomUI();
    this.audio.playMenuBeep(this.isZoomed);
    this._vibrate(10);
  }

  updateZoomUI() {
    if (!this.consoleWrapper || !this.zoomIconImg) return;
    const powerBtn = document.getElementById('btn-power-switch');
    if (this.isZoomed) {
      this.consoleWrapper.classList.add('zoomed');
      this.zoomIconImg.src = ASSET_PATHS.ICONS.ZOOM_OUT;
      this.btnToggleZoom?.classList.add('active-zoom');
      if (powerBtn) {
        powerBtn.title = 'Desligar Zoom da Tela (Retornar Console Completo)';
        powerBtn.setAttribute('aria-label', 'Desligar Zoom da Tela (Retornar Console Completo)');
      }
    } else {
      this.consoleWrapper.classList.remove('zoomed');
      this.zoomIconImg.src = ASSET_PATHS.ICONS.ZOOM_IN;
      this.btnToggleZoom?.classList.remove('active-zoom');
      if (powerBtn) {
        powerBtn.title = 'Ligar Zoom da Tela (Aproximar Visor do Game)';
        powerBtn.setAttribute('aria-label', 'Ligar Zoom da Tela (Aproximar Visor do Game)');
      }
    }
  }

  updateSoundUI() {
    if (!this.soundIconImg) return;
    const isMuted = this.audio.muted;
    this.soundIconImg.src = isMuted ? ASSET_PATHS.ICONS.SOUND_OFF : ASSET_PATHS.ICONS.SOUND_ON;
    if (this.btnToggleSound) {
      this.btnToggleSound.classList.toggle('sound-muted', isMuted);
    }
  }

  syncUI() {
    this.updatePlayPauseUI();
    this.updateZoomUI();
    this.updateSoundUI();
    this.hideConfirmDialog();
  }
}

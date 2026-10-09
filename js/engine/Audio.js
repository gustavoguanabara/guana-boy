/**
 * Motor de Áudio Procedural Chiptune 8-Bit (Web Audio API)
 * Baseado no Technical Requirement Document (TRD), ADR-0004 e ADR-0011
 */

export class AudioManager {
  constructor() {
    this.ctx = null;
    // Por especificação de design, o som permanece SEMPRE ativo
    this.muted = false;
    this.masterGain = null;
    this.isInitialized = false;
  }

  /**
   * Inicializa o AudioContext no primeiro gesto do usuário
   */
  init() {
    if (this.isInitialized && this.ctx) {
      if (this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
      return;
    }

    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) {
        console.warn('Web Audio API não suportada neste navegador.');
        return;
      }
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      // Volume master calibrado (25%)
      this.masterGain.gain.setValueAtTime(0.25, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
      this.isInitialized = true;

      if (this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
    } catch (e) {
      console.warn('Erro ao inicializar AudioContext:', e);
    }
  }

  /**
   * Garante que o contexto esteja inicializado e ativo (despertando de suspended se necessário)
   */
  _ensureContext() {
    if (!this.ctx || !this.isInitialized) {
      this.init();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    if (this.masterGain && this.ctx) {
      const volume = this.muted ? 0 : 0.25;
      this.masterGain.gain.setValueAtTime(volume, this.ctx.currentTime);
    }
  }

  /**
   * Alterna entre som ligado e desligado (Mute/Unmute)
   * @returns {boolean} Novo estado de muted (true = mudo, false = com som)
   */
  toggleMute() {
    this.init();
    this.muted = !this.muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.muted ? 0 : 0.25, this.ctx.currentTime);
    }
    if (!this.muted) {
      this.playMenuBeep(true);
    }
    return this.muted;
  }

  /**
   * Define o estado de mudo diretamente
   * @param {boolean} isMuted
   */
  setMuted(isMuted) {
    this.init();
    this.muted = !!isMuted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.muted ? 0 : 0.25, this.ctx.currentTime);
    }
    return this.muted;
  }

  /**
   * Bipe curto chiptune para interações no menu retrô
   */
  playMenuBeep(highPitch = true) {
    if (this.muted) return;
    this._ensureContext();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(highPitch ? 880 : 440, now);
      osc.frequency.exponentialRampToValueAtTime(highPitch ? 1174 : 587, now + 0.05);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.07);
    } catch (_) {}
  }

  /**
   * Efeito Sonoro de Pulo (Jump): Sweep de frequência quadrada ascendente
   */
  playJump() {
    if (this.muted) return;
    this._ensureContext();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.exponentialRampToValueAtTime(600, now + 0.12);

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.15);
    } catch (e) {
      console.warn('Erro ao reproduzir som de pulo:', e);
    }
  }

  /**
   * Efeito Sonoro de Pause: Duas notas descendentes chiptune (E5 -> A4)
   * Tom característico Game Boy indicando suspensão da ação
   */
  playPause() {
    if (this.muted) return;
    this._ensureContext();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(659.25, now); // E5
      osc.frequency.setValueAtTime(440.00, now + 0.06); // A4

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.setValueAtTime(0.25, now + 0.055);
      gain.gain.setValueAtTime(0.22, now + 0.06);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.17);
    } catch (e) {
      console.warn('Erro ao reproduzir som de pausa:', e);
    }
  }

  /**
   * Efeito Sonoro de Retorno da Pausa (Unpause): Duas notas ascendentes chiptune (A4 -> E5)
   * Tom alegre e enérgico indicando retorno imediato ao jogo
   */
  playUnpause() {
    if (this.muted) return;
    this._ensureContext();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(440.00, now); // A4
      osc.frequency.setValueAtTime(659.25, now + 0.06); // E5

      gain.gain.setValueAtTime(0.22, now);
      gain.gain.setValueAtTime(0.22, now + 0.055);
      gain.gain.setValueAtTime(0.25, now + 0.06);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.17);
    } catch (e) {
      console.warn('Erro ao reproduzir som de retorno da pausa:', e);
    }
  }

  /**
   * Efeito Sonoro de Pontuação (Score): Arpeggio curto em 2 notas
   */
  playScore() {
    if (this.muted) return;
    this._ensureContext();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.setValueAtTime(659.25, now + 0.06); // E5

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.16);
    } catch (e) {
      console.warn('Erro ao reproduzir som de pontuação:', e);
    }
  }

  /**
   * Efeito Sonoro de Dano / Colisão (Hit): Ruído branco percussivo
   */
  playHit() {
    if (this.muted) return;
    this._ensureContext();
    if (!this.ctx) return;
    try {
      const bufferSize = this.ctx.sampleRate * 0.18;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);

      // Gera ruído aleatório
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;

      gain.gain.setValueAtTime(0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);

      noise.connect(gain);
      gain.connect(this.masterGain);

      noise.start(now);
    } catch (e) {
      console.warn('Erro ao reproduzir som de colisão:', e);
    }
  }

  /**
   * Efeito Sonoro de Game Over: Escala descendente melancólica
   */
  playGameOver() {
    if (this.muted) return;
    this._ensureContext();
    if (!this.ctx) return;
    try {
      const freqs = [392, 330, 261, 196]; // G4, E4, C4, G3
      freqs.forEach((freq, idx) => {
        const now = this.ctx.currentTime + idx * 0.12;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.11);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(now);
        osc.stop(now + 0.12);
      });
    } catch (e) {
      console.warn('Erro ao reproduzir som de game over:', e);
    }
  }
}

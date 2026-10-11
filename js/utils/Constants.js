/**
 * Constantes Globais do Jogo Guana-Boy
 * Baseado no Technical Requirement Document (TRD)
 */

export const CANVAS_WIDTH = 320;
export const CANVAS_HEIGHT = 278;
export const APP_VERSION = 'v1.0.5';

export const PHYSICS = {
  GRAVITY: 1750,                 // px/s²
  INITIAL_JUMP_FORCE: -490,       // Velocidade instantânea ao pular
  HOLD_JUMP_ACCELERATION: -600,   // Força de sustentação do salto
  MAX_JUMP_HOLD_TIME: 0.22,       // Tempo máximo em segundos de sustentação
  INITIAL_SPEED: 240,             // Velocidade inicial de corrida do chão
  MAX_SPEED: 520,                 // Velocidade máxima permitida
  ACCELERATION: 4,                // Incremento contínuo de velocidade (px/s²)
  GROUND_DRAW_Y: 234,             // Topo visual da renderização do asset chao.png
  GROUND_Y: 241                   // Linha do solo da pisada (firme em cima do gramado)
};

export const RULES = {
  INITIAL_LIVES: 4,               // 4 vidas conforme aprovado no BRD/TRD
  INVULNERABILITY_TIME: 1.8,      // Tempo de imunidade após dano (segundos)
  BLINK_INTERVAL: 0.1             // Frequência de piscada visual durante imunidade
};

export const GameState = Object.freeze({
  READY: 'READY',
  PLAYING: 'PLAYING',
  PAUSED: 'PAUSED',
  GAMEOVER: 'GAMEOVER'
});

export const STORAGE_KEYS = Object.freeze({
  HIGH_SCORE: 'guanaboy_high_score'
});

export const DIFFICULTY_LEVELS = Object.freeze([
  { level: 1, initialSpeed: 180, maxSpeed: 420, acceleration: 3 },
  { level: 2, initialSpeed: 240, maxSpeed: 520, acceleration: 4 }, // Padrão
  { level: 3, initialSpeed: 300, maxSpeed: 620, acceleration: 5 },
  { level: 4, initialSpeed: 380, maxSpeed: 740, acceleration: 6 }
]);

export const ASSET_PATHS = Object.freeze({
  CONSOLE: './images/console.png',
  SCENARIO: './images/cenario.png',
  GROUND: './images/chao.png',
  CLOUDS: [
    './images/nuvem-01.png',
    './images/nuvem-02.png',
    './images/nuvem-03.png'
  ],
  PLAYER_WALK: [
    './images/personagem-andando-01.png',
    './images/personagem-andando-02.png',
    './images/personagem-andando-03.png',
    './images/personagem-andando-04.png'
  ],
  PLAYER_JUMP_UP: './images/personagem-pulando-01.png',
  PLAYER_JUMP_DOWN: './images/personagem-pulando-02.png',
  PLAYER_LANDING: './images/personagem-pulando-03.png',
  OBSTACLES: [
    './images/obstaculo-01.png',
    './images/obstaculo-02.png'
  ],
  ICONS: {
    SPEED_DOWN: './images/icons/icon-speed-down.png',
    SPEED_UP: './images/icons/icon-speed-up.png',
    SOUND_ON: './images/icons/icon-sound-on.png',
    SOUND_OFF: './images/icons/icon-sound-off.png',
    RESTART: './images/icons/icon-restart.png',
    CLEAR_RECORD: './images/icons/icon-clear-record.png',
    CONFIRM: './images/icons/icon-confirm.png',
    CANCEL: './images/icons/icon-cancel.png',
    ZOOM_IN: './images/icons/icon-zoom-in.png',
    ZOOM_OUT: './images/icons/icon-zoom-out.png',
    PLAY: './images/icons/icon-play.png',
    PAUSE: './images/icons/icon-pause.png'
  },
  LEGACY_OBSTACLES: './images/obstaculos.png',
  LEGACY_CHARACTER: './images/personagem.png'
});

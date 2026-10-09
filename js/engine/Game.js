/**
 * Orquestrador do Jogo (Game Engine Core)
 * Gerencia a máquina de estados, o ciclo de vida, colisões e áudio
 * Baseado no Technical Requirement Document (TRD)
 */

import { GameState, PHYSICS, RULES, DIFFICULTY_LEVELS } from '../utils/Constants.js';
import { Collision } from '../utils/Collision.js';
import { StorageService } from './Storage.js';

export class Game {
  constructor({ renderer, input, audio, player, background, obstacles }) {
    this.renderer = renderer;
    this.input = input;
    this.audio = audio;
    this.player = player;
    this.background = background;
    this.obstacles = obstacles;

    this.state = GameState.READY;
    this.score = 0;
    this.highScore = StorageService.getHighScore();
    this.difficultyLevel = 2; // Padrão: Normal
    this.currentSpeed = this.getInitialSpeed();

    this.lastTime = 0;
    this.fps = 60;
    this.isSmokeTestMode = false;
    this._stateChangeListeners = [];

    this._setupInputListeners();
  }

  onStateChange(callback) {
    this._stateChangeListeners.push(callback);
  }

  _emitStateChange() {
    this._stateChangeListeners.forEach(cb => cb(this.state));
  }

  getDifficulty() {
    return DIFFICULTY_LEVELS.find(d => d.level === this.difficultyLevel) || DIFFICULTY_LEVELS[1];
  }

  getInitialSpeed() {
    return this.getDifficulty().initialSpeed;
  }

  getMaxSpeed() {
    return this.getDifficulty().maxSpeed;
  }

  getAcceleration() {
    return this.getDifficulty().acceleration;
  }

  setDifficulty(level) {
    const clamped = Math.max(1, Math.min(4, Math.floor(level)));
    if (this.difficultyLevel !== clamped) {
      this.difficultyLevel = clamped;
      if (this.state === GameState.READY) {
        this.currentSpeed = this.getInitialSpeed();
      } else if (this.state === GameState.PLAYING) {
        // Ajusta a velocidade corrente respeitando o novo patamar
        const diff = this.getDifficulty();
        this.currentSpeed = Math.max(diff.initialSpeed, Math.min(this.currentSpeed, diff.maxSpeed));
      }
    }
    return this.difficultyLevel;
  }

  increaseDifficulty() {
    if (this.difficultyLevel < 4) {
      this.setDifficulty(this.difficultyLevel + 1);
      this.audio.playMenuBeep(true);
    }
    return this.difficultyLevel;
  }

  decreaseDifficulty() {
    if (this.difficultyLevel > 1) {
      this.setDifficulty(this.difficultyLevel - 1);
      this.audio.playMenuBeep(false);
    }
    return this.difficultyLevel;
  }

  clearHighScore() {
    StorageService.clearHighScore();
    this.highScore = 0;
  }

  togglePause() {
    this.audio.init();
    if (this.state === GameState.PLAYING) {
      this.state = GameState.PAUSED;
      this.audio.playPause();
    } else if (this.state === GameState.PAUSED) {
      this.state = GameState.PLAYING;
      this.audio.playUnpause();
    } else if (this.state === GameState.READY) {
      this.startGame();
    } else if (this.state === GameState.GAMEOVER) {
      this.restartGame();
    }
    this._emitStateChange();
  }

  _setupInputListeners() {
    this.input.on('jump_start', () => {
      this.audio.init();

      if (this.state === GameState.READY) {
        this.startGame();
      } else if (this.state === GameState.PLAYING) {
        if (this.player.jump()) {
          this.audio.playJump();
        }
      } else if (this.state === GameState.GAMEOVER) {
        this.restartGame();
      } else if (this.isSmokeTestMode) {
        this.audio.playJump();
      }
    });

    this.input.on('pause', () => {
      this.togglePause();
    });

    this.input.on('mute', () => {
      this.audio.init();
      this.audio.toggleMute();
    });

    this.input.on('start', () => {
      this.audio.init();
      if (this.state === GameState.READY) {
        this.startGame();
      } else if (this.state === GameState.GAMEOVER) {
        this.restartGame();
      }
    });
  }

  startGame() {
    this.state = GameState.PLAYING;
    this.score = 0;
    this.currentSpeed = this.getInitialSpeed();
    this.player.reset();
    this.obstacles.reset();
    this._emitStateChange();
  }

  restartGame() {
    this.startGame();
  }

  gameOver() {
    this.state = GameState.GAMEOVER;
    if (this.score > this.highScore) {
      this.highScore = Math.floor(this.score);
      StorageService.setHighScore(this.highScore);
    }
    this.audio.playGameOver();
    this.input?.vibrate([40, 40, 70]);
    this._emitStateChange();
  }

  start() {
    this.lastTime = performance.now();
    requestAnimationFrame((t) => this.loop(t));
  }

  loop(currentTime) {
    if (!this.lastTime) this.lastTime = currentTime;
    const deltaMs = currentTime - this.lastTime;
    const deltaTime = Math.min(deltaMs / 1000, 0.1); // trava máxima de 100ms
    this.lastTime = currentTime;

    if (deltaTime > 0) {
      this.fps = 1 / deltaTime;
    }

    if (this.isSmokeTestMode) {
      this.renderer.renderSmokeTestScreen(this.fps, this.audio.isInitialized);
    } else {
      this.update(deltaTime);
      this.render();
    }

    requestAnimationFrame((t) => this.loop(t));
  }

  update(deltaTime) {
    if (this.state !== GameState.PLAYING) {
      if (this.state === GameState.READY) {
        // Brisa suave nas nuvens em tela de boas-vindas
        this.background.update(deltaTime, 60, false);
      }
      return;
    }

    // Atualiza velocidade e pontuação de acordo com o patamar de dificuldade selecionado
    const accel = this.getAcceleration();
    const maxSpd = this.getMaxSpeed();
    this.currentSpeed = Math.min(
      this.currentSpeed + accel * deltaTime,
      maxSpd
    );
    this.score += deltaTime * 10;

    // Atualiza entidades
    this.background.update(deltaTime, this.currentSpeed, true);
    this.player.update(deltaTime, this.input.jumpHeld);
    this.obstacles.update(deltaTime, this.currentSpeed);

    // Checagem de colisões
    for (const obs of this.obstacles.obstacles) {
      if (Collision.check(this.player, obs)) {
        const tookDamage = this.player.takeDamage();
        if (tookDamage) {
          this.audio.playHit();
          this.input?.vibrate(45);
          if (this.player.lives <= 0) {
            this.gameOver();
            break;
          }
        }
      }
    }
  }

  render() {
    this.renderer.clear();

    if (this.state === GameState.READY) {
      this.background.render(this.renderer.ctx);
      this.player.render(this.renderer.ctx);
      this.renderer.renderReadyScreen();
      return;
    }

    // Cenário
    this.background.render(this.renderer.ctx);

    // Obstáculos e Jogador
    this.obstacles.render(this.renderer.ctx);
    this.player.render(this.renderer.ctx);

    // HUD
    this.renderer.renderHUD(this.player.lives, this.score, this.highScore);

    // Telas de sobreposição
    if (this.state === GameState.PAUSED) {
      this.renderer.renderPauseScreen();
    } else if (this.state === GameState.GAMEOVER) {
      this.renderer.renderGameOverScreen(this.score, this.highScore);
    }
  }
}

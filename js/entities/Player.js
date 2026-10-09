/**
 * Entidade do Jogador (Guanabara)
 * Implementa física, salto dinâmico, vidas e invulnerabilidade
 */

import { PHYSICS, RULES, CANVAS_WIDTH } from '../utils/Constants.js';

export class Player {
  constructor(optionsOrImage) {
    if (optionsOrImage && !optionsOrImage.walkFrames) {
      this.walkFrames = [optionsOrImage];
      this.jumpUpFrame = optionsOrImage;
      this.jumpDownFrame = optionsOrImage;
      this.landingFrame = optionsOrImage;
    } else {
      const opts = optionsOrImage || {};
      this.walkFrames = opts.walkFrames || [];
      this.jumpUpFrame = opts.jumpUpFrame || null;
      this.jumpDownFrame = opts.jumpDownFrame || null;
      this.landingFrame = opts.landingFrame || null;
    }

    // Proporção de aspecto estrita sem distorção (dimensões nativas dos frames: 261 x 478 px)
    this.originalWidth = 261;
    this.originalHeight = 478;
    this.scale = 0.185; // Aumentado para escala ideal no console (48x88px) com proporção rigorosa
    this.width = Math.round(this.originalWidth * this.scale);   // 48px
    this.height = Math.round(this.originalHeight * this.scale); // 88px

    this.x = 35;
    this.y = PHYSICS.GROUND_Y - this.height;
    this.velocityY = 0;
    this.isGrounded = true;
    this.isJumping = false;
    this.jumpTimer = 0;

    // Timer do frame de aterrissagem/impacto (personagem-pulando-03.png)
    this.landingTimer = 0;
    this.landingDuration = 0.12; // 120ms exibindo o impacto no chão

    // Vidas e Invulnerabilidade
    this.lives = RULES.INITIAL_LIVES;
    this.invulnerableTimer = 0;
    this.visible = true;

    // Animação de corrida
    this.frameIndex = 0;
    this.frameTimer = 0;
    this.frameInterval = 0.09; // ~11 fps para passada ágil e fluida

    // Hitbox precisa calculada sobre a porção física real do personagem
    // (a cabeça inicia em ~32% da altura do frame; os 30% superiores são transparentes)
    this.paddingTop = Math.round(this.height * 0.32);     // ~28px
    this.paddingBottom = 2;                                // ~2px
    this.paddingLeft = Math.round(this.width * 0.15);     // ~7px
    this.paddingRight = Math.round(this.width * 0.15);    // ~7px
  }

  reset() {
    this.y = PHYSICS.GROUND_Y - this.height;
    this.velocityY = 0;
    this.isGrounded = true;
    this.isJumping = false;
    this.jumpTimer = 0;
    this.landingTimer = 0;
    this.lives = RULES.INITIAL_LIVES;
    this.invulnerableTimer = 0;
    this.visible = true;
    this.frameIndex = 0;
    this.frameTimer = 0;
  }

  jump() {
    if (this.isGrounded) {
      this.velocityY = PHYSICS.INITIAL_JUMP_FORCE;
      this.isGrounded = false;
      this.isJumping = true;
      this.jumpTimer = 0;
      this.landingTimer = 0; // Cancela frame de aterrissagem imediatamente
      return true;
    }
    return false;
  }

  update(deltaTime, isJumpHeld) {
    // Física do salto sustentado (salto dinâmico)
    if (this.isJumping && isJumpHeld && this.jumpTimer < PHYSICS.MAX_JUMP_HOLD_TIME) {
      this.velocityY += PHYSICS.HOLD_JUMP_ACCELERATION * deltaTime;
      this.jumpTimer += deltaTime;
    } else {
      this.isJumping = false;
    }

    // Aplicação da gravidade
    this.velocityY += PHYSICS.GRAVITY * deltaTime;
    this.y += this.velocityY * deltaTime;

    // Colisão com o piso do solo
    const groundLimit = PHYSICS.GROUND_Y - this.height;
    if (this.y >= groundLimit) {
      const wasInAir = !this.isGrounded;
      this.y = groundLimit;
      this.velocityY = 0;
      this.isGrounded = true;
      this.isJumping = false;

      // Assim que toca o chão vindo do ar, ativa o frame de impacto (personagem-pulando-03.png)
      if (wasInAir) {
        this.landingTimer = this.landingDuration;
      }
    }

    // Gestão do tempo de exibição do frame de aterrissagem
    if (this.isGrounded && this.landingTimer > 0) {
      this.landingTimer -= deltaTime;
    }

    // Gestão de invulnerabilidade e efeito de piscar
    if (this.invulnerableTimer > 0) {
      this.invulnerableTimer -= deltaTime;
      this.visible = Math.floor(this.invulnerableTimer / RULES.BLINK_INTERVAL) % 2 === 0;
      if (this.invulnerableTimer <= 0) {
        this.invulnerableTimer = 0;
        this.visible = true;
      }
    } else {
      this.visible = true;
    }

    // Animação de corrida quando no solo e não estiver no frame de aterrissagem
    if (this.isGrounded && this.landingTimer <= 0) {
      this.frameTimer += deltaTime;
      if (this.frameTimer >= this.frameInterval) {
        this.frameTimer = 0;
        const totalWalkFrames = this.walkFrames.length || 1;
        this.frameIndex = (this.frameIndex + 1) % totalWalkFrames;
      }
    }
  }

  /**
   * Determina qual frame de sprite deve ser renderizado no instante atual
   */
  getCurrentSprite() {
    // 1. No ar: subindo ou descendo
    if (!this.isGrounded) {
      if (this.velocityY <= 0) {
        // Subindo no pulo, até o ponto mais alto do salto
        return this.jumpUpFrame || this.walkFrames[0] || null;
      } else {
        // Descendo do pulo, até quase atingir o chão de volta
        return this.jumpDownFrame || this.walkFrames[0] || null;
      }
    }

    // 2. Assim que toca o chão depois do pulo
    if (this.landingTimer > 0) {
      return this.landingFrame || this.walkFrames[0] || null;
    }

    // 3. No chão correndo normalmente: ciclo 01 a 04
    if (this.walkFrames.length > 0) {
      return this.walkFrames[this.frameIndex] || this.walkFrames[0];
    }

    return null;
  }

  takeDamage() {
    if (this.invulnerableTimer > 0) return false;
    this.lives -= 1;
    this.invulnerableTimer = RULES.INVULNERABILITY_TIME;
    return true;
  }

  render(ctx) {
    if (!this.visible) return;

    const sprite = this.getCurrentSprite();
    if (sprite && sprite.complete && sprite.naturalWidth > 0) {
      // Renderização proporcional sem nenhuma distorção geométrica
      ctx.drawImage(sprite, this.x, this.y, this.width, this.height);
    } else {
      // Fallback gráfico retrô
      ctx.fillStyle = '#1f2415';
      ctx.fillRect(this.x, this.y, this.width, this.height);
    }
  }
}

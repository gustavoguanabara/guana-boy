/**
 * Cenário Infinito com Rolagem Contínua e Parallax
 * Baseado no Technical Requirement Document (TRD)
 */

import { CANVAS_WIDTH, CANVAS_HEIGHT, PHYSICS } from '../utils/Constants.js';

export class ParallaxBackground {
  constructor(optionsOrImage) {
    if (optionsOrImage && !optionsOrImage.groundImage && !optionsOrImage.cloudImages) {
      // Compatibilidade retroativa caso apenas uma imagem seja passada
      this.groundImage = optionsOrImage;
      this.cloudImages = [];
      this.legacyScenarioImage = optionsOrImage;
    } else {
      const opts = optionsOrImage || {};
      this.groundImage = opts.groundImage || null;
      this.cloudImages = opts.cloudImages || [];
      this.legacyScenarioImage = opts.scenarioImage || null;
    }

    // Configuração do chão (chao.png: 2040 x 125 px)
    // Proporção de aspecto estrita sem distorção:
    this.groundRenderHeight = 44; // cobre de Y=234 até Y=278
    this.groundScale = 44 / 125;  // ~0.352
    this.groundRenderWidth = 2040 * this.groundScale; // 718.08px
    this.groundOffset = 0;

    // Definição das camadas de profundidade e parallax para as nuvens
    this.layers = [
      { id: 'small', scale: 0.12, speedMult: 0.12, minY: 18, maxY: 55 },
      { id: 'medium', scale: 0.18, speedMult: 0.22, minY: 35, maxY: 85 },
      { id: 'large', scale: 0.25, speedMult: 0.35, minY: 60, maxY: 115 }
    ];

    // Inicializa nuvens distribuídas na tela
    this.clouds = [];
    this._initClouds();
  }

  _initClouds() {
    // Cria 5 nuvens pré-posicionadas pelo céu para início imediato
    const initialPositions = [
      { x: 20, layerIndex: 1, typeIndex: 0 },
      { x: 90, layerIndex: 0, typeIndex: 1 },
      { x: 160, layerIndex: 2, typeIndex: 2 },
      { x: 230, layerIndex: 0, typeIndex: 0 },
      { x: 290, layerIndex: 1, typeIndex: 1 }
    ];

    this.clouds = initialPositions.map((pos) => {
      const layer = this.layers[pos.layerIndex];
      const y = layer.minY + Math.random() * (layer.maxY - layer.minY);
      const img = this.cloudImages[pos.typeIndex % (this.cloudImages.length || 1)] || null;

      return {
        x: pos.x,
        y,
        layerIndex: pos.layerIndex,
        typeIndex: pos.typeIndex,
        img,
        speedMult: layer.speedMult,
        scale: layer.scale
      };
    });
  }

  _resetCloud(cloud, startX) {
    // Escolhe aleatoriamente uma das 3 camadas e um dos 3 tipos de nuvem
    cloud.layerIndex = Math.floor(Math.random() * this.layers.length);
    const layer = this.layers[cloud.layerIndex];

    if (this.cloudImages.length > 0) {
      cloud.typeIndex = Math.floor(Math.random() * this.cloudImages.length);
      cloud.img = this.cloudImages[cloud.typeIndex];
    }

    cloud.scale = layer.scale;
    cloud.speedMult = layer.speedMult;
    cloud.x = startX;
    cloud.y = layer.minY + Math.random() * (layer.maxY - layer.minY);
  }

  update(deltaTime, currentSpeed, moveGround = true) {
    // 1. Chão move-se na velocidade total do jogo (se ativado)
    if (moveGround) {
      this.groundOffset = (this.groundOffset + currentSpeed * deltaTime) % this.groundRenderWidth;
    }

    // 2. Nuvens movem-se com efeito parallax proporcional às suas profundidades
    for (const cloud of this.clouds) {
      cloud.x -= (currentSpeed * cloud.speedMult) * deltaTime;

      const imgW = (cloud.img && cloud.img.naturalWidth > 0)
        ? cloud.img.naturalWidth * cloud.scale
        : 60;

      if (cloud.x + imgW < -10) {
        this._resetCloud(cloud, CANVAS_WIDTH + 10 + Math.random() * 50);
      }
    }
  }

  render(ctx) {
    // 1. Nuvens no fundo (ordenadas por tamanho para profundidade visual correta)
    for (const cloud of this.clouds) {
      if (cloud.img && cloud.img.complete && cloud.img.naturalWidth > 0) {
        // Cálculo estritamente proporcional: largura e altura derivam do tamanho natural
        const w = cloud.img.naturalWidth * cloud.scale;
        const h = cloud.img.naturalHeight * cloud.scale;
        ctx.drawImage(cloud.img, cloud.x, cloud.y, w, h);
      }
    }

    // 2. Chão com rolagem contínua (desenhado em GROUND_DRAW_Y para que a pisada fique no topo do gramado)
    const drawY = PHYSICS.GROUND_DRAW_Y ?? (PHYSICS.GROUND_Y - 7);
    if (this.groundImage && this.groundImage.complete && this.groundImage.naturalWidth > 0) {
      let gx = -this.groundOffset;
      while (gx < CANVAS_WIDTH) {
        ctx.drawImage(
          this.groundImage,
          gx,
          drawY,
          this.groundRenderWidth,
          this.groundRenderHeight
        );
        gx += this.groundRenderWidth;
      }
    } else {
      // Fallback estético retrô
      ctx.fillStyle = '#485233';
      ctx.fillRect(0, PHYSICS.GROUND_Y, CANVAS_WIDTH, CANVAS_HEIGHT - PHYSICS.GROUND_Y);
      ctx.fillStyle = '#1f2415';
      ctx.fillRect(0, PHYSICS.GROUND_Y, CANVAS_WIDTH, 2);
    }
  }
}

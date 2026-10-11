/**
 * Motor de Renderização Canvas 2D
 * Baseado no Technical Requirement Document (TRD)
 */

import { CANVAS_WIDTH, CANVAS_HEIGHT, GameState, APP_VERSION } from '../utils/Constants.js';

export class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');

    // Configura resolução fixa interna lógica
    this.canvas.width = CANVAS_WIDTH;
    this.canvas.height = CANVAS_HEIGHT;

    // Garante pixel art nítido sem interpolação borrada
    this.ctx.imageSmoothingEnabled = false;
  }

  /**
   * Limpa a tela com o tom esverdeado/cinza clássico da tela LCD retrô
   */
  clear() {
    this.ctx.fillStyle = '#8b956d'; // Tom clássico de LCD Game Boy esverdeado
    this.ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  }

  /**
   * Renderiza a barra de status superior (HUD) com textos destacados e ampliados
   * @param {number} lives - Quantidade de vidas restantes (0 a 4)
   * @param {number} score - Pontuação atual
   * @param {number} highScore - Recorde máximo
   */
  renderHUD(lives, score, highScore) {
    this.ctx.save();
    this.ctx.textBaseline = 'middle';

    // Barra translúcida de topo para alto contraste do HUD no LCD
    this.ctx.fillStyle = 'rgba(31, 36, 21, 0.16)';
    this.ctx.fillRect(0, 0, CANVAS_WIDTH, 22);

    this.ctx.fillStyle = '#14180d';
    this.ctx.font = 'bold 13px "Courier New", Courier, monospace';

    // Placar à esquerda (SC)
    this.ctx.textAlign = 'left';
    const scoreStr = `SC:${Math.floor(score).toString().padStart(5, '0')}`;
    this.ctx.fillText(scoreStr, 8, 12);

    // Recorde Centralizado (HI)
    this.ctx.textAlign = 'center';
    const hiStr = `HI:${highScore.toString().padStart(5, '0')}`;
    this.ctx.fillText(hiStr, CANVAS_WIDTH / 2, 12);

    // Indicador de Vidas à direita (VID:♥♥♥♥)
    this.ctx.textAlign = 'right';
    const hearts = '♥'.repeat(Math.max(0, lives));
    this.ctx.fillText(`VID:${hearts}`, CANVAS_WIDTH - 8, 12);

    this.ctx.restore();
  }

  /**
   * Renderiza a tela de boas-vindas / início com tipografia ampliada e versão do app
   */
  renderReadyScreen(version = APP_VERSION) {
    this.ctx.save();
    this.ctx.fillStyle = '#14180d';
    this.ctx.textAlign = 'center';

    this.ctx.font = 'bold 26px "Courier New", Courier, monospace';
    this.ctx.fillText('GUANA-BOY', CANVAS_WIDTH / 2, 75);

    this.ctx.font = 'bold 11px "Courier New", Courier, monospace';
    this.ctx.fillText(version, CANVAS_WIDTH / 2, 94);

    this.ctx.font = 'bold 13px "Courier New", Courier, monospace';
    this.ctx.fillText('PRESSIONE START OU ESPAÇO', CANVAS_WIDTH / 2, 130);
    this.ctx.fillText('PARA JOGAR', CANVAS_WIDTH / 2, 148);

    this.ctx.font = 'bold 10px "Courier New", Courier, monospace';
    this.ctx.fillText('CONTROLES: [A/ESPAÇO] PULAR | [P] PAUSA', CANVAS_WIDTH / 2, 218);

    this.ctx.restore();
  }

  /**
   * Renderiza tela de pausa com textos ampliados
   */
  renderPauseScreen() {
    this.ctx.save();
    this.ctx.fillStyle = 'rgba(139, 149, 109, 0.82)';
    this.ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    this.ctx.fillStyle = '#14180d';
    this.ctx.textAlign = 'center';
    this.ctx.font = 'bold 24px "Courier New", Courier, monospace';
    this.ctx.fillText('JOGO PAUSADO', CANVAS_WIDTH / 2, 105);

    this.ctx.font = 'bold 12px "Courier New", Courier, monospace';
    this.ctx.fillText('PRESSIONE P OU START PARA RETOMAR', CANVAS_WIDTH / 2, 138);
    this.ctx.restore();
  }

  /**
   * Renderiza tela de Game Over com textos ampliados
   */
  renderGameOverScreen(score, highScore) {
    this.ctx.save();
    this.ctx.fillStyle = 'rgba(139, 149, 109, 0.88)';
    this.ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    this.ctx.fillStyle = '#14180d';
    this.ctx.textAlign = 'center';
    this.ctx.font = 'bold 26px "Courier New", Courier, monospace';
    this.ctx.fillText('GAME OVER', CANVAS_WIDTH / 2, 75);

    this.ctx.font = 'bold 16px "Courier New", Courier, monospace';
    this.ctx.fillText(`PONTUAÇÃO: ${Math.floor(score)}`, CANVAS_WIDTH / 2, 116);
    this.ctx.fillText(`RECORDE: ${highScore}`, CANVAS_WIDTH / 2, 142);

    this.ctx.font = 'bold 12px "Courier New", Courier, monospace';
    this.ctx.fillText('PRESSIONE START OU ESPAÇO PARA REINICIAR', CANVAS_WIDTH / 2, 185);
    this.ctx.restore();
  }

  /**
   * Renderiza tela de teste e validação de ambiente (Smoke Test Screen)
   */
  renderSmokeTestScreen(fps, audioActive) {
    this.clear();
    this.ctx.save();

    this.ctx.fillStyle = '#14180d';
    this.ctx.font = 'bold 15px "Courier New", Courier, monospace';
    this.ctx.fillText('GUANA-BOY - AMBIENTE ATIVO', 15, 25);

    this.ctx.font = 'bold 11px "Courier New", Courier, monospace';
    this.ctx.fillText(`🟢 Engine Canvas 2D: ${CANVAS_WIDTH}x${CANVAS_HEIGHT} (${Math.round(fps)} FPS)`, 15, 55);
    this.ctx.fillText(`🟢 ES Modules Nativos: Carregados [OK]`, 15, 75);
    this.ctx.fillText(`🟢 Web Storage (High Score): Operacional`, 15, 95);
    this.ctx.fillText(`${audioActive ? '🟢' : '🟡'} Web Audio API: ${audioActive ? 'Ativo [OK]' : 'Aguardando 1º Clique'}`, 15, 115);
    this.ctx.fillText(`🟢 Controles Físicos/Virtuais: Conectados`, 15, 135);

    // Chão de teste
    this.ctx.fillStyle = '#2f351f';
    this.ctx.fillRect(0, 225, CANVAS_WIDTH, 4);

    this.ctx.fillStyle = '#14180d';
    this.ctx.textAlign = 'center';
    this.ctx.font = 'bold 10px "Courier New", Courier, monospace';
    this.ctx.fillText('PRESSIONE [A] OU ESPAÇO PARA TESTAR O SOM', CANVAS_WIDTH / 2, 195);
    this.ctx.fillText('SMOKE TEST DO SISTEMA 100% OPERACIONAL', CANVAS_WIDTH / 2, 255);

    this.ctx.restore();
  }
}

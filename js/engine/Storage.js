/**
 * Gerenciador de Armazenamento Local (localStorage com Resiliência)
 * Baseado no Technical Requirement Document (TRD) e ADR-0005
 */

import { STORAGE_KEYS } from '../utils/Constants.js';

export class StorageService {
  static _memoryHighScore = 0;

  /**
   * Recupera a pontuação máxima gravada.
   * @returns {number}
   */
  static getHighScore() {
    try {
      const val = localStorage.getItem(STORAGE_KEYS.HIGH_SCORE);
      return val ? parseInt(val, 10) : 0;
    } catch {
      return this._memoryHighScore;
    }
  }

  /**
   * Salva uma nova pontuação máxima de forma segura.
   * @param {number} score
   * @returns {boolean} true se foi um novo recorde
   */
  static setHighScore(score) {
    const current = this.getHighScore();
    if (score > current) {
      try {
        localStorage.setItem(STORAGE_KEYS.HIGH_SCORE, score.toString());
      } catch {
        this._memoryHighScore = score;
      }
      return true;
    }
    return false;
  }

  /**
   * Limpa o recorde (utilizado para testes/debug).
   */
  static clearHighScore() {
    try {
      localStorage.removeItem(STORAGE_KEYS.HIGH_SCORE);
    } catch {
      this._memoryHighScore = 0;
    }
  }
}

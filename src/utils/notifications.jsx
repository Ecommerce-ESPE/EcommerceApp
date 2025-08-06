// src/utils/notifications.js
import { Notyf } from 'notyf';
import 'notyf/notyf.min.css';

// Configuración global para notificaciones
export const notyf = new Notyf({
  duration: 3000,
  position: {
    x: 'right',
    y: 'down',
  },
  ripple: true,
  dismissible: true,
  types: [
    {
      type: 'success',
      background: '#4CAF50',
      icon: {
        className: 'fas fa-check-circle',
        tagName: 'i',
        text: ''
      }
    },
    {
      type: 'error',
      background: '#F44336',
      icon: {
        className: 'fas fa-exclamation-circle',
        tagName: 'i',
        text: ''
      }
    },
    {
      type: 'info',
      background: '#2196F3',
      icon: {
        className: 'fas fa-info-circle',
        tagName: 'i',
        text: ''
      }
    },
    {
      type: 'warning',
      background: '#FFC107',
      icon: {
        className: 'fas fa-exclamation-triangle',
        tagName: 'i',
        text: ''
      }
    }
  ]
});
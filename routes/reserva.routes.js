const express = require('express');
const router = express.Router();

// 1. Importamos las funciones con sus nombres REALES del controlador
const {
    obtenerReservaciones,
    crearReservacion,
    obtenerReservacionesPorUsuario,
    actualizarEstadoReservacion
} = require('../controller/reserva.controller'); // Asegúrate de que la carpeta se llame 'controllers' o 'controller' en tu proyecto

// 2. Definición de rutas adaptada a tu archivo
router.route('/')
    .get(obtenerReservaciones)  // GET /api/v1/reservas
    .post(crearReservacion);    // POST /api/v1/reservas

// Ruta para ver el historial de un usuario específico
router.route('/usuario/:usuarioId')
    .get(obtenerReservacionesPorUsuario); // GET /api/v1/reservas/usuario/:usuarioId

// Ruta para cambiar el estado (confirmar o cancelar)
router.patch('/:id/estado', actualizarEstadoReservacion); // PATCH /api/v1/reservas/:id/estado

module.exports = router;
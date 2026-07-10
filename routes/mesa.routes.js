const express = require('express');
const router = express.Router();

// Importamos todas las funciones del controlador de mesas
const {
    obtenerMesas,
    obtenerMesaById,
    crearMesa,
    actualizarMesa,
    desactivarMesa
} = require('../controller/mesa.controller'); // Ajusta la ruta según tus carpetas

// --- DEFINICIÓN DE RUTAS ---

// RUTA: Obtener todas las mesas y crear una nueva mesa
router.route('/')
    .get(obtenerMesas)   // GET /api/mesas
    .post(crearMesa);    // POST /api/mesas

// RUTA: Operaciones específicas para una mesa usando su ID
router.route('/:id')
    .get(obtenerMesaById)    // GET /api/mesas/:id
    .put(actualizarMesa);    // PUT /api/mesas/:id

// RUTA: Desactivar una mesa (borrado lógico)
router.patch('/:id/desactivar', desactivarMesa); // PATCH /api/mesas/:id/desactivar

module.exports = router;
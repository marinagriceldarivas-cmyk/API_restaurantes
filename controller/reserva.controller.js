const prisma = require('../prisma/client')

// 1. Crear una nueva reservación
const crearReservacion = async (req, res) => {
    try {
        const { fechaHora, personas, usuarioId, mesaId } = req.body;

        // Validaciones básicas de campos obligatorios
        if (!fechaHora || !personas || !usuarioId || !mesaId) {
            return res.status(400).json({ error: "Todos los campos son obligatorios" });
        }

        const fechaReserva = new Date(fechaHora);
        // Validar que la fecha sea válida
        if (isNaN(fechaReserva.getTime())) {
            return res.status(400).json({ error: "Formato de fecha y hora inválido" });
        }

        // 1. Verificar si el usuario existe (Corregido a Usuario)
        const usuarioExiste = await prisma.Usuario.findUnique({ where: { id: Number(usuarioId) } });
        if (!usuarioExiste) {
            return res.status(404).json({ error: "El usuario que intenta reservar no existe" });
        }

        // 2. Verificar si la mesa existe (Corregido a Mesa)
        const mesa = await prisma.Mesa.findUnique({ where: { id: Number(mesaId) } });
        if (!mesa) {
            return res.status(404).json({ error: "La mesa solicitada no existe" });
        }
        if (!mesa.disponible) {
            return res.status(400).json({ error: "Esta mesa está fuera de servicio temporalmente" });
        }

        // 3. Validar capacidad de la mesa
        if (Number(personas) > mesa.capacidad) {
            return res.status(400).json({ 
                error: `La mesa número ${mesa.numero} solo tiene capacidad para ${mesa.capacidad} personas` 
            });
        }

       // 4. Regla de oro: Cambiado a findFirst para evitar conflictos de índices
        const mesaOcupada = await prisma.reservacion.findFirst({
            where: {
                mesaId: mesaId,         // Quita el "mesaId_fechaHora: {"
                fechaHora: new Date(fechaHora)
            } // Quita el "}" de cierre extra que envolvía al índice compuesto
        });

        if (mesaOcupada && mesaOcupada.estado !== 'cancelada') {
            return res.status(400).json({ error: "Esta mesa ya está reservada para la fecha y hora seleccionada" });
        }

        // Si todo está perfecto, creamos la reservación (Corregido a Reservacion)
        const nuevaReservacion = await prisma.Reservacion.create({
            data: {
                fechaHora: fechaReserva,
                personas: Number(personas),
                usuarioId: Number(usuarioId),
                mesaId: Number(mesaId)
            },
            include: {
                mesa: true,
                usuario: {
                    select: { nombre: true, correo: true }
                }
            }
        });

        res.status(201).json({
            message: "Reservación creada con éxito",
            reservacion: nuevaReservacion
        });

    } catch (error) {
        res.status(500).json({ error: "Error al crear la reservación", detalles: error.message });
    }
}

// 2. Obtener todas las reservaciones
const obtenerReservaciones = async (req, res) => {
    try {
        const listaReservaciones = await prisma.Reservacion.findMany({
            include: {
                usuario: { select: { nombre: true, correo: true } },
                mesa: true
            },
            orderBy: { fechaHora: 'asc' }
        });
        res.status(200).json(listaReservaciones);
    } catch (error) {
        res.status(500).json({ error: "Error al obtener las reservaciones", detalles: error.message });
    }
}

// 3. Obtener las reservaciones de un usuario específico
const obtenerReservacionesPorUsuario = async (req, res) => {
    try {
        const usuarioId = Number(req.params.usuarioId);
        if (isNaN(usuarioId)) return res.status(400).json({ error: "ID de usuario inválido" });

        const reservas = await prisma.Reservacion.findMany({
            where: { usuarioId },
            include: { mesa: true },
            orderBy: { fechaHora: 'desc' }
        });

        res.status(200).json(reservas);
    } catch (error) {
        res.status(500).json({ error: "Error al obtener el historial", detalles: error.message });
    }
}

// 4. Cambiar el estado de una reservación
const actualizarEstadoReservacion = async (req, res) => {
    try {
        const id = Number(req.params.id);
        const { estado } = req.body;

        if (isNaN(id)) return res.status(400).json({ error: "ID de reservación inválido" });

        const estadosValidos = ['pendiente', 'confirmada', 'cancelada'];
        if (!estadosValidos.includes(estado)) {
            return res.status(400).json({ error: "Estado no válido. Use: pendiente, confirmada o cancelada" });
        }

        const existe = await prisma.Reservacion.findUnique({ where: { id } });
        if (!existe) return res.status(404).json({ error: "Reservación no encontrada" });

        const reservacionActualizada = await prisma.Reservacion.update({
            where: { id },
            data: { estado },
            include: { mesa: true, usuario: { select: { nombre: true } } }
        });

        res.status(200).json({
            message: `Reservación ${estado} exitosamente`,
            reservacion: reservacionActualizada
        });

    } catch (error) {
        res.status(500).json({ error: "Error al actualizar el estado", detalles: error.message });
    }
}

module.exports = {
    crearReservacion,
    obtenerReservaciones,
    obtenerReservacionesPorUsuario,
    actualizarEstadoReservacion
}

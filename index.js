const express = require('express')
const app = express()
// 1. Middlewares globales (¡Muy importante que vaya arriba!)
app.use(express.json())

// 2. Llamando las rutas desde sus archivos correspondientes
const mesasRoutes = require('./routes/mesa.routes')
const authRoutes = require('./routes/auth.routes')
const reservasRoutes = require('./routes/reserva.routes') // <-- Importamos las rutas de reservas
// 3. Ruta principal de bienvenida
app.get('/', (req, res) => {
    res.json({
        mensaje: 'Bienvenidos a la API de Restaurante',
        descripcion: 'API que gestiona mesas y reservaciones en base al rol del usuario',
        version: '1.0.0',
    })
})
// 4. Conectando las rutas a Express
app.use('/api/v1/mesas', mesasRoutes)
app.use('/api/v1/auth', authRoutes)
app.use('/api/v1/reservas', reservasRoutes) // <-- ¡Aquí le decimos a Express que use tus reservas!

// 5. El servidor escucha al FINAL del archivo
// Cambia tu puerto actual por esto:
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});
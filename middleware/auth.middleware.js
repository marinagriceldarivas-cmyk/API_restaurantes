const jwt = require('jsonwebtoken')

const SECRET = 'clave_secreta_123'

// verifica que el token sea válido
const verificarToken = (req, res, next) => {
    const authHeader = req.headers['authorization']

    if (!authHeader) {
        return res.status(401).json({ error: 'Debes de ingresar un token valido' })
    }

    // el header llega así: "Bearer eyJhbGci..."
    const token = authHeader.split(' ')[1]

    try {
        const decoded = jwt.verify(token, SECRET)
        req.usuario = decoded // guardamos los datos del usuario en req
        next() // continuamos a la ruta
    } catch (error) {
        return res.status(401).json({ error: 'Token inválido o expirado' })
    }
}

// verifica que el usuario sea admin
const verificarAdmin = (req, res, next) => {
    if (req.usuario.rol !== 'admin') {
        return res.status(403).json({ error: 'Acceso denegado, se requiere rol admin' })
    }
    next()
}

module.exports = { verificarToken, verificarAdmin }
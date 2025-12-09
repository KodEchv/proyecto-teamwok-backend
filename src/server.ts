import app from './app'
import { initializeDefaultAdmin } from './services/admin.service'

const PORT = process.env.PORT

async function startServer() {
    try {
        // Inicializar usuario admin por defecto
        await initializeDefaultAdmin()
        
        app.listen(PORT, () => {
            console.log(`Server is running on PORT: ${PORT}`)
        })
    } catch (error) {
        console.error('Error starting server:', error)
        process.exit(1)
    }
}

startServer()
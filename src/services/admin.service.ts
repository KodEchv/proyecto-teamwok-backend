import prisma from '../models/user'
import { hashPassword } from './password.service'

export const initializeDefaultAdmin = async (): Promise<void> => {
    try {
        // Verificar si ya existe un usuario admin
        const existingAdmin = await prisma.auth.findFirst({
            where: { role: 'ADMIN' }
        })

        if (existingAdmin) {
            console.log('✓ Admin user already exists')
            return
        }

        // Hash de la contraseña por defecto
        const hashedPassword = await hashPassword('admin123')

        // Crear usuario admin por defecto
        const adminUser = await prisma.auth.create({
            data: {
                email: 'admin@teamwork.com',
                password: hashedPassword,
                role: 'ADMIN'
            }
        })

        // Crear perfil del admin
        await prisma.userProfile.create({
            data: {
                cedula: '0000000000',
                firstName: 'Admin',
                lastName: 'TeamWork',
                phone: '0000000000',
                authId: adminUser.id
            }
        })

        console.log('✓ Default admin user created successfully')
        console.log('  Email: admin@teamwork.com')
        console.log('  Password: admin123')
        console.log('  ⚠️  Please change the password after first login!')

    } catch (error) {
        console.error('Error initializing default admin:', error)
        throw error
    }
}

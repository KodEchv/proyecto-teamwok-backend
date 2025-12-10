import { Request, Response } from "express";
import { comparePasswords, hashPassword } from "../services/password.service";
import prisma from '../models/user'
import { generateToken } from "../services/auth.service";
import { authRegister, userProfileRegister } from "../models/register.interface";
import { authLogin } from "../models/login.interface";

export const register = async (req: Request, res: Response): Promise<void> => {

    const { email, password, role, cedula, firstName, lastName, phone } = req.body;

    const authData: authRegister = { email, password, role };
    const profileData: userProfileRegister = { cedula, firstName, lastName, phone };


    try {

        if (!authData){
            res.status(400).json({ message: 'Faltan datos de autenticación' })
            return
        }
        if (!profileData){
            res.status(400).json({ message: 'Faltan datos de perfil' })
            return
        }
        const hashedPassword = await hashPassword(authData.password)

        const emailExists = await prisma.auth.findUnique({ where: { email: authData.email } })
        if (emailExists) {
            res.status(400).json({ message: 'El mail ingresado ya existe' })
            return
        }
        const cedulaExists = await prisma.userProfile.findUnique({ where: { cedula: profileData.cedula } })
        if (cedulaExists) {
            res.status(400).json({ message: 'La cédula ingresada ya existe' })
            return
        }


        const user = await prisma.auth.create(
            {
                data: {
                    ...authData,
                    password: hashedPassword
                }
            }
        )

        await prisma.userProfile.create({
            data: {
                ...profileData,
                authId: user.id
            }
        })

        //const token = generateToken(user)
        //res.status(201).json({ token })
        res.status(201).json({ message: 'Usuario registrado exitosamente' })

    } catch (error: any) {

        if (error?.code === 'P2002' && error?.meta?.target?.includes('email')) {
            res.status(400).json({ message: 'El mail ingresado ya existe' })
        }

        console.log(error)
        res.status(500).json({ error: 'Hubo un error en el registro' })

    }

}

export const login = async (req: Request, res: Response): Promise<void> => {

    const loginData = req.body as authLogin;

    try {

        if (!loginData.email) {
            res.status(400).json({ message: 'El email es obligatorio' })
            return
        }
        if (!loginData.password) {
            res.status(400).json({ message: 'El password es obligatorio' })
            return
        }

        const user = await prisma.auth.findUnique({ where: { email: loginData.email } })
        if (!user) {
            res.status(404).json({ error: 'Usuario no encontrado' })
            return
        }

        const passwordMatch = await comparePasswords(loginData.password, user.password);
        if (!passwordMatch) {
            res.status(401).json({ error: 'Usuario y contraseñas no coinciden' })
            return
        }

        const token = generateToken(user)
        res.status(200).json({ token: token, role: user.role, userId: user.id })


    } catch (error: any) {
        console.log('Error: ', error)
        res.status(500).json({ error: 'Hubo un error al iniciar sesión' })
    }

}


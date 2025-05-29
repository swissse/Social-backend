const bcrypt = require("bcryptjs");
const path = require("path");
const fs = require('fs');
const jwt = require("jsonwebtoken");
const { prisma } = require("../prisma/prisma-client");
const Jdenticon = require('jdenticon');
const { error } = require("console");

const UserController = {
    register: async (req, res) => {
        const { email, password, name } = req.body;

        // Проверяем поля на существование
        if (!email || !password || !name) {
            return res.status(400).json({ error: "Все поля обязательны" });
        }

        try {
            // Проверяем, существует ли пользователь с таким emai
            const existingUser = await prisma.user.findUnique({ where: { email } });
            if (existingUser) {
                return res.status(400).json({ error: "Пользователь уже существует" });
            }

            // Хешируем пароль
            const hashedPassword = await bcrypt.hash(password, 10);

            // Генерируем аватар для нового пользователя
            const png = Jdenticon.toPng(email, 200);
            const avatarName = `${email}_${Date.now()}.png`;
            const avatarPath = path.join(__dirname, '/../uploads', avatarName);
            fs.writeFileSync(avatarPath, png);

            // Создаем пользователя
            const user = await prisma.user.create({
                data: {
                    email,
                    password: hashedPassword,
                    name,
                    avatarUrl: `/uploads/${avatarName}`,
                },
            });

            res.json(user);
        } catch (error) {
            console.error("Error in register:", error);
            res.status(500).json({ error: "Internal server error" });
        }
    },
    login: async (req, res) => {
        const { email, password } = req.body

        if (!email || !password) {
            return res.status(400).json({ error: "Все поля обязательны" });
        }

        try {
            const user = await prisma.user.findUnique({ where: {email} })

            if (!user) {
                return res.status(400).json({ error: "Неверный логин или пароль!" });
            }

            const valid = await bcrypt.compare(password, user.password)

            if (!valid) {
                return res.status(400).json({ error: "Неверный логин или пароль!" });
            }

            const token = jwt.sign(({ userId: user.id }), process.env.SECRET_KEY)

            res.json({token})
        } catch(error) {
            console.error('login error', error);
            res.status(500).json({ error })
        }
    },
    getUserById: async (req, res) => {
        const {id} = req.params
        const userId = req.user.userId

        try {
            const user = await prisma.user.findUnique({
                where: { id },
                include: {
                    followers: true,
                    following: true
                }
            })

            if (!user) {
                return res.status(404).json({error: 'пользователь не найден'})
            }


            const isFollowing = await prisma.follows.findFirst({
                where: {
                    AND: [{followerId: userId},{followingId: id}]
                }
            })

            res.json({...user, isFollowing: Boolean(isFollowing)})
        }catch (error) {
            console.error('Get current Error', error)
            res.status(500).json({error: 'Internal server'})
        }
    },
    updateUser: async (req, res) => {
        const {id} = req.params
        const { email, name, dateOfBirth, bio, location } = req.body

        let filePath

        if(req.file && req.file.path) {
            filePath = req.file.path
        }

        if (id !== req.user.userId) {
            return res.status(403).json({ error: 'Нет доступа' })
        }

        try {
            if (email) {
                const existingEmail = await prisma.user.findFirst({
                    where: {email}
                })

                if (existingEmail && existingUser.id !== id) {
                    return res.status(400).json({error: 'почта уже используется'})
                }
            }

            const user = await prisma.user.update({
                where: {id},
                data: {
                    email: email || undefined,
                    name: name || undefined,
                    dateOfBirth: dateOfBirth || undefined,
                    bio: bio || undefined,
                    avatarUrl: filePath ? `/${filePath}`: undefined,
                    location: location || undefined
                }
            })

            res.json(user)

        }catch(error) {
            console.error('Update user error', error)
            res.status(500).json({error : 'Internal server Error'})
        }
    },
    current: async (req, res) => {
        try {
            const user = await prisma.user.findFirst({
                where: {
                    id: req.user.userId
                },
                include: {
                    followers: {
                        include: {
                            follower: true
                        }
                    },
                    following: {
                        include: {
                            following: true
                        }
                    }
                }
            })

            if (!user) {
                return res.status(400).json({ error: 'Не удалось найти пользователя' })
            }

            res.json(user)
        }catch(error) {
            console.error('Get Current Error', error);
            res.status(500).json({ error: 'Internal server error' })
        }
    },
}

module.exports = UserController
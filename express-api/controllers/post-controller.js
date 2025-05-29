const { prisma } = require("../prisma/prisma-client")

const PostController = {
    createPost: async (req, res) => {
        const { content } = req.body

        const authorId = req.user.userId

        if (!content) {
            return res.status(400).json({ error: 'Все поля обязательны' })
        }

        try {
            const post = await prisma.post.create({
                data: {
                    content,
                    authorId,
                }
            })
            res.json(post)
        } catch (error) {
            console.error("Create Post error", error);
            res.status(500).json({ error: "Internal server error" })
        }
    },
    getAllPost: async (req, res) => {
        const { userId } = req.user.userId

        try {
            const posts = await prisma.post.findMany({
                include: {
                    comments: true,
                    author: true,
                    likes: true
                },
                orderBy: {
                    createdAt: 'desc'
                }
            })

            const postWithLikeInfo = posts.map(post => ({
                ...post,
                likeByUser: post.likes.some(like => like.userId == userId)
            }))

            res.json(postWithLikeInfo)
        } catch (error) {
            console.error('Get all post error', error);
            res.statusd(500).json({ error: 'Internal server error' })
        }
    },
    getPostById: async (req, res) => {
        const {id} = req.params
        const userId = req.user.userId

        try {
            const post = await prisma.post.findFirst({
                where: {id},
                include: {
                    comments: {
                        include: {
                            user: true
                        }
                    },
                    author: true,
                    likes: true
                }
            })
            
            if (!post) {
                return res.status(404).json({ error: 'Пост не найден' })
            }
            
            const postWithLikeInfo = {
                ...post,
                likeByUser: post.likes.some(like => like.userId === userId)
            }
            res.json(postWithLikeInfo)

        }catch(error) {
            console.error('Get post by id error', error);
            res.statusd(500).json({ error: 'Internal server error' })
        }
    },
    deletePost: async (req, res) => {
        const { id } = req.params

        const post = await prisma.post.findUnique({
            where: {id}
        })

        if(!post) {
            return res.status(404).json({error: 'Пост не найден'})
        }

        if (post.authorId !== req.user.userId) {
            return res.status(403).json({error: 'Это не ваш пост'})
        }

        try {
            const transaction = await prisma.$transaction([
                prisma.comment.deleteMany({ where: {userId: id} }),
                prisma.like.deleteMany({ where: {userId: id} }),
                prisma.post.deleteMany({ where: {id} })
            ])

            res.json(transaction)
        }catch (error) {
            console.error('delete post error', error);
            res.statusd(500).json({ error: 'Internal server error' })
        }
    }
}

module.exports = PostController
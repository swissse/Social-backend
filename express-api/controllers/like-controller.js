const { prisma } = require('../prisma/prisma-client')

const LikeController = {
    likePost: async (req, res) => {
        const userId = req.user.userId
        const {postId} = req.body
        
        if (!postId) {
            return res.status(400).json({ error: 'Все поля обязательны' })
        }

        try {
            const existingLike = await prisma.like.findFirst({
                where: {postId, userId}
            })

            if (existingLike) {
                return res.status(400).json({ error: 'Вы уже поставили лайк' })
            }

            const like = await prisma.like.create({
                data: {
                    postId,
                    userId
                }
            })

            res.json(like)
        } catch (error) {
            console.error("Like Post error", error);
            res.status(500).json({ error: "Internal server error" })
        }
    },
    UnlikePost: async (req, res) => {
        const userId = req.user.userId
        const {id} = req.params

        if (!id) {
            return res.status(400).json({ error: 'Пост не найден' }) 
        }

        try {
            const existingLike = await prisma.like.findFirst({
                where: {postId: id, userId}
            })

            if (!existingLike) {
                return res.status(400).json({ error: 'Пост не лайкнут' })
            }

            const unlikePost = await prisma.like.deleteMany({
                where: {
                    userId,
                    postId: id
                }
            })

            res.json(existingLike)
        } catch (error) {
            console.error("Unlike Post error", error);
            res.status(500).json({ error: "Internal server error" })
        }
    }
}

module.exports = LikeController
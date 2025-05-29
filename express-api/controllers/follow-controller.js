const { prisma } = require('../prisma/prisma-client')

const FollowController = {
    follow: async (req, res) => {
        const { followingId } = req.body
        const userId = req.user.userId

        if (followingId === userId) {
            return res.status(500).json({error: 'Вы не можете подписаться на себя'})
        }

        try {
            const follows = await prisma.follows.findFirst({
                where: {
                    AND: [
                        {followerId: userId},
                        {followingId}
                    ]
                }
            })

            if (follows) {
                return res.status(400).json({error: 'Вы уже подписаны'})
            }


            await prisma.follows.create({
                data: {
                    follower: { connect: { id: userId } },
                    following: { connect: { id: followingId } },
                }
            })

            res.json('Вы подписались')
        } catch (error) {
            console.error('Follow user error', error);
            res.status(500).json({ error: 'Internal server error' })
        }
    },
    Unfollow: async (req, res) => {
        const userId = req.user.userId
        const { followingId } = req.body

        const follows = await prisma.follows.findFirst({
            where: {
                AND: [
                    {followerId: userId},
                    {followingId}
                ]
            }
        })

        if (!follows) {
            return res.status(404).json({error: 'Вы не подписаны'})
        }

        try {
            await prisma.follows.delete({
                where: { id: follows.id }
            })

            res.json('Вы отписались')
        } catch (error) {
            console.error('Unfollow user error', error);
            res.status(500).json({ error: 'Internal server error' })
        }
    }
}

module.exports = FollowController
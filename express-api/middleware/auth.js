const jwt = require('jsonwebtoken')

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization']

    const token = authHeader && authHeader.split(' ')[1]

    if (!token) {
        return res.status(401).json({ error: 'Unauthorized'})
    }

    jwt.verify(token, process.env.SECRET_KEY, (err, user) => {
        if (err) {
            return res.status(403).json({error: 'invalid token'})
        }

        req.user = user

        next()
    })
}

module.exports = authenticateToken

// createPost: async (req,res) => {
//     const {content} = req.body

//     const authorId = req.user.userId

//     if(!content) {
//         return res.status(400).json({ error: 'Все поля обязательны' })
//     }

//     try {
//         const post = await prisma.post.create({
//             data: {
//                 content,
//                 authorId
//             }
//         })

//         res.json(post)
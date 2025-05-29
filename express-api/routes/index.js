const express = require('express')
const router = express.Router()
const multer = require('multer')
const { UserController, PostController, CommentController, LikeController, FollowController } = require('../controllers')
const authenticateToken = require('../middleware/auth')
const { createPost } = require('../controllers/post-controller')

const uploadDestination = 'uploads'

// Показываем, где будут храниться файлы
const storage = multer.diskStorage({
    destination: uploadDestination,
    filename: function(req, file, cb) {
        cb(null, file.originalname)
    }
})

const uploads = multer({storage: storage})



// РОУТЫ ПОЛЬЗОВАТЕЛЯ
router.post('/register', UserController.register)
router.post('/login', UserController.login)
router.get('/current', authenticateToken, UserController.current)
router.get('/users/:id', authenticateToken, UserController.getUserById)
router.put('/users/:id', authenticateToken, UserController.updateUser)

// РОУТЫ ПОСТОВ
router.post('/posts',authenticateToken, PostController.createPost)
router.get('/posts',authenticateToken, PostController.getAllPost)
router.get('/posts/:id',authenticateToken, PostController.getPostById)
router.delete('/posts/:id',authenticateToken, PostController.deletePost)

// РОУТЫ КОММЕНТАРИЕВ
router.post('/comments', authenticateToken, CommentController.createComment),
router.delete('/comments/:id', authenticateToken, CommentController.deleteComment)

// РОУТЫ ЛАЙКОВ
router.post('/likes', authenticateToken, LikeController.likePost)
router.delete('/likes/:id', authenticateToken, LikeController.UnlikePost)

// РОУТЫ ПОДПИСОК
router.post('/follow', authenticateToken, FollowController.follow),
router.delete('/unfollow', authenticateToken, FollowController.Unfollow)




module.exports = router
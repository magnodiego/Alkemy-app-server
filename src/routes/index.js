const { Router } = require('express');
const { registerUser, login, getUser, getCategories, registerApp, getMainApps , getImage, getCategoryApps, updateWishlist, getUserWishlistApps, getDeveloperApps, updateApp, updateUserApps, getUserApps, deleteApp } = require('../controllers/index.controller')

const router = Router();

router.post('/api/register', registerUser)
router.post('/api/login', login)
router.post('/api/user', getUser)
router.post('/api/main/developer/app', registerApp)
router.post('/api/buy/update/wishlist', updateWishlist)
router.post('/api/buy/update/userApps', updateUserApps)

router.get('/api/main/categories', getCategories)
router.get('/api/main/apps', getMainApps)
router.get('/api/app/card/image', getImage)
router.get('/api/main/apps/category', getCategoryApps)
router.get('/api/me/profile/wishlist', getUserWishlistApps)
router.get('/api/me/profile/developed', getDeveloperApps)
router.get('/api/me/profile/userApps', getUserApps)

router.put('/api/me/app/update', updateApp)

router.delete('/api/me/app/delete', deleteApp)

module.exports = router
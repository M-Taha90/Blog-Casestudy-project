const router = require('express').Router();
const auth = require('../middleware/authMiddleware');
const ctrl = require('../controllers/postController');

router.post('/', auth, ctrl.create);          // create post
router.get('/:slug', ctrl.getBySlug);         // public read by slug
router.get('/id/:id', ctrl.getById);          // get post by id
router.put('/:id', auth, ctrl.update);        // update post (auth & collaborator check)
router.post('/:id/generate', auth, ctrl.generateAI);  // AI generation

module.exports = router;


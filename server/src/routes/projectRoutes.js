const express = require('express');
const {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  addNote,
  deleteNote,
} = require('../controllers/projectController');
const protect = require('../middleware/authMiddleware');

const router = express.Router();

// One line that protects the whole file: every project route below runs the
// auth middleware first, so no controller here ever sees an anonymous request.
router.use(protect);

router.route('/').get(getProjects).post(createProject);
router.route('/:id').get(getProject).put(updateProject).delete(deleteProject);

router.post('/:id/notes', addNote);
router.delete('/:id/notes/:noteId', deleteNote);

module.exports = router;

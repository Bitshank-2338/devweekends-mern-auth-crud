const mongoose = require('mongoose');
const Project = require('../models/Project');
const asyncHandler = require('../utils/asyncHandler');

// Fields a user is allowed to change. `owner` is deliberately absent: a
// project can never be handed to, or stolen by, another account.
const editableFields = ['title', 'description', 'technology', 'status'];

// Finds a project only if it belongs to the logged-in user.
//
// Returning null for "not mine" and for "does not exist" is intentional. The
// route answers 404 in both cases, so User B cannot learn that User A's
// project id is real by watching for a 403.
async function findOwnedProject(id, userId) {
  if (!mongoose.Types.ObjectId.isValid(id)) return null;

  return Project.findOne({ _id: id, owner: userId });
}

// GET /api/projects
const getProjects = asyncHandler(async (req, res) => {
  // The owner filter is the whole ownership rule: the query can only ever
  // reach documents belonging to the user the JWT identified.
  const projects = await Project.find({ owner: req.user._id }).sort({ createdAt: -1 });

  res.status(200).json(projects);
});

// GET /api/projects/:id
const getProject = asyncHandler(async (req, res) => {
  const project = await findOwnedProject(req.params.id, req.user._id);

  if (!project) {
    return res.status(404).json({ message: 'Project not found' });
  }

  res.status(200).json(project);
});

// POST /api/projects
const createProject = asyncHandler(async (req, res) => {
  const { title, description, technology, status } = req.body;

  if (!title || !title.trim()) {
    return res.status(400).json({ message: 'Title is required' });
  }

  const project = await Project.create({
    title,
    description,
    technology,
    status,
    // Taken from the verified token, never from the request body.
    owner: req.user._id,
  });

  res.status(201).json(project);
});

// PUT /api/projects/:id
const updateProject = asyncHandler(async (req, res) => {
  const project = await findOwnedProject(req.params.id, req.user._id);

  if (!project) {
    return res.status(404).json({ message: 'Project not found' });
  }

  // Copy across only the whitelisted fields that were actually sent, so a
  // request carrying an extra "owner" key simply has no effect.
  editableFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      project[field] = req.body[field];
    }
  });

  if (!project.title || !project.title.trim()) {
    return res.status(400).json({ message: 'Title is required' });
  }

  // save() rather than findByIdAndUpdate() so the schema validators run.
  const updatedProject = await project.save();

  res.status(200).json(updatedProject);
});

// DELETE /api/projects/:id
const deleteProject = asyncHandler(async (req, res) => {
  const project = await findOwnedProject(req.params.id, req.user._id);

  if (!project) {
    return res.status(404).json({ message: 'Project not found' });
  }

  await project.deleteOne();

  // The id goes back so React knows which card to drop from state.
  res.status(200).json({ id: req.params.id, message: 'Project deleted' });
});

// POST /api/projects/:id/notes
const addNote = asyncHandler(async (req, res) => {
  const { text } = req.body;

  if (!text || !text.trim()) {
    return res.status(400).json({ message: 'Note text is required' });
  }

  const project = await findOwnedProject(req.params.id, req.user._id);

  if (!project) {
    return res.status(404).json({ message: 'Project not found' });
  }

  project.notes.push({ text });
  const updatedProject = await project.save();

  // The whole project comes back so the card can re-render with the new note.
  res.status(201).json(updatedProject);
});

// DELETE /api/projects/:id/notes/:noteId
const deleteNote = asyncHandler(async (req, res) => {
  const project = await findOwnedProject(req.params.id, req.user._id);

  if (!project) {
    return res.status(404).json({ message: 'Project not found' });
  }

  const { noteId } = req.params;
  const note = mongoose.Types.ObjectId.isValid(noteId) ? project.notes.id(noteId) : null;

  if (!note) {
    return res.status(404).json({ message: 'Note not found' });
  }

  note.deleteOne();
  const updatedProject = await project.save();

  res.status(200).json(updatedProject);
});

module.exports = {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  addNote,
  deleteNote,
};

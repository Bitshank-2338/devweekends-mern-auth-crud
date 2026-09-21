import { useState } from 'react';
import ProjectForm from './ProjectForm.jsx';

const statusLabels = {
  idea: 'Idea',
  'in-progress': 'In progress',
  completed: 'Completed',
};

function formatDate(value) {
  return new Date(value).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function ProjectCard({ project, onUpdate, onDelete, onAddNote, onDeleteNote }) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [showNotes, setShowNotes] = useState(false);

  async function handleEditSubmit(values) {
    setIsSaving(true);
    const succeeded = await onUpdate(project._id, values);
    setIsSaving(false);

    if (succeeded) setIsEditing(false);
    return succeeded;
  }

  // The status dropdown on the card is just a small update request.
  async function handleStatusChange(event) {
    setIsSaving(true);
    await onUpdate(project._id, { status: event.target.value });
    setIsSaving(false);
  }

  async function handleDelete() {
    // Deleting is permanent, so ask first.
    if (!window.confirm(`Delete "${project.title}"? This cannot be undone.`)) return;

    setIsSaving(true);
    await onDelete(project._id);
    setIsSaving(false);
  }

  async function handleNoteSubmit(event) {
    event.preventDefault();
    if (!noteText.trim()) return;

    setIsAddingNote(true);
    const succeeded = await onAddNote(project._id, noteText.trim());
    setIsAddingNote(false);

    if (succeeded) setNoteText('');
  }

  if (isEditing) {
    return (
      <article className="card card-editing">
        <h3 className="card-editing-title">Editing project</h3>
        <ProjectForm
          project={project}
          onSubmit={handleEditSubmit}
          onCancel={() => setIsEditing(false)}
          isSubmitting={isSaving}
          submitLabel="Save changes"
        />
      </article>
    );
  }

  return (
    <article className="card">
      <div className="card-head">
        <h3 className="card-title">{project.title}</h3>
        <span className={`badge badge-${project.status}`}>{statusLabels[project.status]}</span>
      </div>

      {project.description && <p className="card-description">{project.description}</p>}

      <div className="card-meta">
        {project.technology && <span className="tech-tag">{project.technology}</span>}
        <span className="card-date">Added {formatDate(project.createdAt)}</span>
      </div>

      <div className="card-controls">
        <label className="status-select">
          <span className="sr-only">Change status</span>
          <select value={project.status} onChange={handleStatusChange} disabled={isSaving}>
            <option value="idea">Idea</option>
            <option value="in-progress">In progress</option>
            <option value="completed">Completed</option>
          </select>
        </label>

        <button type="button" className="btn btn-small" onClick={() => setShowNotes((open) => !open)}>
          Notes ({project.notes.length})
        </button>
        <button type="button" className="btn btn-small" onClick={() => setIsEditing(true)} disabled={isSaving}>
          Edit
        </button>
        <button type="button" className="btn btn-small btn-danger" onClick={handleDelete} disabled={isSaving}>
          Delete
        </button>
      </div>

      {showNotes && (
        <div className="notes">
          {project.notes.length === 0 ? (
            <p className="notes-empty">No notes yet.</p>
          ) : (
            <ul className="note-list">
              {project.notes.map((note) => (
                <li key={note._id} className="note">
                  <span>{note.text}</span>
                  <button
                    type="button"
                    className="note-delete"
                    onClick={() => onDeleteNote(project._id, note._id)}
                    aria-label="Delete note"
                  >
                    &times;
                  </button>
                </li>
              ))}
            </ul>
          )}

          <form className="note-form" onSubmit={handleNoteSubmit}>
            <input
              type="text"
              value={noteText}
              onChange={(event) => setNoteText(event.target.value)}
              placeholder="Add a note..."
              maxLength={500}
            />
            <button type="submit" className="btn btn-small btn-primary" disabled={isAddingNote}>
              {isAddingNote ? 'Adding...' : 'Add'}
            </button>
          </form>
        </div>
      )}
    </article>
  );
}

export default ProjectCard;

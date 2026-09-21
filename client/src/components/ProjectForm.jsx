import { useState } from 'react';

const emptyProject = {
  title: '',
  description: '',
  technology: '',
  status: 'idea',
};

// One form used twice: to create a new project, and to edit an existing one.
// `project` is undefined when creating, and the project being edited otherwise.
export function ProjectForm({ project, onSubmit, onCancel, isSubmitting, submitLabel = 'Add project' }) {
  const [values, setValues] = useState(
    project
      ? {
          title: project.title,
          description: project.description || '',
          technology: project.technology || '',
          status: project.status,
        }
      : emptyProject
  );
  const [validationError, setValidationError] = useState('');

  function handleChange(event) {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!values.title.trim()) {
      setValidationError('Title is required');
      return;
    }

    setValidationError('');

    // The page above decides whether this is a create or an update, and
    // clears the form afterwards if the request succeeded.
    const succeeded = await onSubmit({ ...values, title: values.title.trim() });

    if (succeeded && !project) {
      setValues(emptyProject);
    }
  }

  return (
    <form className="project-form" onSubmit={handleSubmit}>
      <div className="form-row">
        <div className="form-field">
          <label htmlFor="title">Title</label>
          <input
            id="title"
            name="title"
            type="text"
            value={values.title}
            onChange={handleChange}
            placeholder="e.g. Portfolio site"
            maxLength={100}
          />
        </div>

        <div className="form-field">
          <label htmlFor="technology">Technology</label>
          <input
            id="technology"
            name="technology"
            type="text"
            value={values.technology}
            onChange={handleChange}
            placeholder="e.g. React, Node"
            maxLength={100}
          />
        </div>

        <div className="form-field">
          <label htmlFor="status">Status</label>
          <select id="status" name="status" value={values.status} onChange={handleChange}>
            <option value="idea">Idea</option>
            <option value="in-progress">In progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      <div className="form-field">
        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          name="description"
          rows={2}
          value={values.description}
          onChange={handleChange}
          placeholder="What is this project about?"
          maxLength={1000}
        />
      </div>

      {validationError && <p className="field-error">{validationError}</p>}

      <div className="form-actions">
        {/* Disabled while the request is in flight so a double click cannot
            create the same project twice. */}
        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : submitLabel}
        </button>

        {onCancel && (
          <button type="button" className="btn btn-ghost" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

export default ProjectForm;

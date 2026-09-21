import { useEffect, useState } from 'react';
import { api } from '../api/api.js';
import Navbar from '../components/Navbar.jsx';
import ProjectCard from '../components/ProjectCard.jsx';
import ProjectForm from '../components/ProjectForm.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';
import LoadingState from '../components/LoadingState.jsx';

const filters = [
  { value: 'all', label: 'All' },
  { value: 'idea', label: 'Idea' },
  { value: 'in-progress', label: 'In progress' },
  { value: 'completed', label: 'Completed' },
];

export function Dashboard({ user, onLogout, onSessionExpired }) {
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');

  // Every handler funnels failures through here. A 401 means the token is
  // gone or expired, which is not a normal error: the app logs out instead.
  function handleError(requestError) {
    if (requestError.status === 401) {
      onSessionExpired();
      return;
    }
    setError(requestError.message);
  }

  // Runs once when the dashboard mounts: fetch the projects belonging to the
  // logged-in user. The backend works out "who" from the JWT, so the request
  // needs no user id.
  useEffect(() => {
    let isActive = true;

    async function loadProjects() {
      try {
        const data = await api.get('/api/projects');
        if (isActive) setProjects(data);
      } catch (requestError) {
        if (isActive) handleError(requestError);
      } finally {
        if (isActive) setIsLoading(false);
      }
    }

    loadProjects();

    // Guards against setting state after the component is gone, e.g. if the
    // user logs out while the first request is still in flight.
    return () => {
      isActive = false;
    };
  }, []);

  // Each handler returns true or false so the form knows whether to reset.
  async function handleCreate(values) {
    setIsCreating(true);
    setError('');

    try {
      const created = await api.post('/api/projects', values);
      // Put the new project straight into state instead of refetching the
      // whole list. This is why the UI updates without a page refresh.
      setProjects((current) => [created, ...current]);
      return true;
    } catch (requestError) {
      handleError(requestError);
      return false;
    } finally {
      setIsCreating(false);
    }
  }

  async function handleUpdate(id, values) {
    setError('');

    try {
      const updated = await api.put(`/api/projects/${id}`, values);
      // Swap the one changed project; every other card keeps its identity.
      setProjects((current) => current.map((project) => (project._id === id ? updated : project)));
      return true;
    } catch (requestError) {
      handleError(requestError);
      return false;
    }
  }

  async function handleDelete(id) {
    setError('');

    try {
      await api.del(`/api/projects/${id}`);
      setProjects((current) => current.filter((project) => project._id !== id));
      return true;
    } catch (requestError) {
      handleError(requestError);
      return false;
    }
  }

  // Adding or removing a note returns the whole updated project, so both
  // note handlers reuse the same "replace this project" update.
  function replaceProject(updated) {
    setProjects((current) => current.map((project) => (project._id === updated._id ? updated : project)));
  }

  async function handleAddNote(id, text) {
    setError('');

    try {
      const updated = await api.post(`/api/projects/${id}/notes`, { text });
      replaceProject(updated);
      return true;
    } catch (requestError) {
      handleError(requestError);
      return false;
    }
  }

  async function handleDeleteNote(id, noteId) {
    setError('');

    try {
      const updated = await api.del(`/api/projects/${id}/notes/${noteId}`);
      replaceProject(updated);
      return true;
    } catch (requestError) {
      handleError(requestError);
      return false;
    }
  }

  const visibleProjects =
    filter === 'all' ? projects : projects.filter((project) => project.status === filter);

  const completedCount = projects.filter((project) => project.status === 'completed').length;

  return (
    <div className="app-shell">
      <Navbar user={user} onLogout={onLogout} />

      <main className="container">
        <section className="welcome">
          <h1>Welcome back, {user.name.split(' ')[0]}.</h1>
          <p>
            {projects.length === 0
              ? 'Your board is empty. Add your first project below.'
              : `You have ${projects.length} project${projects.length === 1 ? '' : 's'} on your board, ${completedCount} completed.`}
          </p>
        </section>

        <ErrorMessage message={error} onDismiss={() => setError('')} />

        <section className="panel">
          <h2 className="panel-title">New project</h2>
          <ProjectForm onSubmit={handleCreate} isSubmitting={isCreating} />
        </section>

        <section className="panel">
          <div className="panel-head">
            <h2 className="panel-title">Your projects</h2>

            <div className="filters" role="group" aria-label="Filter by status">
              {filters.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={`filter-btn ${filter === option.value ? 'is-active' : ''}`}
                  onClick={() => setFilter(option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {isLoading ? (
            <LoadingState message="Loading your projects..." />
          ) : projects.length === 0 ? (
            <p className="empty-state">No projects yet. Create your first project.</p>
          ) : visibleProjects.length === 0 ? (
            <p className="empty-state">No projects with this status.</p>
          ) : (
            <div className="project-grid">
              {visibleProjects.map((project) => (
                <ProjectCard
                  key={project._id}
                  project={project}
                  onUpdate={handleUpdate}
                  onDelete={handleDelete}
                  onAddNote={handleAddNote}
                  onDeleteNote={handleDeleteNote}
                />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default Dashboard;

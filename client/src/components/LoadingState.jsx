// Placeholder shown while a request is still in flight.
export function LoadingState({ message = 'Loading...' }) {
  return (
    <div className="loading-state">
      <span className="spinner" aria-hidden="true" />
      <p>{message}</p>
    </div>
  );
}

export default LoadingState;

import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

type SessionHeaderProps = {
  sessionId: string;
  date: Date;
  division: string;
  status: 'running' | 'finished';
};

function SessionHeader({ sessionId, date, division, status }: SessionHeaderProps) {

    const navigate = useNavigate();
    const [isEnding, setIsEnding] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleEndSession = async () => {
        // If session is already finished, just return to home
        if (status === 'finished') {
            navigate('/');
            return;
        }

        // Otherwise, confirm and end the session.
        if (!window.confirm('Are you sure you want to end this session?')) {
            return;
        }

        try {
            setIsEnding(true);
            const res = await fetch(`http://localhost:4000/sessions/${sessionId}/end`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' }
            });

            if (!res.ok) {
                throw new Error('Failed to end session');
            }

            // Return to home page
            navigate('/');
        } catch (err) {
            console.error('Failed to end session:', err);
        // TODO: Add error UI
        } finally {
            setIsEnding(false);
        }
    };

    const handleDeleteSession = async () => {
        if (!window.confirm('Are you sure you want to delete this session? This action cannot be undone.')) {
            return;
        }

        try {
            setIsDeleting(true);
            const res = await fetch(`http://localhost:4000/sessions/${sessionId}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' }
            });

            if (!res.ok) {
                throw new Error('Failed to delete session');
            }

            navigate('/');
        } catch (err) {
            console.error('Failed to delete session:', err);
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <header className="session-header">
            <h2>Scorekeeper Dashboard</h2>
            <p>
                Session ID: {sessionId} | 
                Date: {new Date(date).toLocaleDateString()} | 
                Division: {division}
            </p>
            <div className="session-actions">
                <button 
                    onClick={handleEndSession}
                    disabled={isEnding}
                >
                    {status === 'finished' 
                        ? 'Return to Home' 
                        : isEnding 
                            ? 'Saving...' 
                            : 'End Session'
                    }
                </button>
                
                {status === 'finished' && (
                    <button 
                        onClick={handleDeleteSession}
                        disabled={isDeleting}
                        className="delete-button"
                    >
                        {isDeleting ? 'Deleting...' : 'Delete Session'}
                    </button>
                )}
            </div>
        </header>
    )
}

export default SessionHeader;
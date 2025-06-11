import React, { useState, useEffect } from 'react';
import { signOut, getCurrentUser } from 'aws-amplify/auth';
import TodoList from './components/TodoList';
import FileUploader from './components/FileUploader';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('todos');

  useEffect(() => {
    checkUser();
  }, []);

  async function checkUser() {
    try {
      const currentUser = await getCurrentUser();
      console.log('Current user:', currentUser);
      setUser(currentUser);
    } catch (err) {
      console.error('Error getting current user:', err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  async function handleSignOut() {
    try {
      await signOut();
      setUser(null);
      window.location.reload(); // Reload the page to clear any cached state
    } catch (err) {
      console.error('Error signing out:', err);
    }
  }

  if (loading) {
    return <div style={{ padding: '20px' }}>Loading...</div>;
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>Amplify Todo App</h1>
      
      {user ? (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <p>Welcome, {user.username || user.signInDetails?.loginId || 'User'}!</p>
            <button 
              onClick={handleSignOut}
              style={{ padding: '8px 16px', backgroundColor: '#f44336', color: 'white', border: 'none', cursor: 'pointer' }}
            >
              Sign Out
            </button>
          </div>
          
          <div style={{ marginBottom: '20px' }}>
            <button 
              onClick={() => setActiveTab('todos')}
              style={{ 
                padding: '8px 16px', 
                backgroundColor: activeTab === 'todos' ? '#2196F3' : '#ccc', 
                color: 'white', 
                border: 'none', 
                cursor: 'pointer',
                marginRight: '10px'
              }}
            >
              Todos
            </button>
            <button 
              onClick={() => setActiveTab('files')}
              style={{ 
                padding: '8px 16px', 
                backgroundColor: activeTab === 'files' ? '#2196F3' : '#ccc', 
                color: 'white', 
                border: 'none', 
                cursor: 'pointer'
              }}
            >
              Files
            </button>
          </div>
          
          {activeTab === 'todos' ? <TodoList /> : <FileUploader />}
        </>
      ) : (
        <p>Please sign in to use the app.</p>
      )}
      
      <div style={{ marginTop: '20px' }}>
        <p>User is {user ? 'signed in' : 'signed out'}</p>
      </div>
    </div>
  );
}

export default App;

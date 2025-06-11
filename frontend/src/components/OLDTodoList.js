import React, { useState, useEffect } from 'react';
import { generateClient } from 'aws-amplify/api';
import { fetchAuthSession } from 'aws-amplify/auth';

function TodoList() {
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState({ title: '', description: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [authInfo, setAuthInfo] = useState(null);
  
  // Create the client with explicit userPool auth mode
  const client = generateClient({
    authMode: 'userPool'
  });

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    try {
      const session = await fetchAuthSession();
      console.log('Auth session:', session);
      setAuthInfo({
        isSignedIn: session.tokens !== undefined,
        idToken: session.tokens?.idToken?.toString() || 'No ID token'
      });
      fetchTodos();
    } catch (err) {
      console.error('Error checking auth:', err);
      setError('Authentication error: ' + JSON.stringify(err));
      setLoading(false);
    }
  }

  async function fetchTodos() {
    setLoading(true);
    try {
      console.log('Fetching todos...');
      const result = await client.graphql({
        query: `
          query ListTodos {
            listTodos {
              items {
                id
              }
            }
          }
        `,
        authMode: 'userPool'
      });
      
      console.log('Todos result:', result);
      setTodos(result.data.listTodos.items || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching todos:', err);
      setError('Failed to fetch todos. ' + JSON.stringify(err));
    } finally {
      setLoading(false);
    }
  }

  async function addTodo() {
    if (!newTodo.title.trim()) {
      alert('Title is required');
      return;
    }

    try {
      const result = await client.graphql({
        query: `
          mutation CreateTodo($input: CreateTodoInput!) {
            createTodo(input: $input) {
              id
            }
          }
        `,
        variables: {
          input: {
            title: newTodo.title,
            description: newTodo.description || '',
            completed: false
          }
        },
        authMode: 'userPool'
      });
      console.log('Created todo:', result);
      
      // Refresh the list after adding
      fetchTodos();
      
      setNewTodo({ title: '', description: '' });
    } catch (err) {
      console.error('Error adding todo:', err);
      alert('Failed to add todo: ' + JSON.stringify(err));
    }
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <h2>Todo List</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="Title"
          value={newTodo.title}
          onChange={(e) => setNewTodo({ ...newTodo, title: e.target.value })}
          style={{ padding: '8px', marginRight: '10px', width: '200px' }}
        />
        <input
          type="text"
          placeholder="Description (optional)"
          value={newTodo.description}
          onChange={(e) => setNewTodo({ ...newTodo, description: e.target.value })}
          style={{ padding: '8px', marginRight: '10px', width: '300px' }}
        />
        <button 
          onClick={addTodo}
          style={{ padding: '8px 16px', backgroundColor: '#4CAF50', color: 'white', border: 'none', cursor: 'pointer' }}
        >
          Add Todo
        </button>
      </div>
      
      {loading && <p>Loading todos...</p>}
      
      {error && (
        <div>
          <p style={{ color: 'red' }}>{error}</p>
          <button 
            onClick={fetchTodos}
            style={{ padding: '8px 16px', backgroundColor: '#2196F3', color: 'white', border: 'none', cursor: 'pointer' }}
          >
            Retry
          </button>
        </div>
      )}
      
      {!loading && !error && todos.length === 0 && (
        <p>No todos yet. Add one above!</p>
      )}
      
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {todos.map(todo => (
          <li key={todo.id} style={{ 
            border: '1px solid #ddd', 
            padding: '15px', 
            marginBottom: '10px'
          }}>
            <h3>Todo ID: {todo.id}</h3>
            {todo.title && <h3>{todo.title}</h3>}
            {todo.description && <p>{todo.description}</p>}
            {todo.completed !== undefined && <p>Status: {todo.completed ? 'Completed' : 'Pending'}</p>}
          </li>
        ))}
      </ul>
      
      <div style={{ marginTop: '20px' }}>
        <p>Auth Information:</p>
        <pre style={{ backgroundColor: '#f5f5f5', padding: '10px', overflow: 'auto' }}>
          {JSON.stringify(authInfo, null, 2)}
        </pre>
        
        <p>Debug Information:</p>
        <pre style={{ backgroundColor: '#f5f5f5', padding: '10px', overflow: 'auto' }}>
          {JSON.stringify(todos, null, 2)}
        </pre>
      </div>
    </div>
  );
}

export default TodoList;

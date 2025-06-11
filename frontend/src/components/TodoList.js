// src/components/TodoList.js
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
                title
                description
                completed
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
              title
              description
              completed
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

  async function toggleTodoStatus(id, currentStatus) {
    try {
      const result = await client.graphql({
        query: `
          mutation UpdateTodo($input: UpdateTodoInput!) {
            updateTodo(input: $input) {
              id
              completed
            }
          }
        `,
        variables: {
          input: {
            id,
            completed: !currentStatus
          }
        },
        authMode: 'userPool'
      });
      console.log('Updated todo:', result);
      fetchTodos(); // Refresh the list
    } catch (err) {
      console.error('Error updating todo:', err);
      alert('Failed to update todo: ' + JSON.stringify(err));
    }
  }

  async function deleteTodo(id) {
    try {
      const result = await client.graphql({
        query: `
          mutation DeleteTodo($input: DeleteTodoInput!) {
            deleteTodo(input: $input) {
              id
            }
          }
        `,
        variables: {
          input: {
            id
          }
        },
        authMode: 'userPool'
      });
      console.log('Deleted todo:', result);
      fetchTodos(); // Refresh the list
    } catch (err) {
      console.error('Error deleting todo:', err);
      alert('Failed to delete todo: ' + JSON.stringify(err));
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
            marginBottom: '10px',
            backgroundColor: todo.completed ? '#f9f9f9' : 'white'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3>{todo.title || 'Untitled'}</h3>
                {todo.description && <p>{todo.description}</p>}
                <p>Status: {todo.completed ? 'Completed' : 'Pending'}</p>
              </div>
              <div>
                <button
                  onClick={() => toggleTodoStatus(todo.id, todo.completed)}
                  style={{ 
                    padding: '6px 12px', 
                    backgroundColor: todo.completed ? '#FF9800' : '#4CAF50', 
                    color: 'white', 
                    border: 'none', 
                    cursor: 'pointer',
                    marginRight: '8px'
                  }}
                >
                  {todo.completed ? 'Mark Incomplete' : 'Mark Complete'}
                </button>
                <button
                  onClick={() => deleteTodo(todo.id)}
                  style={{ 
                    padding: '6px 12px', 
                    backgroundColor: '#f44336', 
                    color: 'white', 
                    border: 'none', 
                    cursor: 'pointer'
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
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

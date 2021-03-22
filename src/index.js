const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find((user) => 
    user.username === username
  );

  if (!user) {
    return response.status(404).json({ error: "User not found!" });
  }

  request.user = user;

  return next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  const userAlreadyExists = users.some(user => user.username === username);
  
  if(userAlreadyExists) {
    return response.status(400).json({ error: 'User already exists!' });
  } else {
    const user = {
      id: uuidv4(),
      name,
      username,
      todos: [] 
    };
    
    users.push(user);
  
    return response.status(201).json(user);
  }
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request; 

  return response.json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;

  const { title, deadline } = request.body;

  const todoItem = {
    title,
    deadline: new Date(deadline),
    id: uuidv4(),
    done: false,
    created_at: new Date()
  };

  user.todos.push(todoItem);

  return response.status(201).json(todoItem);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;

  const { title, deadline } = request.body;

  const { user } = request;

  const todoExists = user.todos.some(todo => todo.id === id);

  if (!todoExists) {
    return response.status(404).json({ error: 'Todo not found!' });
  } else {
    user.todos.map(todo => {
      if (todo.id === id) {
        todo.title = title;
        todo.deadline = deadline;
        return response.status(201).json(todo);
      }
    });

    
  }
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;

  const { user } = request;

  const todoExists = user.todos.some(todo => todo.id === id);

  if (!todoExists) {
    return response.status(404).json({ error: 'Todo not found!' });
  } else {
    user.todos.map(todo => {
      if (todo.id === id) {
        todo.done = true;
        return response.status(201).json(todo);
      }
    });
  }
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;

  const { user } = request;

  const todoExists = user.todos.some(todo => todo.id === id);

  if (!todoExists) {
    return response.status(404).json({ error: 'Todo not found!' });
  }
  
  user.todos.splice(id, 1);

  return response.status(204).json(user.todos);
});

module.exports = app;


import express from 'express';

import projectsRouter from './routes/projects.js';
import tagsRouter from './routes/tags.js';
import bookingsRouter from './routes/bookings.js';


const app = express();
const PORT = 3000;
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api/projects', projectsRouter);
app.use('/api/tags', tagsRouter);
app.use('/api/bookings', bookingsRouter);

app.get('/', (req, res) => {
  res.send('Hello, Express!');
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
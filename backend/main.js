const express = require('express');

const app = express();
const PORT = 3000;

const projectsRouter = require('./routes/projects');
const tagsRouter = require('./routes/tags');


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api/projects', projectsRouter);
app.use('/api/tags', tagsRouter);

app.get('/', (req, res) => {
  res.send('Hello, Express!');
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
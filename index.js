const express = require('express');
require('./src/db/mongoose');
const userRouter = require('./src/routers/user');
const diaryRouter = require('./src/routers/diary');
const PORT = process.env.PORT || 4000;

const app = express();

app.use(express.json());
app.use(userRouter)
app.use(diaryRouter)


app.listen(PORT, () => {
  console.log('application running on port ' + PORT)
})

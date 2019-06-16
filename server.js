const express = require('express');
const app = express();
const connectDB = require('./Config/db')
const PORT = process.env.PORT || 5000;

connectDB();
app.use(express.json({extended:false}))
app.use('/api/users',require('./Routes/API/users'));
app.use('/api/auth',require('./Routes/API/auth'));
app.use('/api/profile',require('./Routes/API/profile'));
app.use('/api/post',require('./Routes/API/post'));
app.get('/',(req,res)=>{
  res.send('API Runnin');
});


app.listen(PORT,()=>console.log(`Server listening on PORT ${PORT}`));

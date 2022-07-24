const express = require('express');
require('dotenv').config();
const PORT = process.env.PORT || 3001;
const { graphqlHTTP } = require('express-graphql');
const schema = require('./schema');
const colors = require('colors');
const connectDB = require('./config/db');
connectDB();

const app = express();
app.use('/graphql', graphqlHTTP({
    schema,
    graphiql: process.env.NODE_ENV === 'development',
}))
app.listen(PORT, console.log(`Server is runing on port ${PORT}`.bgGreen))


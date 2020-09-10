const express = require('express');
const database = require('./database');
const routes = require('./routes');

const app = express();
const port = 3501;
    
app.use('/sec', routes);

app.get('/', (req, res) => {
    return res.send('Éxito!');
});

app.listen(port, () => {
    console.log('App listening on port ' + port + '!');
});

database.connect().then(async (res) => {
    console.log('Database connected');
}).catch(error => console.log(error));




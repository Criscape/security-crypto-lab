const config = require('./config.json');
var mongoose = require('mongoose');

async function connect() {
    try {
        const uri = config.connectionString;
        return await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    } catch (error) {
        return error;
    }
}

const userSchema = new mongoose.Schema({
    name: String,
    salt: String,
    hash: String,
    pk: String
});

const userModel = mongoose.model('user', userSchema);

module.exports = {
    connect,
    userModel
}

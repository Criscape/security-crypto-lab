const mongoose = require("mongoose");
const database = require("./../database");

class UserRepo {
    constructor () {
        this.userModel = mongoose.model('user', database.userSchema, 'user');
    }
    async saveUser(name, salt, hash) {
        try {
            await this.userModel.create({ name, salt, hash });
        } catch (error) {
            throw error;
        }
    }
    async getUser(name) {
        try {
            return await this.userModel.findOne({ name });
        } catch (error) {
            throw error;
        }
    }
}

module.exports = {
    UserRepo
}


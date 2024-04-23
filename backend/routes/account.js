const { Router } = require("express");
const zod = require('zod');
const { User, Account } = require("../db");
const jwt = require('jsonwebtoken');
const JWT_SECRET = require("../config");
const accountRouter = Router();



module.exports = accountRouter
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const routes = require('./routes/index');
const multer = require('multer');
const path = require('path');
const server = express();
const createHash = require('hash-generator');



//Middlewares
let storage = multer.diskStorage({
    destination: path.join(__dirname, 'assets/appImages'),
    filename: (req, file, cb) =>{
        cb(null, createHash(20) + path.extname(file.originalname).toLocaleLowerCase())
    } 
})

server.use(multer({
    storage,
    fileFilter: (req, file, callback)=>{
        if((file.mimetype !== 'image/png' && file.mimetype !== 'image/jpg' && file.mimetype !== 'image/jpeg' && file.mimetype !== 'image/gif')){
            req.fileValidationError = 'Check the mimetype please.';
            return callback(null, false, new Error('Check the mimetype please.'));
        }
        callback(null, true)
    }
}).single('img'));

server.use(cors());
server.use(bodyParser.json());

//Routes 
server.use(routes)


//Static files
server.use(express.static(path.join(__dirname, 'assets')))


server.listen(8080, ()=>{
    console.log('Servidor escuchando al puerto 8080')
})
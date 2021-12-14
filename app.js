//declared imports
const express = require('express')
const app = express();
const fs = require('fs');
const multer = require('multer');
const {TesseractWorker} = require('tesseract.js')
const worker = new TesseractWorker();

//storage
//file handling
const storage = multer.diskStorage({
    destination: (req, file, cb) =>{
        cb(null, "./uploads")
    },
    filename : (req, file, cb) =>{
        cb(null, file.originalname);
    }

});

//accespt single file
const upload = multer({storage: storage}).single('avatar');

app.set('view engine', 'ejs');

//routes

app.get('/', (req, res) => {
    res.render('index');
});


app.post('/upload', (req, res) =>{
    upload(req, res, err =>{
        fs.readFile(`./uploads/${req.file.originalname}`, (err, data) =>{
            if(err){
                return console.log(err)
            }
            worker
            .recognize(data, "eng", {tessjs_create_pdf:'1'})
            .progress(progress =>{
                console.log(progress)
            })
            .then(result =>{
                //if want to display in web browser
                //res.send(result.text);

                res.redirect('./download')
            })
            .finally(()=> worker.terminate())

        });
    });
});

app.get('/download', (req,res)=> {
    const file = `${__dirname}/tesseract.js-ocr-result.pdf`;
    res.download(file);
})

//start up the server

const PORT = 5000 || process.env.PORT;
app.listen(PORT, () =>{
    console.log('Server running on PORT :',PORT )
})
const functions = require('firebase-functions');
var admin = require("firebase-admin");
var serviceAccount = require("./credentials.json");
var PDFDocument = require('pdfkit');
var fs = require('fs');
var QRCode = require('qrcode');
const sgMail = require('@sendgrid/mail');
var request = require('request');
var doc = new PDFDocument;


admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://solve4bharat-b7a27.firebaseio.com",
  storageBucket: "gs://solve4bharat-b7a27.appspot.com",
  apiKey: "AIzaSyCp0zORwHiH_snZT0iwPti8RctkRh9V9ms"
});

dbref = admin.firestore();
var storage = admin.storage();
const bucket = storage.bucket('solve4bharat-b7a27.appspot.com.appspot.com');
// Create and Deploy Your First Cloud Functions
// https://firebase.google.com/docs/functions/write-firebase-functions

exports.pdfSaveTest = functions.https.onRequest((req,res)=>{
    doc.pipe(fs.createWriteStream('../pdf_storage/output.pdf'));
    doc.fontSize(25)
        .text('Some text with an embedded font!', 100, 100);
    doc.end();
    doc.save();
    res.send("Success");
})

exports.checkDoctor = functions.https.onRequest((req,res)=>{
    if(req.method === 'POST')
    {
        docID = req.body.docID;
        dbref.collection('doctor-data')
        .where('email','==',req.body.email)
        .where('pwd','==',req.body.pwd)
        .get()
        .then(snapshot =>{
            if(snapshot.size)
            {
                snapshot.forEach(doc =>{
                    getData = doc.data();
                    var name = getData['name'];
                    res.status(200)
                    .json({
                        message:"Successful",
                        data:doc.id,
                        name
                    })
                })
            }
            else{
                res.status(404)
                    .json({
                        message:"Not Found"
                    })
            }
            return null;
        })
        .catch(err =>{
            res.json({
                err
            })
        })
    }
});

exports.addPatient = functions.https.onRequest((req,res)=>{
    if(req.method === 'POST')
    {
        queryStr = "doctor-data/"+req.body.docID+"/patient-data";
        dbref.collection(queryStr).add(req.body)
        .then(retdata => {
            res.json({
                data:retdata.id
            })
            return null;
        })
        .catch(err =>{
            res.json({
                err
            })
        })
    }
});

exports.docPatients = functions.https.onRequest((req,res)=>{
    if(req.method === 'POST')
    {
        var docID = req.body.docID;
        var dataList = []
        queryStr = "doctor-data/"+docID+"/patient-data";
        dbref.collection(queryStr)
        .get()
        .then(snapshot =>{
            if(snapshot.size)
            {
                snapshot.forEach(doc =>{
                    dataList.push({id:doc.id,data:doc.data()})
                })
                res.status(200)
                .json({
                    message:"Successful",
                    dataList
                })
            }
            else
            {
                res.status(404)
                .json({
                    message:"Doctor not found"
                })
            }
            return null;
        })
        .catch(err =>{
            res.json({
                err
            })
        })
    }
});

exports.getPatient = functions.https.onRequest((req,res)=>{
    if(req.method === 'POST')
    {
        var patID = req.body.patID;
        var docID = req.body.docID;
        var queryStr = 'doctor-data/'+docID+'/patient-data';
        dbref.collection(queryStr).doc(patID)
        .get()
        .then(doc =>{
            if(doc.exists)
            {
                patData = doc.data()
                res.status(200)
                .json({
                    data:patData
                })
            }
            else
            {
                res.status(404)
                .json({
                    message:"Not Found"
                })
            }
            return null;
        })
        .catch(err =>{
            res.json({
                err
            })
        })
    }
});

exports.qrtest = functions.https.onRequest((req,res)=>{
    if(req.method === 'POST')
    {
        QRCode.toDataURL(req.body.text)
        .then(url =>{
            res.json({
                url
            })
            return null;
        })
        .catch(err =>{
            res.json({
                err
            })
        })
    }
});

exports.mailSend = functions.https.onRequest((req,res)=>
{
    if(req.method === 'POST')
    { 
        sgMail.setApiKey("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");
        const msg = {
        to: req.body.email,
        from: 'sleeksites@gmail.com',
        subject: 'Prescription',
        text: "This is the Prescription that was prescribed to you",
        html: `<html>
                <body>
                    <div class="jumbotron text-center" style="margin:auto;text-align:center;">
                        <h1 class="display-2">Thank You!</h1>
                        <p class="lead">
                            <strong>Welcome for your visit</strong> 
                            <br>
                            <br>
                            The instructions that are to be followed are mentioned in the attached PDF
                        </p>
                        <h3 class="display-4">Get Well Soon!</h3>
                        <hr>
                        <br>
                        <a href="https://decrepit-moon.000webhostapp.com/pdfmaker/prescriptions/abcdtest.pdf">Download the pdf here</a>
                        <br>
                        <p>
                        Having trouble? <a href="tel:+917894561239">Contact me if you have any doubts</a>
                        </p>
                    </div>
                </body>
            </html>`,
        };
        sgMail.send(msg)
        .then(()=>{
            res.json({
                message:"Success"
            })
            return null;
        })
        .catch(err =>{
            res.json({
                err
            })
        })
    }
})

exports.addPrescription = functions.https.onRequest((req,res)=>{
    if(req.method === 'POST')
    {
        var docID = req.body.docID;
        var patID = req.body.patID;
        var queryStr = 'doctor-data/'+docID+"/patient-data/"+patID+"/prescriptions";
        console.log(queryStr);
        dbref.collection(queryStr).add(req.body)
        .then(retdata => {
            res.status(200)
            .json({
                id:retdata.id
            })
            return null;
        })
        .catch(err =>{
            res.json({
                err
            })
        })
    }
})

exports.validatePrescription = functions.https.onRequest((req,res)=>{
    if(req.method === 'POST')
    {
        var docID = req.body.docID;
        var patID = req.body.patID;
        var queryStr = 'doctor-data/'+docID+"/patient-data/"+patID+"/prescriptions";
        dbref.collection(queryStr).add(req.body)
        .then(retdata => {
            res.json({
                id:retdata.id
            })
            return null;
        })
        .catch(err =>{
            res.json({
                err
            })
        })
    }
})


exports.dummyfunction = functions.https.onRequest((req,res)=>{
    if(req.method === 'POST'){
        res.json({
            med1 : "Paracetamol",
            med2 : "Crocin",
            med3 : "Ibuprofen"
        })
    }
})
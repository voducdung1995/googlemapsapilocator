const express = require('express');
const mongoose = require('mongoose');
const app = express()
const port = 3000

const axios = require('axios');
const GoogleMapsService = require('./api/services/googleMapsService.js');
const googleMapsService = new GoogleMapsService();

const dotenv = require('dotenv');
dotenv.config();

const Store = require('./api/models/store.js');
const { response } = require('express');

mongoose.connect('mongodb+srv://admin:ryZwBOnWVSmtKoUn@cluster0.3lzj3.mongodb.net/db?retryWrites=true&w=majority', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
});

app.use((req,res,next)=> {

    res.setHeader('Access-Control-Allow-Origin', '*');
    next();
})



app.use(express.json({limit: "50mb"}));
app.listen(port, () => {

    console.log(`Server is listen on Port: ${port}`);
})

app.get('/api/stores', (req,res)=> {

    const zipCode = req.query.zip_code;

    googleMapsService.getCoordinates(zipCode).then((coordinates) => {
 
        Store.find({
            location: {
    
    
                $near: {
                    $maxDistance: 3218,
                    $geometry:{
                        type: "Point",
                        coordinates: coordinates
                    }
                }
            }
    
    
        }, (err, stores) =>{
    
            if(err){
                res.status(500).send(err);
            }else{
    
                res.status(200).send(stores);
            }
        })

        console.log(coordinates);
    }).catch((error)=> {
        console.log(error);
    })



})



app.post('/api/stores', (req,res)=> {

    let dbStores = [];
    let stores = req.body;

    stores.forEach((store)=> {
        dbStores.push({
            storeName: store.name,
            phoneNumber: store.phoneNumber,
            address: store.address,
            openStatusText: store.openStatusText,
            addressLines: store.addressLines,
            location:{
                type: 'Point',
                coordinates:[
                    store.coordinates.longitude,
                    store.coordinates.latitude
                ]


            }



        })
    })

    Store.create(dbStores, (err, stores)=>{

        if(err){
            res.status(500).send(err);
        } else {

            res.status(200).send(stores)
        }


    })


})


app.delete('/api/stores', (req,res)=> {

    Store.deleteMany({}, (err) => {

        res.status(200).send(err);
    })


})
const express = require('express');
const router = express.Router();

var http = require('http');

const fetch = require('node-fetch');
var common = require('./extras');
const mysqlConnection = require('../database');

/*

TODO: DELETE

*/


/* Ejemplo de Json del online sensor
    {
        "id_online_sensor": 2,
        "name": "Instagram",
        "description": "General instagram api",
        "base_url": "https://graph.instagram.com/",
        "intiated_date": "2019-05-16 13:17:17" //Cuando se creo
    }
*/
/* Ejemplo de Json de la relacion players_online_sensor
    {
        "id_players_online_sensor": 1,
        "id_players": 2, //Jugador con id = 2
        "id_online_sensor": 2, //Sensor con id = 2 (en este caso de ejemplo concuerda que es el de Instagram)
        "tokens": {
            //Aqui se ponen los tokens de autenticacion de las api y los diferentes permisos que puedan existir
            "access_token":"{long-lived-access-token}", 
        }
    }
*/


/* 
CRUD de sensores y activate/deactivate
*/

/*
RETRIEVE ONLINE_SENSORS:

1) Obtener un online_sensor en particular 

2) Obtener TODOS los online_sensors relacionados a un player

3) Obtener TODOS los online_sensors de todos los players

4) Obtener TODAS las relaciones players_online_sensor

*/


//1) Obtener un online_sensor en particular 
//WORKS
router.get('/sensor/:id_online_sensor',(req,res,next)=>{
    var id_online_sensor = req.params.id_online_sensor;

    var select = 'SELECT DISTINCT `online_sensor`.`id_online_sensor`, `online_sensor`.`name`,`online_sensor`.`description`, `online_sensor`.`base_url`, `online_sensor`.`initiated_date`, `online_sensor`.`last_modified` '
    var from = 'FROM `online_sensor` '
    var where = 'WHERE `online_sensor`.`id_online_sensor` = ?' 

    var query = select+from+where
    mysqlConnection.query(query,[id_online_sensor], function(err,rows,fields){
        if (!err){
            console.log(rows);
            res.status(200).json({sensors: rows})
        } else {
            console.log(err);
        }
    });
})
//2) Obtener TODOS los online_sensors relacionados a un player
//WORKS
router.get('/sensor/:id_player',(req,res,next)=>{
    var id_player = req.params.id_player;

    var select = 'SELECT DISTINCT `playerss`.`id_players`, `online_sensor`.`id_online_sensor`, `playerss_online_sensor`.`tokens`, `online_sensor`.`name`,`online_sensor`.`description`, `online_sensor`.`base_url`, `online_sensor`.`initiated_date`,`online_sensor`.`last_modified`'
    var from = 'FROM `playerss` '
    var join = 'JOIN `playerss_online_sensor` ON `playerss`.`id_players` = `playerss_online_sensor`.`id_players`  JOIN `online_sensor` ON `online_sensor`.`id_online_sensor` = `playerss_online_sensor`.`id_online_sensor`'
    var where = 'WHERE  `playerss`.`id_players` = ?'

    var query = select+from+join+where

    mysqlConnection.query(query,[id_player], function(err,rows,fields){
        if (!err){
            console.log(rows);
            res.status(200).json({sensors: rows})
        } else {
            console.log(err);
        }
    });
})


//3) Obtener TODOS los online_sensors de todos los players
//WORKS
router.get('/sensor/all',(req,res,next)=>{
    var id_player = req.params.id_player;

    var select = 'SELECT DISTINCT `playerss`.`id_players`, `online_sensor`.`id_online_sensor`, `playerss_online_sensor`.`tokens`, `online_sensor`.`name`,`online_sensor`.`description`, `online_sensor`.`base_url`, `online_sensor`.`initiated_date`, `online_sensor`.`last_modified`'
    var from = 'FROM `playerss` '
    var join = 'JOIN `playerss_online_sensor` ON `playerss`.`id_players` = `playerss_online_sensor`.`id_players`  JOIN `online_sensor` ON `online_sensor`.`id_online_sensor` = `playerss_online_sensor`.`id_online_sensor`'
    var query = select+from+join
    mysqlConnection.query(query,[id_player], function(err,rows,fields){
        if (!err){
            console.log(rows);
            res.status(200).json({sensors: rows})
        } else {
            console.log(err);
        }
    });
})

/*
CREATE ENDPOINTS:

1) Crear un online_sensor 

2) Crear la relacion players_online_sensor

*/

//1)Crea un online_sensor 
router.post('/sensor',(req,res,next)=>{
    var sensorData = req.body
    var insertInto = 'INSERT INTO `online_sensor`'
    var columnValues = '(`name`,`description`,`base_url`, `initiated_date`, `last_modified`)'
    var date = new Date().toISOString().slice(0, 19).replace('T', ' ')
    var newValues = 'VALUES (?,?,?,' + date + ',' + date + ')'
    var query = insertInto+columnValues+newValues
    mysqlConnection.query(query,[sensorData.name,sensorData.description,sensorData.base_url], function(err,rows,fields){
        if (!err){
            console.log(rows);
            res.status(200).json({sensors: rows})
        } else {
            console.log(err);
        }
    });
})

//2) Crea la relacion players_online_sensor
router.post('/sensor/relation/:id_player/:id_online_sensor',(req,res,next)=>{
    var id_player = req.params.id_player
    var id_online_sensor = req.params.id_online_sensor
    var tokens = req.body.tokens

    var date = new Date().toISOString().slice(0, 19).replace('T', ' ')

    var insertInto = 'INSERT INTO `playerss_online_sensor`'
    var columnValues = '(`id_players`,`id_online_sensor`,`tokens`, `initiated_date`,`last_modified` )'
    var newValues = 'VALUES (?,?,?,'  + date + ',' + date + ')'

    var query = insertInto+columnValues+newValues

    mysqlConnection.query(query,[id_player,id_online_sensor,tokens], function(err,rows,fields){
        if (!err){
            console.log(rows);
            res.status(200).json({sensors: rows})
        } else {
            console.log(err);
        }
    });
})



/*
UPDATE ENDPOINTS:

1) Modificar la info del sensor (name, description, base_url)
CASCADE Y CASCADE

2) Modificar los tokens de la relacion players_online_sensor
CASCADE Y CASCADE

*/

//1) Modificar la info del sensor (name, description, base_url)

router.put('/sensor/:id_online_sensor',(req,res,next)=>{

    var id_online_sensor = req.params.id_online_sensor
    var newSensorData = req.body

    var date = new Date().toISOString().slice(0, 19).replace('T', ' ')

    var update = 'UPDATE `online_sensor`'
    var set = ' SET `name` = ?,`description` = ? ,`base_url` = ?, `last_modified` = ' + date 
    var where = 'WHERE online_sensor.id_online_sensor = ?'
    var query = update+set+where    

    mysqlConnection.query(query,[newSensorData.name,newSensorData.description,newSensorData.base_url,id_online_sensor], function(err,rows,fields){
        if (!err){
            console.log(rows);
            res.status(200).json({sensors: rows})
        } else {
            console.log(err);
        }
    });
})

//2) Modificar los tokens de la relacion players_online_sensor

router.put('/sensor/tokens/:id_player:/:id_online_sensor',(req,res,next)=>{
    var id_player= req.params.id_player

    var id_online_sensor = req.params.id_online_sensor

    var tokens = req.body.tokens

    var date = new Date().toISOString().slice(0, 19).replace('T', ' ')

    var update = 'UPDATE `playerss_online_sensor`'
    var set = ' SET `tokens` = ?, `last_modified` = ' + date 
    var where = 'WHERE playerss_online_sensor.id_online_sensor = ? AND playerss_online_sensor.id_players = ?'
    var query = update+set+where    

    mysqlConnection.query(query,[tokens, id_online_sensor, id_player], function(err,rows,fields){
        if (!err){
            console.log(rows);
            res.status(200).json({sensors: rows})
        } else {
            console.log(err);
        }
    });
})

/*
DELETE ENDPOINTS:

1) Borrar el online_sensor 
Causa: Borrar todos los sensor_endpoints relacionados al online_sensor y todas las relaciones players_online_sensor
CASCADE Y CASCADE
*/

router.delete('/sensor/:id_online_sensor',(req,res,next)=>{

    var id_online_sensor = req.params.id_online_sensor


    var deleteD = 'DELETE FROM `online_sensor`'
    var where = 'WHERE `online_sensor`. id_online_sensor = ? '
    var query = deleteD+where    

    mysqlConnection.query(query,[id_online_sensor], function(err,rows,fields){
        if (!err){
            console.log(rows);
            res.status(200).json({sensors: rows})
        } else {
            console.log(err);
        }
    });
})

module.exports = router;


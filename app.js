const express = require('express')
const path = require('path')
const sqlite3 = require('sqlite3')
const {open} = require('sqlite')

const dbPath = path.join(__dirname, 'cricketTeam.db')
const app = express()

app.use(express.json())
let db = null

const InitalizeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })

    app.listen(3000, () => {
      console.log('Web Server is Starting .....')
    })
  } catch (e) {
    console.log(`Database Error: ${e.message}`)
    process.exit(1)
  }
}

InitalizeDBAndServer()

const convertDbObjAsRObj = objectList => {
  return {
    playerId: objectList.player_id,
    playerName: objectList.player_name,
    jerseyNumber: objectList.jersey_number,
    role: objectList.role,
  }
}

//Show all the players using GET
app.get('/players/', async (request, response) => {
  const {playerId} = request.body
  const getPlayersQuery = `
        
        SELECT
            *
        FROM
            cricket_team;        
        
        `

  const playersArray = await db.all(getPlayersQuery)
  response.send(playersArray.map(eachobject => convertDbObjAsRObj(eachobject)))
})

//Add player using POST
app.post('/players/', async (request, response) => {
  const playerDetails = request.body
  const {player_name, jersey_number, role} = playerDetails
  const addPlayerQuery = `
    
    INSERT INTO
        cricket_team(player_name,jersey_number,role)
    VALUES (
        
        '${player_name}',
        ${jersey_number},
        '${role}'
    )  ;  

    
    `
  const dbResponse = await db.run(addPlayerQuery)

  const player_Id = dbResponse.lastID

  response.send('Player Added to Team')
})

// Returns a Player using GET

app.get('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params

  const getPlayerQuery = `
    
    SELECT
      *
    FROM
      cricket_team 
    WHERE
      player_id=${playerId};   
    
    `

  const player = await db.get(getPlayerQuery)
  response.send(convertDbObjAsRObj(player))
})

//Update db using PUT

app.put('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const playerDetails = request.body
  const {player_name, jersey_number, role} = playerDetails
  const addPlayerQuery = `
  
  UPDATE
      cricket_team
    SET
      player_name='${player_name}'   ,
      jersey_number=${jersey_number},
      role='${role}'
    WHERE
      player_id=${playerId}  ;
  
  `
  const player = await db.run(addPlayerQuery)
  response.send('Player Details Updated')
})
// Delete the query
app.delete('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params

  const deletePlayerQuery = `
  
  DELETE FROM
    cricket_team
  WHERE
    player_id=${playerId}  ;
  
  `
  await db.run(deletePlayerQuery)
  response.send('Player Removed')
})

module.exports = app

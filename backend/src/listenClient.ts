import { Client } from '../node_modules/@types/pg/index.js'
import dotenv from 'dotenv'

dotenv.config()

const listenClient = new Client({
    connectionString: process.env.DATABASE_URL,
})


const initlistenClient = async(): Promise<Client> => {
    await listenClient.connect()
    await listenClient.query('LISTEN chatlist_changed')
    console.log('chatlist table has changed ')

    return listenClient

}  

export {listenClient , initlistenClient}





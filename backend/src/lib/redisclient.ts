import { Redis } from 'ioredis'

const REDIS_URL:any = process.env.REDIS_URL 


export const  pub  = new Redis(REDIS_URL)
export const sub  =  pub.duplicate()


pub.on('connect', () => console.log('redis pub client connected'))
sub.on('connect', () => console.log('redis sub client connected'))

pub.on('error', (err) => console.log('redis pub client error',err))
sub.on('error', (err) => console.log('redis sub client error',err))

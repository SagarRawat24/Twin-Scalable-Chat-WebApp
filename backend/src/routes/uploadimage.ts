
import { Request, Router } from "express";
import multer from 'multer'
import { cloudinary } from "../lib/cloudinary.js";

export const uploadRouter = Router()

// multer.memoryStorage() — jab file upload hoti hai, multer usse disk pe save karne ki jagah RAM mein buffer ke roop mein rakhta hai.

const upload = multer({
    storage: multer.memoryStorage(),  //file disk pe save nahi hogi ram mein rahegi
    limits: { fieldSize: 10 * 1024 * 1024 }, // 10mb limit

})

// Jab frontend se POST /image-upload hit hoga 
// Pehle multer middleware chalta hai — file ko parse karke req.file mein daal deta ha Phir hamara async function chalta hai

uploadRouter.post("/imageupload", upload.single("file"), async (req: Request, res, next) => {


    // validation   

    // Koi file aayi hi nahi? → reject
    // File image nahi hai (jaise PDF, video)? → reject

    try {
        if (!req.file) {
            return res.status(400).json({ error: "No file is provided" })
        }
        const file = req.file
        if (!file.mimetype.startsWith("image/")) {
            return res.status(400).json({ error: "only image files are allowed " })

        }

        // promise wrap 
        // Hum ek naya Promise bana rahe hain — kyunki upload_stream callback-based hai, async/await directly kaam nahi karta. 
        //because cloudinary.uploader.upload_stream ek purana callback-style function hai — matlab ye Promise return nahi karta, balki ek callback leta hai:
        // Toh problem ye hai ki async/await sirf Promises ke saath kaam karta hai, callbacks ke saath nahi.

        const result = await new Promise<{
            secure_url: string,
            width: number;
            height: number;
        }>((resolve, reject) => {

            //    upload_stream ek writable stream return karta hai — matlab ye ek "pipe" hai jisme hum data daaal sakte hain.
            //    Jab upload complete hota hai, callback fire hota hai:

            //     Error aaya → reject() call hota hai → Promise fail
            //     Success → resolve() call hota hai → Promise success, data bahar aata hai

            const uploadstream = cloudinary.uploader.upload_stream(
                {
                    folder: "all_image_chat_app"
                },
                (err, uploaded) => {
                    if (err || !uploaded) {
                        return reject(err ?? new Error("image uploded failed"))
                    }
                
                    resolve({
                        secure_url: uploaded.secure_url,
                        width: uploaded.width,
                        height: uploaded.height,
                    })
                }
            )
            
            // file.buffer mein poori image RAM mein padi hai (Step 1 yaad hai?). Ab hum wo buffer seedha stream ke andar daal rahe hain — .end() matlab "ye lo data, aur stream band karo".
            //  Cloudinary stream ye bytes receive karta hai aur apne server pe upload kar leta hai.
                uploadstream.end(file.buffer)
                
        })
         
       
        // Upload complete hone ke baad Cloudinary ek public URL deta hai jahan image accessible hai — ye frontend ko bhej dete hain. Frontend isko socket ke through message mein attach kar deta hai.
        return res.status(200).json({
            url: result.secure_url,
            width: result.width,
            height: result.height,
            
        });
        
    } catch (err) {
        next(err)

    }
})
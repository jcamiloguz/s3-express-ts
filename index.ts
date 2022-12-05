import express, { Request, Response } from "express"
import AWS from "aws-sdk"
import multer from "multer"
import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"
import * as dotenv from "dotenv"
const __filename = fileURLToPath(import.meta.url)

const __dirname = path.dirname(__filename)
dotenv.config()

const app = express()
AWS.config.update({
  accessKeyId: process.env.KEYID,
  secretAccessKey: process.env.ACCESSKEY,
  region: "us-west-1",
})
const s3 = new AWS.S3({ apiVersion: "2006-03-01" })

const port = process.env.PORT || 3000
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "/uploads/"))
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname)
  },
})
const upload = multer({ storage })

const uploadFile = (req: Request, res: Response) => {
  if (!req.file) return
  const { originalname, path } = req.file

  const bodyFile = fs.createReadStream(`/${path}`)
  const paramsSnap = {
    Bucket: process.env.BUCKETNAME!,
    Key: originalname,
    Body: bodyFile,
    ContentType: "image/png",
    ACL: "public-read", //TODO 😎
  }
  s3.upload(paramsSnap, (err: Error, data: AWS.S3.ManagedUpload.SendData) => {
    if (err) {
      console.log("error in callback", err)
    } else {
      console.log(data)
      res.send(data)
    }
  })
}

app.post("/upload", upload.single("myfile"), uploadFile)
app.listen(port, () => {
  console.log("Estamos ready por el puerto", port)
})

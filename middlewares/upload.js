const path = require("node:path");
const crypto = require("node:crypto");

const multer = require("multer");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "..", "tmp"));
    console.log("1 - mdlWar - upload");
  },
  filename: (req, file, cb) => {    
    
    const extname = path.extname(file.originalname); // .png
    const basename = path.basename(file.originalname, extname); 
    const suffix = crypto.randomUUID();

    cb(null, `${basename}-${suffix}${extname}`);
  },
});

const upload = multer({ storage });

module.exports = upload;

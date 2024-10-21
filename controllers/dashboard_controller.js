import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";
import db from "../db/query.js";

const fv_getKeyValueFromData = (data, contentHeader) => {
  const result = [];
 
  let formBoundaryName = null;
  {
    const formBoundaryIdx = contentHeader.search("boundary=") + 9;
    let endIdx = contentHeader.indexOf(';', formBoundaryIdx);

    if (endIdx === -1) {
      endIdx = contentHeader.length;
    }

    formBoundaryName = contentHeader.substring(formBoundaryIdx, endIdx);
  }

  //console.log(contentHeader);
  const filenameStr = "filename";
  let currentIdx = 0;
  let startIdx = 0;
  let CLRFConsecutiveCount = 0;
  while (currentIdx < data.length) {
    startIdx = currentIdx;

    switch (data[currentIdx++]) {
      case 'f': {

        while (data[currentIdx] === filenameStr[currentIdx - startIdx]) {
          ++currentIdx;
        }

        if ((currentIdx - startIdx) === filenameStr.length) {
          currentIdx += 2;
          const startSubstrIdx = currentIdx;
          while (data[currentIdx] !== '"') {
            ++currentIdx;
          }
        
          result.push({ filename: data.substring(startSubstrIdx, currentIdx) });
        }

        CLRFConsecutiveCount = 0;
      } break;

      case '\r': {
        if (data[currentIdx] === '\n') {
          ++currentIdx;
          ++CLRFConsecutiveCount;
        }

        if (CLRFConsecutiveCount === 2) {
          CLRFConsecutiveCount = 0;

          currentIdx += 2;

          // YIKES
          let idx = data.lastIndexOf('\r\n', data.indexOf(formBoundaryName, currentIdx));
          let nextIdx = idx;
          let idx0 = data.lastIndexOf('\r\n', idx - 1);
          if ((idx - idx0) === 2) {
            idx = idx0;
          }
          result[result.length - 1].data = data.substring(currentIdx, idx);

          currentIdx = nextIdx + formBoundaryName.length + 2;
        }
      } break;
    }
  }

  return result;
}

const get = (req, res) => {
  if (!req.user) {
    res.redirect('/sign-in');
    return;
  }

  res.render('dashboard', { user: req.user });
};

// https://nodejs.org/en/learn/modules/anatomy-of-an-http-transaction
const postUpload = async (req, res) => {
  if (!req.user) {
    res.status(401).send(`{ "401": "unauthorized" }`);
    return;
  }
 
  let body = []
  req.on('data', chunk => {
    body.push(chunk);
  })
  .on('end', () => {
    body = Buffer.concat(body).toString('binary');
    const data = fv_getKeyValueFromData(body, req.headers['content-type']);
    let hasError = false;
    data.forEach(d => {
      fs.writeFile(`./tmp_uploads/${d.filename}`, Buffer.from(d.data, 'binary'), 'binary', err => {
        if (err) {
          hasError = true;
        } else {
          db.createNewUpload(d.filename, req.user.id);
        }
      });
    }); 

    if (hasError) {
      res.send(`
        {
          "status": 500,
          "message": "Internal server error; failed to write uploaded file onto disk."
        }
      `);
    } else {
      res.send(`
        {
          "status": 200,
          "message": "Successfully uploaded file."
        }
      `);
    }
  });
};

const getUpload = async (req, res) => {
  if (!req.user) {
    res.status(401).send(`{ "401": "unauthorized" }`);
    return;
  }

  try {
    if (req.get('X-Requested-With') === "FetchAPI") {
      const dirs = await fsp.readdir('./tmp_uploads/');
      const result = [];

      for (let idx = 0; idx < dirs.length; ++idx) {
        const file = dirs[idx];
        const stat = fs.lstatSync(path.join('./tmp_uploads', file));
        if (stat.isFile()) {
          let name = file;
          let extension = "";
          let size = stat.size;
          let sizeType = "bytes";

          const extensionIdx = file.lastIndexOf('.');
          if (extensionIdx !== -1) {
            name = file.substring(0, extensionIdx);
            extension = file.substring(extensionIdx + 1, file.length);
          }

          if (size < (50 * 1024)) {
          } else if (size < (50000 * 1024)) {
            size /= 1024;
            sizeType = "kb";
          } else if (size < (50000000 * 1024)) {
            size = (size / 1024) / 1024;
            sizeType = "mb";
          } else {
            size = ((size / 1024) / 1024) / 1024;
            sizeType = "gb";
          }

          const id = await db.getFileIDFromFilename(file, req.user.id);
          if (id === null) {
            throw new Error("failed to fetch ID from filename!");
          }

          result.push({
            name: name,
            type: extension,
            size: size,
            sizeType: sizeType,
            shared: "Anyone With Link", // todo: query data base for shared data,
            uploaded: stat.mtime,
            id: id,
          });
        }
      }

      console.log(result);
      res.send(result);
    } else {
      res.redirect("/");
    }
  } catch (err) {
    res.send(`
      {
        "status": 500,
        "message": "Internal server error; failed to read uploaded files from disk."
      }
    `);
  }
};

export default {
  get,
  postUpload,
  getUpload,
};

import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";
import db from "../db/query.js";
import mime from 'mime-types';

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
  const filenameStr         = "filename";
  let currentIdx            = 0;
  let startIdx              = 0;
  let CLRFConsecutiveCount  = 0;
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

const fv_getFileDetails = async (filename, user_id, includeFileID) => {
  const pathToFile = path.join(`./tmp_uploads/${user_id}`, filename);
  const stat       = fs.lstatSync(pathToFile);

  if (stat.isFile()) {
    let name        = filename;
    let type        = "";
    let size        = stat.size;
    let sizeRaw     = stat.size;
    let sizeType    = "bytes";

    const extensionIdx = filename.lastIndexOf('.');
    if (extensionIdx !== -1) {
      name = filename.substring(0, extensionIdx);
      type = filename.substring(extensionIdx + 1, filename.length);
    }

    if (size < (50 * 1024)) {
    } else if (size < (50000 * 1024)) {
      size     = size / 1024;
      sizeType = "kb";
    } else if (size < (50000000 * 1024)) {
      size     = (size / 1024) / 1024;
      sizeType = "mb";
    } else {
      size     = ((size / 1024) / 1024) / 1024;
      sizeType = "gb";
    }

    if (includeFileID) {
      const id = await db.getFileIDFromFilename(filename, user_id);
      if (id === null) {
  throw new Error("failed to fetch ID from filename!");
      }
      return {
        name: name,
        type: type,
        size: size,
        sizeType: sizeType,
        sizeBytes: sizeRaw,
        shared: "Anyone With Link", // todo: query data base for shared data,
        lastModified: stat.mtime,
        id: id,
      };
    } else {
      return {
        name: name,
        type: type,
        size: size,
        sizeType: sizeType,
        sizeBytes: sizeRaw,
        shared: "Anyone With Link", // todo: query data base for shared data,
        lastModified: stat.mtime,
      };
    }
  } else {
    return null;
  }
};

const get = async (req, res, next) => {
  if (!req.user) {
    res.redirect('/sign-in');
    return;
  }

  try {
    const folders = await db.getFolders(req.user.id);
    res.render('dashboard', { user: req.user, folders: folders.reverse() });
  } catch (err) {
    next(err);
  }
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
  .on('end', async () => {
    body = Buffer.concat(body).toString('binary');
    const data = fv_getKeyValueFromData(body, req.headers['content-type']);
    let hasError = false;
    for (let dataIdx = 0; dataIdx < data.length; ++dataIdx) {
      const d = data[dataIdx];
      fs.writeFile(`./tmp_uploads/${req.user.id}/${d.filename}`, Buffer.from(d.data, 'binary'), 'binary', err => {
        if (err) {
          hasError = true;
        }
      });
      
      await db.createNewUpload(d.filename, req.user.id);
    }

    if (hasError) {
      res.status(500).send(`
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
      const dirs   = await fsp.readdir(`./tmp_uploads/${req.user.id}`);
      const result = [];

      for (let idx = 0; idx < dirs.length; ++idx) {
        const file = dirs[idx];
        const fileDetails = await fv_getFileDetails(file, req.user.id, true);
        if (fileDetails !== null) {
          result.push(fileDetails);
        }
      }

      res.send(result);
    } else {
      res.redirect("/");
    }
  } catch (err) {
    console.log(err);
    res.status(500).send(`
      {
        "status": 500,
        "message": "Internal server error; failed to read uploaded files from disk."
      }
    `);
  }
};

const deleteFile = async (req, res) => {
  if (!req.user) {
    res.status(401).send(`{ "401": "unauthorized" }`);
    return;
  }

  try {
    const filename = await db.deleteFileFromIDAndReturnFileName(parseInt(req.params.id), req.user.id);
    if (filename === null) {
      throw new Error("file does not exist!");
    }

    fs.unlink(path.join(`./tmp_uploads/${req.user.id}`, filename), (err) => {
      if (err) throw err;
      
      res.send(`
        {
          "status": 200,
          "message": "successfully deleted file."
        }
      `);
    });
  } catch (err) {
    console.log(err);
    res.status(500).send(`
      {
        "status": 500,
        "message": "Internal server error; failed to delete uploaded file from disk."
      }
    `);
  } 
};

const getFile = async (req, res, next) => {
  if (!req.user) {
    res.status(401).send(`{ "401": "unauthorized" }`);
    return;
  }

  // 1. Get file details
  // 2. Send to user
  try {
    const filename = await db.getFilenameFromFileID(parseInt(req.params.id), req.user.id);
    if (!filename) {
      throw new Error("Unable to get filename from FileID.");
    }

    const fileDetails = await fv_getFileDetails(filename, req.user.id, false)
    fileDetails.id = req.params.id;
    if (req.get('X-Requested-With') === "FetchAPI") {
      res.send(fileDetails);
    } else {
      res.render("dashboard-file", { fileDetails: fileDetails });
    }
  } catch (err) {
    next(err);
  }
};

const downloadFile = async (req, res, next) => {
  console.log(req.params);
  if (!req.user) {
    res.status(401).send(`{ "401": "unauthorized" }`);
    return;
  }

  try {
    const filename = await db.getFilenameFromFileID(parseInt(req.params.id), req.user.id);
    if (!filename) {
      throw new Error("Unable to get filename from FileID.");
    }

    const filepath = path.join(`./tmp_uploads/${req.user.id}/${filename}`);
    if (!fs.existsSync(filepath)) {
      throw new Error("file doesn't exist");
    }

    const mimeType = mime.lookup(filename) || 'application/octet-stream';
    const details = await fv_getFileDetails(filename, req.user.id, false);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', mimeType);
    res.setHeader('Content-Length', details.sizeBytes);

    // https://www.freecodecamp.org/news/node-js-streams-everything-you-need-to-know-c9141306be93/
    const stream = fs.createReadStream(filepath);

    stream.on('error', (err) => {
      throw err;
    });

    stream.pipe(res);

    /*
    fs.readFile(filepath, (err, data) => {
      if (err) {
        throw err;
      }
      
      res.send(data);
    });*/

  } catch (err) {
    next(err);
  }
};

const getFolders = async (req, res, next) => {
  if (!req.user) {
    res.status(401).send(`{ "401": "unauthorized" }`);
    return;
  }

  try {
    const folders = await db.getFolders(req.user.id);
    console.log(folders);
    res.render("dashboard-folders", { folders: folders.reverse() });
  } catch (err) {
    next(err);
  }
};

const checkFolderNameExists = async (req, res, next) => {
  if (!req.user) {
    res.status(401).send(`{ "401": "unauthorized" }`);
    return;
  }

  try {
    const result = await db.checkFolderNameExists(req.body.value, req.user.id);
    // DIDNT KNOW ABOUT THIS: https://expressjs.com/en/api.html#res.json

    res.json({ exists: result });
  } catch (err) {
    next(err);
  }
};

const createNewFolder = async (req, res, next) => {
  if (!req.user) {
    res.status(401).send(`{ "401": "unauthorized" }`);
    return;
  }

  try {
   const exists = await db.checkFolderNameExists(req.body.value, req.user.id);
    // DIDNT KNOW ABOUT THIS: https://expressjs.com/en/api.html#res.json
    if (!exists) {
      const id = await db.createFolder(req.body.value, req.user.id);
      res.json(
        {
          created: true,
          id: id,
        }
      );
    } else {
      res.json({ create: false });
    }

  } catch (err) {
    next(err);
  }
};

const deleteFolderFromName = async (req, res, next) => {
  if (!req.user) {
    res.status(401).send(`{ "401": "unauthorized" }`);
    return;
  }

  try {
    await db.deleteFolderFromName(req.body.name, req.user.id);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};

const addFilesToFolder = async (req, res, next) => {
  if (!req.user) {
    res.status(401).send(`{ "401": "unauthorized" }`);
    return;
  }

  try {
    await db.addFilesToFolder(req.body.folder, req.body.fileIds, req.user.id);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};

const viewFolder = async (req, res, next) => {
  if (!req.user) {
    res.status(401).send(`{ "401": "unauthorized" }`);
    return;
  }

  try {
    console.log(req.params.id);
    const folder = await db.getFilesFromFolderID(req.params.id, req.user.id);
    console.log(folder);
    res.render("dashboard-folder", { folder: folder });
  } catch (err) {
    next(err);
  }
};

const removeFilesFromFolder = async (req, res, next) => {
  if (!req.user) {
    res.status(401).send(`{ "401": "unauthorized" }`);
    return;
  }

  try {
    await db.removeFilesFromFolder(req.body.fileIds, req.body.folderId);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};

export default {
  get,
  postUpload,
  getUpload,
  deleteFile,
  getFile,
  downloadFile,
  getFolders,
  checkFolderNameExists,
  createNewFolder,
  addFilesToFolder,
  viewFolder,
  removeFilesFromFolder,
};

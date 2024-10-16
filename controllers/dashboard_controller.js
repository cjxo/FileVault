import fs from "node:fs";

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

  console.log(data);
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
    body = Buffer.concat(body).toString();
    const data = fv_getKeyValueFromData(body, req.headers['content-type']);
    let hasError = false;
    data.forEach(d => {
      fs.writeFile(`./tmp_uploads/${d.filename}`, Buffer.from(d.data), err => {
        if (err) {
          hasError = true;
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

export default {
  get,
  postUpload,
};

const fv_sectDisplay           = document.querySelector(".fv-display-section");
const fv_ulFileListCategories  = document.querySelectorAll(".fv-file-list");
const fv_fileListerEntryBtns   = document.querySelectorAll(".fv-file-lister-entry > button");
const fv_inpFileUploader       = document.querySelector("#fv-file-input-uploader");
const fv_btnFileSelect         = document.querySelector(".fv-file-input-select");
const fv_btnFileSubmit         = document.querySelector(".fv-file-input-select + button");
let fv_listerBtnsClickState    = 0;

const testFiles                = [
  {
    name: "kickoff0",
    type: "PDF",
    size: 1.2,
    shared: "Only Me",
    uploaded: new Date(),
  },
  {
    name: "kickoff1",
    type: "PDF",
    size: 4.2,
    shared: "Anyone With Link",
    uploaded: new Date(),
  }
];

function fv_toLocaleDateString(date) {
  return date.toLocaleDateString(
    'en-US',
    {
      weekday: "short",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }
  );
}

function fv_appendToLister(idx, li) {
  const lister = fv_ulFileListCategories[idx];
  lister.appendChild(li);

  if ((lister.children.length % 2) === 0) {
    li.style.backgroundColor = "#F3F3F3";
  } else {
    li.style.backgroundColor = "#FFFFFF";
  }
}

function fv_createLiFile(name) {
  const liFile       = document.createElement("li");
  const p            = document.createElement("p");
  p.textContent      = name;
  
  liFile.append(p);
  return liFile;
}

function fv_appendFileName(name) {
  const liFile              = document.createElement("li");
  const p                   = document.createElement("p");
  const inpCheckBox         = document.createElement("input");
  p.textContent             = name;
  liFile.style.paddingLeft  = "8px";
  
  inpCheckBox.setAttribute("type", "checkbox");
  liFile.append(inpCheckBox, p);
  fv_appendToLister(0, liFile);
}

function fv_sortFilesBy(idx, sortAscending) {
  fv_ulFileListCategories.forEach(list => {
    while (list.firstChild) {
      list.removeChild(list.firstChild);
    }
  });

  const comparer = sortAscending ? -1 : 1;
  let files = null;
  switch (idx) {
    case 0: case 1: case 2: case 3: case 4: {
      files = testFiles.sort((a, b) => {
        if (Object.values(a)[idx] > Object.values(b)[idx]) {
          return comparer;
        }

        if (Object.values(a)[idx] < Object.values(b)[idx]) {
          return -comparer;
        }

        return 0;
      });
    } break;

    default: {
      files = testFiles; 
    } break;
  }

  files.forEach(file => {
    fv_appendFileName(file.name);
    fv_appendToLister(1, fv_createLiFile(file.type));
    fv_appendToLister(2, fv_createLiFile(file.size + "mb"));
    fv_appendToLister(3, fv_createLiFile(file.shared));
    fv_appendToLister(4, fv_createLiFile(fv_toLocaleDateString(file.uploaded)));
  });
}

fv_btnFileSelect.addEventListener("click", (e) => {
  fv_inpFileUploader.click();
});

fv_btnFileSubmit.addEventListener("click", (e) => {
  e.preventDefault();
  
  const formData = new FormData();

  const files = fv_inpFileUploader.files;
  console.log(files);
  for (let idx = 0; idx < files.length; ++idx) {
    formData.append(`uploaded_files`, files[idx]);
  }

  // https://developer.mozilla.org/en-US/docs/Web/API/RequestInit
  fetch('/dashboard/upload', {
    body: formData,
    method: "POST",
  })
  .then((response) => {
    return response.json();
  })
  .then(data => {
    console.log(data);
  })
  .catch(err => {
    console.error(err);
  })
});

fv_inpFileUploader.addEventListener("change", (e) => {
  const t = e.target;
  if (t.files.length) {
    fv_btnFileSubmit.click();

    /*
    // - https://developer.mozilla.org/en-US/docs/Web/API/FormData
    // - "multi-part form data"
    // - Use fetch APi
    // - https://developer.mozilla.org/en-US/docs/Web/API/File_API/Using_files_from_web_applications
    for (let idx = 0; idx < t.files.length; ++idx) {
      const buf = await t.files[idx].arrayBuffer();
      console.log(buf);
    }*/
  }
});

fv_sortFilesBy(99);

fv_fileListerEntryBtns.forEach((btn, idx) => {
  btn.addEventListener("click", () => {
    const state = (fv_listerBtnsClickState & (1 << idx));
    if (state) {
      fv_listerBtnsClickState &= ~(1 << idx);
    } else {
      fv_listerBtnsClickState |= (1 << idx);
    }

    fv_sortFilesBy(idx, state !== 0);
  });
});

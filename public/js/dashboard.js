const fv_sectDisplay           = document.querySelector(".fv-display-section");
const fv_ulFileListCategories  = document.querySelectorAll(".fv-file-list");

const testFiles      = [
  {
    name: "kickoff0",
    type: "PDF",
    size: "1.2mb",
    shared: "Only Me",
    uploaded: "07/12/24"
  },
  {
    name: "kickoff1",
    type: "PDF",
    size: "4.2mb",
    shared: "Only Me",
    uploaded: "10/12/24"
  }
]

function fv_appendToLister(idx, li) {
  const lister = fv_ulFileListCategories[idx];
  lister.appendChild(li);

  if ((lister.children.length % 2) === 0) {
    li.style.backgroundColor = "#F3F3F3";
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

testFiles.forEach(file => {
  fv_appendFileName(file.name);
  fv_appendToLister(1, fv_createLiFile(file.type));
  fv_appendToLister(2, fv_createLiFile(file.size));
  fv_appendToLister(3, fv_createLiFile(file.shared));
  fv_appendToLister(4, fv_createLiFile(file.uploaded));
});

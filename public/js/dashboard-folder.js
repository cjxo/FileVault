const fv_secFolderDisplayGrid = document.querySelector(".fv-folder-display-grid");
const fv_btnAddFolder         = document.querySelector(".fv-file-input-select");

fv_btnAddFolder.addEventListener("click", e => {
  if (fv_secFolderDisplayGrid.querySelector("input") !== null) {
    return;
  }
  // temporaries
  const a       = document.createElement("a");
  const svg     = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  const use     = document.createElementNS("http://www.w3.org/2000/svg", "use");
  const inp     = document.createElement("input"); 

  inp.setAttribute("maxlength", "100");
  inp.setAttribute("class", "fv-temp-folder-detail-input");
  a.setAttribute("href", "#");
  a.setAttribute("class", "fv-folder-entry");
  inp.setAttribute("type", "text");
  use.setAttribute("href", "#fv-file-folder-sym");
  
  svg.appendChild(use);
  a.append(svg, inp);
  if (fv_secFolderDisplayGrid.firstChild) {
    fv_secFolderDisplayGrid.insertBefore(a, fv_secFolderDisplayGrid.firstChild);
  } else {
    fv_secFolderDisplayGrid.appendChild(a);
  }

  inp.addEventListener("keydown", (e) => {
    if (!e.repeat && (e.key === "Enter")) {
      fetch("/dashboard/folders/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ value: inp.value })
      })
      .then(response => response.json())
      .then(data => {
        if (data.created) {
          const h3       = document.createElement("h3");
          h3.textContent = inp.value;
          a.setAttribute("href", `folders/${data.id}`);
          a.appendChild(h3);
          inp.remove(); 
        }
      })
      .catch(err => {
        console.log(err);
      });
    }
  });
});

const fv_secFolderDisplayGrid = document.querySelector(".fv-folder-display-grid");
const fv_btnAddFolder         = document.querySelector(".fv-file-input-select");

const fv_btnOptions           = document.querySelector(".fv-page-title-right > button");
const fv_divDropDownOptions   = document.querySelector(".fv-page-dropdown");
const fv_btnLinks             = document.querySelectorAll(".fv-page-dropdown > button");
const fv_inpCheckboxes        = document.querySelectorAll('.fv-folder-display-grid input[type="checkbox"]');
let g_inpCheckCount           = 0;

fv_inpCheckboxes.forEach(input => {
  input.addEventListener("change", e => {
    if (input.checked) {
      g_inpCheckCount += 1;
    } else {
      g_inpCheckCount -= 1;
    }

    if (g_inpCheckCount > 0) {
      fv_btnOptions.style.display = "flex";
    } else {
      fv_btnOptions.style.display = "none";
      fv_divDropDownOptions.style.display = "none";
    }
  });
});

fv_btnOptions.addEventListener("click", e => {
  if ((fv_divDropDownOptions.style.display === "") || (fv_divDropDownOptions.style.display === "none")) {
    fv_divDropDownOptions.style.display = "flex";
  } else {
    fv_divDropDownOptions.style.display = "none";
  }
});

fv_btnLinks[0].addEventListener("click", async e => {
  const clickedInputs     = document.querySelectorAll(".fv-folder-display-grid input:checked");
  const clickedFoldersIds = [];

  clickedInputs.forEach(input => {
    const folderHref = input.parentElement.href;
    const folderHrefOnePastLastSlash = folderHref.lastIndexOf("/") + 1;
    const folderId                   = folderHref.substring(folderHrefOnePastLastSlash, folderHref.length);
    clickedFoldersIds.push(parseInt(folderId));

    input.parentElement.remove();
  });

  try {
    const response = await fetch ("/dashboard/folders/delete/", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        folderIds: clickedFoldersIds,
      }),
    });

    const json = await response.json();
    console.log(json);

    fv_btnOptions.style.display = "none";
    fv_divDropDownOptions.style.display = "none";
  } catch (err) {
    console.error(err);
  }
});

fv_btnAddFolder.addEventListener("click", e => {
  if (fv_secFolderDisplayGrid.querySelector('input[type="text"]') !== null) {
    return;
  }

  // temporaries
  const a         = document.createElement("a");
  const svg       = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  const use       = document.createElementNS("http://www.w3.org/2000/svg", "use");
  const inp       = document.createElement("input"); 
  const inpCbox   = document.createElement("input");

  inpCbox.setAttribute("type", "checkbox");
  inp.setAttribute("maxlength", "100");
  inp.setAttribute("type", "text");
  inp.setAttribute("class", "fv-temp-folder-detail-input");
  a.setAttribute("href", "#");
  a.setAttribute("class", "fv-folder-entry");
  inp.setAttribute("type", "text");
  use.setAttribute("href", "#fv-file-folder-sym");
  
  svg.appendChild(use);
  a.append(inpCbox, svg, inp);
  if (fv_secFolderDisplayGrid.firstChild) {
    fv_secFolderDisplayGrid.insertBefore(a, fv_secFolderDisplayGrid.firstChild);
  } else {
    fv_secFolderDisplayGrid.appendChild(a);
  }

  inp.addEventListener("input", () => {
    inp.style.color = "black";
  });

  inp.focus();

  const removeA = () => {
    a.remove();
  };

  inp.addEventListener("keydown", (e) => {
    if (!e.repeat && (e.key === "Enter") && (inp.value !== "")) {
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
          inp.removeEventListener("focusout", removeA);
          inp.remove(); 
        } else {
          inp.value = "Folder Already Exists!";
          inp.style.color = "red";
        }
      })
      .catch(err => {
        console.log(err);
      });
    } else if (!e.repeat && (e.key === "Escape")) {
      a.remove();
    }
  });

  inp.addEventListener("focusout", removeA);
});

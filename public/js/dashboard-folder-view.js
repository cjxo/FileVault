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
  const clickedInputs  = document.querySelectorAll(".fv-folder-display-grid input:checked");
  const fileIds        = [];

  const folderHref                 = window.location.href;
  const folderHrefOnePastLastSlash = folderHref.lastIndexOf("/") + 1;
  const folderId                   = folderHref.substring(folderHrefOnePastLastSlash, folderHref.length);

  try {
    for (let inpIdx = 0; inpIdx < clickedInputs.length; ++inpIdx) {
      const parent    = clickedInputs[inpIdx].parentElement;
      const inpHref   = parent.href;
      const lastSlash = inpHref.lastIndexOf("/");
      fileIds.push(parseInt(inpHref.substring(lastSlash + 1, inpHref.length)));
      parent.remove();
    }
    
    const response = await fetch("/dashboard/folders/remove-files/", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fileIds: fileIds,
        folderId: parseInt(folderId)
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

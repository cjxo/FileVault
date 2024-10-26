const fv_btnOptions           = document.querySelector(".fv-page-title-right > button");
const fv_divDropDownOptions   = document.querySelector(".fv-page-dropdown");
const fv_inpCheckboxes        = document.querySelectorAll('.fv-folder-display-grid input[type="checkbox"]');

let g_inpCheckCount = 0;

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

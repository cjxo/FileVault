
const fv_btnFileDownload = document.querySelector(".fv-download-btn");
const fv_btnFileDelete   = document.querySelector(".fv-delete-btn");

fv_btnFileDownload.addEventListener("click", async e => {
  e.preventDefault();

  try {
    const fileQueryHref      = fv_btnFileDownload.href.replace("/download/", "/");
    const fileQueryResponse  = await fetch(fileQueryHref, { headers: { 'X-Requested-With': 'FetchAPI' } });
    const fileQueryJSON      = await fileQueryResponse.json(); 

    console.log(fileQueryJSON);
    
    const response      = await fetch(fv_btnFileDownload.href, { method: "GET" });
    const blob          = await response.blob();
    /*
    const json     = await response.json();

    const blobType = detectType(json.filename);
    const blob     = new Blob([json.data], { type: blobType });

    console.log(blob);

    */
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileQueryJSON.name;
    document.body.append(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  } catch (err) {
    console.error(err);
  }
});

fv_btnFileDelete.addEventListener("click", async e => {
  e.preventDefault();

  try {
    const response = await fetch (fv_btnFileDelete.href, { method: "DELETE" });
    const data = await response.json();
    console.log(data);

    window.location.assign("/");
  } catch (err) {
    console.error(err);
  }
});

# FileVault

- [X] Passwords didnt match error on signup page
- [X] Add new user to DB with hashed PWORD
- [X] Setup sessions for login
- [ ] Features Design
    - [X] Once the user is signed in, redirect to 'Dashboard Route'
    - [X] in this case, we have to make a dashboard route to /dashboard
    - [ ] File Lister
        - [X] File Sorter based on category
        - [X] Upload section in dashboard
        - [X] Extract file type extension
        - [X] display uploaded fiels
        - [X] Recent Files display
        - [X] Instead of requesting entire files from server on upload,
              request the most recent upload instead!
        - [ ] File DB for file flags
        - [X] Deal With file links. That is, when we click a file, open a separate page for display.
            - [X] Ability to delete files.
            - [X] Open in separate page
            - [X] Figure out how to display file contents on screen.
                - [X] File Display UI
                - [X] File DLoad Functionality
                - [X] File Delete functionality
    
    - [ ] folder section in dashboard (also creation)
        - [X] Add file to folder.
        - [X] Open FOlder page.
        - [X] Delete Folder.
        - [X] Remove file on folder
            - [X] Complete Dropdown in Folder
        - [ ] Unifying API for drop-downs
    - [ ] Share feature
    - [ ] Supabase (WHAT IS THIS?)
        - https://supabase.com/docs/reference/javascript/introduction
        - https://supabase.com/docs/guides/storage/security/access-control
        - search how https://www.youtube.com/watch?v=cN2RE6EpExE
        - [X] Remove tmp_uploads.
        - [X] Upload all files to delete instad of one by one in deleteFile @ dashboard_controller.js.
        - [X] Fix cancel folder add bug: When pressing escape, it doesn't cancel.

# Issues

- [X] Clean Up Repetitions in file details @ dashboard_controller.js and create reusable function
- [ ] Responsiveness
    - [X] Zooming in the file lister is quite bad. It falls apart when text is wrapping.
    Either we switch to grid or ...?
- [ ] Dropdown / buttons aren't disappearing when adding files to folders.


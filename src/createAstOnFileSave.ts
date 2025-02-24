// When save any file type, it runs the respective ast parser and generates its ast json.

// This is for the File Enter watcher:
// For stub generation, when we open a file of particular language, then that figures out which 
// language is that language being imported from then it looks the ast json file in the folder 
// the language would have it in and then creates its stub files from it.

// This way even if we dont figure out which languages are communicating with each other, it works.
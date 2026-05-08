function getMetadata() {
  let title = document.querySelector('.model-header').innerText
  let user = document.querySelector('.name-and-handle > .name').innerText
  
  return {
    user,
    title,
    "filename_prefix": `${user} - ${title} `
  }
}

// common.js loads after
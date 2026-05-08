function getMetadata() {
  let title = document.querySelector('h1.title-for-share').innerText
  let user = document.querySelector('.user_name').innerText

  return {
    user,
    title,
    "filename_prefix": `${user} - ${title} `
  }
}

// common.js loads after
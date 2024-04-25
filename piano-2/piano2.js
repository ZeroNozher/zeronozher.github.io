const WHITE_KEYS = ['z', 'x', 'c', 'v', 'b', 'n', 'm']

const keys = document.querySelectorAll('.key')
const whiteKeys = document.querySelectorAll('.key.white')

keys.forEach(key => {
  key.addEventListener('click', () => playNote(key))
})

document.addEventListener('keydown', e => {
  if(e.repeat) return
  const key = e.key
  const whiteKeyIndex = WHITE_KEYS.indexOf(key)
  if(whiteKeyIndex > -1) playNote(whiteKeys[whiteKeyIndex])
})

function playNote(key){
  const noteAudio = document.getElementById(key.dataset.note)
  noteAudio.currentTime = 0
  noteAudio.play()
  key.classList.add('active')

  noteAudio.addEventListener('ended', () => {
    key.classList.remove('active')
  })
}
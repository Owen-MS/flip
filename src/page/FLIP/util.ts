export const preload = (imgs: string[]) => {
  return new Promise((resolve, reject) => {
    if (!imgs.length) {
      resolve()
    }
    const length = imgs.length
    let count = 0

    const load = (src: string) => {
      let img = new Image()
      const checkIfFinished = () => {
        count++
        if (count === length) {
          resolve()
        }
      }

      img.onload = checkIfFinished
      img.onerror = checkIfFinished

      img.src = src
    }
    imgs.forEach(load)
  })
}

export let getRandomInt = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1) + min)
}

export const shuffle = (arr: []) => {
  let ret = arr.slice()
  for (let i = 0; i < ret.length; i++) {
    let j = getRandomInt(0, i)
    let t = ret[i]
    ret[i] = ret[j]
    ret[j] = t
  }
  return ret
}

import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import './style.css'
import { getSisterGenerator } from './mock'
import { preload, shuffle } from './util'

const getSister = getSisterGenerator()

function FLIP() {
  const [adding, updateAdding] = useState<boolean>(false);
  const [loading, updateLoading] = useState<boolean>(false);
  const [imgs, updateImgs] = useState<string[]>([]);

  const imgRefs = useRef();
  const prevSrcRectMap = useRef(); // 记录旧图片节点位置

  function handleReset() {
    const getSister = getSisterGenerator()
    const resetImgs = getSister()
    prevSrcRectMap.current = undefined
    updateImgs(resetImgs);
  }

  function handleShuffle() {
    scheduleAnimation(() => {
      const shuffleImgs = shuffle(imgs)
      updateImgs(shuffleImgs)
    })
  }

  async function handleAdd() {
    if (adding) return
    updateAdding(true)
    const newData = getSister()
    await preload(newData)
    updateAdding(false)
    scheduleAnimation(() => {
      const locImgs = newData.concat(imgs)
      updateImgs(locImgs)
    })
  }


  useLayoutEffect(() => {
    const prevSrcRectMaps = prevSrcRectMap.current
    if (!prevSrcRectMaps) return
    const currentImgs = imgRefs.current
    const currentSrcRectMap = createSrcRectMap([...currentImgs?.childNodes])
    Object.keys(prevSrcRectMaps).forEach((src) => {
      const currentRect = currentSrcRectMap[src]
      const prevRect = prevSrcRectMaps[src]

      const invert = {
        left: prevRect.left - currentRect.left,
        top: prevRect.top - currentRect.top,
      }

      const keyframes = [
        {
          transform: `translate(${invert.left}px, ${invert.top}px)`, // 将元素平移到原有的位置
        },
        {transform: "translate(0, 0)"},
      ]
      const options = {
        duration: 300,
        easing: "cubic-bezier(0,0,0.32,1)",
      }
      currentRect.imgElement.animate(keyframes, options)
    })
  })
  const scheduleAnimation = (update: () => {}) => {
    // 获取旧图片的位置
    const prevImgs = imgRefs.current
    prevSrcRectMap.current = createSrcRectMap([...prevImgs?.childNodes])
    // 更新数据
    update()
  }
  const createSrcRectMap = (locImgs: string []) => {
    return locImgs.reduce((prev, img) => {
      const imgElement = img.childNodes[0]
      const rect = imgElement.getBoundingClientRect() // 返回元素的大小及其相对于视口的位置。
      const {left, top} = rect
      prev[imgElement.src] = {left, top, imgElement}
      return prev
    }, {})
  }
  useEffect(() => { // 初始化获取图片
    (async () => {
      updateLoading(true)
      const locImgs: string [] = getSister()
      await preload(locImgs)
      updateImgs(locImgs)
      updateLoading(false)
    })()
  }, [])
  return (
    <>
      <div className="action">
        <button onClick={handleAdd}>
          {
            adding ? <span>下载中……</span> : <span>追加图片</span>

          }
        </button>
        <button onClick={handleShuffle}>乱序图片
        </button>
        <button onClick={handleReset}>重置</button>
      </div>
      {
        loading ? <div className="loading">正在加载图片……</div>
          :
          <div className="wrap" ref={imgRefs}>
            {
              imgs.map(src => {
                return (
                  <div className="img-wrap" key={src}>
                    <img className="img" src={src} alt={'我出错咯'}/>
                  </div>
                )
              })
            }
          </div>
      }
    </>
  )
}

export default FLIP;

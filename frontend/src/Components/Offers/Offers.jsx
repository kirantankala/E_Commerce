import React from 'react'
import './Offers.css'
import exclucive_image from '../Assets/exclusive_image.png'
 const Offers = () => {
  return (
    <div className='offers'>
        <div className="offers-left">
         <h1>Exclusive</h1>
         <h1>Just For YOU</h1>
         <p>ONLY ON BEST SELLER PRODUCTS</p>
         <button>CHECK NOW</button>
        </div>
        <div className="offers-right">
          <img src={exclucive_image} alt="" />
        </div>

    </div>
  )
}
export default Offers
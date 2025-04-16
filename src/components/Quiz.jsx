import React, { useState } from 'react'
import Register from './Register'
import Questions from './Questions'
const Quiz = () => {
  const [registered, setRegistered] = useState(localStorage.getItem("register") === "true" )
  
  return (
    <div>
      {registered ? <Questions/> : <Register setRegistered={setRegistered}/> }
    </div>
  )
}

export default Quiz
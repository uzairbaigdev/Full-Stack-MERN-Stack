import { useState } from "react"
import React from 'react'

const Register = () => {

  const [username, setUsername] = useState(null);
  const [email, setEmail] = useState(null);
  const [password, setPassword] = useState(null);



  return (
    <form>
      <input type="text" name="username" placeholder="enter your username"
      onChange={(e)=> setUsername(e.target.value)}
      />
      <br />
      <input type="text" name="email" placeholder="enter your email"
      onChange={(e)=> setEmail(e.target.value)}
      />
      <br />
      <input type="text" name="password" placeholder="enter your password"
      onChange={(e)=> setPassword(e.target.value)}
      />
      <br />
      <button type="submit" onClick={(e)=> {
        e.preventDefault();
        console.log(username,password,email)
      }}>Register</button>
    </form>
  )
}

export default Register
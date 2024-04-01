import React, { useState } from 'react'
import axios from 'axios'
import { UserContext } from './UserContext'
import { useContext } from 'react'


function AuthForm() {
  const [username, setusername] = useState('')
  const [password, setpassword] = useState('')
  const { setUsername: setloggedinname, setId } = useContext(UserContext)
  const [isLoginOrRegister, setIsLoginOrRegister] = useState('register')


  async function handleSubmit(ev) {
    ev.preventDefault();
    const slug = '/api/auth/';
    const url = isLoginOrRegister === 'login' ? 'signin' : 'signup';

    const api = slug + url;
    const { data } = await axios.post(api, { username, password });
    console.log(data)
    setloggedinname(username)
    setId(data._id)
    console.log(data._id)
  }
  return (
    <div className="bg-blue-50 h-screen flex items-center">
      <form className="w-64 mx-auto mb-12" onSubmit={handleSubmit}>
        <input value={username}
          onChange={ev => setusername(ev.target.value)}
          type="text" placeholder="username"
          className="block w-full rounded-sm p-2 mb-2 border" />
        <input value={password}
          onChange={ev => setpassword(ev.target.value)}
          type="password"
          placeholder="password"
          className="block w-full rounded-sm p-2 mb-2 border" />
        <button className="bg-blue-500 text-white block w-full rounded-sm p-2">
          {isLoginOrRegister === 'register' ? 'Register' : 'Login'}
        </button>
        <div className="text-center mt-2">
          {isLoginOrRegister === 'register' && (
            <div>
              Already a member?
              <button className="ml-1" onClick={() => setIsLoginOrRegister('login')}>
                Login here
              </button>
            </div>
          )}
          {isLoginOrRegister === 'login' && (
            <div>
              Dont have an account?
              <button className="ml-1" onClick={() => setIsLoginOrRegister('register')}>
                Register
              </button>
            </div>
          )}
        </div>

      </form>
    </div>
  )
}

export default AuthForm
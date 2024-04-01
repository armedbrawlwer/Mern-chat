import axios from 'axios'
import { UserContextProvider, UserContext } from './UserContext.jsx'
import { useContext } from 'react'
import AuthForm from './AuthForm'
import Chat from './Chat.jsx'

export default function Routes() {
    const { username, id } = useContext(UserContext)
    console.log(username)

    if (username === null) {
        return (<AuthForm />)
    } else {
        return (
            <Chat/>
        )
    }
}

import React, { useContext, useEffect, useRef, useState } from 'react'
import Avatar from './Avatar'
import Logo from './Logo'
import { UserContext } from './UserContext'
import { uniqBy } from 'lodash'
import axios from 'axios'
import Contact from './Contact'

export function Chat() {

    const [ws, setws] = useState(null)
    const [onlinePeople, setOnlinePeople] = useState({})
    const [offlinePeople, setOfflinePeople] = useState({})
    const [selectedUserId, setSelectedUserId] = useState(null)
    const [newMessageText, setNewMessageText] = useState('')
    const [messages, setMessages] = useState([])

    const { username, id, setUsername, setId } = useContext(UserContext)
    const divUnderMessages = useRef()

    //auto reconnection
    useEffect(() => {
        connectToWs()
    }, [])

    function connectToWs() {
        const ws = new WebSocket('ws://localhost:4000')
        setws(ws)
        ws.addEventListener('message', handleMessage)
        ws.addEventListener('close', () => {
            setTimeout(() => {
                console.log('Disconnected!!Trying to connect again')
                connectToWs()
            }, 1000)
        })
    }

    //fetch messages
    useEffect(() => {
        if (selectedUserId) {
            const url = '/api/message/fetchMessages/' + selectedUserId.toString();
            const { data } = axios.get(url).then((res) => {
                setMessages(res.data)
            })
            // console.log(data)
        }
    }, [selectedUserId])


    //fetch offline people
    useEffect(() => {
        axios.get('/api/users/fetchUsers').then(res => {
            const newOfflinePeople = res.data
                .filter(p => p._id !== id)
                .filter(p => !Object.keys(onlinePeople).includes(p._id))
                .reduce((people, { _id, username }) => {
                    people[_id] = username;
                    return people;
                }, {});

            setOfflinePeople(newOfflinePeople);
        });
    }, [onlinePeople]);


    function showPeopleOnline(peopleArray) {
        const people = {}
        peopleArray.forEach(({ userId, username }) => {
            people[userId] = username;
        })

        console.log(people)
        setOnlinePeople(people)
    }

    function handleMessage(e) {
        // console.log('New Message: ', e);
        const messageData = JSON.parse(e.data)
        console.log({ e, messageData })
        // console.log(messageData)
        if ('online' in messageData) {
            showPeopleOnline(messageData.online)
        } else if ('text' in messageData) {
            if (messageData.sender === selectedUserId)
                setMessages(prev => ([...prev, { ...messageData }]))
        }
    }

    // function selectContact(userId) {
    //     setSelectedUserId(userId)
    // }

    function sendMessage(e, file = null) {
        if (e) e.preventDefault()

        if (newMessageText || file) {
            ws.send(JSON.stringify({
                message: {
                    recipient: selectedUserId,
                    text: newMessageText,
                    file,
                }
            }))

            if (file) {
                const url = '/api/message/fetchMessages/' + selectedUserId.toString();
                const { data } = axios.get(url).then((res) => {
                    setMessages(res.data)
                })
            } else {
                setNewMessageText('')
                setMessages(prev => ([...prev, {
                    text: newMessageText,
                    sender: id,
                    recipient: selectedUserId,
                    _id: Date.now()
                }]));
            }
            setTimeout(() => {
                const div = divUnderMessages.current
                div.scrollIntoView({ behavior: 'smooth', block: 'end' })
            }, 100)
        }
    }

    function sendFile(e) {
        const reader = new FileReader()
        reader.readAsDataURL(e.target.files[0])

        reader.onload = () => {
            sendMessage(null, {
                info: e.target.files[0].name,
                data: reader.result,
            })
        }
    }


    function logout() {
        axios.post('/api/auth/signout').then(() => {
            console.log('user logged out')
            setws(null)
            setId(null)
            setUsername(null)
        })
    }


    const messageWithoutDupes = uniqBy(messages, '_id')
    console.log(messageWithoutDupes)


    return (

        <div className='flex h-screen flex-wrap'>
            <div className='bg-white-100 w-1/3 pl-4 flex flex-col h-full'> {/* Set height to full */}
                <div className='text-blue-500 font-bold flex gap-2 mb-4 mt-3'>
                    <Logo />
                    Mern-chat
                </div>

                {/* Online and offline contacts */}
                {Object.keys(onlinePeople).map(userId => (
                    onlinePeople[userId] !== username &&
                    (<Contact
                        userId={userId}
                        username={onlinePeople[userId]}
                        onClick={() => setSelectedUserId(userId)}
                        selectedUserId={selectedUserId}
                        online={true}
                    />)
                ))}
                {Object.keys(offlinePeople).map(_id => (
                    offlinePeople[_id] !== username &&
                    (<Contact
                        userId={_id}
                        username={offlinePeople[_id]}
                        onClick={() => setSelectedUserId(_id)}
                        selectedUserId={selectedUserId}
                        online={false}
                    />)
                ))}

                <div className='flex-grow'></div> {/* This will push links div to the bottom */}
                <div className='flex-grow'></div> {/* This will push links div to the bottom */}
                <div className='flex-grow'></div> {/* This will push links div to the bottom */}

                {/* Links div at the bottom */}
                <div className="p-2 text-center flex items-center justify-center">
                    <span className="mr-2 text-sm text-gray-600 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                            <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
                        </svg>
                        {username}
                    </span>
                    <button
                        onClick={logout}
                        className="text-sm bg-blue-100 py-1 px-2 text-gray-500 border rounded-sm">logout</button>
                </div>
            </div>




            <div className='flex flex-col bg-blue-300 w-2/3 p-2'>
                <div className='flex-grow '>
                    {
                        !selectedUserId &&
                        (<div className='flex mt-40 flex-grow items-center justify-center'>
                            <div className='text-gray-600'>start messaging </div>
                        </div>)
                    }
                </div>


                {
                    !!selectedUserId &&
                    (<div className="relative h-full">
                        <div className="overflow-y-scroll absolute top-0 left-0 right-0 bottom-2">
                            {messageWithoutDupes.map(message => (
                                <div key={message._id} className={(message.sender === id ? 'text-right' : 'text-left')}>
                                    <div className={"text-left inline-block p-2 my-2 rounded-md text-sm " + (message.sender === id ? 'bg-blue-500 text-white' : 'bg-white text-gray-500')}>
                                        {message.text}
                                        {message.file && (
                                            <div className="">
                                                <a target="_blank" className="flex items-center gap-1 border-b" href={axios.defaults.baseURL + '/api//message/uploads/' + message.file}>
                                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                                                        <path fillRule="evenodd" d="M18.97 3.659a2.25 2.25 0 00-3.182 0l-10.94 10.94a3.75 3.75 0 105.304 5.303l7.693-7.693a.75.75 0 011.06 1.06l-7.693 7.693a5.25 5.25 0 11-7.424-7.424l10.939-10.94a3.75 3.75 0 115.303 5.304L9.097 18.835l-.008.008-.007.007-.002.002-.003.002A2.25 2.25 0 015.91 15.66l7.81-7.81a.75.75 0 011.061 1.06l-7.81 7.81a.75.75 0 001.054 1.068L18.97 6.84a2.25 2.25 0 000-3.182z" clipRule="evenodd" />
                                                    </svg>
                                                    {message.file}
                                                </a>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                            <div ref={divUnderMessages}></div>
                        </div>
                    </div>
                    )
                }

                {!!selectedUserId && (
                    <form className='flex gap-2 ' onSubmit={sendMessage}>
                        <input type='text'
                            value={newMessageText}
                            onChange={(e) => setNewMessageText(e.target.value)}
                            placeholder='enter your message'
                            className='bg-white-border p-2 ' />
                        <label className="bg-blue-200 p-2 text-gray-600 cursor-pointer rounded-sm border border-blue-200">
                            <input type="file" className="hidden" onChange={sendFile} />
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                                <path fillRule="evenodd" d="M18.97 3.659a2.25 2.25 0 00-3.182 0l-10.94 10.94a3.75 3.75 0 105.304 5.303l7.693-7.693a.75.75 0 011.06 1.06l-7.693 7.693a5.25 5.25 0 11-7.424-7.424l10.939-10.94a3.75 3.75 0 115.303 5.304L9.097 18.835l-.008.008-.007.007-.002.002-.003.002A2.25 2.25 0 015.91 15.66l7.81-7.81a.75.75 0 011.061 1.06l-7.81 7.81a.75.75 0 001.054 1.068L18.97 6.84a2.25 2.25 0 000-3.182z" clipRule="evenodd" />
                            </svg>
                        </label>
                        <button type="submit" className="bg-blue-500 p-2 text-white rounded-sm">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                            </svg>
                        </button>
                    </form>
                )}


            </div>

        </div>
    )
}

export default Chat
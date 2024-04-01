import React from 'react'
import Avatar from './Avatar'

function Contact({ userId, username, selectedUserId, onClick ,online}) {
    return (
        <div key={userId} className={'border-b  py-2 flex gap-2 mb-1 cursor-pointer' + (userId === selectedUserId ? 'bg-teal-400' : '')} onClick={() => onClick(userId)}>
            {
                userId === selectedUserId && <div className='bg-blue-500 w-1 rounded-sm'></div>
            }
            <Avatar userId={userId} username={username} online={online} />
            {
                <span>{username}</span>

            }
        </div>
    )
}

export default Contact
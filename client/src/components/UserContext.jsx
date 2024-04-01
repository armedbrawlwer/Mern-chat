import { createContext, useEffect, useState } from "react";
import axios from "axios";

export const UserContext = createContext({});

export function UserContextProvider({ children }) {
    const [username, setUsername] = useState(null); // Initialize with undefined
    const [id, setId] = useState(null); // Initialize with undefined
    useEffect(() => {
        axios.get('/api/auth/profile').then(response => {
            console.log(response.data);
            setId(response.data.id);
            setUsername(response.data.username);
            // console.log(username)
        }).catch(error => {
            // Handle error if necessary
            console.error("Error fetching user profile:", error);
        });  
    }, []);
    useEffect(() => {
        console.log(username); // Log username whenever it changes
    }, [username]);
    return (
        <UserContext.Provider value={{ username, setUsername, id, setId }}>
            {children}
        </UserContext.Provider>
    );
}

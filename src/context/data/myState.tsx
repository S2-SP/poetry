import { useState, ReactNode } from 'react';
import myContext from './myContext';

function MyState({ children }: { children: ReactNode }) {
    const [mode, setMode] = useState('light');
    const toggleMode = () => {
        if (mode === 'light') {
            setMode('dark');
            document.body.style.backgroundColor = 'rgb(17,34, 39)';
        } else {
            setMode('light');
            document.body.style.backgroundColor = 'white';
        }
    }

    return (
        <myContext.Provider value={{ mode, toggleMode }}>
            {children}
        </myContext.Provider>
    )
}

export default MyState;

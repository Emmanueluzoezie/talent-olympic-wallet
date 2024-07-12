import React from 'react'
import { ButtonsProps } from '../types/Components'


const Button: React.FC<ButtonsProps> = ({activeComponent, title, setActiveComponent, Icon }) => {

    return (
        <button className={`text-[30px] p-3 ${activeComponent === title.toLocaleLowerCase()&& "text-red-400 border-t-4 "}`} onClick={() => setActiveComponent(title.toLowerCase() as "wallet" | "swap" | "setting")}>
            <Icon />
        </button>
    )
}

export default Button
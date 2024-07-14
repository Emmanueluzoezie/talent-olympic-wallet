import React from 'react'
import { ButtonsProps } from '../types/Components'


const Button: React.FC<ButtonsProps> = ({activeComponent, title, setActiveComponent, Icon }) => {

    return (
        <button className={`text-[30px] p-3 primary-text-color ${activeComponent === title.toLocaleLowerCase()&& "text-[#59E460] border-t-[3px] border-[#A9A9A9]"}`} onClick={() => setActiveComponent(title.toLowerCase() as "wallet" | "swap" | "setting")}>
            <Icon />
        </button>
    )
}

export default Button
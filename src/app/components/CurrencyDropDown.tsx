import Image from "next/image";
import { CurrencyDropdownProps } from "../types/Components";

const CurrencyDropdown: React.FC<CurrencyDropdownProps> = ({ onSelect }) => {
    return (
        <div className="absolute left-0  w-[136px] mt-1 bg-white border-2 border-gray-300 rounded shadow-lg z-10">
            {['SOL', 'BTC', 'ETH'].map((currency, index) => (
                <div
                    key={index}
                    className="border-2 flex items-center p-1  cursor-pointer hover:bg-gray-100"
                    onClick={() => onSelect(currency)}
                >
                    <Image src="https://pbs.twimg.com/profile_images/1472933274209107976/6u-LQfjG_400x400.jpg" alt={`Image of ${currency}`} className="w-10 h-10 mr-2 border-2" width={20} height={20} />
                    <h2 className="font-semibold pl-2">{currency}</h2>
                </div>
            ))}
        </div>
    );
};

export default CurrencyDropdown;
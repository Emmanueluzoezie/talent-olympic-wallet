import Image from "next/image";
import { CurrencyDropdownProps } from "../types/Components";

const CurrencyDropdown: React.FC<CurrencyDropdownProps> = ({ onSelect, tokens }) => {
    return (
        <div className="absolute left-0  w-[136px] mt-1 bg-white border-2 border-gray-300 rounded shadow-lg z-10">
            {tokens.map((token, index) => (
                <div
                    key={index}
                    className="border-2 flex items-center p-1  cursor-pointer hover:bg-gray-100"
                    onClick={() => onSelect(
                        {
                            symbol: token.symbol,
                            image: token.image
                        })}
                >
                    <Image src={`${token.image}`} 
                           alt={`Image of ${token.symbol}`} 
                           className="w-10 h-10 mr-2" 
                           width={20} 
                           height={20} />
                    <h2 className="font-semibold pl-2">{token.symbol}</h2>
                </div>
            ))}
        </div>
    );
};

export default CurrencyDropdown;
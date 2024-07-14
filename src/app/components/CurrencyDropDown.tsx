import Image from "next/image";
import { CurrencyDropdownProps } from "../types/Components";

const CurrencyDropdown: React.FC<CurrencyDropdownProps> = ({ onSelect, tokens }) => {
    return (
        <div className="absolute left-0 w-[135px] border-[#13161E] pb-1 mt-1 layer-color border-[1px] rounded shadow-lg z-10">
            {tokens.map((token, index) => (
                <div
                    key={index}
                    className={`flex items-center p-2 border-[#13161E] cursor-pointer hover:bg-[#13161E] ${index === 3 ? "border-b-0" : "border-b-[1px]"}`}
                    onClick={() => onSelect( {
                            symbol: token.symbol,
                            image: token.image
                        })}
                >
                    <Image src={`${token.image}`} 
                           alt={`Image of ${token.symbol}`} 
                           className="w-8 h-8 mr-2 rounded-full" 
                           width={20} 
                           height={20} />
                    <h2 className="font-semibold pl-2 flex-1 primary-text-color text-[14px]">{token.symbol}</h2>
                </div>
            ))}
        </div>
    );
};

export default CurrencyDropdown;
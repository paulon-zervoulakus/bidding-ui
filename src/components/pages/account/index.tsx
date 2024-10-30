import { useState } from "react";
import ProfileForm from "./profile";

const AccountIndex: React.FC = () => {
    const [activeTab, setActiveTab] = useState("mybio");

    return (
        <main className="flex justify-center">
			<div className="w-full mt-5">
				<h1 className="text-3xl">Account Settings</h1>
				<div className="mt-5">
                    <div className="flex flex-col sm:flex-row">
                        {/* Left side (Accordion) */}
                        <div className="w-full sm:w-60 sm:max-w-60 sm:min-w-60 bg-gray-100 p-4">
                            <div className="space-y-2">
                                {/* Accordion Item 1 */}
                                <div className={`
                                        ${activeTab === 'mybio' ?
                                            'border-s-4 border-blue-400 bg-blue-200' :
                                            'hover:bg-blue-200 hover:border-s-4 hover:border-blue-400'
                                        }
                                    `}
                                    onClick={() => {setActiveTab('mybio')}}>
                                    <button className="w-full text-left p-4 font-bold ">My Bio</button>
                                </div>
                                {/* Accordion Item 2 */}
                                <div className={`
                                        ${activeTab === 'products' ?
                                            'border-s-4 border-blue-400 bg-blue-200' :
                                            'hover:bg-blue-200 hover:border-s-4 hover:border-blue-400'
                                        }
                                    `}
                                    onClick={() => {setActiveTab('products')}}>
                                    <button className="w-full text-left p-4 font-bold ">Products</button>
                                </div>
                                {/* Accordion Item 3 */}
                                <div className={`
                                        ${activeTab === 'auction' ?
                                            'border-s-4 border-blue-400 bg-blue-200' :
                                            'hover:bg-blue-200 hover:border-s-4 hover:border-blue-400'
                                        }
                                    `}
                                    onClick={() => {setActiveTab('auction')}}>
                                    <button className="w-full text-left p-4 font-bold ">Auction</button>
                                </div>
                            </div>
                        </div>

                        {/* Right side (Details) */}
                        <div className="w-full sm:w-3/4 bg-white p-6">
                            <div id="profile" className={`${activeTab === 'mybio' ? 'active':'hidden'}`}>
                                <ProfileForm/>
                            </div>
                            <div id="products" className={`${activeTab === 'products' ? 'active':'hidden'}`}>
                                <h2 className="text-2xl font-bold mb-4">Products Settings</h2>
                                <p>This section will display details related to the selected accordion item.</p>
                            </div>
                            <div id="auction" className={`${activeTab === 'auction' ? 'active':'hidden'}`}>
                                <h2 className="text-2xl font-bold mb-4">Auction Settings</h2>
                                <p>This section will display details related to the selected accordion item.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    )
}
export default AccountIndex;
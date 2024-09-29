import React from "react";
import { Outlet } from "react-router-dom";
const Content: React.FC = () => {
    return (
        <div className="flex flex-col min-h-screen">
            <div className="flex-grow p-4">
                <Outlet/>
            </div>
        </div>
    );
}
export default Content;
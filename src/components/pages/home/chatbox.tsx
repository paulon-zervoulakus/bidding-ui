import { useEffect, useState } from "react";
import  {
	StartConnection as SignalRStartConnection,
	StopConnection as SignalRStopConnection,
	BroadcastSendMessage
} from "../../../hooks/signalRService";
import {ConnectedUsersDTO, IncomingMessagesDTO } from "../../../dto/signalr";

const Chatbox: React.FC = () => {

	const [users, setUsers] = useState<ConnectedUsersDTO[]>([]);
	const [incomingMessages, setIncomingMessages] = useState<
		IncomingMessagesDTO[]
	>([]); // State for the list of messages
	const [message, setMessage] = useState("");
	const [inputCtrl, setInputCtrl] = useState(true);

    useEffect(() => {
        const container = document.getElementById('incomingMessages');
        if (container) {
            // Scroll to the bottom of the container when new messages arrive
            container.scrollTop = container.scrollHeight;
        }
    },[incomingMessages]);

    useEffect(() => {

		SignalRStartConnection(setUsers, setInputCtrl, setIncomingMessages);

		window.addEventListener("beforeunload",	() => SignalRStopConnection(setUsers, setInputCtrl));

		return () => {
			SignalRStopConnection(setUsers, setInputCtrl);
		};
	}, []);

	const sendMessage = async () => {
		await BroadcastSendMessage(message, setMessage);
	}

    return (
        <div className="flex flex-col sm:flex-row">
            <div className="w-full sm:w-1/2 bg-gray-200 p-4">
                <h2 className="text-2xl">Users in Lobby</h2>
                <ul className="divide-y divide-gray-200">
                    {users.map((user, index) => (
                        <li key={index} className="flex items-center space-x-2 py-2">
                            { (user.avatarSrc != "") ?
                            <img
                                src={user.avatarSrc}
                                alt="User Avatar"
                                className="w-12 h-12 rounded-full" />
                            :
                            <img
                                src="https://via.placeholder.com/150"
                                alt="User Avatar"
                                className="w-12 h-12 rounded-full" />
                            }

                            <div>
                                <h5 className="text-lg font-semibold">{user.fullname}</h5>
                                <p className="text-gray-500">{user.email}</p>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>


            <div className="w-full sm:w-1/2 bg-gray-200 p-4 space-y-2">
                <div
                id="incomingMessages"
                className="w-full bg-gray-100 p-4 h-[200px] overflow-y-auto rounded-md space-y-1">
                    {incomingMessages.map((msg, index) => (
                        <div key={index} className="bg-blue-100 text-blue-900 px-2 py-1 rounded-md block max-w-xs break-words">
                            {msg.user}: {msg.message}
                        </div>
                    ))}
                </div>
                <div className="flex space-x-2">
                    <input
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Message"
                        disabled={inputCtrl}
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
						onKeyDown={(e) => {
							if (e.key === 'Enter') {
								sendMessage(); // Call the sendMessage function when Enter is pressed
							}
						}}
                    />
                    <button onClick={sendMessage} disabled={inputCtrl} className="bg-blue-500 text-white font-semibold px-4 py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50">
                        Send
                    </button>
                </div>
            </div>
        </div>
    )
}
export default Chatbox;
import * as signalR from "@microsoft/signalr";
import GetCookie from "../helper/account";

const connection = new signalR.HubConnectionBuilder()
	.withUrl("http://localhost:5260/subastaHub", {
		accessTokenFactory: () => GetCookie("signalr_token") || "",
		withCredentials: true,
		transport:
			signalR.HttpTransportType.WebSockets ||
			signalR.HttpTransportType.LongPolling,
	})
	.configureLogging(signalR.LogLevel.Information)
	.build();

// export function invokeSendMessage(
// 	hubConnection: signalR.HubConnection,
// 	methodName: string,
// 	...args: any[]
// ): Promise<void> {
// 	return new Promise((resolve, reject) => {
// 		const token = GetCookie("signalr_token");
// 		if (token) {
// 			const argsWithToken = [...args, token];
// 			hubConnection
// 				.invoke(methodName, ...argsWithToken)
// 				.then(resolve)
// 				.catch(reject);
// 		} else {
// 			console.warn("SignalR token not available. Aborting message.");
// 			reject(new Error("SignalR token not available"));
// 		}
// 	});
// }
export default connection;

import * as signalR from "@microsoft/signalr";
import GetCookie from "../helper/account";

const connection = new signalR.HubConnectionBuilder()
	.withUrl("http://localhost:5260/subastaHub", {
		accessTokenFactory: () => GetCookie("signalr_token") || "",
		withCredentials: true,
		transport:
			signalR.HttpTransportType.WebSockets |
			signalR.HttpTransportType.LongPolling,
	})
	.configureLogging(signalR.LogLevel.Information)
	.build();

function startConnection() {
	if (connection.state === signalR.HubConnectionState.Disconnected) {
		connection
			.start()
			.then(() => console.log("SignalR Connected."))
			.catch((err) => {
				console.error("SignalR Connection Error: ", err);
				setTimeout(() => startConnection(), 5000); // Retry connection after a delay
			});
	}
}

function stopConnection() {
	if (connection.state === signalR.HubConnectionState.Connected) {
		connection
			.stop()
			.then(() => {
				console.log("SignalR connection stopped.");
			})
			.catch((err) => {
				console.error("Error stopping connection: ", err);
			});
	}
}

startConnection(); // Start the connection

window.addEventListener("beforeunload", () => {
	stopConnection(); // Ensure connection is stopped before page unload
});

export function invokeWithCookieCheck(
	hubConnection: signalR.HubConnection,
	methodName: string,
	...args: any[]
): Promise<void> {
	return new Promise((resolve, reject) => {
		const token = GetCookie("signalr_token");
		if (token) {
			const argsWithToken = [...args, token];
			hubConnection
				.invoke(methodName, ...argsWithToken)
				.then(resolve)
				.catch(reject);
		} else {
			console.warn("SignalR token not available. Aborting message.");
			reject(new Error("SignalR token not available"));
		}
	});
}
export default connection;

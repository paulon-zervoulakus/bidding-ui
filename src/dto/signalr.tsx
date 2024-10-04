// Define the ConnectedUsersDTO interface
export interface ConnectedUsersDTO {
    email: string;      // The user's email address
    fullname: string;   // The user's full name
    avatarSrc: string;  // The URL of the user's avatar image
}
export interface IncomingMessagesDTO {
	user: string;
	message: string;
}

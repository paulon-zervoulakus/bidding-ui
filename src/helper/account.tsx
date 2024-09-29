const GetCookie = (name: string) => {
	const value = `; ${document.cookie}`;
	// console.log("Document cookie", value);
	const parts = value.split(`; ${name}=`);
	if (parts.length === 2) {
		const cookieValue = parts.pop();
		return cookieValue ? cookieValue.split(";").shift() : undefined;
	}
	return undefined;
};

export default GetCookie;

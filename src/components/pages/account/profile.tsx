import { useEffect, useState } from "react";
import { GetProfileDetails } from "../../../hooks/account";
import { BasicProfileDTO } from "../../../dto/account";

const ProfileForm: React.FC = () => {
    const [account, setAccount] = useState<BasicProfileDTO>({
        id: 0,
        userName: '',
        email: '',
        fullName: '',
        dateOfBirth: '',
        role: 4, // Default role, e.g., Guest
        gender: 3, // Default gender value
    } as BasicProfileDTO);

    const handleChange = (e: { target: { name: string; value: string; }; }) => {
        const { name, value } = e.target;
        setAccount((prevAccount)=>({
            ...prevAccount,
            [name]: value
        }));
    };

    const handleSubmit = (e: { preventDefault: () => void; }) => {
        e.preventDefault();
        // Handle form submission logic, such as sending data to the server
        console.log('Form submitted:', account);
    };

    useEffect(() => {
        console.log("profile component...");
        GetProfileDetails((data) => {
            setAccount({
                ...data,
                role: Number(data.role),
                gender: Number(data.gender),
                dateOfBirth: data.dateOfBirth ? data.dateOfBirth.split('T')[0] : "", // Format the date to YYYY-MM-DD
            });
        });

    },[]);

    return (
        <div className="mx-auto w-full sm:w-3/4 md:w-1/2">
            <h2 className="text-2xl font-bold mb-4">Profile Settings</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                {/* UserName */}
                <div>
                    <label className="block font-bold">Username</label>
                    <input
                    type="text"
                    name="userName"
                    value={account.userName}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300"
                    required
                    />
                </div>

                {/* Email */}
                <div>
                    <label className="block font-bold">Email</label>
                    <input
                    type="email"
                    name="email"
                    value={account.email}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300"
                    required
                    />
                </div>

                {/* Password */}
                {/* <div>
                    <label className="block font-bold">Password</label>
                    <input
                    type="password"
                    name="password"
                    value={account.password}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300"
                    required
                    />
                </div> */}

                {/* Full Name */}
                <div>
                    <label className="block font-bold">Full Name</label>
                    <input
                    type="text"
                    name="fullName"
                    value={account.fullName}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300"
                    />
                </div>

                {/* Date of Birth */}
                <div>
                    <label className="block font-bold">Date of Birth</label>
                    <input
                    type="date"
                    name="dateOfBirth"
                    value={account.dateOfBirth}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300"
                    />
                </div>

                {/* Role */}
                <div>
                    <label className="block font-bold">Role</label>
                    <select
                    name="role"
                    value={account.role}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300"
                    >
                    <option value={1}>Guest</option>
                    <option value={2}>Member</option>
                    <option value={3}>Administrator</option>
                    <option value={4}>Seller</option>
                    </select>
                </div>

                {/* Gender */}
                <div>
                    <label className="block font-bold">Gender</label>
                    <select
                    name="gender"
                    value={account.gender}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300"
                    >
                    <option value={1}>Hidden</option>
                    <option value={2}>Male</option>
                    <option value={3}>Female</option>
                    </select>
                </div>



                <button
                    type="submit"
                    className="px-4 py-2 bg-blue-500 text-white font-bold hover:bg-blue-600"
                >
                    Submit
                </button>
            </form>
        </div>
    )
}
export default ProfileForm;
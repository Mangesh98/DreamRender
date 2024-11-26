import { useEffect, useState } from "react";
import { assets } from "../assets/assets";
import { useAppContext } from "../context/useAppContext";
import { motion } from "motion/react";
import axios from "axios";
import { toast } from "react-toastify";

const Login = () => {
	const [state, setState] = useState<string>("Login");
	const { setShowLogin, backendUrl, setToken, setUser } = useAppContext();
	const [name, setName] = useState<string>("");
	const [email, setEmail] = useState<string>("");
	const [password, setPassword] = useState<string>("");

	useEffect(() => {
		document.body.style.overflow = "hidden";
		return () => {
			document.body.style.overflow = "unset";
		};
	}, []);

	const onSubmitHandler = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		try {
			if (state === "Login") {
				// login
				const { data } = await axios.post(backendUrl + "/api/user/login", {
					email,
					password,
				});
				if (data.success) {
					setToken(data.token);
					setUser(data.user);
					localStorage.setItem("token", data.token);
					// localStorage.setItem("user", JSON.stringify(data.user));
				} else {
					toast.error(data.message);
				}
			} else {
				// signup
				const { data } = await axios.post(backendUrl + "/api/user/register", {
					name,
					email,
					password,
				});
				if (data.success) {
					setToken(data.token);
					setUser(data.user);
					localStorage.setItem("token", data.token);
					// localStorage.setItem("user", JSON.stringify(data.user));
				} else {
					toast.error(data.message);
				}
			}
			setShowLogin(false);
		} catch (error) {
			console.log(error);
			toast.error("Something went wrong");
		}
	};

	return (
		<div className="fixed top-0 left-0 right-0 bottom-0 z-10 backdrop-blur-sm bg-black/30 flex justify-center items-center">
			<motion.form
				onSubmit={onSubmitHandler}
				initial={{ opacity: 0.2, y: 50 }}
				transition={{ duration: 0.3 }}
				whileInView={{ opacity: 1, y: 0 }}
				viewport={{ once: true }}
				className="relative bg-white p-10 rounded-xl text-slate-500"
			>
				<h1 className="text-center text-2xl text-neutral-700 font-medium">
					{state}
				</h1>
				<p className="text-sm">Welcome back! Please sign in to continue</p>
				{state !== "Login" && (
					<div className="border px-6 py-2 flex items-center gap-2 rounded-full mt-5">
						<img src={assets.profile_icon} alt="" width={25} />
						<input
							className="outline-none text-sm"
							type="text"
							placeholder="Full Name"
							required
							onChange={(e) => setName(e.target.value)}
							value={name}
						/>
					</div>
				)}
				<div className="border px-6 py-2 flex items-center gap-2 rounded-full mt-4">
					<img src={assets.email_icon} alt="" />
					<input
						className="outline-none text-sm"
						type="email"
						placeholder="Email id"
						required
						onChange={(e) => setEmail(e.target.value)}
						value={email}
					/>
				</div>
				<div className="border px-6 py-2 flex items-center gap-2 rounded-full mt-4">
					<img src={assets.lock_icon} alt="" />
					<input
						className="outline-none text-sm"
						type="password"
						placeholder="Password"
						required
						onChange={(e) => setPassword(e.target.value)}
						value={password}
					/>
				</div>
				<p className="text-sm text-blue-600 my-4 cursor-pointer">
					Forgot password?
				</p>
				<button className="bg-blue-600 w-full text-white py-2 rounded-full">
					{state === "Login" ? "Login" : "create account"}
				</button>
				{state === "Login" ? (
					<p className="mt-5 text-center ">
						Don't have an account?{" "}
						<span
							className="text-blue-600 cursor-pointer"
							onClick={() => setState("Sign Up")}
						>
							Sign up
						</span>
					</p>
				) : (
					<p className="mt-5 text-center ">
						Already have an account?{" "}
						<span
							className="text-blue-600 cursor-pointer"
							onClick={() => setState("Login")}
						>
							Login
						</span>
					</p>
				)}
				<img
					className="absolute top-5 right-5 cursor-pointer"
					src={assets.cross_icon}
					alt=""
					onClick={() => setShowLogin(false)}
				/>
			</motion.form>
		</div>
	);
};

export default Login;

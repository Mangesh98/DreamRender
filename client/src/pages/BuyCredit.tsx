import { useContext } from "react";
import { assets, plans } from "../assets/assets";
import { AppContext } from "../context/AppContext";
import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import { useRazorpay, RazorpayOrderOptions } from "react-razorpay";
import { Orders } from "razorpay/dist/types/orders";

const BuyCredit = () => {
	const { Razorpay } = useRazorpay();
	const navigate = useNavigate();
	const appContext = useContext(AppContext);
	if (!appContext) return null;
	const { user, backendUrl, token, setShowLogin, loadCredit } = appContext;

	const initPay = async (order: Orders.RazorpayOrder) => {
		try {
			const options: RazorpayOrderOptions = {
				key: import.meta.env.RAZORPAY_KEY_ID || "",
				amount: Number(order.amount),
				currency: "INR",
				name: "Credit Purchase",
				description: "Purchase credits for your account",
				order_id: order.id,
				handler: async (response) => {
					try {
						const { data } = await axios.post(
							`${backendUrl}/api/user/verify-razor`,
							{ response },
							{
								headers: { token }, 
								validateStatus: (status: number) => status < 500,
							}
						);

						if (data.success) {
							loadCredit();
							toast.success("Purchase successful!");
							navigate("/");
						} else {
							toast.error(data.message || "Purchase verification failed.");
						}
					} catch (error) {
						console.error(error);
						toast.error("Verification failed. Please try again later.");
					}
				},

				theme: {
					color: "#3399cc",
				},
			};

			const rzp = new Razorpay(options);
			rzp.open();

			rzp.on("payment.failed", (response) => {
				console.error("Payment failed:", response.error);
				toast.error("Payment failed. Please try again.");
			});
		} catch (error) {
			console.error("Razorpay Initialization Error:", error);
			toast.error(
				"Something went wrong initializing payment. Please try again."
			);
		}
	};

	const handlePurchase = async (planId: string) => {
		try {
			if (!user) {
				setShowLogin(true);
				return;
			}

			const { data } = await axios.post(
				`${backendUrl}/api/user/pay-razor`,
				{ planId },
				{
					headers: {
						token,
					},
					validateStatus: (status) => status < 500, // Only throw for 500+ status codes
				}
			);
			console.log(data);

			// await loadCredit();
			if (data.success) {
				initPay(data.order);
			}
		} catch (error) {
			console.log(error);

			toast.error("Something went wrong!");
		}
	};
	return (
		<motion.div
			initial={{ opacity: 0.2, y: 100 }}
			transition={{ duration: 1 }}
			whileInView={{ opacity: 1, y: 0 }}
			viewport={{ once: true }}
			className="min-h-[80vh] text-center pt-14 mb-10"
		>
			<button className="border border-gray-400 px-10 py-2 rounded-full mb-6">
				Our Plans
			</button>
			<h1 className="text-center text-3xl font-medium mb-6 sm:mb-10">
				Choose the plan
			</h1>
			<div className="flex flex-wrap justify-center gap-6 text-left">
				{plans.map((plan, index) => (
					<div
						className="bg-white drop-shadow-sm border rounded-lg py-12 px-8 text-gray-600 hover:scale-105 transition-all duration-500"
						key={index}
					>
						<img width={40} src={assets.logo_icon} alt="" />
						<p className="mt-3 mb-1 font-semibold">{plan.id}</p>
						<p className="text-sm">{plan.desc}</p>
						<p className="mt-6">
							<span className="text-3xl font-medium"> ₹{plan.price} </span> /{" "}
							{plan.credits} credits
						</p>
						<button
							onClick={() => handlePurchase(plan.id)}
							className="w-full bg-gray-800 text-white mt-8 text-sm rounded-md py-2.5 min-w-52"
						>
							{user ? "Purchase" : "Get Started"}
						</button>
					</div>
				))}
			</div>
		</motion.div>
	);
};

export default BuyCredit;

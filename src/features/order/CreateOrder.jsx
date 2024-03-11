import { useState } from "react";
import { Form, redirect, useActionData, useNavigation } from "react-router-dom";
import { createOrder } from "../../services/apiRestaurant";
import Button from "../../ui/Button";
import { useDispatch, useSelector } from "react-redux";
import { clearCart, getCart, getTotalCartPrice } from "../cart/cartSlice";
import EmptyCart from "../cart/EmptyCart";
import store from "../../store";
import { formatCurrency } from "../../utils/helpers";
import { fetchAddress } from "../user/userSlice";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

const isValidPhone = (str) => /^\+(?:[0-9] ?){6,14}[0-9]$/.test(str);

function CreateOrder() {
	const [withPriority, setWithPriority] = useState(false);
	const [phoneNumber, setPhoneNumber] = useState("");
	const dispatch = useDispatch();
	const cart = useSelector(getCart);
	const navigation = useNavigation();
	const isSubmitting = navigation.state === "submitting";
	const {
		username,
		status: addressStatus,
		position,
		address,
		error: errorAddress,
	} = useSelector((state) => state.user);
	const isLoadingAddress = addressStatus === "loading";

	const totalCartPrice = useSelector(getTotalCartPrice);
	const priorityPrice = withPriority ? totalCartPrice * 0.2 : 0;
	const totalPrice = totalCartPrice + priorityPrice;
	const formErrors = useActionData();

	if (!cart.length) return <EmptyCart />;

	const handleSubmit = async (e) => {
		e.preventDefault();
		const formData = new FormData(e.target);
		const data = Object.fromEntries(formData);

		const order = {
			...data,
			cart: JSON.parse(data.cart),
			priority: data.priority === "true",
		};
		const errors = {};

		if (!isValidPhone(order.phone))
			errors.phone = "Please give us your correct phone number. We might need it to contact you.";

		if (Object.keys(errors).length > 0) return errors;

		const newOrder = await createOrder(order);

		store.dispatch(clearCart());

		return redirect(`/order/${newOrder.id}`);
	};

	return (
		<div className="px-4 py-6">
			<h2 className="mb-8 text-xl font-semibold">Ready to order? Let&apos;s go!</h2>

			<Form onSubmit={handleSubmit}>
				<div className="flex-column sm:item-center mb-5 flex gap-2 sm:flex-row">
					<label className="sm:basis-40">First Name</label>
					<input
						className="input grow"
						defaultValue={username}
						type="text"
						name="customer"
						required
					/>
				</div>

				<div className="flex-column sm:item-center mb-5 flex gap-2 sm:flex-row">
					<label className="sm:basis-40">Phone number</label>
					<div className="input grow">
						<PhoneInput
							country={"uz"}
							value={phoneNumber}
							onChange={(value) => setPhoneNumber(value)}
							inputProps={{
								name: "phone",
								required: true,
							}}
						/>
						{formErrors?.phone && (
							<p className="mt-2 rounded-md bg-red-100 p-2 text-xs text-red-700">
								{formErrors.phone}
							</p>
						)}
					</div>
				</div>

				<div className="flex-column relative mb-5 flex gap-2 sm:flex-row sm:items-center">
					<label className="sm:basis-40">Address</label>
					<div className="grow">
						<input
							className="input w-full"
							type="text"
							name="address"
							defaultValue={address}
							disabled={isLoadingAddress}
							required
						/>
						{addressStatus === "error" && (
							<p className="mt-2 rounded-md bg-red-100 p-2 text-xs text-red-700">{errorAddress}</p>
						)}
					</div>
					{!position.latitude && !position.longitude && (
						<span className="absolute right-[3px] top-[3px] z-50 md:right-[5px] md:top-[5px]">
							<Button
								disabled={isLoadingAddress || isSubmitting}
								type="small"
								onClick={(e) => {
									e.preventDefault();
									dispatch(fetchAddress());
								}}
							>
								Get Position
							</Button>
						</span>
					)}
				</div>

				<div className="mb-12 flex items-center gap-5">
					<input
						className="mr-8 h-4 w-4 scale-150 text-stone-800 accent-yellow-400"
						type="checkbox"
						name="priority"
						id="priority"
						value="true"
						onChange={(e) => setWithPriority(e.target.checked)}
					/>

					<label className="font-medium" htmlFor="priority">
						Want to give your order priority?
					</label>
				</div>

				<div className="">
					<input type="hidden" name="cart" value={JSON.stringify(cart)} />
					<input
						type="hidden"
						name="position"
						value={
							position.longitude && position.latitude
								? `${position.latitude},${position.longitude}`
								: ""
						}
					/>
					<Button type="primary" disabled={isSubmitting}>
						{isSubmitting ? "Placing order..." : `Order now for ${formatCurrency(totalPrice)}`}
					</Button>
				</div>
			</Form>
		</div>
	);
}

export async function action({ request }) {
	const formData = await request.formData();
	const data = Object.fromEntries(formData);

	const order = {
		...data,
		cart: JSON.parse(data.cart),
		priority: data.priority === "true",
	};
	const errors = {};

	if (!isValidPhone(order.phone))
		errors.phone = "Please give us your correct phone number. We might need it to contact you.";

	if (Object.keys(errors).length > 0) return errors;

	const newOrder = await createOrder(order);

	store.dispatch(clearCart());

	return redirect(`/order/${newOrder.id}`);
}

export default CreateOrder;

// import React, { useState } from "react";
// import { Form, redirect, useActionData, useNavigation } from "react-router-dom";
// import { createOrder } from "../../services/apiRestaurant";
// import Button from "../../ui/Button";
// import { useDispatch, useSelector } from "react-redux";
// import { clearCart, getCart, getTotalCartPrice } from "../cart/cartSlice";
// import EmptyCart from "../cart/EmptyCart";
// import store from "../../store";
// import { formatCurrency } from "../../utils/helpers";
// import { fetchAddress } from "../user/userSlice";
// import PhoneInput from "react-phone-input-2";
// import "react-phone-input-2/lib/style.css";

// const isValidPhone = (str) => /^\+(?:[0-9] ?){6,14}[0-9]$/.test(str);

// const isValidAddress = (str) => /^[a-zA-Z0-9\s,'-]*$/.test(str);

// function CreateOrder() {
//   const [withPriority, setWithPriority] = useState(false);
//   const [phoneNumber, setPhoneNumber] = useState(""); // State to hold phone number
//   const [address, setAddress] = useState(""); // State to hold address
//   const dispatch = useDispatch();
//   const cart = useSelector(getCart);
//   const navigation = useNavigation();
//   const isSubmitting = navigation.state === "submitting";
//   const {
//     username,
//     status: addressStatus,
//     position,
//     error: errorAddress,
//   } = useSelector((state) => state.user);
//   const isLoadingAddress = addressStatus === "loading";

//   const totalCartPrice = useSelector(getTotalCartPrice);
//   const priorityPrice = withPriority ? totalCartPrice * 0.2 : 0;
//   const totalPrice = totalCartPrice + priorityPrice;
//   const formErrors = useActionData();

//   if (!cart.length) return <EmptyCart />;

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     const formData = new FormData(e.target);
//     const data = Object.fromEntries(formData);

//     const order = {
//       ...data,
//       cart: JSON.parse(data.cart),
//       priority: data.priority === "true",
//     };
//     const errors = {};

//     if (!isValidPhone(order.phone))
//       errors.phone =
//         "Please give us your correct phone number. We might need it to contact you.";

//     if (!isValidAddress(order.address))
//       errors.address = "Please provide a valid address.";

//     if (Object.keys(errors).length > 0) return errors;

//     const newOrder = await createOrder(order);

//     store.dispatch(clearCart());

//     return redirect(`/order/${newOrder.id}`);
//   };

//   return (
//     <div className="px-4 py-6">
//       <h2 className="mb-8 text-xl font-semibold">
//         Ready to order? Let&apos;s go!
//       </h2>

//       <Form onSubmit={handleSubmit}>
//         <div className="flex-column sm:item-center mb-5 flex gap-2 sm:flex-row">
//           <label className="sm:basis-40">First Name</label>
//           <input
//             className="input grow"
//             defaultValue={username}
//             type="text"
//             name="customer"
//             required
//           />
//         </div>

//         <div className="flex-column sm:item-center mb-5 flex gap-2 sm:flex-row">
//           <label className="sm:basis-40">Phone number</label>
//           <div className="input grow">
//             <PhoneInput
//               country={"uz"}
//               value={phoneNumber}
//               onChange={(value) => setPhoneNumber(value)}
//               inputProps={{
//                 name: "phone",
//                 required: true,
//               }}
//             />
//             {formErrors?.phone && (
//               <p className="mt-2 rounded-md bg-red-100 p-2 text-xs text-red-700">
//                 {formErrors.phone}
//               </p>
//             )}
//           </div>
//         </div>

//         <div className="flex-column relative mb-5 flex gap-2 sm:flex-row sm:items-center">
//           <label className="sm:basis-40">Address</label>
//           <div className="grow">
//             <input
//               className={`input w-full ${
//                 formErrors?.address ? "border-red-500" : ""
//               }`}
//               type="text"
//               name="address"
//               value={address}
//               onChange={(e) => setAddress(e.target.value)}
//               disabled={isLoadingAddress}
//               required
//             />
//             {formErrors?.address && (
//               <p className="mt-2 rounded-md bg-red-100 p-2 text-xs text-red-700">
//                 {formErrors.address}
//               </p>
//             )}
//           </div>
//           {!position.latitude && !position.longitude && (
//             <span className="absolute right-[3px] top-[3px] z-50 md:right-[5px] md:top-[5px]">
//               <Button
//                 disabled={isLoadingAddress || isSubmitting}
//                 type="small"
//                 onClick={(e) => {
//                   e.preventDefault();
//                   dispatch(fetchAddress());
//                 }}
//               >
//                 Get Position
//               </Button>
//             </span>
//           )}
//         </div>

//         <div className="mb-12 flex items-center gap-5">
//           <input
//             className="mr-8 h-4 w-4 scale-150 text-stone-800 accent-yellow-400"
//             type="checkbox"
//             name="priority"
//             id="priority"
//             value="true"
//             onChange={(e) => setWithPriority(e.target.checked)}
//           />
//           <label className="font-medium" htmlFor="priority">
//             Want to give your order priority?
//           </label>
//         </div>

//         <div className="">
//           <input type="hidden" name="cart" value={JSON.stringify(cart)} />
//           <input
//             type="hidden"
//             name="position"
//             value={
//               position.longitude && position.latitude
//                 ? `${position.latitude},${position.longitude}`
//                 : ""
//             }
//           />
//           <Button type="primary" disabled={isSubmitting}>
//             {isSubmitting
//               ? "Placing order..."
//               : `Order now for ${formatCurrency(totalPrice)}`}
//           </Button>
//         </div>
//       </Form>
//     </div>
//   );
// }

// export async function action({ request }) {
//   const formData = await request.formData();
//   const data = Object.fromEntries(formData);
//   console.log(data);

//   const order = {
//     ...data,
//     cart: JSON.parse(data.cart),
//     priority: data.priority === "true",
//   };
//   const errors = {};

//   if (!isValidPhone(order.phone))
//     errors.phone =
//       "Please give us your correct phone number. We might need it to contact you.";

//   if (Object.keys(errors).length > 0) return errors;

//   const newOrder = await createOrder(order);

//   store.dispatch(clearCart());

//   return redirect(`/order/${newOrder.id}`);
// }

// export default CreateOrder;

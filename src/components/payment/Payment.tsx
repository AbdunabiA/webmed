import React from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";

const Payment = () => {
	const location = useLocation();
	const { paymentUrl } = location.state || {
		paymentUrl: "test"
	};
	return (
		<div>
	      <a href={paymentUrl} style={{ color: "white" }}>Pay</a>
	    </div>
	)
}

export default Payment;
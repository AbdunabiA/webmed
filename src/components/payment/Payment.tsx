import React from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";

const Payment = () => {
	const location = useLocation();
	const { paymentUrl } = location.state || {
		paymentUrl: "test"
	};
	return (
		<div>
	      <a href={paymentUrl} style={{ color: "white", marginTop:"100px", fontSize:"30px", textDecoration:"none", padding:"10px 24px", borderRadius:"10px", border:"1px solid white" }}>Нажмите для оплаты</a>
	    </div>
	)
}

export default Payment;
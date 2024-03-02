import { Box } from '@mui/material';

const Logo = () => {
    return (
			<Box mt={4} textAlign="center" sx={{ display: "flex" }}>
				<img
					src="logo.jpg"
					alt="My Photo"
					style={{
						borderRadius: "50%",
						width: "150px",
						height: "150px",
						objectFit: "cover",
					}}
				/>
			</Box>
	);
}

export default Logo;
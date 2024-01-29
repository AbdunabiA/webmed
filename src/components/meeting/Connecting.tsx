import React, { useState, useEffect } from "react";

const ConnectionChecking: React.FC = () => {
	const [connectionLevels, setConnectionLevels] = useState<string[]>(
		Array.from({ length: 6 }, () => "inactive")
	);
	const [levelIndex, setLevelIndex] = useState<number>(0);

	useEffect(() => {
		const interval = setInterval(() => {
            setLevelIndex((prevIndex) =>
				{
                    if (prevIndex === connectionLevels.length) {
                        setConnectionLevels(
							Array.from({ length: 6 }, () => "inactive")
						);
                        return 0
                    }
                    return prevIndex + 1;
                }
			);
			setConnectionLevels((prevLevels) => {
				const updatedLevels = [...prevLevels];
				updatedLevels[levelIndex] =
					updatedLevels[levelIndex] === "active"
						? "inactive"
						: "active";

				return updatedLevels;
			});
		}, 500);

		return () => clearInterval(interval);
	}, [levelIndex, connectionLevels.length]);

	return (
		<div
			style={{
				display: "flex",
				alignItems: "flex-end",
				justifyContent: "space-around",
				position: "absolute",
				flexDirection: "row",
				top: "180px",
				width: "auto",
				minHeight: "50px",
				borderRadius: "15px",
			}}
		>
			{connectionLevels.map((level, index) => (
				<div
					key={index}
					style={{
						height: `${20 * (index + 1)}px`,
						backgroundColor: level === "active" ? "white" : "grey",
						color: level === "active" ? "white" : "grey",
						margin: "5px",
						borderRadius: "10px",
					}}
				>
					*
				</div>
			))}
		</div>
	);
};

export default ConnectionChecking;

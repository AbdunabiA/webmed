import React from "react";
import {
	FormControl,
	Input,
	InputAdornment,
	IconButton,
	colors,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { tgSecondaryBgColor } from "../../utils/colors";

interface SearchInputProps {
	onChange: (value: string) => void;
}

const SearchInput: React.FC<SearchInputProps> = ({ onChange }) => {
	return (
		<div>
			<div
				style={{
					display: "flex",
					alignItems: "center",
					textAlign: "center",
					background: tgSecondaryBgColor,
					borderRadius: "25px",
					minWidth: "350px",
				}}
			>
				<p style={{ margin: "0 5px" }}></p>
				<FormControl
					fullWidth
					variant="standard"
					size="small"
					sx={{ m: 1 }}
				>
					<Input
						fullWidth
						disableUnderline
						placeholder="Search"
						sx={{ height: "25px", marginTop: "3px" }}
						onChange={(e) => onChange(e.target.value)}
						endAdornment={
							<InputAdornment position="end">
								<IconButton
									edge="start"
									sx={{ color: colors.grey[400] }}
									aria-label="search"
								>
									<SearchIcon />
								</IconButton>
							</InputAdornment>
						}
					/>
				</FormControl>
			</div>
		</div>
	);
};

export default SearchInput;

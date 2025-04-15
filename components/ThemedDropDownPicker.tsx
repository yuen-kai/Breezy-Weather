import React from "react";
import DropDownPicker, { DropDownPickerProps } from "react-native-dropdown-picker";
import { useAppTheme } from "@/theme";

export const ThemedDropDownPicker: React.FC<DropDownPickerProps<any>> = (props) => {
	const theme = useAppTheme();


	return (
		<DropDownPicker
			{...props}
			
			style={[
				{
					backgroundColor: theme.colors.elevation.level1,
					borderColor: theme.colors.outline,
				},
				props.style, // merge user-defined style
			]}
			textStyle={[
				{
					color: theme.colors.onSurface,
					fontSize: 15,
				},
				props.textStyle,
			]}
			dropDownContainerStyle={[
				{
					backgroundColor: theme.colors.elevation.level1,
					borderColor: theme.colors.outline,
				},
				props.dropDownContainerStyle,
			]}
			placeholderStyle={[
				{
					color: theme.colors.onSurfaceDisabled,
				},
				props.placeholderStyle,
			]}
			arrowIconStyle={[
				{
					tintColor: theme.colors.onSurface,
				},
				props.arrowIconStyle,
			]}
			listItemLabelStyle={[
				{
					color: theme.colors.onSurface,
					fontSize: 15,
				},
				props.listItemLabelStyle,
			]}
			tickIconStyle={[
				{
					tintColor: theme.colors.onSurface,
				},
				props.tickIconStyle,
			]}
			searchContainerStyle={[
				{
					borderBottomColor: theme.colors.outline,
					borderBottomWidth: 1,
				},
				props.searchContainerStyle,
			]}
			searchTextInputStyle={[
				{
					color: theme.colors.onSurface,
					borderRadius: theme.roundness,
					borderColor: theme.colors.outline,
					fontSize: 15,
				},
				props.searchTextInputStyle,
			]}
		/>
	);
};

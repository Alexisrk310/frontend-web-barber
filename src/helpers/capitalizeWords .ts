export const capitalizeWords = (str: string): string =>
	str
		.toLowerCase()
		.trim()
		.split(' ')
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(' ');

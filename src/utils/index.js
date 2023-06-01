export const getFontStyle = (style) => {
	switch (style) {
		case 'regular':
			return {
				fontWeight: '500',
			};
		case 'bold':
			return {
				fontWeight: '800',
			};
		case 'italic':
			return {
				fontStyle: 'italic',
			};
		case 'light-italic':
			return {
				fontWeight: 100,
				fontStyle: 'italic',
			};
		case 'light':
			return {
				fontWeight: 100,
			};
		default:
			return;
	}
};

export const determineWIllWidgetShow = (
	selectedProducts,
	currentProductHandle,
	productSelection
) => {
	if (productSelection === 'all-products') return true;
	return selectedProducts.some(
		(product) => product.handle === currentProductHandle
	);
};

export const getMostProbableDiscount = (discountCodes = {}) => {
	const probabilitySum = discountCodes.reduce(
		(sum, code) => sum + code.probability / 100,
		0
	);
	const randomNumber = Math.random();

	let cumulativeProbability = 0;
	let selectedCode;
	let discountIndex;

	discountCodes.forEach((code, index) => {
		const currentProbability = code.probability / 100;
		cumulativeProbability += currentProbability / probabilitySum;

		if (randomNumber <= cumulativeProbability && !selectedCode) {
			selectedCode = code.code;
			discountIndex = index;
		}
	});
	return { selectedCode, discountIndex };
};

const discountCodes = [
	{ code: 'CODE1', probability: 0.25 },
	{ code: 'CODE2', probability: 0.4 },
	{ code: 'CODE3', probability: 0.15 },
	{ code: 'CODE4', probability: 0.2 },
];

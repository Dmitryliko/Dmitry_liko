module.exports = {
  defaultCity: 'msk',
  projectIdToCity: {
    '820503': 'msk'
  },
  pageIdToCity: {
    "10004506": "msk"
  },
  cities: {
    msk: {
      apiLogin: "95d5ce46963b47418e5b07543ec77fb4",
      organizationId: "6fd820ff-65a0-40d6-8309-83d6425aaf2e",
      terminalGroupId: "16405536-0b9a-30e4-017e-dea16b460064",
      paymentTypeKind: 'Card',
      fallbackProductId: '', // Disabled fallback to avoid adding incorrect items to order - используется как fallback для неизвестных наборов/товаров
    }
  }
};

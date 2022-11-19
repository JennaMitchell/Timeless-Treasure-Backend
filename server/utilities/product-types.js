const productTypeSubSelectionObject = {
  Ceramics: {
    Types: [
      "Earthenware",
      "Stoneware",
      "Porcelian",
      "Bone China",
      "Fire Bricks",
    ],
  },
  Clocks: {
    Type: ["Wall", "Pendulum", "Mantel", "Alarm", "Cuckoo"],
    Size: ["Small", "Medium", "Large", "Oversized"],
    Style: ["Digital", "Analog"],
  },
  Tablewear: {
    Type: ["Serveware", "Dinnerware", "Silverware", "Drinkware"],
    Sets: ["4 Sets", "6 Sets", "8 Sets"],
    Material: ["Bone China", "Silver", "Porcelain", "Melamine"],
  },
  Paintings: {
    Type: [
      "Realism",
      "Photorealism",
      "Abstract",
      "Surrealism",
      "Pop Art",
      "Oil",
    ],
  },
  Electronics: {
    Type: ["Cameras", "Games", "Media Players", "DvDs", "CDs"],
  },
};

const productTypeSubSelectionCategories = Object.keys(
  productTypeSubSelectionObject
);

const productTypeSubSelectionCategoryTypes = Object.values(
  productTypeSubSelectionObject
).map((type) => {
  return Object.values(type);
});
const acceptedFilterTypes = [];
const combinedTypeArraysSortedByType = [];
for (
  let productTypesIndex = 0;
  productTypesIndex < productTypeSubSelectionCategories.length;
  productTypesIndex++
) {
  combinedTypeArraysSortedByType.push([]);
}

for (let i = 0; i < productTypeSubSelectionCategoryTypes.length; i++) {
  for (let q = 0; q < productTypeSubSelectionCategoryTypes[i].length; q++) {
    for (
      let z = 0;
      z < productTypeSubSelectionCategoryTypes[i][q].length;
      z++
    ) {
      acceptedFilterTypes.push(productTypeSubSelectionCategoryTypes[i][q][z]);
      combinedTypeArraysSortedByType[i].push(
        productTypeSubSelectionCategoryTypes[i][q][z]
      );
    }
  }
}

for (let a = 0; a < productTypeSubSelectionCategories.length; a++) {
  acceptedFilterTypes.push(productTypeSubSelectionCategories[a]);
}

exports.productTypeSubSelectionCategories = productTypeSubSelectionCategories;
exports.productTypeSubSelection = productTypeSubSelectionObject;
exports.acceptedFilterTypes = acceptedFilterTypes;
exports.combinedTypeArraysSortedByType = combinedTypeArraysSortedByType;

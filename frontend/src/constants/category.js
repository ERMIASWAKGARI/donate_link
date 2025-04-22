export const materialCategories = [
  {
    name: "Food",
    subCategories: ["Grain", "Cooking Oil", "Salt", "Sugar", "Other"],
    units: ["kg", "litre", "pack", "other"]
  },
  {
    name: "Health",
    subCategories: ["Medicine", "Gloves", "Masks", "Sanitizers", "Other"],
    units: ["piece", "pack", "box", "bottle", "other"]
  },
  {
    name: "Education",
    subCategories: ["Stationery", "Books", "Uniform", "Backpacks", "Other"],
    units: ["piece", "set", "pack", "box", "other"]
  },
  {
    name: "Agriculture",
    subCategories: ["Seeds", "Fertilizer", "Tools", "Pesticides", "Other"],
    units: ["kg", "litre", "pack", "piece", "other"]
  },
  {
    name: "Shelter",
    subCategories: ["Tents", "Beds", "Blankets", "Mattresses", "Other"],
    units: ["piece", "set", "pack", "other"]
  },
  {
    name: "Other",
    subCategories: ["Item 1", "Item 2", "Item 3", "Item 4", "Other"],
    units: ["piece", "kg", "litre", "set", "other"]
  }
];

export const getSubCategories = (category) => {
  const foundCategory = materialCategories.find((cat) => cat.name === category);
  return foundCategory ? foundCategory.subCategories : [];
};
export const getUnits = (category) => {
  const foundCategory = materialCategories.find((cat) => cat.name === category);
  return foundCategory ? foundCategory.units : [];
};
export const serviceCategories = [
  {
    name: "Education",
    subCategories: [
      "Teaching",
      "Tutoring",
      "Mentoring",
      "Literacy Programs",
      "Other",
    ],
  },
  {
    name: "Healthcare",
    subCategories: [
      "Nursing",
      "Medical Checkups",
      "Counseling",
      "Ambulance Service",
      "Other",
    ],
  },
  {
    name: "Agricultural Support",
    subCategories: [
      "Farming Training",
      "Irrigation Service",
      "Veterinary Service",
      "Equipment Repair",
      "Other",
    ],
  },
  {
    name: "Construction",
    subCategories: [
      "Carpentry",
      "Masonry",
      "Plumbing",
      "Electric Work",
      "Other",
    ],
  },
  {
    name: "Community Development",
    subCategories: [
      "Youth Programs",
      "Women Empowerment",
      "Conflict Resolution",
      "Civic Education",
      "Other",
    ],
  },
  {
    name: "Other",
    subCategories: [
      "Custom Service 1",
      "Custom Service 2",
      "Custom Service 3",
      "Custom Service 4",
      "Other",
    ],
  },
];
export const getServiceSubCategories = (category) => {
  const foundCategory = serviceCategories.find((cat) => cat.name === category);
  return foundCategory ? foundCategory.subCategories : [];
};
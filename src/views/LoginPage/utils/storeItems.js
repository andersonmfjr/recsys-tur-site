export const storeItems = id => {
  const items = localStorage.getItem("items");
  if (items) {
    const arr = [id, ...JSON.parse(items)];
    localStorage.setItem("items", JSON.stringify(arr));
  } else {
    const arr = [id];
    localStorage.setItem("items", JSON.stringify(arr));
  }
};

export const getStoredItems = () => {
  return JSON.parse(localStorage.getItem("items"));
};
